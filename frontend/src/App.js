import React, { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function App() {
  const [inputs, setInputs] = useState({
    raisedHands: "",
    visitedResources: "",
    discussion: "",
    absences: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", {
        raisedHands: parseInt(inputs.raisedHands),
        visitedResources: parseInt(inputs.visitedResources),
        discussion: parseInt(inputs.discussion),
        absences: parseInt(inputs.absences)
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Prediction failed. Check backend.");
    }
  };

  const chartData =
    result?.predictions
      ? Object.entries(result.predictions).map(([name, label]) => ({
          name,
          value: label === "H" ? 1 : label === "M" ? 0.5 : 0
        }))
      : [];

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}> Student Performance Insights System</h1>

      {/* Input Card */}
      <div style={styles.card}>
        <h2>Enter Student Activity</h2>

        {["raisedHands", "visitedResources", "discussion", "absences"].map(
          (field) => (
            <div key={field} style={styles.inputGroup}>
              <label style={styles.label}>{field}</label>
              <input
                type="number"
                name={field}
                value={inputs[field]}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          )
        )}

        <button style={styles.button} onClick={handlePredict}>
          Predict Performance
        </button>
      </div>

      {/* Results Card */}
      {result && (
        <div style={styles.card}>
          <h2> Prediction Results</h2>

          {/* Engagement Score */}
          <h3>Engagement Score: {result.engagementScore} / 100</h3>
          <div style={styles.progressBarOuter}>
            <div
              style={{
                ...styles.progressBarInner,
                width: `${result.engagementScore}%`
              }}
            ></div>
          </div>

          <h3>Overall Evaluation: {result.evaluation}</h3>

          {/* List of model predictions */}
          <ul>
            {Object.entries(result.predictions).map(([model, value]) => (
              <li key={model}>
                <strong>{model}:</strong> {value}
              </li>
            ))}
          </ul>

          {/* Chart */}
          <div style={{ width: "100%", height: 300, marginTop: "2rem" }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} />
                <Tooltip />
                <Bar dataKey="value" fill="#00BFA6" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "auto",
    padding: "2rem",
    fontFamily: "Arial"
  },
  heading: {
    textAlign: "center",
    fontSize: "2rem",
    color: "#00BFA6",
    marginBottom: "1.5rem"
  },
  card: {
    background: "#f8ffff",
    padding: "1.5rem",
    borderRadius: "10px",
    marginBottom: "2rem",
    border: "1px solid #c0f2eb"
  },
  label: { marginBottom: "0.2rem", fontWeight: "bold" },
  input: {
    padding: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #aaa",
    marginBottom: "1rem"
  },
  inputGroup: { display: "flex", flexDirection: "column" },
  button: {
    padding: "0.6rem",
    border: "none",
    background: "#00BFA6",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600
  },
  progressBarOuter: {
    width: "100%",
    height: "15px",
    background: "#ddd",
    borderRadius: "10px",
    marginBottom: "1rem"
  },
  progressBarInner: {
    height: "100%",
    background: "#00BFA6",
    borderRadius: "10px"
  }
};

export default App;
