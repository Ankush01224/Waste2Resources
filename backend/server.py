from fastapi import FastAPI, APIRouter, HTTPException, Header, Query, File, UploadFile, Depends
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import requests
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Environment variables
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')

# Storage configuration
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "recycle-market"
storage_key = None

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserRole:
    INDUSTRY = "industry"
    RECYCLER = "recycler"
    BUYER = "buyer"
    SELLER = "seller"

class WasteStatus:
    AVAILABLE = "available"
    RESERVED = "reserved"
    SOLD = "sold"

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    company_name: Optional[str] = None
    location: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str
    company_name: Optional[str] = None
    location: str
    created_at: str

class WasteListingCreate(BaseModel):
    title: str
    description: str
    waste_type: str
    quantity: float
    unit: str
    price: float
    location: str
    images: List[str] = []

class WasteListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    waste_type: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    location: Optional[str] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None

class WasteListing(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    waste_type: str
    quantity: float
    unit: str
    price: float
    location: str
    images: List[str] = []
    seller_id: str
    seller_name: str
    status: str = WasteStatus.AVAILABLE
    ai_classification: Optional[dict] = None
    created_at: str
    updated_at: str

class EnvironmentalImpact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    co2_saved_kg: float
    items_recycled: int
    waste_diverted_kg: float
    trees_saved: float

# ============== STORAGE FUNCTIONS ==============

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(
            f"{STORAGE_URL}/init",
            json={"emergent_key": EMERGENT_LLM_KEY},
            timeout=30
        )
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        raise

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# ============== AUTH FUNCTIONS ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# ============== AI CLASSIFICATION ==============

async def classify_waste_with_ai(title: str, description: str, waste_type: str) -> dict:
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert waste classification assistant. Analyze waste materials and provide detailed classification."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"""Analyze this waste material and provide a JSON response:

Title: {title}
Description: {description}
Type: {waste_type}

Provide:
1. Detailed category (e.g., 'Ferrous Metal', 'HDPE Plastic', 'Agricultural Residue')
2. Recyclability score (0-100)
3. Potential uses (list)
4. Environmental impact if recycled (CO2 saved per kg)
5. Hazard level (low/medium/high)

Respond ONLY with valid JSON."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        import json
        classification = json.loads(response)
        return classification
    except Exception as e:
        logger.error(f"AI classification error: {e}")
        return {
            "category": waste_type,
            "recyclability_score": 50,
            "potential_uses": ["To be determined"],
            "co2_saved_per_kg": 0.5,
            "hazard_level": "low"
        }

# ============== ROUTES ==============

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "role": user_data.role,
        "company_name": user_data.company_name,
        "location": user_data.location,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_dict)
    token = create_token(user_dict["id"], user_dict["email"])
    
    return {
        "token": token,
        "user": User(
            id=user_dict["id"],
            email=user_dict["email"],
            name=user_dict["name"],
            role=user_dict["role"],
            company_name=user_dict["company_name"],
            location=user_dict["location"],
            created_at=user_dict["created_at"]
        )
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"])
    
    return {
        "token": token,
        "user": User(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            company_name=user.get("company_name"),
            location=user["location"],
            created_at=user["created_at"]
        )
    }

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{current_user.id}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    
    result = put_object(path, data, file.content_type or "application/octet-stream")
    
    file_doc = {
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result["size"],
        "user_id": current_user.id,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.files.insert_one(file_doc)
    
    return {"path": result["path"], "size": result["size"]}

@api_router.get("/files/{path:path}")
async def download_file(path: str, authorization: str = Header(None), auth: str = Query(None)):
    auth_header = authorization or (f"Bearer {auth}" if auth else None)
    if auth_header:
        try:
            verify_token(auth_header.replace("Bearer ", ""))
        except:
            pass
    
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))

@api_router.post("/listings", response_model=WasteListing)
async def create_listing(listing_data: WasteListingCreate, current_user: User = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    
    listing_dict = {
        "id": str(uuid.uuid4()),
        **listing_data.model_dump(),
        "seller_id": current_user.id,
        "seller_name": current_user.name,
        "status": WasteStatus.AVAILABLE,
        "ai_classification": None,
        "created_at": now,
        "updated_at": now
    }
    
    await db.listings.insert_one(listing_dict)
    return WasteListing(**listing_dict)

@api_router.get("/listings", response_model=List[WasteListing])
async def get_listings(waste_type: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if waste_type:
        query["waste_type"] = waste_type
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    listings = await db.listings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [WasteListing(**listing) for listing in listings]

@api_router.get("/listings/my", response_model=List[WasteListing])
async def get_my_listings(current_user: User = Depends(get_current_user)):
    listings = await db.listings.find({"seller_id": current_user.id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [WasteListing(**listing) for listing in listings]

@api_router.get("/listings/{listing_id}", response_model=WasteListing)
async def get_listing(listing_id: str):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return WasteListing(**listing)

@api_router.put("/listings/{listing_id}", response_model=WasteListing)
async def update_listing(listing_id: str, update_data: WasteListingUpdate, current_user: User = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing["seller_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.listings.update_one({"id": listing_id}, {"$set": update_dict})
    
    updated = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    return WasteListing(**updated)

@api_router.delete("/listings/{listing_id}")
async def delete_listing(listing_id: str, current_user: User = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing["seller_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.listings.delete_one({"id": listing_id})
    return {"message": "Listing deleted"}

@api_router.post("/listings/{listing_id}/classify")
async def classify_listing(listing_id: str, current_user: User = Depends(get_current_user)):
    listing = await db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    classification = await classify_waste_with_ai(
        listing["title"],
        listing["description"],
        listing["waste_type"]
    )
    
    await db.listings.update_one(
        {"id": listing_id},
        {"$set": {"ai_classification": classification, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"classification": classification}

@api_router.get("/impact", response_model=EnvironmentalImpact)
async def get_impact():
    listings = await db.listings.find({"status": WasteStatus.SOLD}, {"_id": 0}).to_list(10000)
    
    total_quantity = sum(listing.get("quantity", 0) for listing in listings)
    items_count = len(listings)
    
    co2_per_kg = 0.5
    co2_saved = total_quantity * co2_per_kg
    trees_saved = co2_saved / 21
    
    return EnvironmentalImpact(
        co2_saved_kg=round(co2_saved, 2),
        items_recycled=items_count,
        waste_diverted_kg=round(total_quantity, 2),
        trees_saved=round(trees_saved, 2)
    )

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Application started successfully")
    except Exception as e:
        logger.error(f"Startup error: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
