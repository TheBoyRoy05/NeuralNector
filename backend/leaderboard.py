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
    name: Optional[str] = None  # undefined indicates the user's row
    score: Optional[float] = None
    rank: Optional[int] = None  # undefined indicates a separator row


# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./leaderboard.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Drop and recreate tables to ensure schema is up to date
# In production, you'd use migrations (Alembic) instead
Base.metadata.drop_all(bind=engine)
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


def _get_all_entries(db: Session, difficulty: str) -> List[tuple]:
    """Get all leaderboard entries for a given difficulty with ranks calculated in SQL"""
    rank_subquery = (
        db.query(
            LeaderboardEntryDB.name,
            LeaderboardEntryDB.score,
            func.rank().over(order_by=LeaderboardEntryDB.score.desc()).label("rank"),
        )
        .filter(LeaderboardEntryDB.difficulty == difficulty)
        .subquery()
    )

    result = (
        db.query(rank_subquery.c.name, rank_subquery.c.score, rank_subquery.c.rank)
        .order_by(rank_subquery.c.score.desc())
        .all()
    )

    return [(row.name, row.score, int(row.rank)) for row in result]


def _insert_user(entries: List[tuple], user_score: float) -> tuple[List[LeaderboardResponse], int]:
    """Inserts user into all entries with the correct ranking"""
    # Convert to list of lists so we can modify
    entries = [list(e) for e in entries]
    bisect.insort(entries, [None, user_score, 0], key=lambda x: -x[1])
    index = next(i for i, entry in enumerate(entries) if entry[0] is None)

    # Calculate user's rank
    prev = entries[index - 1]
    in_bounds = 0 < index <= len(entries)
    entries[index][2] = prev[2] if in_bounds and prev[1] == user_score else index + 1

    response = [
        LeaderboardResponse(name=e[0], score=e[1], rank=e[2] + (i > index)) # Shift rank after user
        for i, e in enumerate(entries)
    ]
    return response, index


def create_leaderboard_entry(
    db: Session, entry_data: LeaderboardEntryCreate
) -> LeaderboardEntryDB:
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


def get_leaderboard(db: Session, diff: str, top_n: int, score: float) -> List[LeaderboardResponse]:
    """
    Get leaderboard entries with user's score inserted appropriately.

    Returns a list of LeaderboardResponse objects that includes:
    - Top n entries for the difficulty
    - User's row (with name=None) inserted in the correct position
    - If user is not in top n, includes a separator row and entries around user's position
    """
    # Get all entries with ranks calculated in SQL
    all_entries: List(tuple) = _get_all_entries(db, diff)
    user_all_entries, user_index = _insert_user(all_entries, score)

    response = user_all_entries[:top_n]
    response.append(LeaderboardResponse(name=None, score=None, rank=None))  # separator row
    if user_index < top_n:
        return response

    start_idx = max(0, user_index - 2)
    end_idx = min(len(user_all_entries), user_index + 3)
    response.extend(user_all_entries[start_idx:end_idx])
    return response
