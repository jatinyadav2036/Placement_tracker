from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from app.models.jd_model import JDAnalysisRequest, JDAnalysisResponse
from app.services.gemini_service import analyze_job_description
from app.database import get_collection
from app.utils.auth import get_current_user
from app.utils.helpers import serialize_doc

router = APIRouter(prefix="/jd", tags=["Job Description"])


@router.post("/analyze", response_model=JDAnalysisResponse)
async def analyze_jd(
    data: JDAnalysisRequest,
    user_id: str = Depends(get_current_user)
):
    try:
        result = await analyze_job_description(
            company_name=data.company_name,
            job_role=data.job_role,
            experience_required=data.experience_required,
            job_description=data.job_description,
            location=data.location
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
    
    # Save to history
    try:
        col = get_collection("jd_analyses")
        await col.insert_one({
            "user_id": user_id,
            "company_name": data.company_name,
            "job_role": data.job_role,
            "result": result,
            "created_at": datetime.utcnow()
        })
    except Exception:
        pass
    
    return JDAnalysisResponse(
        company_name=data.company_name,
        job_role=data.job_role,
        **result
    )


@router.get("/history")
async def get_jd_history(user_id: str = Depends(get_current_user)):
    col = get_collection("jd_analyses")
    docs = await col.find({"user_id": user_id}).sort("created_at", -1).limit(20).to_list(20)
    return [serialize_doc(d) for d in docs]
