import os
import time
import requests
import logging
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(dotenv_path=env_path)

CRICAPI_KEY = os.getenv("CRICAPI_KEY")
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/sport-analytics")

# CricAPI Player endpoints
PLAYER_SEARCH_URL = "https://api.cricapi.com/v1/players"

# Major players to seed the database with real profiles
TEAMS = ["Virat", "Rohit", "Babar", "Root", "Smith", "Kane", "Rashid", "Warner", "Stokes", "Cummins"]

def get_db_collection():
    try:
        client = MongoClient(MONGO_URI)
        # Use sport-analytics because the older Express routes map there
        db_name = "sport-analytics"
        db = client[db_name]
        return db['players']
    except PyMongoError as e:
        logger.error(f"MongoDB connection failed: {e}")
        return None

def fetch_players_for_team(team_name):
    """Searches CricAPI for players by name."""
    if not CRICAPI_KEY or CRICAPI_KEY == "YOUR_API_KEY_GOES_HERE":
        logger.error("CRICAPI_KEY is not set correctly in .env!")
        return []

    try:
        params = {
            "apikey": CRICAPI_KEY,
            "search": team_name,
            "offset": 0
        }
        response = requests.get(PLAYER_SEARCH_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") != "success":
            logger.error(f"API Error fetching {team_name}: {data.get('info')}")
            return []
        
        # Limit to 10 per team to avoid massive API rate limits on free tier
        return data.get("data", [])[:10] 
    except Exception as e:
        logger.error(f"Error fetching players for {team_name}: {e}")
        return []

def store_players_in_db(collection, players, team_name):
    for p in players:
        try:
            # Map CricAPI to your existing Kinetix AI Player Schema
            player_doc = {
                "name": p.get("name"),
                "sport": "Cricket",
                "teamName": p.get("country") or team_name,
                "position": "All-Rounder", # Generic fallback since basic API doesn't provide it
                "bio": f"Real API Player from {p.get('country')}. CricAPI ID: {p.get('id')}",
                "updatedAt": datetime.utcnow()
            }
            
            # Upsert by name so we don't get duplicates
            collection.update_one(
                {"name": p.get("name")},
                {"$set": player_doc},
                upsert=True
            )
            logger.info(f"Saved real player: {p.get('name')} ({p.get('country')})")
        except Exception as e:
            logger.error(f"DB error saving {p.get('name')}: {e}")

def main():
    logger.info("Starting CricAPI Real Player Data Migration...")
    collection = get_db_collection()
    if collection is None:
        return

    total_fetched = 0
    for team in TEAMS:
        logger.info(f"Fetching real players for {team}...")
        players = fetch_players_for_team(team)
        if players:
            store_players_in_db(collection, players, team)
            total_fetched += len(players)
        
        # Sleep to avoid hitting API rate limits instantly (Free tiers are strict)
        time.sleep(2)
        
    logger.info(f"Player migration complete! Successfully pulled {total_fetched} real players from CricAPI.")

if __name__ == "__main__":
    main()
