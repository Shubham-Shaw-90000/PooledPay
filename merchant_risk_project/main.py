from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

from ai_engine import ai_engine

app = FastAPI(title="PooledPay AI Microservice", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RiskInput(BaseModel):
    rev: int = 150000
    pay_due: int = 10000
    gst: int = 5000
    sales: int = 4000
    rep_score: int = 80
    miss_pay: int = 0
    cash_bal: int = 50000
    up_orders: int = 15000
    ord_freq: int = 40
    credit_used: int = 20000
    upi_vol: int = 80000
    ret_rate: int = 2
    pool_save: int = 5000
    inv_turn: int = 30
    grp_ord: int = 3
    pay_delay: int = 2
    season_idx: int = 50
    supp_rate: float = 4.2
    credit_ratio: int = 30
    cust_growth: int = 5

class RiskPredictionResponse(BaseModel):
    risk_score: int
    risk_level: str
    confidence: float
    reasons: List[str]
    suggestions: List[str]

@app.get("/")
def home():
    return {"message": "PooledPay AI Microservice is running."}

@app.get("/health")
def health():
    return {"status": "UP"}

@app.post("/predict-risk", response_model=RiskPredictionResponse)
def predict_risk(data: RiskInput):
    # Convert Pydantic model to dict
    input_dict = data.dict()
    
    # Use AI Engine to generate predictions and explanations
    result = ai_engine.predict_risk(input_dict)
    
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
