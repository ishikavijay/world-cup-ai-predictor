import joblib
import pandas as pd

# Load trained model
model = joblib.load("predictor.pkl")

print("\n🏆 WORLD CUP AI PREDICTOR")
print("--------------------------")

# Take input from user
team1 = input("Enter Team 1: ")
team2 = input("Enter Team 2: ")

team1_rank = int(input(f"Enter {team1} ranking: "))
team2_rank = int(input(f"Enter {team2} ranking: "))

team1_form = int(input(f"Enter {team1} recent wins (0-5): "))
team2_form = int(input(f"Enter {team2} recent wins (0-5): "))

# Create match data
match = pd.DataFrame([
    {
        "team1_rank": team1_rank,
        "team2_rank": team2_rank,
        "team1_form": team1_form,
        "team2_form": team2_form
    }
])

# Predict
prediction = model.predict(match)
probabilities = model.predict_proba(match)

print("\n📊 PREDICTION")
print("--------------------------")

for result, probability in zip(
    model.classes_,
    probabilities[0]
):
    if result == "team1":
        name = team1
    elif result == "team2":
        name = team2
    else:
        name = "Draw"

    print(f"{name}: {probability * 100:.2f}%")

print("\n🤖 Predicted Result:")

if prediction[0] == "team1":
    print(team1)
elif prediction[0] == "team2":
    print(team2)
else:
    print("Draw")