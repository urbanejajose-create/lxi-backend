"""
Printful Integration Module
Sincronización de productos, creación de órdenes y seguimiento
"""

import httpx
import os
from typing import Optional, Dict, List
from pydantic import BaseModel
from datetime import datetime

PRINTFUL_API_KEY = os.environ.get('PRINTFUL_API_KEY')
PRINTFUL_API_URL = "https://api.printful.com"

# Headers para cada request
PRINTFUL_HEADERS = {
    "Authorization": f"Bearer {PRINTFUL_API_KEY}",
    "Content-Type": "application/json"
}


# ============================================================
# MODELS
# ============================================================

class PrintfulProduct(BaseModel):
    """Modelo de producto Printful"""
    id: Optional[int] = None
    external_id: Optional[str] = None  # ID del producto en LXI
    name: str
    description: Optional[str] = None
    sku: str
    price: float
    images: List[Dict] = []


class PrintfulOrderItem(BaseModel):
    """Item de orden en Printful"""
    sync_variant_id: int
    quantity: int
    size: str
    color: Optional[str] = None
    retail_price: Optional[str] = None


class PrintfulOrder(BaseModel):
    """Orden para enviar a Printful"""
    external_id: str  # Tu referencia de orden (LXI order_id)
    items: List[PrintfulOrderItem]
    recipient: Dict  # { name, address1, city, state_code, country_code, zip }
    retail_costs: Dict  # { shipping, tax, discount }


# ============================================================
# PRINTFUL API CLIENT
# ============================================================

class PrintfulClient:
    
    def __init__(self, api_key: str = PRINTFUL_API_KEY):
        self.api_key = api_key
        self.base_url = PRINTFUL_API_URL
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def get_store_info(self) -> Dict:
        """Obtener información de la tienda Printful"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/store",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def get_products(self) -> List[Dict]:
        """Obtener todos los productos de Printful"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/store/products",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            return data.get("result", [])
    
    async def get_product(self, printful_id: int) -> Dict:
        """Obtener detalles de un producto específico"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/store/products/{printful_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def create_product(self, product_data: PrintfulProduct) -> Dict:
        """Crear producto en Printful"""
        payload = {
            "external_id": product_data.external_id,
            "name": product_data.name,
            "description": product_data.description,
            "sku": product_data.sku,
            "images": product_data.images
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/products",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
    
    async def create_order(self, order: PrintfulOrder) -> Dict:
        """Crear orden en Printful"""
        payload = {
            "external_id": order.external_id,
            "items": [
                {
                    "sync_variant_id": item.sync_variant_id,
                    "quantity": item.quantity,
                    **({"retail_price": item.retail_price} if item.retail_price is not None else {})
                }
                for item in order.items
            ],
            "recipient": order.recipient,
            "retail_costs": order.retail_costs
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/orders",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
    
    async def get_order(self, printful_order_id: int) -> Dict:
        """Obtener estado de orden en Printful"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/orders/{printful_order_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def get_order_by_external_id(self, external_id: str) -> Dict:
        """Obtener orden por ID externo (LXI)"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/orders/external/{external_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def update_order_status(self, printful_order_id: int, status: str) -> Dict:
        """Actualizar estado de orden"""
        payload = {"status": status}
        
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{self.base_url}/orders/{printful_order_id}",
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
    
    async def get_tracking_info(self, printful_order_id: int) -> Dict:
        """Obtener información de rastreo"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/orders/{printful_order_id}/shipments",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()


# ============================================================
# WEBHOOK HANDLERS
# ============================================================

