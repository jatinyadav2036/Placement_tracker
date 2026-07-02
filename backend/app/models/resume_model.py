from pydantic import BaseModel
from typing import Optional, List, Dict


class ResumeAnalysisRequest(BaseModel):
    job_description: Optional[str] = ""
    job_role: Optional[str] = ""
    company_name: Optional[str] = ""


class SkillMatch(BaseModel):
    skill: str
    found: bool
    importance: str  # high, medium, low


class ResumeSection(BaseModel):
    name: str
    score: int  # 0-100
    feedback: str
    suggestions: List[str]


class ResumeAnalysisResponse(BaseModel):
    ats_score: float
    match_percentage: float
    extracted_skills: List[str]
    missing_skills: List[str]
    matched_skills: List[str]
    missing_keywords: List[str]
    ats_keywords: List[str]
    section_scores: List[ResumeSection]
    action_verb_suggestions: List[str]
    improvement_suggestions: List[str]
    overall_feedback: str
    strengths: List[str]
    weaknesses: List[str]
    rewrite_suggestions: Dict[str, str]
    skill_match_details: List[SkillMatch]
