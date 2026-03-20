import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_database():
    print("🌱 Seeding database with sample data...")
    
    # Create demo user
    demo_user = {
        "id": str(uuid.uuid4()),
        "email": "demo@ecomarket.com",
        "password_hash": bcrypt.hashpw("demo123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "name": "EcoMarket Demo",
        "company_name": "Green Industries Inc.",
        "location": "San Francisco, CA",
        "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_user = await db.users.find_one({"email": demo_user["email"]})
    if not existing_user:
        await db.users.insert_one(demo_user)
        print("✅ Demo user created: demo@ecomarket.com / demo123")
    else:
        demo_user = existing_user
        print("✅ Using existing demo user")
    
    # Sample listings
    sample_listings = [
        {
            "id": str(uuid.uuid4()),
            "title": "Premium Steel Scrap - Grade A",
            "description": "High-quality ferrous steel scrap from automotive manufacturing. Clean, sorted, and ready for melting. Perfect for steel mills and foundries. No rust or contamination.",
            "waste_type": "metal",
            "quantity": 5000,
            "unit": "kg",
            "price_usd": 2500.00,
            "price_eth": 0.75,
            "location": "Detroit, Michigan",
            "material_composition": "98% Steel, 2% Carbon",
            "purity_percentage": 98.5,
            "certifications": ["ISO 9001", "EPA Certified"],
            "pickup_available": True,
            "delivery_available": True,
            "min_order_quantity": 500,
            "images": [],
            "seller_id": demo_user["id"],
            "seller_name": demo_user["name"],
            "seller_wallet": demo_user.get("wallet_address"),
            "status": "available",
            "ai_classification": {
                "detailed_category": "Ferrous Steel Scrap - Grade A",
                "recyclability_score": 95,
                "potential_uses": ["Steel manufacturing", "Construction materials", "Automotive parts"],
                "co2_saved_per_kg": 1.8,
                "hazard_level": "low",
                "market_value_indicator": "premium",
                "processing_requirements": ["Sorting", "Melting", "Casting"]
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "HDPE Plastic Bottles - Food Grade",
            "description": "Clean HDPE plastic bottles from beverage industry. Pre-sorted, washed, and compressed. Ideal for plastic recycling facilities. High-density polyethylene ready for reprocessing.",
            "waste_type": "plastic",
            "quantity": 2000,
            "unit": "kg",
            "price_usd": 800.00,
            "price_eth": 0.24,
            "location": "Los Angeles, California",
            "material_composition": "100% HDPE (Type 2 Plastic)",
            "purity_percentage": 99.2,
            "certifications": ["FDA Compliant", "ISO 14001"],
            "pickup_available": True,
            "delivery_available": False,
            "min_order_quantity": 200,
            "images": [],
            "seller_id": demo_user["id"],
            "seller_name": demo_user["name"],
            "seller_wallet": demo_user.get("wallet_address"),
            "status": "available",
            "ai_classification": {
                "detailed_category": "High-Density Polyethylene (HDPE) - Resin Code 2",
                "recyclability_score": 92,
                "potential_uses": ["New bottles", "Plastic lumber", "Drainage pipes", "Flower pots"],
                "co2_saved_per_kg": 1.5,
                "hazard_level": "low",
                "market_value_indicator": "high",
                "processing_requirements": ["Cleaning", "Shredding", "Melting", "Pelletizing"]
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Electronic Circuit Boards - Gold Recovery",
            "description": "Mixed electronic circuit boards from computer and telecom equipment. Contains precious metals including gold, silver, and copper. Professionally de-soldered and sorted.",
            "waste_type": "e-waste",
            "quantity": 500,
            "unit": "kg",
            "price_usd": 3500.00,
            "price_eth": 1.05,
            "location": "Austin, Texas",
            "material_composition": "60% PCB, 25% Copper, 10% Precious Metals, 5% Other",
            "purity_percentage": 85.0,
            "certifications": ["R2 Certified", "e-Stewards"],
            "pickup_available": False,
            "delivery_available": True,
            "min_order_quantity": 50,
            "images": [],
            "seller_id": demo_user["id"],
            "seller_name": demo_user["name"],
            "seller_wallet": demo_user.get("wallet_address"),
            "status": "available",
            "ai_classification": {
                "detailed_category": "Mixed PCB E-Waste with Precious Metal Content",
                "recyclability_score": 88,
                "potential_uses": ["Gold recovery", "Copper extraction", "Silver reclamation", "Rare earth mining"],
                "co2_saved_per_kg": 2.2,
                "hazard_level": "medium",
                "market_value_indicator": "premium",
                "processing_requirements": ["Dismantling", "Chemical extraction", "Smelting", "Refining"]
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Agricultural Crop Residue - Wheat Straw",
            "description": "Fresh wheat straw from organic farming. Excellent for biomass energy, animal bedding, or composting. Dry and baled for easy transport. Pesticide-free and organic certified.",
            "waste_type": "crop-residue",
            "quantity": 10000,
            "unit": "kg",
            "price_usd": 1200.00,
            "price_eth": 0.36,
            "location": "Iowa City, Iowa",
            "material_composition": "100% Organic Wheat Straw",
            "purity_percentage": 97.0,
            "certifications": ["USDA Organic", "Non-GMO"],
            "pickup_available": True,
            "delivery_available": True,
            "min_order_quantity": 1000,
            "images": [],
            "seller_id": demo_user["id"],
            "seller_name": demo_user["name"],
            "seller_wallet": demo_user.get("wallet_address"),
            "status": "available",
            "ai_classification": {
                "detailed_category": "Organic Agricultural Residue - Wheat Straw Biomass",
                "recyclability_score": 90,
                "potential_uses": ["Biomass fuel", "Animal bedding", "Mushroom cultivation", "Paper production", "Composting"],
                "co2_saved_per_kg": 0.8,
                "hazard_level": "low",
                "market_value_indicator": "medium",
                "processing_requirements": ["Baling", "Drying", "Storage"]
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Aluminum Cans - Beverage Grade",
            "description": "Compressed aluminum beverage cans. Clean, dry, and sorted. Excellent for aluminum smelting and recycling. High-quality material from collected consumer waste.",
            "waste_type": "metal",
            "quantity": 3000,
            "unit": "kg",
            "price_usd": 4500.00,
            "price_eth": 1.35,
            "location": "Seattle, Washington",
            "material_composition": "95% Aluminum, 5% Coating",
            "purity_percentage": 95.5,
            "certifications": ["SCS Certified"],
            "pickup_available": True,
            "delivery_available": True,
            "min_order_quantity": 300,
            "images": [],
            "seller_id": demo_user["id"],
            "seller_name": demo_user["name"],
            "seller_wallet": demo_user.get("wallet_address"),
            "status": "available",
            "ai_classification": {
                "detailed_category": "Post-Consumer Aluminum - UBC (Used Beverage Cans)",
                "recyclability_score": 98,
                "potential_uses": ["New aluminum cans", "Automotive parts", "Building materials", "Aircraft components"],
                "co2_saved_per_kg": 9.0,
                "hazard_level": "low",
                "market_value_indicator": "premium",
                "processing_requirements": ["Compression", "De-coating", "Melting", "Casting"]
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Industrial PET Plastic Film",
            "description": "Clear PET plastic film from packaging industry. Transparent, clean, and ready for recycling. Perfect for textile fiber production or new packaging materials.",
            "waste_type": "plastic",
            "quantity": 1500,
            "unit": "kg",
            "price_usd": 900.00,
            "price_eth": 0.27,
            "location": "Chicago, Illinois",
            "material_composition": "100% PET (Polyethylene Terephthalate)",
            "purity_percentage": 98.0,
            "certifications": ["ISO 14001"],
            "pickup_available": True,
            "delivery_available": False,
            "min_order_quantity": 150,
            "images": [],
            "seller_id": demo_user["id"],
            "seller_name": demo_user["name"],
            "seller_wallet": demo_user.get("wallet_address"),
            "status": "available",
            "ai_classification": {
                "detailed_category": "Polyethylene Terephthalate Film - Type 1 Plastic",
                "recyclability_score": 94,
                "potential_uses": ["Polyester fiber", "Textile production", "New PET bottles", "Carpets", "Clothing"],
                "co2_saved_per_kg": 1.6,
                "hazard_level": "low",
                "market_value_indicator": "high",
                "processing_requirements": ["Cleaning", "Shredding", "Melting", "Fiber spinning"]
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert listings
    for listing in sample_listings:
        existing = await db.listings.find_one({"title": listing["title"]})
        if not existing:
            await db.listings.insert_one(listing)
            print(f"✅ Created listing: {listing['title']}")
        else:
            print(f"⏭️  Skipped existing: {listing['title']}")
    
    print(f"\n🎉 Database seeded successfully!")
    print(f"📊 Total listings: {len(sample_listings)}")
    print(f"\n🔑 Login with: demo@ecomarket.com / demo123")

if __name__ == "__main__":
    asyncio.run(seed_database())
    client.close()
