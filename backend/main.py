from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from statsbombpy import sb
from datetime import datetime
from typing import List
from pydantic import TypeAdapter
import numpy as np
from models.competition_model import Competition
from models.match_model import Match
from models.top_players_model import TopPlayer
from models.player_model import Player
from models.events_model import Event
from fastapi.concurrency import run_in_threadpool

import requests

def custom_get_response(path):
    headers = {
        'User-Agent': 'MatchStatsApp/1.0',  # Replace with your app's name and version
        'Accept': 'application/vnd.github.v3.raw',
    }
    response = requests.get(path, headers=headers)
    response.raise_for_status()
    return response.json()

# Apply the monkey patch
sb.public.get_response = custom_get_response

app = FastAPI()

origins = [
    "http://localhost:4200",  # For Local Development
    "https://match-stats-49or.onrender.com" # For Production
    # Add other origins if needed, e.g., production URLs
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],             # List of allowed origins
    allow_credentials=False,           # Whether to allow credentials (cookies, etc.)
    allow_methods=["*"],               # List of allowed HTTP methods
    allow_headers=["*"],               # List of allowed headers
)

@app.get("/api/competitions", response_model=List[Competition])
async def get_competitions():
    competitions_df = await run_in_threadpool(sb.competitions)
    competitions_list = competitions_df.to_dict(orient='records')

    # Process date fields to convert strings to datetime objects
    for competition in competitions_list:
        for date_field in ['match_updated', 'match_available']:
            date_str = competition.get(date_field)
            if date_str and isinstance(date_str, str):
                try:
                    competition[date_field] = datetime.fromisoformat(date_str)
                except ValueError:
                    competition[date_field] = None
            else:
                competition[date_field] = None

    competitions_models = TypeAdapter(List[Competition]).validate_python(competitions_list)
    return competitions_models

@app.get("/api/matches", response_model=List[Match])
async def get_matches(competition_id: int, season_id: int):
    try:
        matches_df = await run_in_threadpool(sb.matches, competition_id=competition_id, season_id=season_id)
        matches_list = matches_df.to_dict(orient='records')

        for match in matches_list:
            # Parse 'match_date' to datetime
            match_date_str = match.get('match_date')
            if match_date_str:
                try:
                    match['match_date'] = datetime.fromisoformat(match_date_str)
                except ValueError:
                    match['match_date'] = datetime.strptime(match_date_str, '%Y-%m-%dT%H:%M:%S.%f')
            else:
                match['match_date'] = None

            # Parse 'kick_off' to time
            kick_off_str = match.get('kick_off')
            if kick_off_str:
                try:
                    match['kick_off'] = datetime.strptime(kick_off_str, '%H:%M:%S.%f').time()
                except ValueError:
                    try:
                        match['kick_off'] = datetime.strptime(kick_off_str, '%H:%M:%S').time()
                    except ValueError:
                        match['kick_off'] = None
            else:
                match['kick_off'] = None

            # Parse 'last_updated' to datetime
            last_updated_str = match.get('last_updated')
            if last_updated_str:
                try:
                    match['last_updated'] = datetime.fromisoformat(last_updated_str)
                except ValueError:
                    match['last_updated'] = None
            else:
                match['last_updated'] = None

            # Ensure 'match_week' is int
            match_week = match.get('match_week')
            if match_week is not None and match_week != '':
                try:
                    match['match_week'] = int(match_week)
                except ValueError:
                    match['match_week'] = None
            else:
                match['match_week'] = None

            # Ensure 'match_status' is not None
            match_status = match.get('match_status')
            match['match_status'] = match_status if match_status != '' else 'Unknown'

        matches_models = TypeAdapter(List[Match]).validate_python(matches_list)
        return matches_models

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/top_scorers", response_model=List[TopPlayer])
async def get_top_scorers(country: str, division: str, season: str, gender: str):
    try:
        filters = {"type": "Shot"}
        events_dict = await run_in_threadpool(
            sb.competition_events,
            country=country,
            division=division,
            season=season,
            gender=gender,
            filters=filters,
            split=True
        )
        events = events_dict["shots"][["player", "team", "shot_outcome"]]

        if events.empty:
            return []
        events = events[events["shot_outcome"] == "Goal"]

        if events.empty:
            return []

        goal_counts = events.groupby(["player", "team"]).size().reset_index(name='number')
        top_scorers_df = goal_counts.sort_values(by='number', ascending=False).head(5)
        top_scorers = [
            TopPlayer(player=row['player'], team=row['team'], number=row['number'])
            for _, row in top_scorers_df.iterrows()
        ]

        return top_scorers

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/top_assists", response_model=List[TopPlayer])
async def get_top_assists(country: str, division: str, season: str, gender: str):
    try:
        filters = {"type": "Pass"}
        events_dict = await run_in_threadpool(
            sb.competition_events,
            country=country,
            division=division,
            season=season,
            gender=gender,
            filters=filters,
            split=True
        )
        events = events_dict["passes"][["player", "team", "pass_goal_assist"]]
        
        if events.empty:
            return []

        events = events[events["pass_goal_assist"] == True]

        if events.empty:
            return []

        assist_counts = events.groupby(["player", "team"]).size().reset_index(name='number')
        top_assists_df = assist_counts.sort_values(by='number', ascending=False).head(5)
        top_assists = [
            TopPlayer(player=row['player'], team=row['team'], number=row['number'])
            for _, row in top_assists_df.iterrows()
        ]

        return top_assists

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error fetching top assists: {str(e)} with filters country={country}, division={division}, season={season}, gender={gender}, filters={filters}"
        )
    
@app.get("/api/players", response_model=List[Player])
async def get_players(competition_id: int, season_id: int):
    try:
        # Retrieve matches for the competition and season
        matches_df = await run_in_threadpool(sb.matches, competition_id=competition_id, season_id=season_id)
        match_ids = matches_df['match_id'].tolist()

        # Collect unique players across all matches
        unique_players = {}
        for match_id in match_ids:
            # Fetch the lineup data for the current match
            lineup_data = await run_in_threadpool(sb.lineups, match_id=match_id)
            
            # Iterate over each team in the lineup data
            for team_name in lineup_data.keys():
                team_df = lineup_data[team_name]  # Get DataFrame for each team
                
                # Process each player in the team's DataFrame
                for _, row in team_df.iterrows():
                    player_id = row['player_id']
                    if player_id not in unique_players:
                        # Add player only if they haven't been added before
                        unique_players[player_id] = Player(
                            player_id=row['player_id'],
                            player_name=row['player_name'],
                            player_nickname=row.get('player_nickname'),
                            birth_date=row.get('birth_date'),
                            player_gender=row.get('player_gender'),
                            player_height=row.get('player_height'),
                            player_weight=row.get('player_weight'),
                            jersey_number=row.get('jersey_number'),
                            country=row.get('country')
                        )

        # Return the unique players as a list
        return list(unique_players.values())

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@app.get("/api/match_events", response_model=List[Event])
async def get_match_events(match_id: int):
    try:
        events_df = await run_in_threadpool(sb.events, match_id=match_id)
        
        # Replace NaN with None before converting to dict
        events_df = events_df.replace({np.nan: None})
        
        events_list = events_df.to_dict(orient='records')
        events_models = TypeAdapter(List[Event]).validate_python(events_list)
        
        return events_models

    except Exception as e:
        print("Error fetching events:", e)
        raise HTTPException(status_code=400, detail=str(e))

