from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_encoder__(cls):
        return str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    college: Optional[str] = ""
    graduation_year: Optional[int] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class FirebaseAuthRequest(BaseModel):
    id_token: str


class UserProfile(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: str
    college: Optional[str] = ""
    graduation_year: Optional[int] = None
    avatar_url: Optional[str] = ""
    skills: Optional[List[str]] = []
    target_roles: Optional[List[str]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[int] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[str]] = None
    target_roles: Optional[List[str]] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
