from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Query, UploadFile, File
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import re
import hmac
import hashlib
import httpx
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe setup (using stripe library directly)
import stripe
stripe_api_key = os.environ.get('STRIPE_API_KEY', '')
stripe.api_key = stripe_api_key
paypal_client_id = os.environ.get('PAYPAL_CLIENT_ID', '')
paypal_client_secret = os.environ.get('PAYPAL_CLIENT_SECRET', '')
paypal_env = os.environ.get('PAYPAL_ENV', 'sandbox')
paypal_base_url = "https://api-m.paypal.com" if paypal_env == "production" else "https://api-m.sandbox.paypal.com"

# Printful setup
from printful_integration import PrintfulClient, create_order_in_printful, PrintfulOrder, PrintfulOrderItem
printful_api_key = os.environ.get('PRINTFUL_API_KEY')
printful_env = os.environ.get('PRINTFUL_ENV', 'test')
printful_webhook_secret_hex = os.environ.get('PRINTFUL_WEBHOOK_SECRET_HEX', '')

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is required and not set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Rate limiting
limiter = Limiter(key_func=get_remote_address)

# Create the main app
app = FastAPI(
    title="LXI E-commerce API",
    description="Premium e-commerce backend for LXI Founders Edition",
    version="2.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()

    try:
        event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    print("EVENTO:", event.get("type"))

    if event.get("type") in [
        "checkout.session.completed",
        "payment_intent.succeeded"
    ]:
        print("🔥 PAGO CONFIRMADO")

    return {"status": "success"}

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

DEFAULT_HOME_CONTENT = {
    "_id": "home",
    "hero_label": "FOUNDERS EDITION - INITIUM",
    "hero_title": "LA ARMADURA DEL GLADIADOR MODERNO",
    "hero_subtitle": "Para quienes eligieron enfrentar su arena.",
    "hero_cta_text": "ENTER INITIUM",
    "hero_cta_link": "/shop",
    "hero_image": "https://images.unsplash.com/photo-1648314789571-4003c96b5b09?w=1920&q=80",
    "brand_quote": "No vendemos ropa. Vendemos la armadura que te recuerda quien decidiste ser.",
    "pillars": [
        {
            "numeral": "I",
            "title": "DISCIPLINA",
            "description": "La consistencia silenciosa que construye identidad."
        },
        {
            "numeral": "II",
            "title": "PRESENCIA",
            "description": "La autoridad que no necesita anunciarse."
        },
        {
            "numeral": "III",
            "title": "LEGADO",
            "description": "Lo que permanece cuando el miedo desaparece."
        }
    ],
    "collection_label": "INITIUM - FOUNDERS EDITION",
    "collection_title": "La Coleccion",
    "story_label": "NACIO DE UNA BATALLA",
    "story_title": "Cada pieza LXI es un recordatorio de que la batalla mas dificil ya comenzo.",
    "story_body": "LXI nacio de un libro. De una batalla personal escrita para millones que pelean la misma guerra silenciosa: el sindrome del impostor. Luchando con el Impostor no es una metafora. Es un metodo. Y LXI es su armadura.",
    "story_image": "https://images.unsplash.com/photo-1705513010372-b3ba14ef4530?w=1200&q=80",
    "story_cta_text": "READ THE PHILOSOPHY",
    "story_cta_link": "/philosophy",
    "banner_label": "FOUNDERS EDITION - AVAILABLE FOR LIMITED TIME",
    "banner_text": "MMXXVI - EACH PIECE MADE TO ORDER",
    "updated_at": datetime.now(timezone.utc).isoformat()
}

DEFAULT_GLOBAL_CONTENT = {
    "_id": "global",
    "logo_text": "LXI",
    "navbar_links": [
        {"label": "SHOP", "path": "/shop"},
        {"label": "PHILOSOPHY", "path": "/philosophy"},
        {"label": "INITIUM", "path": "/shop"},
    ],
    "mobile_menu_badge": "FOUNDERS EDITION",
    "footer_description": "Vestir la transformacion de quienes eligieron enfrentar su arena.",
    "footer_email": "wearelxi@gmail.com",
    "instagram_url": "https://instagram.com",
    "tiktok_url": "https://tiktok.com",
    "footer_shop_links": [
        {"label": "INITIUM", "path": "/shop", "external": False},
        {"label": "TOPS", "path": "/shop?category=TOPS", "external": False},
        {"label": "HEADWEAR", "path": "/shop?category=HEADWEAR", "external": False},
        {"label": "OUTERWEAR", "path": "/shop?category=OUTERWEAR", "external": False},
    ],
    "footer_brand_links": [
        {"label": "PHILOSOPHY", "path": "/philosophy", "external": False},
        {"label": "THE BOOK", "path": "https://joseurbaneja.com", "external": True},
    ],
    "newsletter_title": "ENTER THE ARENA",
    "newsletter_text": "Be the first to know about new drops and LXI philosophy.",
    "footer_bottom_text": "All rights reserved.",
    "footer_badge_text": "FOUNDERS EDITION MMXXVI",
    "shop_title": "INITIUM",
    "shop_count_label_template": "FOUNDERS EDITION - {count} PIECES",
    "shop_empty_text": "No products found",
    "shop_banner_label": "FOUNDERS EDITION - AVAILABLE FOR LIMITED TIME",
    "shop_banner_text": "PRODUCED ON DEMAND - SHIPS VIA PRINTFUL",
    "product_badge_text": "FOUNDERS EDITION",
    "product_breadcrumb_shop": "SHOP",
    "product_breadcrumb_collection": "INITIUM",
    "add_to_cart_text": "ADD TO ARMOR",
    "add_to_cart_loading_text": "ADDING...",
    "theme": {
        "primary_bg": "#0a0e17",
        "secondary_bg": "#1a2332",
        "primary_text": "#f5f5f0",
        "secondary_text": "#8a8a8a",
        "accent_gold": "#d4af37",
        "border_color": "#2a3444",
        "body_font": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        "heading_font": "'Cormorant Garamond', serif",
        "body_font_size": "16px",
        "hero_title_size": "clamp(3rem, 8vw, 5.5rem)",
        "section_title_size": "clamp(2rem, 5vw, 3.5rem)"
    },
    "updated_at": datetime.now(timezone.utc).isoformat()
}

DEFAULT_PHILOSOPHY_CONTENT = {
    "_id": "philosophy",
    "hero_label": "LA FILOSOFIA LXI",
    "hero_image": "https://images.unsplash.com/photo-1648314789571-4003c96b5b09?w=1920&q=80",
    "opening_quote": "El gladiador no entra a la arena porque no tiene miedo. Entra porque decidio que la batalla vale mas que el miedo.",
    "sections": [
        {
            "label": "ACT I",
            "title": "EL ORIGEN",
            "paragraphs": [
                "LXI nacio de un libro. De una batalla personal escrita para millones que pelean la misma guerra silenciosa: el sindrome del impostor.",
                "Luchando con el Impostor no es una metafora. Es un metodo. Y LXI es su armadura."
            ]
        },
        {
            "label": "ACT II",
            "title": "LA TRANSFORMACION",
            "paragraphs": [
                "Existen dos tipos de personas en cualquier arena: los que esperan sentirse listos para entrar, y los que entran sabiendo que el miedo nunca desaparece.",
                "LXI viste a los segundos."
            ]
        },
        {
            "label": "ACT III",
            "title": "EL ESTANDAR",
            "paragraphs": [
                "Cada pieza LXI es disenada bajo un solo criterio: Tiene la presencia silenciosa de quien ya gano su primera batalla?",
                "Si la respuesta es no, no existe."
            ]
        }
    ],
    "values_label": "LOS VALORES",
    "values_title": "Cinco Pilares",
    "values": [
        {
            "numeral": "I",
            "name": "ARENA",
            "description": "El espacio donde decides aparecer. No el escenario que te espera, sino el que construyes con cada decision."
        },
        {
            "numeral": "II",
            "name": "DISCIPLINA",
            "description": "La consistencia silenciosa que construye identidad. No lo que haces cuando te observan, sino lo que repites cuando nadie mira."
        },
        {
            "numeral": "III",
            "name": "PRESENCIA",
            "description": "La autoridad que no necesita anunciarse. El poder de ocupar un espacio sin pedirlo ni disculparte."
        },
        {
            "numeral": "IV",
            "name": "TRANSFORMACION",
            "description": "El proceso, no el destino. El arte de convertirte en quien decidiste ser, una batalla a la vez."
        },
        {
            "numeral": "V",
            "name": "LEGADO",
            "description": "Lo que permanece cuando el miedo desaparece. La huella que dejas en los que te observan pelear."
        }
    ],
    "mission_label": "MISION",
    "mission_text": "Vestir la transformacion de quienes eligieron enfrentar su arena.",
    "vision_label": "VISION",
    "vision_text": "Ser la marca que los gladiadores modernos reconocen como suya.",
    "cta_text": "EXPLORE THE COLLECTION",
    "cta_link": "/shop",
    "updated_at": datetime.now(timezone.utc).isoformat()
}

# =============================================================================
# SECURITY & UTILITIES
# =============================================================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def slugify(value: str) -> str:
    """Create URL-safe slugs for products."""
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")

def extract_printful_variants(product_detail: Dict) -> List[Dict]:
    """Normalize Printful variant data to local product schema."""
    result = product_detail.get("result", {})
    variants = (
        result.get("sync_variants")
        or result.get("variants")
        or result.get("sync_product", {}).get("sync_variants")
        or []
    )
    normalized_variants = []

    for variant in variants:
        sync_variant_id = variant.get("id")
        size = (
            variant.get("size")
            or variant.get("name")
            or variant.get("sku")
            or "DEFAULT"
        )
        sku = variant.get("sku")
        retail_price = variant.get("retail_price") or variant.get("price")

        if sync_variant_id:
            normalized_variants.append({
                "sync_variant_id": int(sync_variant_id),
                "size": str(size).upper(),
                "sku": sku,
                "retail_price": retail_price
            })

    return normalized_variants

def extract_printful_product_media(product_detail: Dict, remote_product: Dict) -> Dict:
    """Extract product image fields from varying Printful response shapes."""
    result = product_detail.get("result", {})
    sync_product = result.get("sync_product", {})
    sync_variants = result.get("sync_variants") or []

    image = (
        result.get("thumbnail_url")
        or sync_product.get("thumbnail_url")
        or remote_product.get("thumbnail_url")
        or remote_product.get("image")
    )

    images = []
    for candidate in [image]:
        if candidate and candidate not in images:
            images.append(candidate)

    for variant in sync_variants:
        for candidate in (
            variant.get("files", [{}])[0].get("preview_url") if variant.get("files") else None,
            variant.get("product", {}).get("image"),
        ):
            if candidate and candidate not in images:
                images.append(candidate)

    return {
        "image_url": image,
        "images": images,
    }

def extract_printful_product_identity(product_detail: Dict, remote_product: Dict) -> Dict:
    """Resolve product naming and identifiers across Printful response shapes."""
    result = product_detail.get("result", {})
    sync_product = result.get("sync_product", {})
    sync_variants = result.get("sync_variants") or []
    primary_variant = sync_variants[0] if sync_variants else {}

    name = (
        sync_product.get("name")
        or result.get("name")
        or remote_product.get("name")
        or primary_variant.get("product", {}).get("name")
        or f"Printful {remote_product['id']}"
    )

    external_id = (
        sync_product.get("external_id")
        or result.get("external_id")
        or remote_product.get("external_id")
        or primary_variant.get("external_id")
    )

    return {
        "name": name,
        "external_id": external_id,
        "source_name": primary_variant.get("product", {}).get("name") or name,
    }

def infer_catalog_category(name: str) -> str:
    """Map imported Printful products into storefront categories."""
    normalized = name.lower()

    if any(token in normalized for token in ["hoodie", "sweatshirt", "jacket", "crewneck"]):
        return "OUTERWEAR"
    if any(token in normalized for token in ["tee", "t-shirt", "shirt", "tank", "long sleeve", "polo"]):
        return "TOPS"
    if any(token in normalized for token in ["beanie", "hat", "cap", "snapback", "bucket"]):
        return "HEADWEAR"
    if any(token in normalized for token in ["pants", "jogger", "shorts", "leggings"]):
        return "BOTTOMS"
    if any(token in normalized for token in ["bag", "mug", "bottle", "sticker", "poster", "case", "towel", "sock"]):
        return "ACCESSORIES"
    return "PRINTFUL"

def find_matching_printful_variant(product: Dict, order_item: Dict) -> Optional[Dict]:
    """Find the Printful sync variant matching the chosen size."""
    selected_size = str(order_item.get("size", "DEFAULT")).upper()
    variants = product.get("printful_variants", [])

    for variant in variants:
        if str(variant.get("size", "")).upper() == selected_size:
            return variant

    if variants:
        return variants[0]

    legacy_id = product.get("printful_id")
    if legacy_id:
        return {
            "sync_variant_id": int(legacy_id),
            "size": selected_size,
            "retail_price": order_item.get("price")
        }

    return None

def build_recipient_from_shipping(shipping_addr: Dict, fallback_email: str = "") -> Dict:
    """Normalize checkout shipping data into Printful recipient format."""
    return {
        "name": f"{shipping_addr.get('firstName', '')} {shipping_addr.get('lastName', '')}".strip(),
        "address1": shipping_addr.get('address', ''),
        "city": shipping_addr.get('city', ''),
        "state_code": shipping_addr.get('state', ''),
        "country_code": shipping_addr.get('country', 'US'),
        "zip": shipping_addr.get('zipCode', ''),
        "email": shipping_addr.get('email', fallback_email),
        "phone": shipping_addr.get('phone', '')
    }

async def get_paypal_access_token() -> str:
    """Get PayPal OAuth access token."""
    if not paypal_client_id or not paypal_client_secret:
        raise HTTPException(status_code=500, detail="PayPal credentials not configured")

    async with httpx.AsyncClient() as http_client:
        response = await http_client.post(
            f"{paypal_base_url}/v1/oauth2/token",
            auth=(paypal_client_id, paypal_client_secret),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={"grant_type": "client_credentials"}
        )
        response.raise_for_status()
        return response.json()["access_token"]

async def send_transaction_to_printful(transaction: Dict) -> Optional[str]:
    """Send a paid transaction to Printful if the products are synced."""
    if not printful_api_key or not transaction.get("shipping_address"):
        return None

    client = PrintfulClient(api_key=printful_api_key)
    items_for_printful = []

    for item in transaction.get("items", []):
        product = await db.products.find_one({"_id": item["product_id"]})
        variant = find_matching_printful_variant(product or {}, item) if product else None
        if variant:
            items_for_printful.append(PrintfulOrderItem(
                sync_variant_id=int(variant["sync_variant_id"]),
                quantity=item["quantity"],
                size=item.get("size", "M"),
                retail_price=str(item.get("price", 0))
            ))

    if not items_for_printful:
        return None

    recipient = build_recipient_from_shipping(
        transaction["shipping_address"],
        fallback_email=transaction["shipping_address"].get("email", "")
    )
    printful_order = PrintfulOrder(
        external_id=transaction["session_id"],
        items=items_for_printful,
        recipient=recipient,
        retail_costs={"shipping": 0, "tax": 0, "discount": 0}
    )
    printful_response = await client.create_order(printful_order)
    return printful_response.get("result", {}).get("id") if printful_response else None

async def finalize_paid_transaction(session_id: str, source: str = "unknown") -> Dict:
    """
    Mark transaction as paid and trigger Printful fulfillment when applicable.
    Returns the fresh transaction document.
    """
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction:
        logger.error(f"[{source}] Transaction not found for session_id={session_id}")
        raise HTTPException(status_code=500, detail="Transaction not found for paid session")

    if transaction.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "status": "complete",
                    "payment_status": "paid",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        logger.info(f"[{source}] Transaction marked as paid: {session_id}")

    updated_transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not updated_transaction:
        logger.error(f"[{source}] Unable to reload transaction after payment update: {session_id}")
        raise HTTPException(status_code=500, detail="Unable to reload transaction after payment update")

    if (
        updated_transaction.get("shipping_address")
        and not updated_transaction.get("printful_order_id")
    ):
        printful_id = await send_transaction_to_printful(updated_transaction)
        if printful_id:
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "printful_order_id": str(printful_id),
                        "printful_status": "sent_to_production",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logger.info(f"[{source}] Auto-sent to Printful: session_id={session_id}, printful_id={printful_id}")

    return await db.payment_transactions.find_one({"session_id": session_id})

async def get_current_user(request: Request):
    """Dependency to get current authenticated user"""
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = auth_header.replace("Bearer ", "").strip()
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    """Dependency to get current admin user"""
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def get_home_content_doc() -> Dict:
    """Load home content from DB or create defaults."""
    content = await db.site_content.find_one({"_id": "home"})
    if content:
        return content

    default_content = DEFAULT_HOME_CONTENT.copy()
    await db.site_content.insert_one(default_content)
    return default_content

async def get_site_content_doc(content_id: str, default_content: Dict) -> Dict:
    """Load a content document from DB or create defaults."""
    content = await db.site_content.find_one({"_id": content_id})
    if content:
        return content

    payload = default_content.copy()
    await db.site_content.insert_one(payload)
    return payload

# =============================================================================
# MODELS - USERS & AUTH
# =============================================================================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str = Field(alias="_id")
    email: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    created_at: str

    class Config:
        populate_by_name = True

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# =============================================================================
# MODELS - PRODUCTS
# =============================================================================

class ProductCreate(BaseModel):
    name: str
    category: str
    description: str
    price: float
    sizes: List[str]
    inventory: int = 0
    sku: str
    slug: Optional[str] = None
    details: Optional[Dict] = None
    image_url: Optional[str] = None
    images: List[str] = []
    printful_id: Optional[str] = None
    visible: bool = True
    featured: bool = False

class Product(ProductCreate):
    id: str = Field(alias="_id")
    created_at: str
    updated_at: str
    rating: Optional[float] = 0
    review_count: int = 0

    class Config:
        populate_by_name = True

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    sizes: Optional[List[str]] = None
    inventory: Optional[int] = None
    sku: Optional[str] = None
    slug: Optional[str] = None
    details: Optional[Dict] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    visible: Optional[bool] = None
    featured: Optional[bool] = None

class HomePillar(BaseModel):
    numeral: str
    title: str
    description: str

class HomeContentUpdate(BaseModel):
    hero_label: str
    hero_title: str
    hero_subtitle: str
    hero_cta_text: str
    hero_cta_link: str
    hero_image: str
    brand_quote: str
    pillars: List[HomePillar]
    collection_label: str
    collection_title: str
    story_label: str
    story_title: str
    story_body: str
    story_image: str
    story_cta_text: str
    story_cta_link: str
    banner_label: str
    banner_text: str

class EditableLink(BaseModel):
    label: str
    path: str
    external: bool = False

class GlobalThemeUpdate(BaseModel):
    primary_bg: str
    secondary_bg: str
    primary_text: str
    secondary_text: str
    accent_gold: str
    border_color: str
    body_font: str
    heading_font: str
    body_font_size: str
    hero_title_size: str
    section_title_size: str

class GlobalContentUpdate(BaseModel):
    logo_text: str
    navbar_links: List[EditableLink]
    mobile_menu_badge: str
    footer_description: str
    footer_email: str
    instagram_url: str
    tiktok_url: str
    footer_shop_links: List[EditableLink]
    footer_brand_links: List[EditableLink]
    newsletter_title: str
    newsletter_text: str
    footer_bottom_text: str
    footer_badge_text: str
    shop_title: str
    shop_count_label_template: str
    shop_empty_text: str
    shop_banner_label: str
    shop_banner_text: str
    product_badge_text: str
    product_breadcrumb_shop: str
    product_breadcrumb_collection: str
    add_to_cart_text: str
    add_to_cart_loading_text: str
    theme: GlobalThemeUpdate

class PhilosophySection(BaseModel):
    label: str
    title: str
    paragraphs: List[str]

class PhilosophyValue(BaseModel):
    numeral: str
    name: str
    description: str

class PhilosophyContentUpdate(BaseModel):
    hero_label: str
    hero_image: str
    opening_quote: str
    sections: List[PhilosophySection]
    values_label: str
    values_title: str
    values: List[PhilosophyValue]
    mission_label: str
    mission_text: str
    vision_label: str
    vision_text: str
    cta_text: str
    cta_link: str

# =============================================================================
# MODELS - WISHLIST
# =============================================================================

class WishlistItem(BaseModel):
    product_id: str
    user_id: str
    added_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# MODELS - REVIEWS
# =============================================================================

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    title: str = ""
    comment: str

    @validator('rating')
    def rating_range(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class Review(ReviewCreate):
    id: str = Field(alias="_id")
    user_id: str
    user_email: str
    created_at: str
    updated_at: str
    helpful_count: int = 0

    class Config:
        populate_by_name = True

# =============================================================================
# MODELS - ORDERS (Enhanced)
# =============================================================================

class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    size: str

class CheckoutRequest(BaseModel):
    items: List[CartItem]
    origin_url: str
    shipping_address: Optional[Dict] = None  # For Printful {firstName, lastName, address, city, zipCode, country, email, phone}

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: str
    provider: str = "stripe"
    amount: float
    currency: str = "usd"
    items: List[Dict]
    status: str = "initiated"
    payment_status: str = "pending"
    paypal_order_id: Optional[str] = None
    shipping_address: Optional[Dict] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Printful Models
class PrintfulOrderRequest(BaseModel):
    """Request to send order to Printful"""
    session_id: str
    shipping_address: Dict  # {firstName, lastName, address, city, zipCode, country, email, phone}

class PrintfulWebhookEvent(BaseModel):
    """Printful webhook event"""
    type: str  # order:created, shipment:updated, etc
    data: Dict

# Newsletter & System
    email: EmailStr

class NewsletterSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    subscribed_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# =============================================================================
# AUTH ROUTES
# =============================================================================

@api_router.post("/auth/register")
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserRegister):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    logger.info(f"New user registered: {user_data.email}")
    
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name
        }
    }

