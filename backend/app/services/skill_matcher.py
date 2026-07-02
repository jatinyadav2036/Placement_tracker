from typing import List, Dict, Tuple


SKILL_ALIASES = {
    "js": "JavaScript",
    "ts": "TypeScript",
    "py": "Python",
    "ml": "Machine Learning",
    "dl": "Deep Learning",
    "k8s": "Kubernetes",
    "pg": "PostgreSQL",
    "mongo": "MongoDB",
    "tf": "TensorFlow",
}

SKILL_LEVELS = {
    "beginner": ["HTML", "CSS", "Python basics", "Git basics"],
    "intermediate": ["React", "Node.js", "SQL", "REST API", "Docker"],
    "advanced": ["Kubernetes", "Microservices", "System Design", "ML/AI", "AWS Architecture"]
}


def normalize_skill(skill: str) -> str:
    skill = skill.strip().lower()
    return SKILL_ALIASES.get(skill, skill)


def match_skills(resume_skills: List[str], jd_skills: List[str]) -> Dict:
    resume_normalized = {s.lower() for s in resume_skills}
    jd_normalized = {s.lower() for s in jd_skills}
    
    matched = []
    missing = []
    
    for skill in jd_skills:
        if skill.lower() in resume_normalized:
            matched.append(skill)
        else:
            missing.append(skill)
    
    match_pct = (len(matched) / len(jd_skills) * 100) if jd_skills else 0
    
    return {
        "matched": matched,
        "missing": missing,
        "match_percentage": round(match_pct, 2),
        "extra_skills": [s for s in resume_skills if s.lower() not in jd_normalized]
    }


def get_skill_roadmap(missing_skills: List[str]) -> List[Dict]:
    roadmap = []
    for i, skill in enumerate(missing_skills[:10]):
        roadmap.append({
            "step": i + 1,
            "skill": skill,
            "duration": "1-2 weeks",
            "resources": [
                {"platform": "YouTube", "type": "Free"},
                {"platform": "Coursera", "type": "Paid"}
            ]
        })
    return roadmap
