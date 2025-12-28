import bisect
from datetime import datetime
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

Base = declarative_base()


class LeaderboardEntryDB(Base):
    """Database model for leaderboard entries."""

    __tablename__ = "leaderboard_entries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    ratio = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    devicetype = Column(String, nullable=False)
    date_time = Column(DateTime, default=datetime.utcnow(), nullable=False)


class LeaderboardResponse(BaseModel):
    """Response model for leaderboard entries."""

    id: Optional[int] = None
    name: Optional[str] = None  # None indicates the user's row
    score: Optional[float] = None
    rank: Optional[int] = None  # None indicates a separator row


# Database setup
import os
database_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL") or "sqlite:///./leaderboard.db"

if database_url.startswith("postgres"):
    # PostgreSQL connection
    engine = create_engine(database_url, pool_pre_ping=True)
else:
    # SQLite connection (for local development)
    engine = create_engine(database_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Only create tables if they don't exist (never drop in production!)
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class LeaderboardEntryCreate(BaseModel):
    name: str
    difficulty: str
    ratio: str
    score: float
    devicetype: str


def _get_entries(db: Session, difficulty: str) -> List[LeaderboardResponse]:
    """Get all leaderboard entries for a given difficulty with ranks calculated in SQL"""
    rank_subquery = (
        db.query(
            LeaderboardEntryDB.id,
            LeaderboardEntryDB.name,
            LeaderboardEntryDB.score,
            func.rank().over(order_by=LeaderboardEntryDB.score.desc()).label("rank"),
        )
        .filter(LeaderboardEntryDB.difficulty == difficulty)
        .subquery()
    )

    result = (
        db.query(
            rank_subquery.c.id,
            rank_subquery.c.name,
            rank_subquery.c.score,
            rank_subquery.c.rank
        )
        .order_by(rank_subquery.c.score.desc())
        .all()
    )

    return [
        LeaderboardResponse(id=row.id, name=row.name, score=row.score, rank=int(row.rank))
        for row in result
    ]


def _get_user_index(entries: List[LeaderboardResponse], id: int) -> int:
    return next((i for i, entry in enumerate(entries) if entry.id == id), -1)


def _insert_user(
    entries: List[LeaderboardResponse], user_score: float
) -> tuple[List[LeaderboardResponse], int]:
    """Inserts user into all entries with the correct ranking"""
    # Convert to list of lists so we can modify
    user = LeaderboardResponse(id=None, name=None, score=user_score, rank=None)
    bisect.insort(entries, user, key=lambda x: -x.score)
    index = next(i for i, entry in enumerate(entries) if entry.name is None)

    # Calculate user's rank
    prev = entries[index - 1]
    in_bounds = 0 < index <= len(entries)
    entries[index].rank = prev.rank if in_bounds and prev.score == user_score else index + 1

    entries[:] = [
        LeaderboardResponse(id=e.id, name=e.name, score=e.score, rank=e.rank + (i > index))
        for i, e in enumerate(entries)
    ]
    return index


def create_leaderboard_entry(db: Session, entry_data: LeaderboardEntryCreate) -> LeaderboardEntryDB:
    """Create a new leaderboard entry in the database."""
    db_entry = LeaderboardEntryDB(
        name=entry_data.name,
        difficulty=entry_data.difficulty,
        ratio=entry_data.ratio,
        score=entry_data.score,
        devicetype=entry_data.devicetype,
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def get_leaderboard(
    db: Session, diff: str, top_n: int, score: float, user_id: Optional[int] = None
) -> List[LeaderboardResponse]:
    """
    Get leaderboard entries with user's score inserted appropriately.

    Returns a list of LeaderboardResponse objects that includes:
    - Top n entries for the difficulty
    - User's row (with name=None) inserted in the correct position
    - If user is not in top n, includes a separator row and entries around user's position
    """
    NUM_AROUND = 2 # number of entries to show above and below user's position
    
    # Get all entries with ranks calculated in SQL
    entries: List[LeaderboardResponse] = _get_entries(db, diff)
    user_index = _get_user_index(entries, user_id) if user_id else _insert_user(entries, score)

    response = entries[:top_n]
    if user_index < top_n:
        return response
        
    if user_index >= top_n + NUM_AROUND:
        response.append(LeaderboardResponse(id=None, name=None, score=None, rank=None))  # separator row

    start_idx = max(0, top_n, user_index - NUM_AROUND)
    end_idx = min(len(entries), user_index + NUM_AROUND + 1)
    response.extend(entries[start_idx:end_idx])
    return response

