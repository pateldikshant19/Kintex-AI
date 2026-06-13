import os
import requests
import logging
import time
from dotenv import load_dotenv
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(dotenv_path=env_path)

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com"
URL = f"https://{RAPIDAPI_HOST}/teams/v1/international"
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/sport-analytics")

def get_db_collection():
    client = MongoClient(MONGO_URI)
    return client['sport-analytics']['teams']

def fetch_teams():
    if not RAPIDAPI_KEY:
        logger.error("RAPIDAPI_KEY not set")
        return []

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    
    try:
        response = requests.get(URL, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        teams = []
        if "list" in data:
            teams = data["list"]
        return teams
    except Exception as e:
        logger.error(f"Error fetching teams: {e}")
        return []

def store_teams(collection, teams):
    for t in teams:
        team_id = t.get("teamId") or t.get("id")
        if not team_id: continue
        
        doc = {
            "teamId": team_id,
            "name": t.get("teamName"),
            "shortName": t.get("teamSName"),
            "imageId": t.get("imageId"),
            "country": t.get("teamName") # Fallback
        }
        collection.update_one({"teamId": team_id}, {"$set": doc}, upsert=True)
    logger.info(f"Stored {len(teams)} teams.")

def main():
    coll = get_db_collection()
    teams = fetch_teams()
    if teams:
        store_teams(coll, teams)

if __name__ == "__main__":
    main()
