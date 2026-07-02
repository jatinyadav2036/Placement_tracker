from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class ApplicationStatus(str, Enum):
    APPLIED = "Applied"
    OA_PENDING = "OA Pending"
    OA_CLEARED = "OA Cleared"
    OA_FAILED = "OA Failed"
    INTERVIEW_R1 = "Interview R1"
    INTERVIEW_R2 = "Interview R2"
    INTERVIEW_R3 = "Interview R3"
    HR_ROUND = "HR Round"
    SELECTED = "Selected"
    REJECTED = "Rejected"
    OFFER_RECEIVED = "Offer Received"
    WITHDRAWN = "Withdrawn"
    WAITING = "Waiting"


class ReferralStatus(str, Enum):
    NONE = "None"
    REQUESTED = "Requested"
    RECEIVED = "Received"
    APPLIED = "Applied"


class PlacementCreate(BaseModel):
    company_name: str
    role: str
    application_date: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    oa_status: Optional[str] = ""
    interview_r1: Optional[str] = ""
    interview_r2: Optional[str] = ""
    interview_r3: Optional[str] = ""
    hr_round: Optional[str] = ""
    salary_package: Optional[str] = ""
    location: Optional[str] = ""
    job_type: Optional[str] = "Full-time"
    notes: Optional[str] = ""
    referral_status: ReferralStatus = ReferralStatus.NONE
    referral_name: Optional[str] = ""
    follow_up_date: Optional[str] = None
    application_link: Optional[str] = ""
    job_description: Optional[str] = ""
    resume_match_score: Optional[float] = None
    priority: Optional[str] = "Medium"
    tags: Optional[List[str]] = []


class PlacementUpdate(PlacementCreate):
    company_name: Optional[str] = None
    role: Optional[str] = None


class PlacementResponse(PlacementCreate):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True


class PlacementStats(BaseModel):
    total_applications: int
    selected: int
    rejected: int
    in_progress: int
    success_rate: float
    oa_clear_rate: float
    interview_success_rate: float
    offer_count: int
    top_companies: List[dict]
    monthly_trend: List[dict]
    status_distribution: List[dict]
