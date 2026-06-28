from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import init_db
from app.api.v1.router import api_router
from app.services.companion_service import seed_mock_profiles
from app.db.session import AsyncSessionLocal


# ──────────────────────────────────────────────
# Lifespan: startup / shutdown hooks
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──
    print(f"[{settings.APP_NAME}] Initializing database…")
    await init_db()

    print(f"[{settings.APP_NAME}] Seeding mock companion profiles…")
    async with AsyncSessionLocal() as db:
        count = await seed_mock_profiles(db)
        if count:
            print(f"[{settings.APP_NAME}] ✓ Seeded {count} mock profiles.")
        else:
            print(f"[{settings.APP_NAME}] ✓ Mock profiles already present, skipping.")

    print(f"[{settings.APP_NAME}] Server ready on http://localhost:8000")
    yield
    # ── Shutdown ──
    print(f"[{settings.APP_NAME}] Shutting down…")


# ──────────────────────────────────────────────
# App Factory
# ──────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="A real-time companion booking platform — FastAPI edition",
        version="2.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # REST API routes
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.get("/")
    async def root():
        return {
        "message": "CompanionConnect API is running",
        "docs": "/docs",
        "status": "ok"
    }

    # Health check
    @app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
    async def health_check():
        return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": "2.0.0"
    }

    return app
   

app = create_app()