@api_router.post("/auth/login")
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin):
    """Login user"""
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["_id"]})
    logger.info(f"User login: {credentials.email}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "is_admin": user.get("is_admin", False)
        }
    }

@api_router.get("/auth/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": current_user["_id"],
        "email": current_user["email"],
        "first_name": current_user["first_name"],
        "last_name": current_user["last_name"],
        "is_admin": current_user.get("is_admin", False),
        "created_at": current_user.get("created_at")
    }

# =============================================================================
# USER PROFILE ROUTES
# =============================================================================

@api_router.put("/users/profile")
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update current user profile"""
    update_dict = update_data.dict(exclude_unset=True)
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_dict}
    )
    
    logger.info(f"User profile updated: {current_user['email']}")
    return {"message": "Profile updated successfully"}

@api_router.get("/users/{user_id}")
async def get_user_public(user_id: str):
    """Get public user info"""
    user = await db.users.find_one(
        {"_id": user_id},
        {"_id": 1, "first_name": 1, "last_name": 1, "created_at": 1}
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# =============================================================================
# PRODUCTS ROUTES (DB-BASED)
# =============================================================================

@api_router.get("/products")
@limiter.limit("30/minute")
async def get_products(
    request: Request,
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """Get products with optional filtering and search"""
    query = {"visible": {"$ne": False}}

    if category:
        query["category"] = category.upper()
    
    if search:
        query["$text"] = {"$search": search}
    
    products = await db.products.find(query).skip(skip).limit(limit).to_list(None)
    total = await db.products.count_documents(query)

    return {
        "products": products,
        "count": len(products),
        "total": total,
        "skip": skip,
        "limit": limit
    }

@api_router.get("/site-content/home")
async def get_home_content():
    """Get editable home page content."""
    return {"content": await get_home_content_doc()}

@api_router.get("/site-content/global")
async def get_global_content():
    """Get editable global site content and theme."""
    return {"content": await get_site_content_doc("global", DEFAULT_GLOBAL_CONTENT)}

@api_router.get("/site-content/philosophy")
async def get_philosophy_content():
    """Get editable philosophy page content."""
    return {"content": await get_site_content_doc("philosophy", DEFAULT_PHILOSOPHY_CONTENT)}

@api_router.get("/products/slug/{slug}")
async def get_product_by_slug(slug: str):
    """Get a specific product by slug"""
    product = await db.products.find_one({"slug": slug})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    reviews = await db.reviews.find(
        {"product_id": product["_id"]}
    ).sort("created_at", -1).to_list(10)

    return {
        "product": product,
        "reviews": reviews
    }

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get a specific product with reviews"""
    product = await db.products.find_one({"_id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    reviews = await db.reviews.find(
        {"product_id": product_id}
    ).sort("created_at", -1).to_list(10)
    
    return {
        "product": product,
        "reviews": reviews
    }

@api_router.post("/admin/products")
async def create_product(product_data: ProductCreate, current_user: dict = Depends(get_current_admin)):
    """Create a new product (admin only)"""
    product_id = str(uuid.uuid4())
    product_payload = product_data.dict()
    product_payload["slug"] = product_payload.get("slug") or slugify(product_payload["name"])
    if not product_payload.get("image_url") and product_payload.get("images"):
        product_payload["image_url"] = product_payload["images"][0]
    product_doc = {
        "_id": product_id,
        **product_payload,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "rating": 0,
        "review_count": 0
    }
    
    await db.products.insert_one(product_doc)
    logger.info(f"Product created: {product_id}")
    
    return product_doc

@api_router.put("/admin/products/{product_id}")
async def update_product(product_id: str, update_data: ProductUpdate, current_user: dict = Depends(get_current_admin)):
    """Update product (admin only)"""
    update_dict = update_data.dict(exclude_unset=True)
    if update_dict:
        if update_dict.get("name") and not update_dict.get("slug"):
            update_dict["slug"] = slugify(update_dict["name"])
        if not update_dict.get("image_url") and update_dict.get("images"):
            update_dict["image_url"] = update_dict["images"][0]
        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.products.update_one({"_id": product_id}, {"$set": update_dict})
    
    product = await db.products.find_one({"_id": product_id})
    logger.info(f"Product updated: {product_id}")
    
    return product

@api_router.get("/admin/products")
async def get_admin_products(current_user: dict = Depends(get_current_admin)):
    """Get all products for admin, including hidden ones."""
    products = await db.products.find({}).sort("created_at", -1).to_list(1000)
    return {"products": products, "count": len(products)}

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_admin)):
    """Delete product (admin only)"""
    result = await db.products.delete_one({"_id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    logger.info(f"Product deleted: {product_id}")
    return {"message": "Product deleted"}

# =============================================================================
# WISHLIST ROUTES
# =============================================================================

@api_router.get("/wishlist")
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    """Get user's wishlist"""
    wishlist_items = await db.wishlist.find(
        {"user_id": current_user["_id"]}
    ).to_list(100)
    
    product_ids = [item["product_id"] for item in wishlist_items]
    products = await db.products.find({"_id": {"$in": product_ids}}).to_list(len(product_ids))
    
    return {
        "wishlist": wishlist_items,
        "products": products,
        "count": len(wishlist_items)
    }

@api_router.post("/wishlist/{product_id}")
async def add_to_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    """Add product to wishlist"""
    existing = await db.wishlist.find_one({
        "user_id": current_user["_id"],
        "product_id": product_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")
    
    wishlist_item = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "product_id": product_id,
        "added_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.wishlist.insert_one(wishlist_item)
    
    return wishlist_item

@api_router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: str, current_user: dict = Depends(get_current_user)):
    """Remove product from wishlist"""
    await db.wishlist.delete_one({
        "user_id": current_user["_id"],
        "product_id": product_id
    })
    
    return {"message": "Removed from wishlist"}

# =============================================================================
# REVIEWS ROUTES
# =============================================================================

@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    """Create a product review"""
    # Check if product exists
    product = await db.products.find_one({"_id": review_data.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing_review = await db.reviews.find_one({
        "product_id": review_data.product_id,
        "user_id": current_user["_id"]
    })
    if existing_review:
        raise HTTPException(status_code=400, detail="You already reviewed this product")
    
    review_id = str(uuid.uuid4())
    review_doc = {
        "_id": review_id,
        **review_data.dict(),
        "user_id": current_user["_id"],
        "user_email": current_user["email"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "helpful_count": 0
    }
    
    await db.reviews.insert_one(review_doc)
    
    # Update product rating
    reviews = await db.reviews.find({"product_id": review_data.product_id}).to_list(1000)
    avg_rating = sum([r["rating"] for r in reviews]) / len(reviews)
    
    await db.products.update_one(
        {"_id": review_data.product_id},
        {
            "$set": {
                "rating": round(avg_rating, 1),
                "review_count": len(reviews)
            }
        }
    )
    
    logger.info(f"Review created for product {review_data.product_id}")
    return review_doc

@api_router.get("/products/{product_id}/reviews")
async def get_product_reviews(product_id: str, skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=50)):
    """Get reviews for a product"""
    reviews = await db.reviews.find(
        {"product_id": product_id}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.reviews.count_documents({"product_id": product_id})
    
    return {
        "reviews": reviews,
        "count": len(reviews),
        "total": total
    }

@api_router.put("/reviews/{review_id}")
async def update_review(review_id: str, update_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    """Update a review"""
    review = await db.reviews.find_one({"_id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review["user_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Can only update your own reviews")
    
    update_dict = update_data.dict()
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.reviews.update_one({"_id": review_id}, {"$set": update_dict})
    
    return await db.reviews.find_one({"_id": review_id})

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a review"""
    review = await db.reviews.find_one({"_id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review["user_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Can only delete your own reviews")
    
    await db.reviews.delete_one({"_id": review_id})
    
    return {"message": "Review deleted"}

# =============================================================================
# NEWSLETTER ROUTES
# =============================================================================

@api_router.post("/newsletter/subscribe")
@limiter.limit("5/minute")
async def subscribe_newsletter(request: Request, data: NewsletterSubscription):
    """Subscribe to LXI newsletter"""
    existing = await db.newsletter_subscriptions.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already subscribed")
    
    subscription = {
        "_id": str(uuid.uuid4()),
        "email": data.email,
        "subscribed_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.newsletter_subscriptions.insert_one(subscription)
    logger.info(f"New newsletter subscription: {data.email}")
    
    return {"message": "Successfully subscribed", "email": data.email}

@api_router.get("/admin/newsletter/subscribers")
async def get_subscribers(current_user: dict = Depends(get_current_admin)):
    """Get all newsletter subscribers (admin)"""
    subscribers = await db.newsletter_subscriptions.find({}).to_list(10000)
    return {"subscribers": subscribers, "count": len(subscribers)}

@api_router.post("/admin/upload-image")
async def upload_admin_image(
    request: Request,
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_admin)
):
    """Upload an image file for CMS usage and return a public URL."""
    allowed_types = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
    extension = allowed_types.get(image.content_type)
    if not extension:
        raise HTTPException(status_code=400, detail="Unsupported image type")

    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = UPLOADS_DIR / filename
    content = await image.read()

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Max 10MB")

    file_path.write_bytes(content)
    base_url = str(request.base_url).rstrip("/")
    return {
        "filename": filename,
        "url": f"{base_url}/uploads/{filename}"
    }

@api_router.get("/admin/site-content/home")
async def get_admin_home_content(current_user: dict = Depends(get_current_admin)):
    """Get home content for admin editing."""
    return {"content": await get_home_content_doc()}

@api_router.put("/admin/site-content/home")
async def update_admin_home_content(
    content_data: HomeContentUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """Update editable home page content."""
    payload = content_data.dict()
    payload["_id"] = "home"
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.site_content.update_one(
        {"_id": "home"},
        {"$set": payload},
        upsert=True
    )

    return {"content": await get_home_content_doc(), "message": "Home content updated"}

@api_router.get("/admin/site-content/global")
async def get_admin_global_content(current_user: dict = Depends(get_current_admin)):
    """Get global content for admin editing."""
    return {"content": await get_site_content_doc("global", DEFAULT_GLOBAL_CONTENT)}

@api_router.put("/admin/site-content/global")
async def update_admin_global_content(
    content_data: GlobalContentUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """Update editable global site content and theme."""
    payload = content_data.dict()
    payload["_id"] = "global"
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.site_content.update_one(
        {"_id": "global"},
        {"$set": payload},
        upsert=True
    )

    return {"content": await get_site_content_doc("global", DEFAULT_GLOBAL_CONTENT), "message": "Global content updated"}

@api_router.get("/admin/site-content/philosophy")
async def get_admin_philosophy_content(current_user: dict = Depends(get_current_admin)):
    """Get philosophy page content for admin editing."""
    return {"content": await get_site_content_doc("philosophy", DEFAULT_PHILOSOPHY_CONTENT)}

@api_router.put("/admin/site-content/philosophy")
async def update_admin_philosophy_content(
    content_data: PhilosophyContentUpdate,
    current_user: dict = Depends(get_current_admin)
):
    """Update editable philosophy page content."""
    payload = content_data.dict()
    payload["_id"] = "philosophy"
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()

    await db.site_content.update_one(
        {"_id": "philosophy"},
        {"$set": payload},
        upsert=True
    )

    return {"content": await get_site_content_doc("philosophy", DEFAULT_PHILOSOPHY_CONTENT), "message": "Philosophy content updated"}

# =============================================================================
# CHECKOUT & ORDERS ROUTES
# =============================================================================

@api_router.post("/checkout/create-session")
@limiter.limit("20/minute")
async def create_checkout_session(
    request: Request,
    data: CheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe checkout session"""
    if not data.items or len(data.items) == 0:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total_amount = 0.0
    validated_items = []
    
    for item in data.items:
        product = await db.products.find_one({"_id": item.product_id})
        if not product:
            raise HTTPException(status_code=400, detail=f"Invalid product: {item.product_id}")
        
        item_total = product["price"] * item.quantity
        total_amount += item_total
        
        validated_items.append({
            "product_id": item.product_id,
            "name": item.name,
            "price": product["price"],
            "quantity": item.quantity,
            "size": item.size
        })

    line_items = [
        {
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": item["name"],
                    "metadata": {
                        "product_id": item["product_id"],
                        "size": item["size"]
                    }
                },
                "unit_amount": int(round(item["price"] * 100))
            },
            "quantity": item["quantity"]
        }
        for item in validated_items
    ]
    
    success_url = f"{data.origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{data.origin_url}/checkout/cancel"
    
    try:
        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "source": "lxi_ecommerce",
                "user_id": current_user["_id"],
                "items_count": str(len(validated_items))
            }
        )
        
        transaction = PaymentTransaction(
            session_id=session.id,
            user_id=current_user["_id"],
            provider="stripe",
            amount=total_amount,
            items=validated_items,
            status="initiated",
            payment_status="pending",
            shipping_address=data.shipping_address  # Save for Printful
        )
        
        await db.payment_transactions.insert_one(transaction.model_dump())
        logger.info(f"Created checkout session: {session.id}")
        
        return {
            "url": session.url,
            "session_id": session.id
        }
        
    except Exception as e:
        logger.error(f"Stripe checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@api_router.post("/checkout/create-paypal-order")
@limiter.limit("20/minute")
async def create_paypal_order(
    request: Request,
    data: CheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a PayPal order and return approval URL."""
    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = 0.0
    validated_items = []
    for item in data.items:
        product = await db.products.find_one({"_id": item.product_id})
        if not product:
            raise HTTPException(status_code=400, detail=f"Invalid product: {item.product_id}")
        item_total = product["price"] * item.quantity
        total_amount += item_total
        validated_items.append({
            "product_id": item.product_id,
            "name": item.name,
            "price": product["price"],
            "quantity": item.quantity,
            "size": item.size
        })

    access_token = await get_paypal_access_token()
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [{
            "amount": {
                "currency_code": "USD",
                "value": f"{total_amount:.2f}"
            }
        }],
        "application_context": {
            "return_url": f"{data.origin_url}/checkout/success?provider=paypal",
            "cancel_url": f"{data.origin_url}/checkout/cancel?provider=paypal"
        }
    }

    async with httpx.AsyncClient() as http_client:
        response = await http_client.post(
            f"{paypal_base_url}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=payload
        )
        response.raise_for_status()
        order_data = response.json()

    approve_url = next((link["href"] for link in order_data.get("links", []) if link.get("rel") == "approve"), None)
    if not approve_url:
        raise HTTPException(status_code=500, detail="PayPal approval URL not returned")

    transaction = PaymentTransaction(
        session_id=order_data["id"],
        paypal_order_id=order_data["id"],
        provider="paypal",
        user_id=current_user["_id"],
        amount=total_amount,
        items=validated_items,
        status="initiated",
        payment_status="pending",
        shipping_address=data.shipping_address
    )
    await db.payment_transactions.insert_one(transaction.model_dump())

    return {
        "provider": "paypal",
        "order_id": order_data["id"],
        "url": approve_url
    }

@api_router.post("/checkout/capture-paypal-order")
async def capture_paypal_order(
    payload: Dict,
    current_user: dict = Depends(get_current_user)
):
    """Capture an approved PayPal order."""
    paypal_order_id = payload.get("order_id")
    if not paypal_order_id:
        raise HTTPException(status_code=400, detail="Missing PayPal order_id")

    transaction = await db.payment_transactions.find_one({
        "paypal_order_id": paypal_order_id,
        "user_id": current_user["_id"]
    })
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.get("payment_status") == "paid":
        return {"status": "complete", "payment_status": "paid", "provider": "paypal"}

    access_token = await get_paypal_access_token()
    async with httpx.AsyncClient() as http_client:
        response = await http_client.post(
            f"{paypal_base_url}/v2/checkout/orders/{paypal_order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        response.raise_for_status()
        capture_data = response.json()

    await db.payment_transactions.update_one(
        {"paypal_order_id": paypal_order_id},
        {
            "$set": {
                "status": "complete",
                "payment_status": "paid",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )

    updated_transaction = await db.payment_transactions.find_one({"paypal_order_id": paypal_order_id})
    try:
        printful_id = await send_transaction_to_printful(updated_transaction)
        if printful_id:
            await db.payment_transactions.update_one(
                {"paypal_order_id": paypal_order_id},
                {"$set": {"printful_order_id": str(printful_id), "printful_status": "sent_to_production"}}
            )
    except Exception as e:
        logger.error(f"PayPal capture Printful send failed: {str(e)}")

    return {
        "status": capture_data.get("status", "COMPLETED").lower(),
        "payment_status": "paid",
        "provider": "paypal",
        "order_id": paypal_order_id
    }

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request, current_user: dict = Depends(get_current_user)):
    """Get the status of a checkout session"""
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.get("user_id") != current_user["_id"] and not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Not authorized to view this transaction")
    
    if transaction.get("payment_status") == "paid":
        return {
            "status": "complete",
            "payment_status": "paid",
            "amount_total": transaction.get("amount", 0),
            "currency": "usd"
        }
    
    try:
        # Get session status from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status == "paid":
            await finalize_paid_transaction(session_id, source="checkout_status")
            logger.info(f"Payment completed via status endpoint: {session_id}")
        
        return {
            "status": session.status,
            "payment_status": session.payment_status,
            "amount_total": session.amount_total,
            "currency": session.currency
        }
        
    except Exception as e:
        logger.error(f"Error checking payment status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to check payment status")

@api_router.post("/webhook/stripe")
@limiter.limit("100/minute")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

    if not STRIPE_WEBHOOK_SECRET:
        logger.error("Stripe webhook secret is not configured")
        raise HTTPException(status_code=500, detail="Stripe webhook not configured")

    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    if not signature:
        logger.warning("Stripe webhook request missing Stripe-Signature header")
        raise HTTPException(status_code=400, detail="Missing Stripe signature header")

    try:
        event = stripe.Webhook.construct_event(body, signature, STRIPE_WEBHOOK_SECRET)
    except ValueError as e:
        logger.warning(f"Invalid Stripe webhook payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid Stripe payload")
    except stripe.error.SignatureVerificationError as e:
        logger.warning(f"Invalid Stripe signature: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    except Exception as e:
        logger.exception(f"Unexpected Stripe signature verification error: {str(e)}")
        raise HTTPException(status_code=500, detail="Stripe webhook verification failed")

    try:
        # Handle checkout.session.completed event
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            session_id = session["id"]
            await finalize_paid_transaction(session_id, source="stripe_webhook")
            logger.info(f"Stripe webhook processed checkout.session.completed: {session_id}")

        return {"status": "received"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Stripe webhook processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Stripe webhook processing failed")

@api_router.get("/orders")
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    """Get current user's orders"""
    orders = await db.payment_transactions.find(
        {"user_id": current_user["_id"]}
    ).sort("created_at", -1).to_list(50)
    
    return {"orders": orders, "count": len(orders)}

@api_router.get("/orders/{session_id}")
async def get_order(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific order"""
    order = await db.payment_transactions.find_one({"session_id": session_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.get("user_id") != current_user["_id"] and not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    return order

@api_router.get("/admin/orders")
async def get_all_orders(current_user: dict = Depends(get_current_admin)):
    """Get all orders (admin only)"""
    orders = await db.payment_transactions.find(
        {}
    ).sort("created_at", -1).to_list(100)
    
    return {"orders": orders, "count": len(orders)}

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_admin)):
    """Get admin dashboard statistics"""
    try:
        total_users = await db.users.count_documents({})
        total_products = await db.products.count_documents({})
        total_orders = await db.payment_transactions.count_documents({"payment_status": "paid"})
        newsletter_subscribers = await db.newsletter_subscriptions.count_documents({})
        
        # Calculate total revenue
        revenue_result = await db.payment_transactions.aggregate([
            {"$match": {"payment_status": "paid"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(1)
        
        total_revenue = revenue_result[0]["total"] if revenue_result else 0
        
        # Get recent orders
        recent_orders = await db.payment_transactions.find(
            {"payment_status": "paid"}
        ).sort("created_at", -1).limit(5).to_list(5)
        
        return {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "newsletter_subscribers": newsletter_subscribers,
            "recent_orders": recent_orders
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/integrations/status")
async def get_integrations_status(current_user: dict = Depends(get_current_admin)):
    """Return safe integration readiness flags without exposing secrets."""
    return {
        "mongodb_configured": bool(os.environ.get("MONGO_URL")) and "ROTATE_AND_SET" not in os.environ.get("MONGO_URL", ""),
        "stripe_configured": bool(stripe_api_key) and "ROTATE_AND_SET" not in stripe_api_key,
        "stripe_webhook_configured": bool(os.environ.get("STRIPE_WEBHOOK_SECRET")) and "SET_NEW" not in os.environ.get("STRIPE_WEBHOOK_SECRET", ""),
        "paypal_configured": bool(paypal_client_id and paypal_client_secret) and "SET_NEW" not in paypal_client_id and "SET_NEW" not in paypal_client_secret,
        "printful_configured": bool(printful_api_key) and "ROTATE_AND_SET" not in printful_api_key,
        "printful_webhook_configured": bool(printful_webhook_secret_hex) and "SET_" not in printful_webhook_secret_hex,
    }

# =============================================================================
# PRINTFUL INTEGRATION ROUTES
# =============================================================================

@api_router.post("/admin/sync-products-printful")
async def sync_products_to_printful(current_user: dict = Depends(get_current_admin)):
    """
    Syncronize all LXI products with Printful
    Maps each product to a Printful product ID
    """
    if not printful_api_key:
        raise HTTPException(status_code=500, detail="Printful API key not configured")
    
    try:
        client = PrintfulClient(api_key=printful_api_key)
        products = await db.products.find({}).to_list(1000)
        printful_products = await client.get_products()
        
        synced = 0
        failed = 0
        mapping = {}
        
        for product in products:
            try:
                # Check if already synced
                if product.get("printful_id"):
                    synced += 1
                    mapping[str(product["_id"])] = product["printful_id"]
                    continue
                
                # Match by external_id first, then by name
                matched_product = None
                for pf_product in printful_products:
                    if pf_product.get("external_id") == str(product["_id"]):
                        matched_product = pf_product
                        break
                    if pf_product.get("name", "").strip().lower() == product.get("name", "").strip().lower():
                        matched_product = pf_product
                        break
                
                if matched_product:
                    detail = await client.get_product(matched_product["id"])
                    variants = extract_printful_variants(detail)
                    printful_id = matched_product["id"]
                    # Update product with Printful ID
                    await db.products.update_one(
                        {"_id": product["_id"]},
                        {"$set": {"printful_id": printful_id, "printful_variants": variants}}
                    )
                    mapping[str(product["_id"])] = printful_id
                    synced += 1
                    logger.info(f"Product synced: {product['name']} → {printful_id}")
                else:
                    failed += 1
                    logger.warning(f"No Printful match for: {product['name']}")
            
            except Exception as e:
                failed += 1
                logger.error(f"Error syncing {product['name']}: {str(e)}")
        
        return {
            "status": "complete",
            "synced": synced,
            "failed": failed,
            "mapping": mapping,
            "message": f"Synced {synced} products, {failed} failed"
        }
    
    except Exception as e:
        logger.error(f"Sync error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/import-printful-catalog")
async def import_printful_catalog(current_user: dict = Depends(get_current_admin)):
    """
    Import an existing Printful catalog into the local products collection.
    Uses the Printful store products API and upserts products locally.
    """
    if not printful_api_key:
        raise HTTPException(status_code=500, detail="Printful API key not configured")

    try:
        client = PrintfulClient(api_key=printful_api_key)
        printful_products = await client.get_products()

        imported = 0
        updated = 0
        failed = 0

        for remote_product in printful_products:
            try:
                detail = await client.get_product(remote_product["id"])
                result = detail.get("result", {})
                variants = extract_printful_variants(detail)
                first_variant = variants[0] if variants else {}
                identity = extract_printful_product_identity(detail, remote_product)
                external_id = identity["external_id"]
                canonical_name = identity["name"]
                slug = slugify(canonical_name or f"printful-{remote_product['id']}")
                local_id = external_id or slug
                media = extract_printful_product_media(detail, remote_product)
                price = first_variant.get("retail_price") or 0
                category = infer_catalog_category(identity["source_name"])
                description = f"Imported from Printful: {canonical_name}"

                product_doc = {
                    "_id": local_id,
                    "slug": slug,
                    "name": canonical_name,
                    "category": category,
                    "description": description,
                    "price": float(price or 0),
                    "sizes": [variant["size"] for variant in variants] or ["DEFAULT"],
                    "inventory": 999,
                    "sku": first_variant.get("sku") or external_id or slug,
                    "image_url": media["image_url"],
                    "images": media["images"],
                    "printful_id": str(remote_product["id"]),
                    "printful_external_id": external_id,
                    "printful_variants": variants,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }

                existing = await db.products.find_one({"_id": local_id})
                if existing:
                    await db.products.update_one({"_id": local_id}, {"$set": product_doc})
                    updated += 1
                else:
                    product_doc["created_at"] = datetime.now(timezone.utc).isoformat()
                    product_doc["rating"] = 0
                    product_doc["review_count"] = 0
                    await db.products.insert_one(product_doc)
                    imported += 1
            except Exception as e:
                failed += 1
                logger.error(f"Import failed for Printful product {remote_product.get('id')}: {str(e)}")

        return {
            "status": "complete",
            "imported": imported,
            "updated": updated,
            "failed": failed,
            "message": f"Imported {imported}, updated {updated}, failed {failed}"
        }
    except Exception as e:
        logger.error(f"Printful import error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/orders/send-to-printful")
async def send_order_to_printful(
    request_data: PrintfulOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Send a confirmed order to Printful for production
    Triggered after Stripe payment is confirmed
    """
    if not printful_api_key:
        raise HTTPException(status_code=500, detail="Printful API key not configured")
    
    try:
        # Get order from payment_transactions
        order = await db.payment_transactions.find_one({
            "session_id": request_data.session_id,
            "user_id": current_user["_id"]
        })
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.get("payment_status") != "paid":
            raise HTTPException(status_code=400, detail="Order not paid yet")
        
        if order.get("printful_order_id"):
            return {
                "status": "already_sent",
                "printful_order_id": order["printful_order_id"],
                "message": "Order already sent to Printful"
            }
        
        # Prepare items for Printful
        client = PrintfulClient(api_key=printful_api_key)
        items_for_printful = []
        
        for item in order["items"]:
            product = await db.products.find_one({"_id": item["product_id"]})

            variant = find_matching_printful_variant(product or {}, item) if product else None

            if not product or not variant:
                raise HTTPException(
                    status_code=400,
                    detail=f"Product {item['product_id']} not synced with Printful"
                )
            
            items_for_printful.append(PrintfulOrderItem(
                sync_variant_id=int(variant["sync_variant_id"]),
                quantity=item["quantity"],
                size=item.get("size", "M"),
                retail_price=str(item.get("price", 0))
            ))
        
        # Prepare shipping address
        shipping_addr = request_data.shipping_address
        recipient = build_recipient_from_shipping(shipping_addr, fallback_email=current_user['email'])
        
        # Create order in Printful
        printful_order = PrintfulOrder(
            external_id=request_data.session_id,
            items=items_for_printful,
            recipient=recipient,
            retail_costs={"shipping": 0, "tax": 0, "discount": 0}
        )
        
        printful_response = await client.create_order(printful_order)
        
        if not printful_response or "error" in printful_response:
            error_msg = printful_response.get("error", "Unknown Printful error")
            logger.error(f"Printful order creation failed: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Printful error: {error_msg}")
        
        printful_order_id = printful_response.get("result", {}).get("id")
        
        # Update order in DB with Printful ID
        await db.payment_transactions.update_one(
            {"session_id": request_data.session_id},
            {
                "$set": {
                    "printful_order_id": str(printful_order_id),
                    "printful_status": "pending_production",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        logger.info(f"Order sent to Printful: {printful_order_id}")
        
        return {
            "status": "sent",
            "printful_order_id": printful_order_id,
            "printful_status": "pending_production",
            "message": "Order successfully sent to Printful"
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error sending order to Printful: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/webhook/printful")
@limiter.limit("100/minute")
async def handle_printful_webhook(request: Request):
    """
    Handle Printful webhooks for order updates
    Events: order:created, shipment:updated, order:failed
    """
    raw_body = await request.body()

    if printful_webhook_secret_hex:
        signature = request.headers.get("X-PF-Signature") or request.headers.get("X-Printful-Signature", "")
        digest = hmac.new(
            bytes.fromhex(printful_webhook_secret_hex),
            raw_body,
            hashlib.sha256
        ).hexdigest()
        if not signature or not hmac.compare_digest(signature, digest):
            logger.warning("Invalid Printful webhook signature")
            raise HTTPException(status_code=400, detail="Invalid Printful signature")

    try:
        body = json.loads(raw_body.decode("utf-8"))
    except json.JSONDecodeError as e:
        logger.warning(f"Invalid Printful webhook JSON payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid Printful payload")

    event_type = body.get("type")
    data = body.get("data", {})

    if not event_type:
        logger.warning("Printful webhook missing event type")
        raise HTTPException(status_code=400, detail="Missing Printful event type")

    logger.info(f"Printful webhook received: {event_type}")

    external_id = data.get("external_id")  # Our session_id
    if not external_id:
        logger.warning(f"Printful webhook missing external_id for event={event_type}")
        raise HTTPException(status_code=400, detail="Missing external_id in Printful payload")

    transaction = await db.payment_transactions.find_one({"session_id": external_id})
    if not transaction:
        logger.error(f"Printful webhook references unknown session_id={external_id}")
        raise HTTPException(status_code=500, detail="Order not found for Printful webhook")

    try:
        # Handle different event types
        if event_type == "order:created":
            printful_id = data.get("id")
            await db.payment_transactions.update_one(
                {"session_id": external_id},
                {
                    "$set": {
                        "printful_order_id": str(printful_id),
                        "printful_status": "processing",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logger.info(f"Order created in Printful: {printful_id}")

        elif event_type == "shipment:updated":
            tracking_number = data.get("tracking_number")
            tracking_url = data.get("tracking_url")
            carrier = data.get("carrier", "Unknown")

            await db.payment_transactions.update_one(
                {"session_id": external_id},
                {
                    "$set": {
                        "printful_status": "shipped",
                        "tracking_number": tracking_number,
                        "tracking_url": tracking_url,
                        "carrier": carrier,
                        "shipped_at": datetime.now(timezone.utc).isoformat(),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logger.info(f"Order shipped: {external_id}, Tracking: {tracking_number}")

        elif event_type == "order:failed":
            failure_reason = data.get("error", "Unknown reason")
            await db.payment_transactions.update_one(
                {"session_id": external_id},
                {
                    "$set": {
                        "printful_status": "failed",
                        "failure_reason": failure_reason,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            logger.error(f"Order failed in Printful: {external_id}, Reason: {failure_reason}")

        return {"status": "received"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Printful webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Printful webhook processing failed")


@api_router.get("/orders/{session_id}/printful-status")
async def get_printful_order_status(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get Printful status for an order"""
    try:
        order = await db.payment_transactions.find_one({
            "session_id": session_id,
            "user_id": current_user["_id"]
        })
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        printful_info = {
            "printful_order_id": order.get("printful_order_id"),
            "status": order.get("printful_status", "pending"),
            "tracking_number": order.get("tracking_number"),
            "tracking_url": order.get("tracking_url"),
            "carrier": order.get("carrier"),
            "shipped_at": order.get("shipped_at"),
            "failure_reason": order.get("failure_reason")
        }
        
        return printful_info
    
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting Printful status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# HEALTH & SYSTEM ROUTES
# =============================================================================

@api_router.get("/")
async def root():
    """API root"""
    return {"message": "LXI API - Founders Edition v2", "version": "2.0.0"}

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "brand": "LXI", "edition": "Founders MMXXVI"}

# =============================================================================
# APP SETUP
# =============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return {"detail": "Rate limit exceeded"}

@app.on_event("startup")
async def ensure_critical_indexes():
    """Create critical production indexes."""
    try:
        await db.users.create_index("email", unique=True, name="uniq_users_email")
        await db.products.create_index(
            "slug",
            unique=True,
            sparse=True,
            name="uniq_products_slug"
        )
        logger.info("Critical MongoDB indexes verified")
    except Exception as e:
        logger.exception(f"Failed to create critical MongoDB indexes: {str(e)}")
        raise RuntimeError("Critical MongoDB indexes could not be created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()

    print("🔥 WEBHOOK RECIBIDO")
    print(payload)

    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

