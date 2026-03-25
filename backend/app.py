from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)

# Load models
modelD = joblib.load("decision_tree_model.pkl")
modelR = joblib.load("random_forest_model.pkl")
modelP = joblib.load("perceptron_model.pkl")
modelL = joblib.load("logistic_model.pkl")
modelN = joblib.load("mlp_model.pkl")

label_map = {0: "H", 1: "M", 2: "L"}

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        print("Received:", data)

        # Validate
        required = ["raisedHands", "visitedResources", "discussion", "absences"]
        for key in required:
            if key not in data:
                return jsonify({"error": f"Missing field: {key}"}), 400
        
        # Build dataframe
        df = pd.DataFrame([{
            "raisedhands": int(data["raisedHands"]),
            "VisITedResources": int(data["visitedResources"]),
            "Discussion": int(data["discussion"]),
            "StudentAbsenceDays": int(data["absences"])
        }])

        # Predictions
        predictions = {
            "Decision Tree": label_map[int(modelD.predict(df)[0])],
            "Random Forest": label_map[int(modelR.predict(df)[0])],
            "Perceptron": label_map[int(modelP.predict(df)[0])],
            "Logistic Regression": label_map[int(modelL.predict(df)[0])],
            "MLP Classifier": label_map[int(modelN.predict(df)[0])]
        }

        # Student Engagement Score (0–100)
        engagement = (
            df["raisedhands"][0] * 0.3 +
            df["VisITedResources"][0] * 0.3 +
            df["Discussion"][0] * 0.3 -
            df["StudentAbsenceDays"][0] * 2
        )

        engagement = max(0, min(100, int(engagement)))

        # Evaluation
        if engagement > 70:
            evaluation = "Excellent & Highly Active"
        elif engagement > 40:
            evaluation = "Average Activity"
        else:
            evaluation = "Needs Improvement"

        return jsonify({
            "predictions": predictions,
            "engagementScore": engagement,
            "evaluation": evaluation
        })

    except Exception as e:
        print("Backend Error:", e)
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
