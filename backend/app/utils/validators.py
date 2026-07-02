from fastapi import HTTPException
import re


def validate_password(password: str) -> str:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not re.search(r'[A-Z]', password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not re.search(r'[0-9]', password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    return password


def validate_file_type(filename: str, allowed: list) -> bool:
    ext = filename.rsplit('.', 1)[-1].lower()
    return ext in allowed


def validate_file_size(size: int, max_mb: int = 10) -> bool:
    return size <= max_mb * 1024 * 1024
