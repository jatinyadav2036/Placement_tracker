from groq import Groq
import json
import re
from app.config.settings import settings

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "llama-3.3-70b-versatile"


def clean_json_response(text: str) -> str:
    """Strip markdown fences and extract raw JSON."""
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    return text.strip()


def call_groq(prompt: str, max_tokens: int = 2048) -> str:
    """Single reusable Groq call."""
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content


async def analyze_job_description(
    company_name: str,
    job_role: str,
    experience_required: str,
    job_description: str,
    location: str = ""
) -> dict:
    prompt = f"""
You are an expert career coach and ATS specialist. Analyze this job description thoroughly.

Company: {company_name}
Role: {job_role}
Experience Required: {experience_required}
Location: {location}

Job Description:
{job_description}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{{
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill1"],
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["skill1"],
  "certifications": ["cert1"],
  "ats_keywords": ["keyword1", "keyword2"],
  "experience_needed": "2-3 years",
  "education_requirements": ["Bachelor's in CS"],
  "salary_hints": "Estimated: $80k-$120k",
  "difficulty_level": "Medium",
  "interview_topics": ["topic1", "topic2"],
  "interview_questions": ["question1", "question2", "question3"],
  "learning_roadmap": ["step1", "step2", "step3"],
  "preparation_timeline": "4-6 weeks",
  "resources": [
    {{"topic": "React.js", "resource_type": "course", "platform": "Udemy", "estimated_time": "20 hours"}}
  ],
  "skill_categories": {{
    "frontend": ["React"],
    "backend": ["Node.js"],
    "devops": ["Docker"],
    "database": ["PostgreSQL"]
  }},
  "company_culture_hints": ["hint1"],
  "red_flags": ["flag1"],
  "summary": "Brief summary of the role",
  "action_plan": ["action1", "action2", "action3"]
}}
"""
    try:
        print("===== SENDING TO GROQ =====")
        raw = call_groq(prompt)

        print("===== RAW GROQ RESPONSE =====")
        print(raw)

        cleaned = clean_json_response(raw)

        print("===== CLEANED JSON =====")
        print(cleaned)

        return json.loads(cleaned)

    except Exception as e:
        import traceback
        print("===== GROQ ERROR =====")
        print(str(e))
        traceback.print_exc()
        return {"error": str(e)}


async def analyze_resume_with_jd(
    resume_text: str,
    job_description: str = "",
    job_role: str = "",
    company_name: str = ""
) -> dict:
    jd_section = ""
    if job_description:
        jd_section = f"""
Target Job Description:
Company: {company_name}
Role: {job_role}
Description: {job_description}
"""

    prompt = f"""
You are an expert ATS system and career coach. Analyze this resume.

Resume Content:
{resume_text}

{jd_section}

Return ONLY a valid JSON object (no markdown) with this structure:
{{
  "ats_score": 78.5,
  "match_percentage": 72.0,
  "extracted_skills": ["Python", "React"],
  "missing_skills": ["Docker", "Kubernetes"],
  "matched_skills": ["Python", "FastAPI"],
  "missing_keywords": ["agile", "microservices"],
  "ats_keywords": ["python", "api", "database"],
  "section_scores": [
    {{"name": "Summary", "score": 80, "feedback": "Good", "suggestions": ["Add metrics"]}},
    {{"name": "Experience", "score": 75, "feedback": "Decent", "suggestions": ["Use action verbs"]}},
    {{"name": "Skills", "score": 90, "feedback": "Comprehensive", "suggestions": []}},
    {{"name": "Education", "score": 85, "feedback": "Good", "suggestions": []}}
  ],
  "action_verb_suggestions": ["Led", "Engineered", "Architected", "Spearheaded"],
  "improvement_suggestions": ["Add quantified achievements", "Include LinkedIn URL"],
  "overall_feedback": "Strong technical resume with room for improvement in impact metrics.",
  "strengths": ["Strong technical skills", "Good project section"],
  "weaknesses": ["Lacks quantified achievements", "Summary is generic"],
  "rewrite_suggestions": {{
    "summary": "Results-driven Software Engineer with 3+ years...",
    "experience_bullet": "Engineered REST APIs serving 50k+ daily requests..."
  }},
  "skill_match_details": [
    {{"skill": "Python", "found": true, "importance": "high"}},
    {{"skill": "Docker", "found": false, "importance": "high"}}
  ]
}}
"""
    try:
        raw = call_groq(prompt)
        cleaned = clean_json_response(raw)
        return json.loads(cleaned)

    except Exception as e:
        import traceback
        print("===== GROQ ERROR (resume) =====")
        traceback.print_exc()
        return {"error": str(e)}


async def get_ai_insights(placements: list, user_profile: dict) -> dict:
    try:
        print("===== AI INSIGHTS STARTED =====")

        summary = []
        for p in placements[:20]:
            summary.append({
                "company": p.get("company_name"),
                "role": p.get("role"),
                "status": p.get("status")
            })

        prompt = f"""
You are a placement counselor analyzing a student's placement journey.

Student Profile: {json.dumps(user_profile)}
Placement Data: {json.dumps(summary)}

Return ONLY a valid JSON object (no markdown):
{{
  "overall_assessment": "You are performing well...",
  "success_rate_insight": "Your success rate of X% is above average...",
  "strengths": ["You clear OA rounds well", "Product companies prefer you"],
  "improvement_areas": ["HR round performance needs work"],
  "recommendations": ["Focus on system design", "Apply to 5 more companies"],
  "predicted_success_companies": ["Google", "Microsoft"],
  "skill_gaps": ["System Design", "DSA"],
  "motivational_message": "Keep going! You're closer than you think.",
  "weekly_goals": ["Apply to 3 companies", "Practice 5 LeetCode problems"],
  "trend_analysis": "Your application rate improved 20% last month."
}}
"""
        print("===== SENDING PROMPT TO GROQ =====")
        raw = call_groq(prompt)

        print("===== GROQ RAW RESPONSE =====")
        print(raw)

        cleaned = clean_json_response(raw)
        parsed = json.loads(cleaned)

        print("===== JSON PARSED SUCCESSFULLY =====")
        return parsed

    except Exception as e:
        import traceback
        print("\n===== GROQ ERROR =====")
        print(str(e))
        traceback.print_exc()
        return {"error": str(e)}


async def chat_with_ai(messages: list, user_context: dict = {}) -> str:
    system_prompt = f"""You are PlaceIQ AI, a smart placement assistant helping students with:
- Resume building and ATS optimization
- Job description analysis
- Interview preparation
- Skill development roadmaps
- DSA tips and company-specific prep
- Placement strategy

User Context: {json.dumps(user_context)}

Provide helpful, concise, and actionable responses. Be encouraging and specific."""

    # Build proper multi-turn chat history for Groq
    groq_messages = [{"role": "system", "content": system_prompt}]
    for m in messages[-10:]:
        groq_messages.append({
            "role": m["role"],      # "user" or "assistant"
            "content": m["content"]
        })

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=groq_messages
    )
    return response.choices[0].message.content