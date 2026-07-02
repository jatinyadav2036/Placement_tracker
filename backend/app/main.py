from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import logging

from app.database import connect_to_mongo, close_mongo_connection
from app.config.settings import settings
from app.routes import auth_routes, placement_routes, resume_routes, jd_routes, ai_routes

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info("PlaceIQ AI Backend started")
    yield
    # Shutdown
    await close_mongo_connection()
    logger.info("PlaceIQ AI Backend stopped")


app = FastAPI(
    title="PlaceIQ AI API",
    description="Smart Placement Intelligence Platform — Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_routes.router, prefix="/api/v1")
app.include_router(placement_routes.router, prefix="/api/v1")
app.include_router(resume_routes.router, prefix="/api/v1")
app.include_router(jd_routes.router, prefix="/api/v1")
app.include_router(ai_routes.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "name": "PlaceIQ AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG
    )
