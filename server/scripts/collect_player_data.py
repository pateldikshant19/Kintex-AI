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

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/sport-analytics")

# RapidAPI Cricbuzz Player endpoints
PLAYER_SEARCH_URL = "https://cricbuzz-cricket.p.rapidapi.com/stats/v1/player/search"
RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com"

# Major players to seed the database with real profiles
TEAMS = [
    "Virat Kohli", "Rohit Sharma", "Babar Azam", "Joe Root", "Steve Smith", 
    "Kane Williamson", "Rashid Khan", "David Warner", "Ben Stokes", "Pat Cummins", 
    "Shubman Gill", "Shikhar Dhawan", "Neil Wagner", "Dwayne Bravo", "MS Dhoni",
    "Jasprit Bumrah", "Trent Boult", "Mitchell Starc", "Jos Buttler", "Quinton de Kock",
    "Shaheen Afridi", "Glenn Maxwell", "Hardik Pandya", "Ravindra Jadeja", "Kagiso Rabada",
    "Marnus Labuschagne", "Suryakumar Yadav", "KL Rahul", "Rishabh Pant", "Rishabh Pant",
    "Shakib Al Hasan", "Mohammad Rizwan", "Jofra Archer", "Anrich Nortje", "Jason Holder",
    "Aaron Finch", "Eoin Morgan", "AB de Villiers", "Chris Gayle", "Lasith Malinga",
    "Tim Southee", "Stuart Broad", "James Anderson", "Nathan Lyon", "Ravichandran Ashwin",
    "Mustafizur Rahman", "Sandeep Lamichhane", "Mujeeb Ur Rahman", "Faf du Plessis", "Imam-ul-Haq"
]

def get_db_collections():
    try:
        client = MongoClient(MONGO_URI)
        db = client['sport-analytics']
        return db['players'], db['teams']
    except PyMongoError as e:
        logger.error(f"MongoDB connection failed: {e}")
        return None, None

def fetch_players_for_team(team_name):
    """Searches CricAPI for players by name."""
    if not RAPIDAPI_KEY or RAPIDAPI_KEY == "YOUR_RAPIDAPI_KEY_HERE":
        logger.error("RAPIDAPI_KEY is not set correctly in .env!")
        return []

    try:
        headers = {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST
        }
        
        # 1. Search for the exact player
        params = {"plrN": team_name}
        response = requests.get(PLAYER_SEARCH_URL, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Only take the FIRST match to avoid variants (e.g. Virat Singh when searching Virat)
        players = data.get("player", [])
        if not players: return []
        
        best_match = players[0]
        player_id = best_match.get("id")
        
        if not player_id: return []
        
        # 2. Fetch the deep profile for real achievements and bio
        profile_url = f"https://{RAPIDAPI_HOST}/stats/v1/player/{player_id}"
        prof_res = requests.get(profile_url, headers=headers)
        if prof_res.status_code == 200:
            prof_data = prof_res.json()
            # Merge deep profile data into the best_match dict
            best_match["deep_profile"] = prof_data
            
        return [best_match]
        
    except Exception as e:
        logger.error(f"Error fetching players for {team_name}: {e}")
        return []

def store_players_in_db(player_coll, team_coll, players, search_query):
    for p in players:
        try:
            player_name = p.get("name", p.get("title", ""))
            if not player_name: continue
            
            country = p.get("teamName", p.get("country", ""))
            # Try to find a matching team in the database
            team = None
            if country:
                team = team_coll.find_one({"name": {"$regex": f"^{country}$", "$options": "i"}})
            
            # Extract deep profile stats
            deep = p.get("deep_profile", {})
            bio = deep.get("bio", f"Professional Cricketer for {country}.")
            import re
            # Clean HTML tags from bio
            clean_bio = re.sub('<[^<]+>', '', bio)[:300] + "..." if bio else f"Professional Cricketer for {country}."
            
            # Extract real rankings as achievements
            records = []
            rankings = deep.get("rankings", {})
            if rankings:
                for format_type, ranks in rankings.items():
                    for key, val in ranks.items():
                        if val and str(val).isdigit() and int(val) <= 100:
                            friendly_name = key.replace("Rank", "").replace("Best", " Best ").capitalize()
                            records.append(f"ICC {format_type.upper()} {friendly_name} Rank: #{val}")
            
            if not records:
                records = ["International Professional", "National Team Cap"]
                
            player_doc = {
                "playerId": str(p.get("id", "")),
                "name": player_name,
                "sport": "Cricket",
                "teamId": team["teamId"] if team else None,
                "teamName": country,
                "role": p.get("playingRole", deep.get("role", "Professional Cricketer")), 
                "battingStyle": deep.get("battingStyle", ""),
                "bowlingStyle": deep.get("bowlingStyle", ""),
                "country": country,
                "imageId": deep.get("faceImageId", p.get("faceImageId", p.get("imageId"))),
                "bio": clean_bio,
                "records": records[:5], # Keep top 5 achievements
                "updatedAt": datetime.now()
            }
            
            player_coll.update_one(
                {"playerId": str(p.get("id"))} if p.get("id") else {"name": player_name},
                {"$set": player_doc},
                upsert=True
            )
            logger.info(f"Saved player: {player_name} (Team ID: {team['teamId'] if team else 'None'})")
        except Exception as e:
            logger.error(f"DB error saving {p.get('name', p.get('title'))}: {e}")

def main():
    logger.info("Starting CricAPI Real Player Data Migration...")
    player_coll, team_coll = get_db_collections()
    if player_coll is None: return

    total_fetched = 0
    for player_search in TEAMS: # TEAMS actually contains player search strings
        logger.info(f"Fetching real players for {player_search}...")
        players = fetch_players_for_team(player_search)
        if players:
            store_players_in_db(player_coll, team_coll, players, player_search)
            total_fetched += len(players)
        time.sleep(2)
        
    logger.info(f"Player migration complete! Pulled {total_fetched} real players.")

if __name__ == "__main__":
    main()
