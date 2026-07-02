from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import pandas as pd
import io

from app.models.placement_model import PlacementCreate, PlacementUpdate, PlacementResponse, PlacementStats
from app.database import get_collection
from app.utils.auth import get_current_user
from app.utils.helpers import serialize_doc, serialize_docs, calculate_percentage

router = APIRouter(prefix="/placements", tags=["Placements"])


@router.post("/", response_model=dict)
async def create_placement(data: PlacementCreate, user_id: str = Depends(get_current_user)):
    col = get_collection("placements")
    now = datetime.utcnow()
    
    doc = {
        **data.dict(),
        "user_id": user_id,
        "created_at": now,
        "updated_at": now
    }
    
    result = await col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.get("/", response_model=List[dict])
async def get_placements(
    user_id: str = Depends(get_current_user),
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    order: Optional[str] = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200)
):
    col = get_collection("placements")
    query = {"user_id": user_id}
    
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"company_name": {"$regex": search, "$options": "i"}},
            {"role": {"$regex": search, "$options": "i"}}
        ]
    
    sort_dir = -1 if order == "desc" else 1
    skip = (page - 1) * limit
    
    cursor = col.find(query).sort(sort_by, sort_dir).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    return serialize_docs(docs)


@router.get("/stats", response_model=PlacementStats)
async def get_stats(user_id: str = Depends(get_current_user)):
    col = get_collection("placements")
    docs = await col.find({"user_id": user_id}).to_list(length=1000)
    
    total = len(docs)
    selected = sum(1 for d in docs if d.get("status") in ["Selected", "Offer Received"])
    rejected = sum(1 for d in docs if d.get("status") == "Rejected")
    in_progress = total - selected - rejected
    
    oa_attempted = sum(1 for d in docs if d.get("oa_status") in ["Cleared", "Failed"])
    oa_cleared = sum(1 for d in docs if d.get("oa_status") == "Cleared")
    
    interview_reached = sum(1 for d in docs if "Interview" in d.get("status", ""))
    interview_success = selected
    
    # Company counts
    company_counts = {}
    for d in docs:
        c = d.get("company_name", "Unknown")
        company_counts[c] = company_counts.get(c, 0) + 1
    top_companies = [{"company": k, "count": v} for k, v in sorted(company_counts.items(), key=lambda x: x[1], reverse=True)[:10]]
    
    # Monthly trend
    monthly = {}
    for d in docs:
        date = d.get("application_date", "")
        if date:
            month = date[:7] if len(date) >= 7 else "Unknown"
            monthly[month] = monthly.get(month, 0) + 1
    monthly_trend = [{"month": k, "count": v} for k, v in sorted(monthly.items())]
    
    # Status distribution
    status_counts = {}
    for d in docs:
        s = d.get("status", "Unknown")
        status_counts[s] = status_counts.get(s, 0) + 1
    status_distribution = [{"status": k, "count": v} for k, v in status_counts.items()]
    
    return PlacementStats(
        total_applications=total,
        selected=selected,
        rejected=rejected,
        in_progress=in_progress,
        success_rate=calculate_percentage(selected, total),
        oa_clear_rate=calculate_percentage(oa_cleared, oa_attempted),
        interview_success_rate=calculate_percentage(interview_success, interview_reached),
        offer_count=selected,
        top_companies=top_companies,
        monthly_trend=monthly_trend,
        status_distribution=status_distribution
    )


@router.get("/{placement_id}", response_model=dict)
async def get_placement(placement_id: str, user_id: str = Depends(get_current_user)):
    col = get_collection("placements")
    doc = await col.find_one({"_id": ObjectId(placement_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Placement not found")
    return serialize_doc(doc)


@router.put("/{placement_id}", response_model=dict)
async def update_placement(placement_id: str, data: PlacementUpdate, user_id: str = Depends(get_current_user)):
    col = get_collection("placements")
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await col.update_one(
        {"_id": ObjectId(placement_id), "user_id": user_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Placement not found")
    
    doc = await col.find_one({"_id": ObjectId(placement_id)})
    return serialize_doc(doc)


@router.delete("/{placement_id}")
async def delete_placement(placement_id: str, user_id: str = Depends(get_current_user)):
    col = get_collection("placements")
    result = await col.delete_one({"_id": ObjectId(placement_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Placement not found")
    return {"message": "Deleted successfully"}


@router.get("/export/excel")
async def export_excel(user_id: str = Depends(get_current_user)):
    col = get_collection("placements")
    docs = await col.find({"user_id": user_id}).to_list(length=1000)
    
    rows = []
    for d in docs:
        rows.append({
            "Company": d.get("company_name", ""),
            "Role": d.get("role", ""),
            "Status": d.get("status", ""),
            "Application Date": d.get("application_date", ""),
            "OA Status": d.get("oa_status", ""),
            "Interview R1": d.get("interview_r1", ""),
            "Interview R2": d.get("interview_r2", ""),
            "HR Round": d.get("hr_round", ""),
            "Salary Package": d.get("salary_package", ""),
            "Location": d.get("location", ""),
            "Notes": d.get("notes", ""),
            "Referral": d.get("referral_status", ""),
            "Follow-Up Date": d.get("follow_up_date", ""),
            "Application Link": d.get("application_link", ""),
        })
    
    df = pd.DataFrame(rows)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Placements")
    output.seek(0)
    
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=placements.xlsx"}
    )


@router.post("/import/excel")
async def import_excel(user_id: str = Depends(get_current_user)):
    # Placeholder - actual implementation reads uploaded file
    return {"message": "Import endpoint ready"}
