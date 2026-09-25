from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd


# Create FastAPI app
app = FastAPI()


# Allow React to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model
model = joblib.load("predictor.pkl")


# ==========================================
# PREDICT MATCH
# ==========================================

@app.get("/predict")
def predict(
    team1: str,
    team2: str,
    team1_rank: int,
    team2_rank: int,
    team1_form: int,
    team2_form: int
):

    match = pd.DataFrame([
        {
            "team1_rank": team1_rank,
            "team2_rank": team2_rank,
            "team1_form": team1_form,
            "team2_form": team2_form
        }
    ])

    # Make prediction
    prediction = model.predict(match)[0]

    # Get probabilities
    probabilities = model.predict_proba(match)[0]

    result = {}

    for outcome, probability in zip(
        model.classes_,
        probabilities
    ):
        result[outcome] = round(
            probability * 100,
            2
        )

    return {
        "team1": team1,
        "team2": team2,
        "prediction": prediction,
        "probabilities": {
            "team1": result.get("team1", 0),
            "draw": result.get("draw", 0),
            "team2": result.get("team2", 0)
        }
    }


# ==========================================
# TEAM STATISTICS
# ==========================================

@app.get("/stats/{team_name}")
def team_stats(team_name: str):

    data = pd.read_csv("results.csv")

    # Find all matches involving this team
    team_matches = data[
        (data["home_team"].str.lower() == team_name.lower())
        |
        (data["away_team"].str.lower() == team_name.lower())
    ].copy()

    # Sort newest matches first
    team_matches["date"] = pd.to_datetime(team_matches["date"])

    team_matches = team_matches.sort_values(
        "date",
        ascending=False
    )

    wins = 0
    draws = 0
    losses = 0

    goals_for = 0
    goals_against = 0

    recent_form = []
    recent_matches = []

    # Look at matches
    for _, match in team_matches.iterrows():

        is_home = (
            match["home_team"].lower()
            == team_name.lower()
        )

        if is_home:

            goals_for_match = match["home_score"]
            goals_against_match = match["away_score"]

            opponent = match["away_team"]

        else:

            goals_for_match = match["away_score"]
            goals_against_match = match["home_score"]

            opponent = match["home_team"]


        goals_for += goals_for_match
        goals_against += goals_against_match


        # Determine result
        if goals_for_match > goals_against_match:

            result = "W"
            wins += 1

        elif goals_for_match == goals_against_match:

            result = "D"
            draws += 1

        else:

            result = "L"
            losses += 1


        # Recent form
        if len(recent_form) < 5:

            recent_form.append(result)


        # Recent matches
        if len(recent_matches) < 5:

            recent_matches.append({
                "date": str(match["date"].date()),
                "opponent": opponent,
                "team_score": int(goals_for_match),
                "opponent_score": int(goals_against_match),
                "result": result
            })


    return {
        "team": team_name,
        "matches": len(team_matches),
        "wins": wins,
        "draws": draws,
        "losses": losses,
        "goals_for": goals_for,
        "goals_against": goals_against,
        "recent_form": recent_form,
        "recent_matches": recent_matches
    }
# ==========================================
# MODEL PERFORMANCE
# ==========================================

@app.get("/model-performance")
def model_performance():

    model_info = joblib.load("model_info.pkl")

    return model_info