async def handle_printful_webhook(event_type: str, data: Dict) -> bool:
    """
    Manejar webhooks de Printful
    
    Event types:
    - order:created
    - order:updated
    - order:failed
    - shipment:created
    - shipment:updated
    """
    
    try:
        if event_type == "order:created":
            # Orden creada en Printful, actualizar en BD
            print(f"✅ Orden creada en Printful: {data.get('external_id')}")
            return True
        
        elif event_type == "order:updated":
            # Estado de orden cambió
            status = data.get("status")
            print(f"📦 Orden actualizada: {data.get('external_id')} → {status}")
            return True
        
        elif event_type == "shipment:updated":
            # Paquete enviado, actualizar tracking
            tracking_url = data.get("tracking_url")
            print(f"🚚 Tracking disponible: {tracking_url}")
            return True
        
        elif event_type == "order:failed":
            # Orden fallida, notificar al usuario
            print(f"❌ Orden fallida: {data.get('external_id')}")
            return False
        
        return True
    
    except Exception as e:
        print(f"Error procesando webhook: {str(e)}")
        return False


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

async def sync_products_to_printful(db, lxi_products: List[Dict]) -> Dict:
    """
    Sincronizar productos de LXI a Printful
    
    Retorna:
    {
        "synced": 5,
        "failed": 0,
        "product_mapping": {
            "lxi_id": "printful_id",
            ...
        }
    }
    """
    client = PrintfulClient()
    mapping = {}
    synced = 0
    failed = 0
    
    for product in lxi_products:
        try:
            printful_data = PrintfulProduct(
                external_id=str(product["_id"]),
                name=product["name"],
                description=product.get("description", ""),
                sku=product.get("sku", product["_id"]),
                price=product["price"],
                images=product.get("images", [])
            )
            
            result = await client.create_product(printful_data)
            
            if "result" in result:
                printful_id = result["result"]["id"]
                mapping[str(product["_id"])] = printful_id
                
                # Guardar printful_id en BD
                await db.products.update_one(
                    {"_id": product["_id"]},
                    {"$set": {"printful_id": printful_id}}
                )
                
                synced += 1
        
        except Exception as e:
            print(f"Error sincronizando {product['name']}: {str(e)}")
            failed += 1
    
    return {
        "synced": synced,
        "failed": failed,
        "product_mapping": mapping
    }


async def create_order_in_printful(order_data: Dict, product_mapping: Dict) -> Dict:
    """
    Crear orden en Printful desde orden de LXI
    
    Estructura esperada de order_data:
    {
        "_id": "order_123",
        "user_id": "user_123",
        "items": [...],
        "shipping_address": {...},
        "total": 99.99
    }
    """
    client = PrintfulClient()
    
    try:
        # Preparar items
        items = []
        for item in order_data.get("items", []):
            product_id = str(item["product_id"])
            printful_product_id = product_mapping.get(product_id)
            
            if not printful_product_id:
                raise ValueError(f"No mapping para producto {product_id}")
            
            items.append(PrintfulOrderItem(
                sync_variant_id=printful_product_id,
                quantity=item["quantity"],
                size=item.get("size", "M"),
                color=item.get("color"),
                retail_price=str(item.get("price", "0"))
            ))
        
        # Preparar dirección de envío
        shipping_addr = order_data.get("shipping_address", {})
        recipient = {
            "name": f"{shipping_addr.get('firstName', '')} {shipping_addr.get('lastName', '')}",
            "address1": shipping_addr.get('address', ''),
            "city": shipping_addr.get('city', ''),
            "state_code": shipping_addr.get('state', ''),
            "country_code": shipping_addr.get('country', 'US'),
            "zip": shipping_addr.get('zipCode', '')
        }
        
        # Calcular costos
        retail_costs = {
            "shipping": 0,  # Calcula basado en destinatario
            "tax": 0,
            "discount": 0
        }
        
        # Crear orden en Printful
        order = PrintfulOrder(
            external_id=str(order_data["_id"]),
            items=items,
            recipient=recipient,
            retail_costs=retail_costs
        )
        
        result = await client.create_order(order)
        
        return {
            "success": True,
            "printful_order_id": result.get("result", {}).get("id"),
            "data": result
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": None
        }
