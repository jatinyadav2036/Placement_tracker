from fastapi import APIRouter, File, UploadFile, Form, Depends, HTTPException
from typing import Optional
import os

from app.models.resume_model import ResumeAnalysisResponse
from app.services.resume_parser import extract_resume_text
from app.services.gemini_service import analyze_resume_with_jd
from app.services.ats_service import calculate_basic_ats_score
from app.utils.auth import get_current_user
from app.utils.validators import validate_file_type, validate_file_size
from app.config.settings import settings

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(""),
    job_role: Optional[str] = Form(""),
    company_name: Optional[str] = Form(""),
    user_id: str = Depends(get_current_user)
):
    # Validate file
    if not validate_file_type(file.filename, ["pdf", "docx", "doc"]):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    file_bytes = await file.read()
    
    if not validate_file_size(len(file_bytes), settings.MAX_FILE_SIZE_MB):
        raise HTTPException(status_code=400, detail=f"File too large. Max {settings.MAX_FILE_SIZE_MB}MB")
    
    # Extract text
    try:
        resume_text = extract_resume_text(file_bytes, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {str(e)}")
    
    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from the file")
    
    # AI Analysis
    try:
        analysis = await analyze_resume_with_jd(
            resume_text=resume_text,
            job_description=job_description,
            job_role=job_role,
            company_name=company_name
        )
    except Exception as e:
        # Fallback to basic analysis
        basic_score = calculate_basic_ats_score(resume_text, job_description)
        analysis = {
            "ats_score": basic_score,
            "match_percentage": basic_score * 0.9,
            "extracted_skills": [],
            "missing_skills": [],
            "matched_skills": [],
            "missing_keywords": [],
            "ats_keywords": [],
            "section_scores": [],
            "action_verb_suggestions": ["Led", "Engineered", "Delivered"],
            "improvement_suggestions": ["AI analysis unavailable. Please check API key."],
            "overall_feedback": "Basic analysis performed.",
            "strengths": [],
            "weaknesses": [],
            "rewrite_suggestions": {},
            "skill_match_details": []
        }
    
    return ResumeAnalysisResponse(**analysis)


@router.post("/extract-text")
async def extract_text_only(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    if not validate_file_type(file.filename, ["pdf", "docx", "doc"]):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files supported")
    
    file_bytes = await file.read()
    text = extract_resume_text(file_bytes, file.filename)
    return {"text": text, "word_count": len(text.split())}
