# Pooled Pay - AI Merchant Risk Bot Integration

This repository contains the integrated AI Merchant Risk Bot. The system is built using a modern 3-tier architecture:
1. **React Frontend (Vite)**
2. **Spring Boot Backend (Java)**
3. **Python AI Microservice (FastAPI)**

## Requirements
- Node.js & npm (for the React Frontend)
- Java 17+ & Maven (for the Spring Boot Backend)
- Python 3.10+ (for the ML Microservice)

---

## 1. Starting the Python AI Microservice

The AI engine runs as a lightweight FastAPI microservice on port `8000`.

1. Navigate to the Python directory:
   ```bash
   cd merchant_risk_project
   ```
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server:
   ```bash
   python main.py
   ```
   *The server will start at http://localhost:8000*

---

## 2. Starting the Spring Boot Backend

The backend acts as the orchestrator. It receives frontend requests, queries the H2 Database for history, and calls the Python microservice for new predictions.

1. Navigate to the backend directory:
   ```bash
   cd Pooled_Pay/CODEFLOW2026-QuadCore-PooledPay/pooled-pay-backend
   ```
2. Run the application using the Maven wrapper:
   ```bash
   ./mvnw spring-boot:run   # On Windows: .\mvnw.cmd spring-boot:run
   ```
   *The backend will start at http://localhost:8082*

---

## 3. Starting the React Frontend

The frontend features the new AI Copilot Chatbot interface.

1. Navigate to the frontend directory:
   ```bash
   cd Pooled_Pay/CODEFLOW2026-QuadCore-PooledPay/pooled-pay-frontend
   ```
2. Install Node dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will start at http://localhost:5173*

---

## Architecture Flow

1. **User Input:** The user adjusts the 20 merchant parameters in the AI Copilot UI and clicks "Generate Risk Prediction".
2. **Frontend -> Backend:** React sends a `POST` request to `http://localhost:8082/api/ai/predict-risk`.
3. **Backend -> Microservice:** Spring Boot formats the data and sends it via `RestTemplate` to the Python microservice at `http://localhost:8000/predict-risk`.
4. **ML Inference:** The Python `AIEngine` loads the `risk_model.pkl` (Random Forest Classifier), calculates probabilities to derive a risk score (0-100), and uses feature-based heuristics to generate explanations.
5. **Microservice -> Backend:** Python returns the score, level, confidence, and explanations.
6. **Persistence:** Spring Boot saves the entire assessment in the `merchant_risk_assessments` table in the H2 Database.
7. **Backend -> Frontend:** The full assessment (including database ID) is returned to React.
8. **UI Rendering:** The React UI smoothly animates the risk gauge, updates the history panel, and provides actionable recommendations.

## Future Retraining

To retrain the model:
1. Update `train_model (1).py` with new data.
2. Re-run it to generate a new `risk_model.pkl`.
3. Replace the `.pkl` file in `merchant_risk_project` and restart the FastAPI server.
