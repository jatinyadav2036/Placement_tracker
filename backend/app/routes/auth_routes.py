from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId

from app.models.user_model import UserCreate, UserLogin, UserProfile, TokenResponse, FirebaseAuthRequest, UserUpdate
from app.database import get_collection
from app.utils.auth import (
    verify_password, get_password_hash, create_access_token, get_current_user
)
from app.utils.helpers import serialize_doc

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    users = get_collection("users")
    
    # Check existing
    existing = await users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user_data.password)
    now = datetime.utcnow()
    
    user_doc = {
        "email": user_data.email,
        "password": hashed_pw,
        "full_name": user_data.full_name,
        "college": user_data.college,
        "graduation_year": user_data.graduation_year,
        "avatar_url": "",
        "skills": [],
        "target_roles": [],
        "auth_provider": "email",
        "created_at": now,
        "updated_at": now
    }
    
    result = await users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    token = create_access_token({"sub": user_id})
    
    profile = UserProfile(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        college=user_data.college,
        graduation_year=user_data.graduation_year,
        created_at=now
    )
    
    return TokenResponse(access_token=token, user=profile)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    users = get_collection("users")
    user = await users.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id})
    
    profile = UserProfile(
        id=user_id,
        email=user["email"],
        full_name=user.get("full_name", ""),
        college=user.get("college", ""),
        graduation_year=user.get("graduation_year"),
        avatar_url=user.get("avatar_url", ""),
        skills=user.get("skills", []),
        target_roles=user.get("target_roles", []),
        created_at=user.get("created_at")
    )
    
    return TokenResponse(access_token=token, user=profile)


@router.post("/firebase", response_model=TokenResponse)
async def firebase_auth(req: FirebaseAuthRequest):
    """Authenticate with Firebase ID token."""
    try:
        import firebase_admin
        from firebase_admin import auth as fb_auth
        
        decoded = fb_auth.verify_id_token(req.id_token)
        firebase_uid = decoded["uid"]
        email = decoded.get("email", "")
        name = decoded.get("name", email.split("@")[0])
        picture = decoded.get("picture", "")
        
        users = get_collection("users")
        user = await users.find_one({"firebase_uid": firebase_uid})
        
        now = datetime.utcnow()
        
        if not user:
            user_doc = {
                "firebase_uid": firebase_uid,
                "email": email,
                "full_name": name,
                "avatar_url": picture,
                "college": "",
                "skills": [],
                "target_roles": [],
                "auth_provider": "google",
                "created_at": now,
                "updated_at": now
            }
            result = await users.insert_one(user_doc)
            user_id = str(result.inserted_id)
        else:
            user_id = str(user["_id"])
        
        token = create_access_token({"sub": user_id})
        
        profile = UserProfile(
            id=user_id,
            email=email,
            full_name=name,
            avatar_url=picture,
            created_at=now
        )
        
        return TokenResponse(access_token=token, user=profile)
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Firebase auth failed: {str(e)}")


@router.get("/me", response_model=UserProfile)
async def get_me(user_id: str = Depends(get_current_user)):
    users = get_collection("users")
    user = await users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserProfile(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user.get("full_name", ""),
        college=user.get("college", ""),
        graduation_year=user.get("graduation_year"),
        avatar_url=user.get("avatar_url", ""),
        skills=user.get("skills", []),
        target_roles=user.get("target_roles", []),
        created_at=user.get("created_at"),
        updated_at=user.get("updated_at")
    )


@router.put("/me", response_model=UserProfile)
async def update_profile(updates: UserUpdate, user_id: str = Depends(get_current_user)):
    users = get_collection("users")
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    
    user = await users.find_one({"_id": ObjectId(user_id)})
    return UserProfile(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user.get("full_name", ""),
        college=user.get("college", ""),
        avatar_url=user.get("avatar_url", ""),
        skills=user.get("skills", []),
        target_roles=user.get("target_roles", [])
    )
