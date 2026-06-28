from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from pathlib import Path

from app.core.config import settings

# Ensure data directory exists for SQLite
Path("data").mkdir(exist_ok=True)
Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)

# Async SQLAlchemy Engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# Declarative Base for all ORM models
class Base(DeclarativeBase):
    pass


# ──────────────────────────────────────────────
# Dependency: yields a scoped async DB session
# ──────────────────────────────────────────────
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ──────────────────────────────────────────────
# Startup: create all tables
# ──────────────────────────────────────────────
async def init_db():
    async with engine.begin() as conn:
        # Import models here so Base has them registered
        from app.models import user, companion, booking, message  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
