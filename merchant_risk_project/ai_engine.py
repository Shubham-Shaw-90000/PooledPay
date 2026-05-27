import joblib
import pandas as pd
import numpy as np

MODEL_PATH = "risk_model.pkl"

FEATURE_COLUMNS = [
    "rev", "pay_due", "gst", "sales", "rep_score", "miss_pay", "cash_bal",
    "up_orders", "ord_freq", "credit_used", "upi_vol", "ret_rate", "pool_save",
    "inv_turn", "grp_ord", "pay_delay", "season_idx", "supp_rate", "credit_ratio", "cust_growth"
]

class AIEngine:
    def __init__(self):
        self.model = None
        self.feature_columns = FEATURE_COLUMNS
        self._load_model()

    def _load_model(self):
        try:
            loaded_model = joblib.load(MODEL_PATH)
            if isinstance(loaded_model, dict):
                if "model" in loaded_model:
                    self.model = loaded_model["model"]
                elif "supervised_model" in loaded_model:
                    self.model = loaded_model["supervised_model"]
                self.feature_columns = loaded_model.get("feature_columns", FEATURE_COLUMNS)
            else:
                self.model = loaded_model
            print(f"[AIEngine] Model loaded successfully. Feature columns: {len(self.feature_columns)}")
        except Exception as e:
            print(f"[AIEngine] Error loading model: {e}")

    def predict_risk(self, input_data: dict):
        """
        Takes a dict of features, returns risk_score, risk_level, confidence, reasons, and suggestions.
        """
        if not self.model:
            raise RuntimeError("Model is not loaded.")

        df = pd.DataFrame([input_data], columns=self.feature_columns)
        
        # Predictions
        prediction = self.model.predict(df)[0]
        probabilities = self.model.predict_proba(df)[0]
        classes = self.model.classes_

        # Map classes to probability dictionary
        prob_dict = {cls: prob for cls, prob in zip(classes, probabilities)}
        
        # Calculate continuous risk score (0 to 100)
        # Assuming classes are 'SAFE', 'RISK', 'CRITICAL'
        prob_safe = prob_dict.get('SAFE', 0.0)
        prob_risk = prob_dict.get('RISK', 0.0)
        prob_critical = prob_dict.get('CRITICAL', 0.0)
        
        risk_score = int((prob_critical * 100) + (prob_risk * 50) + (prob_safe * 0))
        confidence = float(max(probabilities))
        
        # Define risk level
        if prediction == "CRITICAL":
            risk_level = "High Risk"
        elif prediction == "RISK":
            risk_level = "Medium Risk"
        else:
            risk_level = "Low Risk"

        # Generate reasons and suggestions based on features
        reasons, suggestions = self._generate_explanations(input_data, risk_level)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": round(confidence, 2),
            "reasons": reasons,
            "suggestions": suggestions
        }

    def _generate_explanations(self, data, risk_level):
        reasons = []
        suggestions = []
        
        # Simple heuristics based on common sense / business rules corresponding to features
        if data.get('pay_delay', 0) > 5:
            reasons.append(f"High payment delay ({data.get('pay_delay')} days)")
            suggestions.append("Settle outstanding dues immediately to improve your risk profile.")
            
        if data.get('miss_pay', 0) > 1:
            reasons.append(f"Frequent missed payments ({data.get('miss_pay')})")
            
        if data.get('rep_score', 100) < 60:
            reasons.append(f"Low repayment score ({data.get('rep_score')})")
            
        if data.get('cash_bal', 100000) < 30000:
            reasons.append("Critically low cash balance")
            suggestions.append("Avoid large individual purchases. Use BNPL or join group buy pools to conserve cash.")
            
        if data.get('credit_ratio', 0) > 75:
            reasons.append(f"High credit utilization ({data.get('credit_ratio')}%)")
            
        if data.get('pay_due', 0) > data.get('rev', 1) * 0.5:
            reasons.append("Supplier dues are dangerously high compared to monthly revenue.")
            suggestions.append("Delay non-essential procurement or leverage Pooled Pay for discounts.")
            
        # Add positive reinforcement if risk is low
        if risk_level == "Low Risk":
            if not reasons:
                reasons.append("Stable cash flow and healthy repayment behavior.")
            suggestions.append("Safe to proceed with purchases. Consider starting a pool order to capture premium group buying volume discounts.")
        
        # If no reasons were triggered for higher risk, add a generic one
        if not reasons and risk_level != "Low Risk":
            reasons.append("Overall financial indicators point towards liquidity stress.")
            suggestions.append("Switch upcoming procurement to group pools to reduce costs by 18-30%.")
            
        # Limit to top 3 reasons/suggestions to keep it clean
        return reasons[:3], suggestions[:2]

ai_engine = AIEngine()
