from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.routers import course, lesson, user, leaderboard, quests, shop

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables
    Base.metadata.create_all(bind=engine)
    # Seed database
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Duolingo Clone API",
    description="Fullstack Duolingo clone backend with lessons, gamification, and learning path.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(course.router)
app.include_router(lesson.router)
app.include_router(user.router)
app.include_router(leaderboard.router)
app.include_router(quests.router)
app.include_router(shop.router)

@app.get("/")
def root():
    return {
        "name": "Duolingo Clone API",
        "status": "healthy",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
