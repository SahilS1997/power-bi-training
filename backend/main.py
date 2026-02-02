from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from strawberry.fastapi import GraphQLRouter
from contextlib import asynccontextmanager
import uvicorn

from graphql_api.schema import schema
from api.routes import auth, videos, health
from config import settings
from utils.logger import logger

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting Power BI Training Portal API")
    logger.info(f"📊 Connecting to Microsoft Fabric Workspace: {settings.FABRIC_WORKSPACE_ID}")
    # Initialize Fabric connection here
    yield
    # Shutdown
    logger.info("👋 Shutting down API")

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for Power BI Training Portal with GraphQL",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GraphQL Router
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

# REST API Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(videos.router, prefix="/api/v1/videos", tags=["Videos"])
app.include_router(health.router, prefix="/api/v1", tags=["Health"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Power BI Training Portal API",
        "version": settings.APP_VERSION,
        "graphql": "/graphql",
        "docs": "/api/docs",
        "health": "/api/v1/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
