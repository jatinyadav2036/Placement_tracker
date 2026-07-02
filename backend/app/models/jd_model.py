from pydantic import BaseModel
from typing import Optional, List, Dict


class JDAnalysisRequest(BaseModel):
    company_name: str
    job_role: str
    experience_required: Optional[str] = ""
    job_description: str
    location: Optional[str] = ""


class LearningResource(BaseModel):
    topic: str
    resource_type: str  # course, book, practice, video
    platform: str
    estimated_time: str


class JDAnalysisResponse(BaseModel):
    company_name: str
    job_role: str
    # Skills
    required_skills: List[str]
    preferred_skills: List[str]
    technical_skills: List[str]
    soft_skills: List[str]
    certifications: List[str]
    # Keywords
    ats_keywords: List[str]
    # Info
    experience_needed: str
    education_requirements: List[str]
    salary_hints: str
    difficulty_level: str  # Easy, Medium, Hard, Very Hard
    # Interview
    interview_topics: List[str]
    interview_questions: List[str]
    # Roadmap
    learning_roadmap: List[str]
    preparation_timeline: str
    resources: List[LearningResource]
    # Analytics
    skill_categories: Dict[str, List[str]]
    company_culture_hints: List[str]
    red_flags: List[str]
    # Summary
    summary: str
    action_plan: List[str]
