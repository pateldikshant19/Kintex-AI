import os
import requests
import logging
from dotenv import load_dotenv
from pymongo import MongoClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(dotenv_path=env_path)

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com"
URL = f"https://{RAPIDAPI_HOST}/series/v1/international"
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/sport-analytics")

def get_db_collection():
    client = MongoClient(MONGO_URI)
    return client['sport-analytics']['leagues']

def fetch_leagues():
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
        
        leagues = []
        if "seriesMapProto" in data:
            for smp in data["seriesMapProto"]:
                if "series" in smp:
                    leagues.extend(smp["series"])
        elif "series" in data:
            leagues = data["series"]
        
        return leagues
    except Exception as e:
        logger.error(f"Error fetching leagues: {e}")
        return []

def store_leagues(collection, leagues):
    for l in leagues:
        league_id = l.get("id") or l.get("seriesId")
        if not league_id: continue
        
        doc = {
            "leagueId": league_id,
            "name": l.get("name"),
            "startDate": l.get("startDt"),
            "endDate": l.get("endDt"),
            "seriesType": l.get("seriesType"),
            "status": "upcoming" # Defaulting for now
        }
        collection.update_one({"leagueId": league_id}, {"$set": doc}, upsert=True)
    logger.info(f"Stored {len(leagues)} leagues.")

def main():
    coll = get_db_collection()
    leagues = fetch_leagues()
    if leagues:
        store_leagues(coll, leagues)

if __name__ == "__main__":
    main()
