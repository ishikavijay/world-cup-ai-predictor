import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
import joblib


# ==========================================
# 1. LOAD DATA
# ==========================================

data = pd.read_csv("matches.csv")


# ==========================================
# 2. FEATURES
# ==========================================

X = data[
    [
        "team1_rank",
        "team2_rank",
        "team1_form",
        "team2_form"
    ]
]


# ==========================================
# 3. TARGET
# ==========================================

y = data["result"]


# ==========================================
# 4. TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# ==========================================
# 5. RANDOM FOREST
# ==========================================

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


# ==========================================
# 6. TRAIN MODEL
# ==========================================

model.fit(X_train, y_train)


# ==========================================
# 7. PREDICTIONS
# ==========================================

predictions = model.predict(X_test)


# ==========================================
# 8. ACCURACY
# ==========================================

accuracy = accuracy_score(
    y_test,
    predictions
)

print("--------------------------------")
print("WORLD CUP AI PREDICTOR")
print("--------------------------------")

print(
    "Model Accuracy:",
    round(accuracy * 100, 2),
    "%"
)

print(
    "Training Matches:",
    len(X_train)
)

print(
    "Testing Matches:",
    len(X_test)
)


# ==========================================
# 9. CONFUSION MATRIX
# ==========================================

matrix = confusion_matrix(
    y_test,
    predictions
)

print("\nConfusion Matrix:")
print(matrix)


# ==========================================
# 10. SAVE MODEL
# ==========================================

# Save model
joblib.dump(model, "predictor.pkl")

# Save model information
model_info = {
    "accuracy": round(accuracy * 100, 2),
    "training_matches": len(X_train),
    "testing_matches": len(X_test),
    "model": "Random Forest Classifier"
}

joblib.dump(model_info, "model_info.pkl")

print("\nModel saved successfully!")
print("Model information saved successfully!")