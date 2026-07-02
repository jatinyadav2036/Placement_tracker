export const STATUS_COLORS = {
  'Applied': 'status-applied',
  'OA Pending': 'status-waiting',
  'OA Cleared': 'status-oa-cleared',
  'OA Failed': 'status-oa-failed',
  'Interview R1': 'status-interview',
  'Interview R2': 'status-interview',
  'Interview R3': 'status-interview',
  'HR Round': 'status-interview',
  'Selected': 'status-selected',
  'Rejected': 'status-rejected',
  'Offer Received': 'status-offer',
  'Withdrawn': 'status-waiting',
  'Waiting': 'status-waiting',
}

export const STATUS_OPTIONS = [
  'Applied', 'OA Pending', 'OA Cleared', 'OA Failed',
  'Interview R1', 'Interview R2', 'Interview R3', 'HR Round',
  'Selected', 'Rejected', 'Offer Received', 'Withdrawn', 'Waiting'
]

export const STATUS_HEX = {
  'Applied': '#3b82f6',
  'OA Cleared': '#eab308',
  'Interview R1': '#f97316',
  'Interview R2': '#f97316',
  'Interview R3': '#f97316',
  'HR Round': '#8b5cf6',
  'Selected': '#10b981',
  'Rejected': '#ef4444',
  'Offer Received': '#06b6d4',
  'OA Failed': '#dc2626',
  'Withdrawn': '#6b7280',
  'Waiting': '#9ca3af',
  'OA Pending': '#6b7280',
}

export const PRIORITY_COLORS = {
  'High': 'text-red-400',
  'Medium': 'text-yellow-400',
  'Low': 'text-green-400',
}

export const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote', 'Hybrid']

export const SKILL_CATEGORIES = {
  Frontend: ['React', 'Vue', 'Angular', 'TypeScript', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
  Backend: ['Python', 'Node.js', 'Java', 'FastAPI', 'Django', 'Spring Boot', 'Go'],
  Database: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Elasticsearch'],
  Cloud: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD'],
  ML: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'Computer Vision'],
  Tools: ['Git', 'Linux', 'Jira', 'Figma', 'Postman'],
}
