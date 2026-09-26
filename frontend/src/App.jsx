import { useState, useEffect } from "react";
import "./App.css";

const API_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://world-cup-ai-predictor-eakk.onrender.com";

function App() {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");

  const [team1Rank, setTeam1Rank] = useState("");
  const [team2Rank, setTeam2Rank] = useState("");

  const [team1Form, setTeam1Form] = useState("");
  const [team2Form, setTeam2Form] = useState("");

  const [prediction, setPrediction] = useState(null);
  const [team1Stats, setTeam1Stats] = useState(null);
  const [team2Stats, setTeam2Stats] = useState(null);
  const [modelPerformance, setModelPerformance] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD MODEL PERFORMANCE
  // ==========================================

  useEffect(() => {
    async function loadModelPerformance() {
      try {
        const response = await fetch(
          `${API_URL}/model-performance`
        );

        if (!response.ok) {
          throw new Error("Model performance request failed");
        }

        const data = await response.json();

        setModelPerformance(data);
      } catch (err) {
        console.log("Model performance:", err);
      }
    }

    loadModelPerformance();
  }, []);

  // ==========================================
  // GET TEAM STATISTICS
  // ==========================================

  async function getTeamStats(team, setStats) {
    try {
      const response = await fetch(
        `${API_URL}/stats/${encodeURIComponent(team)}`
      );

      if (!response.ok) {
        throw new Error("Statistics request failed");
      }

      const data = await response.json();

      setStats(data);
    } catch (err) {
      console.log("Stats error:", err);
    }
  }

  // ==========================================
  // GET PROBABILITY
  // ==========================================

  function getProbability(name) {
    if (!prediction || !prediction.probabilities) {
      return 0;
    }

    return prediction.probabilities[name] || 0;
  }

  // ==========================================
  // PREDICT MATCH
  // ==========================================

  async function predictMatch() {
    setError("");

    if (
      !team1 ||
      !team2 ||
      !team1Rank ||
      !team2Rank ||
      !team1Form ||
      !team2Form
    ) {
      setError("Please fill in all the fields.");
      return;
    }

    if (team1.toLowerCase() === team2.toLowerCase()) {
      setError("Please select two different teams.");
      return;
    }

    setLoading(true);

    try {
      const url =
        `${API_URL}/predict` +
        `?team1=${encodeURIComponent(team1)}` +
        `&team2=${encodeURIComponent(team2)}` +
        `&team1_rank=${Number(team1Rank)}` +
        `&team2_rank=${Number(team2Rank)}` +
        `&team1_form=${Number(team1Form)}` +
        `&team2_form=${Number(team2Form)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();

      setPrediction(data);

      await getTeamStats(team1, setTeam1Stats);
      await getTeamStats(team2, setTeam2Stats);

    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to FastAPI. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="header">

        <div className="ball">
          ⚽
        </div>

        <h1>
          WORLD CUP AI PREDICTOR
        </h1>

        <p>
          AI-powered football match prediction & analytics
        </p>

      </header>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}


      {/* =====================================
          TEAM INPUT SECTION
      ===================================== */}

      <section className="match-section">

        {/* TEAM 1 */}

        <div className="team-card">

          <div className="team-icon">
            🏆
          </div>

          <h2>
            TEAM 1
          </h2>

          <input
            type="text"
            placeholder="Team name"
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
          />

          <label>
            FIFA Ranking
          </label>

          <input
            type="number"
            placeholder="Example: 1"
            value={team1Rank}
            onChange={(e) => setTeam1Rank(e.target.value)}
          />

          <label>
            Recent Wins
          </label>

          <input
            type="number"
            min="0"
            max="5"
            placeholder="0 - 5"
            value={team1Form}
            onChange={(e) => setTeam1Form(e.target.value)}
          />

        </div>


        {/* VS */}

        <div className="vs-container">

          <div className="vs">
            VS
          </div>

        </div>


        {/* TEAM 2 */}

        <div className="team-card">

          <div className="team-icon">
            🏆
          </div>

          <h2>
            TEAM 2
          </h2>

          <input
            type="text"
            placeholder="Team name"
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
          />

          <label>
            FIFA Ranking
          </label>

          <input
            type="number"
            placeholder="Example: 3"
            value={team2Rank}
            onChange={(e) => setTeam2Rank(e.target.value)}
          />

          <label>
            Recent Wins
          </label>

          <input
            type="number"
            min="0"
            max="5"
            placeholder="0 - 5"
            value={team2Form}
            onChange={(e) => setTeam2Form(e.target.value)}
          />

        </div>

      </section>


      {/* =====================================
          PREDICT BUTTON
      ===================================== */}

      <div className="button-container">

        <button
          className="predict-button"
          onClick={predictMatch}
          disabled={loading}
        >

          {loading
            ? "⏳ Predicting..."
            : "🔮 Predict Match"}

        </button>

      </div>


      {/* =====================================
          MATCH PREDICTION
      ===================================== */}

      {prediction && (

        <section className="result-card">

          <h2>
            🏆 MATCH PREDICTION
          </h2>


          {/* MATCH NAME */}

          <div className="match-name">

            <span>
              {team1}
            </span>

            <strong>
              VS
            </strong>

            <span>
              {team2}
            </span>

          </div>


          {/* PREDICTED RESULT */}

          <div className="predicted-result">

            <span>
              Predicted Outcome
            </span>

            <strong>
              {prediction.prediction}
            </strong>

          </div>


          {/* =================================
              PROBABILITY CIRCLES
          ================================= */}

          <div className="probability-section">

            <h3>
              📊 MATCH PROBABILITY
            </h3>


            <div className="probability-cards">


              {/* TEAM 1 */}

              <div className="probability-card">

                <div
                  className="probability-circle"
                  style={{
                    "--percentage":
                      `${getProbability("team1")}%`
                  }}
                >

                  <div className="circle-inner">

                    <strong>
                      {getProbability("team1")}%
                    </strong>

                  </div>

                </div>

                <span>
                  {team1}
                </span>

              </div>


              {/* DRAW */}

              <div className="probability-card">

                <div
                  className="probability-circle"
                  style={{
                    "--percentage":
                      `${getProbability("draw")}%`
                  }}
                >

                  <div className="circle-inner">

                    <strong>
                      {getProbability("draw")}%
                    </strong>

                  </div>

                </div>

                <span>
                  Draw
                </span>

              </div>


              {/* TEAM 2 */}

              <div className="probability-card">

                <div
                  className="probability-circle"
                  style={{
                    "--percentage":
                      `${getProbability("team2")}%`
                  }}
                >

                  <div className="circle-inner">

                    <strong>
                      {getProbability("team2")}%
                    </strong>

                  </div>

                </div>

                <span>
                  {team2}
                </span>

              </div>

            </div>

          </div>

        </section>

      )}


      {/* =====================================
          TEAM STATISTICS
      ===================================== */}

      {(team1Stats || team2Stats) && (

        <section className="stats-section">

          <h2>
            📊 TEAM STATISTICS
          </h2>

          <div className="stats-grid">


            {/* TEAM 1 */}

            {team1Stats && (

              <div className="stats-card">

                <h3>
                  {team1Stats.team}
                </h3>

                <div className="stat">
                  <span>Matches</span>
                  <strong>
                    {team1Stats.matches}
                  </strong>
                </div>

                <div className="stat">
                  <span>Wins</span>
                  <strong>
                    {team1Stats.wins}
                  </strong>
                </div>

                <div className="stat">
                  <span>Draws</span>
                  <strong>
                    {team1Stats.draws}
                  </strong>
                </div>

                <div className="stat">
                  <span>Losses</span>
                  <strong>
                    {team1Stats.losses}
                  </strong>
                </div>

                <div className="stat">
                  <span>Goals For</span>
                  <strong>
                    {team1Stats.goals_for}
                  </strong>
                </div>

                <div className="stat">
                  <span>Goals Against</span>
                  <strong>
                    {team1Stats.goals_against}
                  </strong>
                </div>


                {/* RECENT FORM */}

                <div className="form-title">
                  Recent Form
                </div>

                <div className="form-row">

                  {team1Stats.recent_form?.map(
                    (result, index) => (

                      <span
                        key={index}
                        className={`form ${result.toLowerCase()}`}
                      >
                        {result}
                      </span>

                    )
                  )}

                </div>

              </div>

            )}


            {/* TEAM 2 */}

            {team2Stats && (

              <div className="stats-card">

                <h3>
                  {team2Stats.team}
                </h3>

                <div className="stat">
                  <span>Matches</span>
                  <strong>
                    {team2Stats.matches}
                  </strong>
                </div>

                <div className="stat">
                  <span>Wins</span>
                  <strong>
                    {team2Stats.wins}
                  </strong>
                </div>

                <div className="stat">
                  <span>Draws</span>
                  <strong>
                    {team2Stats.draws}
                  </strong>
                </div>

                <div className="stat">
                  <span>Losses</span>
                  <strong>
                    {team2Stats.losses}
                  </strong>
                </div>

                <div className="stat">
                  <span>Goals For</span>
                  <strong>
                    {team2Stats.goals_for}
                  </strong>
                </div>

                <div className="stat">
                  <span>Goals Against</span>
                  <strong>
                    {team2Stats.goals_against}
                  </strong>
                </div>


                {/* RECENT FORM */}

                <div className="form-title">
                  Recent Form
                </div>

                <div className="form-row">

                  {team2Stats.recent_form?.map(
                    (result, index) => (

                      <span
                        key={index}
                        className={`form ${result.toLowerCase()}`}
                      >
                        {result}
                      </span>

                    )
                  )}

                </div>

              </div>

            )}

          </div>

        </section>

      )}


      {/* =====================================
          RECENT MATCHES
      ===================================== */}

      {(team1Stats?.recent_matches ||
        team2Stats?.recent_matches) && (

        <section className="history-section">

          <h2>
            ⚽ RECENT MATCHES
          </h2>

          <div className="history-grid">


            {/* TEAM 1 */}

            {team1Stats?.recent_matches && (

              <div className="history-card">

                <h3>
                  {team1Stats.team}
                </h3>

                {team1Stats.recent_matches.map(
                  (match, index) => (

                    <div
                      className="history-match"
                      key={index}
                    >

                      <div className="history-date">
                        {match.date}
                      </div>

                      <div className="history-teams">

                        <span>
                          {team1Stats.team}
                        </span>

                        <strong>
                          {match.team_score} -{" "}
                          {match.opponent_score}
                        </strong>

                        <span>
                          {match.opponent}
                        </span>

                      </div>

                      <span
                        className={`history-result ${match.result.toLowerCase()}`}
                      >
                        {match.result}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}


            {/* TEAM 2 */}

            {team2Stats?.recent_matches && (

              <div className="history-card">

                <h3>
                  {team2Stats.team}
                </h3>

                {team2Stats.recent_matches.map(
                  (match, index) => (

                    <div
                      className="history-match"
                      key={index}
                    >

                      <div className="history-date">
                        {match.date}
                      </div>

                      <div className="history-teams">

                        <span>
                          {team2Stats.team}
                        </span>

                        <strong>
                          {match.team_score} -{" "}
                          {match.opponent_score}
                        </strong>

                        <span>
                          {match.opponent}
                        </span>

                      </div>

                      <span
                        className={`history-result ${match.result.toLowerCase()}`}
                      >
                        {match.result}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>

      )}


      {/* =====================================
          MODEL PERFORMANCE
      ===================================== */}

      {modelPerformance && (

        <section className="performance-section">

          <h2>
            🤖 MODEL PERFORMANCE
          </h2>

          <div className="performance-grid">


            {/* ACCURACY */}

            <div className="performance-card">

              <div className="performance-icon">
                🎯
              </div>

              <h3>
                {modelPerformance.accuracy}%
              </h3>

              <p>
                Model Accuracy
              </p>

            </div>


            {/* TRAINING */}

            <div className="performance-card">

              <div className="performance-icon">
                📚
              </div>

              <h3>
                {modelPerformance.training_matches}
              </h3>

              <p>
                Training Matches
              </p>

            </div>


            {/* TESTING */}

            <div className="performance-card">

              <div className="performance-icon">
                🧪
              </div>

              <h3>
                {modelPerformance.testing_matches}
              </h3>

              <p>
                Testing Matches
              </p>

            </div>


            {/* MODEL */}

            <div className="performance-card">

              <div className="performance-icon">
                🌲
              </div>

              <h3>
                Random Forest
              </h3>

              <p>
                Machine Learning Model
              </p>

            </div>

          </div>

        </section>

      )}

    </div>
  );
}

export default App;