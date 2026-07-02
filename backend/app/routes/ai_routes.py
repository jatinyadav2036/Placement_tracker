from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId

from app.services.gemini_service import get_ai_insights, chat_with_ai
from app.database import get_collection
from app.utils.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI"])


class ChatMessage(BaseModel):
    role: str  # user / assistant
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class InsightsResponse(BaseModel):
    overall_assessment: str
    success_rate_insight: str
    strengths: List[str]
    improvement_areas: List[str]
    recommendations: List[str]
    predicted_success_companies: List[str]
    skill_gaps: List[str]
    motivational_message: str
    weekly_goals: List[str]
    trend_analysis: str


@router.get("/insights", response_model=InsightsResponse)
async def get_insights(user_id: str = Depends(get_current_user)):
    placements_col = get_collection("placements")
    users_col = get_collection("users")
    
    placements = await placements_col.find({"user_id": user_id}).to_list(100)
    user = await users_col.find_one({"_id": ObjectId(user_id)})
    
    user_profile = {
        "name": user.get("full_name", "") if user else "",
        "college": user.get("college", "") if user else "",
        "skills": user.get("skills", []) if user else []
    }
    
    # Serialize placements for the AI
    serialized = [{"company_name": p.get("company_name"), "role": p.get("role"), "status": p.get("status")} for p in placements]
    
    try:
        result = await get_ai_insights(serialized, user_profile)
        return InsightsResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI insights failed: {str(e)}")


@router.post("/chat")
async def chat(req: ChatRequest, user_id: str = Depends(get_current_user)):
    users_col = get_collection("users")
    user = await users_col.find_one({"_id": ObjectId(user_id)})
    
    user_context = {
        "name": user.get("full_name", "") if user else "",
        "skills": user.get("skills", []) if user else []
    }
    
    messages_list = [{"role": m.role, "content": m.content} for m in req.messages]
    
    try:
        response = await chat_with_ai(messages_list, user_context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/skill-recommendations")
async def skill_recommendations(user_id: str = Depends(get_current_user)):
    """Get personalized skill recommendations based on placement history."""
    placements_col = get_collection("placements")
    docs = await placements_col.find({"user_id": user_id}).to_list(50)
    
    # Aggregate roles
    roles = [d.get("role", "") for d in docs]
    companies = [d.get("company_name", "") for d in docs]
    
    prompt_context = f"Student has applied for roles: {', '.join(set(roles[:10]))} at companies: {', '.join(set(companies[:10]))}"
    
    try:
        messages = [{"role": "user", "content": f"Based on this context: {prompt_context}, give me top 10 skill recommendations with learning resources."}]
        response = await chat_with_ai(messages)
        return {"recommendations": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
