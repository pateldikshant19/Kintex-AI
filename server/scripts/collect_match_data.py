import os
import time
import requests
import logging
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

# Configure basic logging for the terminal
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables from the root .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(dotenv_path=env_path)

# Constants
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_URL = "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live"
RAPIDAPI_HOST = "cricbuzz-cricket.p.rapidapi.com"
# Fallback to local MongoDB if not provided in .env
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/sport-analytics")
DB_NAME = "sport-analytics"
COLLECTION_NAME = "live_matches"
POLL_INTERVAL_SECONDS = 120

def get_db_collection():
    """Establish connection to MongoDB and return the collection."""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        
        # Ping the database to verify the connection is active
        client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database: {DB_NAME}")
        
        return db[COLLECTION_NAME]
    except PyMongoError as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return None

def fetch_live_matches():
    """Fetch current live cricket matches from CricAPI."""
    if not RAPIDAPI_KEY:
        logger.error("RAPIDAPI_KEY is not set in the environment variables.")
        return []

    try:
        headers = {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST
        }
        # Make the HTTP GET request
        response = requests.get(RAPIDAPI_URL, headers=headers)
        response.raise_for_status() # Raise an exception for bad status codes (4xx, 5xx)
        
        data = response.json()
        
        # The structure from RapidAPI Cricbuzz might differ. We try to grab the matches array
        # This part might need tuning based on the exact JSON schema of the API
        if "typeMatches" in data:
            # Often Cricbuzz returns data["typeMatches"] -> match -> matchInfo
            matches = []
            for tm in data["typeMatches"]:
                if "seriesMatches" in tm:
                    for sm in tm["seriesMatches"]:
                        if "seriesAdWrapper" in sm and "matches" in sm["seriesAdWrapper"]:
                            matches.extend(sm["seriesAdWrapper"]["matches"])
            return matches
        elif "matches" in data:
            return data["matches"]
        else:
            return data.get("data", [])
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data from CricAPI: {e}")
        return []
    except ValueError as e:
        logger.error(f"Error parsing JSON response: {e}")
        return []

def store_matches_in_db(collection, matches):
    """Store or update fetched matches in the MongoDB collection to avoid duplicates."""
    if not matches:
        return

    updated_count = 0
    inserted_count = 0

    for match in matches:
        try:
            # Adapted schema for Cricbuzz API style
            match_info = match.get("matchInfo", match) # fallback to match if no matchInfo wrapper
            match_id = match_info.get("matchId", match.get("id"))
            
            if not match_id:
                continue

            # Format the document we want to store based on your requirements
            match_document = {
                "match_id": match_id,
                "name": match_info.get("team1", {}).get("teamName", "") + " vs " + match_info.get("team2", {}).get("teamName", match.get("name")),
                "status": match_info.get("status", match.get("status")),
                "venue": match_info.get("venueInfo", {}).get("knownAs", match.get("venue")),
                "matchType": match_info.get("matchFormat", match.get("matchType")),
                "date": match.get("date", str(datetime.utcnow().date())),
                "dateTimeGMT": match.get("dateTimeGMT", str(datetime.utcnow())),
                "teams": match.get("teams", []),
                "score": match.get("matchScore", match.get("score", [])),
                "updatedAt": datetime.utcnow()
            }

            # Use update_one with upsert=True
            # This inserts the document if match_id doesn't exist, or updates it if it does
            result = collection.update_one(
                {"match_id": match_id},
                {"$set": match_document},
                upsert=True
            )

            if result.matched_count > 0:
                updated_count += 1
            elif result.upserted_id is not None:
                inserted_count += 1

        except PyMongoError as e:
            logger.error(f"Database error while saving match {match_id}: {e}")

    logger.info(f"Database sync complete. Inserted: {inserted_count}, Updated: {updated_count}")

def main():
    """Main loop to continuously fetch and store data every 30 seconds."""
    logger.info("Starting Kinetix AI Live Match Data Collector...")
    
    collection = get_db_collection()
    if collection is None:
        logger.error("Exiting due to database connection failure.")
        return

    logger.info(f"Polling CricAPI every {POLL_INTERVAL_SECONDS} seconds. Press Ctrl+C to stop.")

    try:
        # Run continuously
        while True:
            logger.info("Fetching latest match data...")
            matches = fetch_live_matches()
            
            if matches:
                logger.info(f"Retrieved {len(matches)} matches. Processing...")
                store_matches_in_db(collection, matches)
            else:
                logger.warning("No matches retrieved or an error occurred.")

            logger.info(f"Sleeping for {POLL_INTERVAL_SECONDS} seconds...\n")
            time.sleep(POLL_INTERVAL_SECONDS)
            
    except KeyboardInterrupt:
        # Cleanly handle Ctrl+C
        logger.info("\nData collector stopped by user (KeyboardInterrupt).")
    except Exception as e:
        logger.critical(f"Unexpected error in main loop: {e}")

if __name__ == "__main__":
    main()
