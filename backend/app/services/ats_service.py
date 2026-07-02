import re
from typing import List, Tuple
from collections import Counter

# Common ATS keywords by category
TECH_SKILLS = {
    "languages": ["python", "java", "javascript", "typescript", "c++", "c#", "go", "rust", "kotlin", "swift", "r", "scala", "php", "ruby"],
    "frontend": ["react", "vue", "angular", "html", "css", "tailwind", "sass", "redux", "next.js", "gatsby"],
    "backend": ["node.js", "fastapi", "django", "flask", "spring", "express", "laravel", "rails", "graphql", "rest api"],
    "database": ["postgresql", "mysql", "mongodb", "redis", "elasticsearch", "dynamodb", "cassandra", "sqlite"],
    "cloud": ["aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "jenkins", "github actions"],
    "ml": ["machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "nlp", "computer vision"],
    "tools": ["git", "linux", "jira", "agile", "scrum", "microservices", "kafka", "rabbitmq"]
}

STRONG_ACTION_VERBS = [
    "Engineered", "Architected", "Spearheaded", "Led", "Designed",
    "Implemented", "Optimized", "Developed", "Built", "Created",
    "Reduced", "Improved", "Increased", "Delivered", "Launched",
    "Automated", "Streamlined", "Collaborated", "Mentored", "Managed"
]

WEAK_ACTION_VERBS = [
    "worked on", "helped with", "assisted", "participated", "involved in",
    "responsible for", "duties included", "was in charge of"
]


def normalize_text(text: str) -> str:
    return text.lower().strip()


def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills found in text."""
    text_lower = text.lower()
    found = []
    for category, skills in TECH_SKILLS.items():
        for skill in skills:
            if skill in text_lower:
                found.append(skill)
    return list(set(found))


def calculate_keyword_density(resume_text: str, jd_text: str) -> Tuple[float, List[str], List[str]]:
    """Calculate how well resume keywords match JD."""
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()
    
    # Extract all meaningful words from JD
    jd_words = set(re.findall(r'\b[a-z][a-z.+#]*[a-z]\b', jd_lower))
    # Filter stopwords
    stopwords = {"and", "or", "the", "a", "an", "to", "for", "in", "on", "at", "with", "from", "by", "of", "is", "are", "be", "was", "were"}
    jd_keywords = jd_words - stopwords
    
    matched = [kw for kw in jd_keywords if kw in resume_lower]
    missing = [kw for kw in jd_keywords if kw not in resume_lower]
    
    match_rate = len(matched) / len(jd_keywords) * 100 if jd_keywords else 0
    return round(match_rate, 2), matched[:30], missing[:30]


def check_weak_verbs(text: str) -> List[str]:
    """Find weak action verbs in resume."""
    found = []
    text_lower = text.lower()
    for verb in WEAK_ACTION_VERBS:
        if verb in text_lower:
            found.append(verb)
    return found


def calculate_basic_ats_score(resume_text: str, jd_text: str = "") -> float:
    """Calculate a basic ATS score without AI."""
    score = 0
    text = resume_text.lower()
    
    # Length check (20 points)
    word_count = len(text.split())
    if 300 <= word_count <= 800:
        score += 20
    elif word_count > 200:
        score += 10
    
    # Contact info (15 points)
    if re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text):
        score += 8
    if re.search(r'[\d\s\-\(\)]{10,}', text):
        score += 7
    
    # Key sections (25 points)
    sections = ["experience", "education", "skills", "projects"]
    for s in sections:
        if s in text:
            score += 6
    
    # Skills density (20 points)
    found_skills = extract_skills_from_text(resume_text)
    score += min(20, len(found_skills) * 2)
    
    # JD match (20 points)
    if jd_text:
        match_rate, _, _ = calculate_keyword_density(resume_text, jd_text)
        score += min(20, match_rate * 0.2)
    
    return round(min(score, 100), 1)
