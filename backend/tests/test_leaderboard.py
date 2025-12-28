"""Test script for leaderboard functionality."""
from api.leaderboard import (
    LeaderboardEntryDB,
    LeaderboardEntryCreate,
    get_leaderboard,
    get_db,
    SessionLocal,
    Base,
    engine,
)
import random


def setup_test_data():
    """Create test data in the database."""
    # Drop and recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create some test entries
        test_entries = [
            LeaderboardEntryDB(
                name=f"Player{i}",
                difficulty="easy",
                ratio="1:1",
                score=100 - i * 5 + random.randint(-2, 2),  # Scores with some variation
                devicetype="desktop",
            )
            for i in range(15)
        ]
        
        # Add some entries with same scores (ties)
        test_entries.append(
            LeaderboardEntryDB(
                name="TiedPlayer1",
                difficulty="easy",
                ratio="1:1",
                score=75,
                devicetype="desktop",
            )
        )
        test_entries.append(
            LeaderboardEntryDB(
                name="TiedPlayer2",
                difficulty="easy",
                ratio="1:1",
                score=75,
                devicetype="desktop",
            )
        )
        
        db.add_all(test_entries)
        db.commit()
        print(f"✓ Created {len(test_entries)} test entries")
    finally:
        db.close()


def test_leaderboard_in_top_n():
    """Test when user is in top n."""
    print("\n" + "="*60)
    print("TEST 1: User in top n (score = 95)")
    print("="*60)
    
    db = next(get_db())
    try:
        result = get_leaderboard(db, "easy", top_n=5, score=95.0)
        
        print(f"\nReturned {len(result)} entries:")
        for entry in result:
            if entry.rank is None:
                print("  --- SEPARATOR ---")
            else:
                user_marker = " 👤 USER" if entry.name is None else ""
                print(f"  Rank {entry.rank}: {entry.name or 'YOU'} - Score: {entry.score}{user_marker}")
    finally:
        db.close()


def test_leaderboard_not_in_top_n():
    """Test when user is not in top n."""
    print("\n" + "="*60)
    print("TEST 2: User not in top n (score = 50)")
    print("="*60)
    
    db = next(get_db())
    try:
        result = get_leaderboard(db, "easy", top_n=5, score=50.0)
        
        print(f"\nReturned {len(result)} entries:")
        for entry in result:
            if entry.rank is None:
                print("  --- SEPARATOR ---")
            else:
                user_marker = " 👤 USER" if entry.name is None else ""
                print(f"  Rank {entry.rank}: {entry.name or 'YOU'} - Score: {entry.score}{user_marker}")
    finally:
        db.close()


def test_leaderboard_with_ties():
    """Test when user ties with existing entries."""
    print("\n" + "="*60)
    print("TEST 3: User ties with existing entries (score = 75)")
    print("="*60)
    
    db = next(get_db())
    try:
        result = get_leaderboard(db, "easy", top_n=5, score=75.0)
        
        print(f"\nReturned {len(result)} entries:")
        for entry in result:
            if entry.rank is None:
                print("  --- SEPARATOR ---")
            else:
                user_marker = " 👤 USER" if entry.name is None else ""
                print(f"  Rank {entry.rank}: {entry.name or 'YOU'} - Score: {entry.score}{user_marker}")
    finally:
        db.close()


def test_leaderboard_highest_score():
    """Test when user has the highest score."""
    print("\n" + "="*60)
    print("TEST 4: User has highest score (score = 120)")
    print("="*60)
    
    db = next(get_db())
    try:
        result = get_leaderboard(db, "easy", top_n=5, score=120.0)
        
        print(f"\nReturned {len(result)} entries:")
        for entry in result:
            if entry.rank is None:
                print("  --- SEPARATOR ---")
            else:
                user_marker = " 👤 USER" if entry.name is None else ""
                print(f"  Rank {entry.rank}: {entry.name or 'YOU'} - Score: {entry.score}{user_marker}")
    finally:
        db.close()


def test_leaderboard_lowest_score():
    """Test when user has the lowest score."""
    print("\n" + "="*60)
    print("TEST 5: User has lowest score (score = 10)")
    print("="*60)
    
    db = next(get_db())
    try:
        result = get_leaderboard(db, "easy", top_n=5, score=10.0)
        
        print(f"\nReturned {len(result)} entries:")
        for entry in result:
            if entry.rank is None:
                print("  --- SEPARATOR ---")
            else:
                user_marker = " 👤 USER" if entry.name is None else ""
                print(f"  Rank {entry.rank}: {entry.name or 'YOU'} - Score: {entry.score}{user_marker}")
    finally:
        db.close()


def show_all_entries():
    """Show all entries in the database."""
    print("\n" + "="*60)
    print("ALL ENTRIES IN DATABASE (sorted by score)")
    print("="*60)
    
    db = next(get_db())
    try:
        entries = (
            db.query(LeaderboardEntryDB)
            .filter(LeaderboardEntryDB.difficulty == "easy")
            .order_by(LeaderboardEntryDB.score.desc())
            .all()
        )
        
        print(f"\nTotal entries: {len(entries)}")
        for i, entry in enumerate(entries, 1):
            print(f"  {i}. {entry.name} - Score: {entry.score}")
    finally:
        db.close()


if __name__ == "__main__":
    print("Setting up test data...")
    setup_test_data()
    
    show_all_entries()
    
    # Run all tests
    test_leaderboard_in_top_n()
    test_leaderboard_not_in_top_n()
    test_leaderboard_with_ties()
    test_leaderboard_highest_score()
    test_leaderboard_lowest_score()
    
    print("\n" + "="*60)
    print("All tests completed!")
    print("="*60)

