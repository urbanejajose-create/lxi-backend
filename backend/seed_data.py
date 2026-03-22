"""
Seed data for MongoDB - Initial products and test data
Run this script to populate the database with sample products
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone
import uuid

load_dotenv()

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

PRODUCTS = [
    {
        "_id": "heavyweight-tee",
        "name": "HEAVYWEIGHT TEE",
        "category": "TOPS",
        "description": "No es una camiseta. Es la primera pieza de tu armadura. Premium heavyweight cotton with custom LXI branding. Perfect for the modern warrior.",
        "price": 59.00,
        "sizes": ["S", "M", "L", "XL", "2XL"],
        "inventory": 150,
        "sku": "LXI-TEE-HW-001",
        "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        "images": [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"
        ],
        "rating": 4.8,
        "review_count": 24,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "_id": "snapback-hat",
        "name": "SNAPBACK HAT",
        "category": "HEADWEAR",
        "description": "Corona tu transformación. Premium snapback with embroidered LXI logo. Adjustable sizing for perfect fit.",
        "price": 45.00,
        "sizes": ["ONE SIZE"],
        "inventory": 200,
        "sku": "LXI-HAT-SB-001",
        "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500",
        "images": [
            "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500"
        ],
        "rating": 4.6,
        "review_count": 18,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "_id": "eco-hoodie",
        "name": "ECO HOODIE ESSENTIAL",
        "category": "OUTERWEAR",
        "description": "La armadura esencial del gladiador moderno. Sustainable eco-friendly hoodie with premium comfort. Perfect layering piece.",
        "price": 89.00,
        "sizes": ["S", "M", "L", "XL", "2XL"],
        "inventory": 100,
        "sku": "LXI-HOO-ECO-001",
        "image_url": "https://images.unsplash.com/photo-1556821552-23d516b5a845?w=500",
        "images": [
            "https://images.unsplash.com/photo-1556821552-23d516b5a845?w=500"
        ],
        "rating": 4.9,
        "review_count": 32,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "_id": "cuffed-beanie",
        "name": "CUFFED BEANIE",
        "category": "HEADWEAR",
        "description": "Silencio y presencia. Classic cuffed beanie in premium knit material. The ultimate winter essential.",
        "price": 45.00,
        "sizes": ["ONE SIZE"],
        "inventory": 180,
        "sku": "LXI-BEN-CUF-001",
        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500",
        "images": [
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500"
        ],
        "rating": 4.7,
        "review_count": 21,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "_id": "long-sleeve-shirt",
        "name": "LONG SLEEVE SHIRT",
        "category": "TOPS",
        "description": "Para las batallas que requieren paciencia. Premium long sleeve in soft cotton blend. Versatile for any season.",
        "price": 65.00,
        "sizes": ["S", "M", "L", "XL", "2XL"],
        "inventory": 120,
        "sku": "LXI-SHI-LS-001",
        "image_url": "https://images.unsplash.com/photo-1518739268067-4e0aa427b238?w=500",
        "images": [
            "https://images.unsplash.com/photo-1518739268067-4e0aa427b238?w=500"
        ],
        "rating": 4.5,
        "review_count": 16,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]

async def seed_database():
    """Seed the database with initial data"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Drop existing collections
        print("Clearing existing data...")
        await db.products.delete_many({})
        
        # Insert products
        print("Inserting products...")
        result = await db.products.insert_many(PRODUCTS)
        print(f"✓ Inserted {len(result.inserted_ids)} products")
        
        # Create indexes
        print("Creating indexes...")
        await db.products.create_index("category")
        await db.products.create_index([("name", "text"), ("description", "text")])
        await db.reviews.create_index("product_id")
        await db.reviews.create_index("user_id")
        await db.wishlist.create_index("user_id")
        await db.wishlist.create_index("product_id")
        await db.payment_transactions.create_index("user_id")
        print("✓ Indexes created")
        
        print("\n✅ Database seeding complete!")
        print(f"Products: {len(PRODUCTS)}")
        
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
