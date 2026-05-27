package com.pooledpay.backend.controller;

import com.pooledpay.backend.model.CashflowRecord;
import com.pooledpay.backend.model.MerchantRiskAssessment;
import com.pooledpay.backend.repository.CashflowRecordRepository;
import com.pooledpay.backend.repository.MerchantRiskAssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private CashflowRecordRepository cashflowRecordRepository;

    @Autowired
    private MerchantRiskAssessmentRepository merchantRiskAssessmentRepository;

    private final String PYTHON_ML_URL = System.getenv("PYTHON_ML_URL") != null ? System.getenv("PYTHON_ML_URL") : "http://localhost:8000/predict-risk";

    @PostConstruct
    public void seedCashflow() {
        if (cashflowRecordRepository.count() == 0) {
            CashflowRecord c1 = new CashflowRecord();
            c1.setRetailerId(1L);
            c1.setAmount(new BigDecimal("48000"));
            c1.setType("INFLOW");
            c1.setDescription("Weekly Pharmacy Sales Receipt");
            c1.setCreatedAt(LocalDateTime.now().minusDays(2));

            CashflowRecord c2 = new CashflowRecord();
            c2.setRetailerId(1L);
            c2.setAmount(new BigDecimal("15000"));
            c2.setType("OUTFLOW");
            c2.setDescription("Previous supplier procurement invoice");
            c2.setCreatedAt(LocalDateTime.now().minusDays(5));

            cashflowRecordRepository.saveAll(List.of(c1, c2));
        }
    }

    // 1. Existing simple cashflow copilot endpoint (Backward Compatibility)
    @GetMapping("/copilot")
    public ResponseEntity<?> getCopilotAssessment(@RequestParam Long userId, @RequestParam(defaultValue = "12000") BigDecimal gstDue) {
        List<CashflowRecord> records = cashflowRecordRepository.findByRetailerIdOrderByCreatedAtDesc(userId);
        
        BigDecimal totalInflows = records.stream()
                .filter(r -> "INFLOW".equalsIgnoreCase(r.getType()))
                .map(CashflowRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOutflows = records.stream()
                .filter(r -> "OUTFLOW".equalsIgnoreCase(r.getType()))
                .map(CashflowRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(gstDue);

        String risk;
        String reason;
        String suggestion;
        String prediction;

        if (totalOutflows.compareTo(totalInflows) > 0) {
            risk = "HIGH";
            reason = "Total upcoming liabilities exceed total recorded sales inflows.";
            suggestion = "CRITICAL Suggestion: Delay non-essential bulk items immediately.";
            prediction = "Potential cash crunch expected within 5-7 days.";
        } else if (totalOutflows.compareTo(totalInflows.multiply(new BigDecimal("0.7"))) > 0) {
            risk = "MEDIUM";
            reason = "GST and procurement outflows consume over 70% of inflows.";
            suggestion = "Suggestion: Join pool orders to save costs.";
            prediction = "Cash flows remain tight but stable for next 10-12 days.";
        } else {
            risk = "LOW";
            reason = "Strong cashflow position.";
            suggestion = "Suggestion: Safe to purchase.";
            prediction = "Cash liquidity is robust. No shortage predicted within the next 30 days.";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("risk", risk);
        result.put("reason", reason);
        result.put("suggestion", suggestion);
        result.put("prediction", prediction);
        result.put("totalInflows", totalInflows);
        result.put("totalOutflows", totalOutflows);
        result.put("gstDue", gstDue);

        return ResponseEntity.ok(result);
    }

    // 2. New ML Integration: Predict Risk
    @PostMapping("/predict-risk")
    public ResponseEntity<?> predictRisk(@RequestBody MerchantRiskAssessment assessmentRequest) {
        RestTemplate restTemplate = new RestTemplate();
        
        try {
            // Build the JSON payload to send to Python FastAPI
            Map<String, Object> pythonPayload = new HashMap<>();
            pythonPayload.put("rev", assessmentRequest.getRev());
            pythonPayload.put("pay_due", assessmentRequest.getPayDue());
            pythonPayload.put("gst", assessmentRequest.getGst());
            pythonPayload.put("sales", assessmentRequest.getSales());
            pythonPayload.put("rep_score", assessmentRequest.getRepScore());
            pythonPayload.put("miss_pay", assessmentRequest.getMissPay());
            pythonPayload.put("cash_bal", assessmentRequest.getCashBal());
            pythonPayload.put("up_orders", assessmentRequest.getUpOrders());
            pythonPayload.put("ord_freq", assessmentRequest.getOrdFreq());
            pythonPayload.put("credit_used", assessmentRequest.getCreditUsed());
            pythonPayload.put("upi_vol", assessmentRequest.getUpiVol());
            pythonPayload.put("ret_rate", assessmentRequest.getRetRate());
            pythonPayload.put("pool_save", assessmentRequest.getPoolSave());
            pythonPayload.put("inv_turn", assessmentRequest.getInvTurn());
            pythonPayload.put("grp_ord", assessmentRequest.getGrpOrd());
            pythonPayload.put("pay_delay", assessmentRequest.getPayDelay());
            pythonPayload.put("season_idx", assessmentRequest.getSeasonIdx());
            pythonPayload.put("supp_rate", assessmentRequest.getSuppRate());
            pythonPayload.put("credit_ratio", assessmentRequest.getCreditRatio());
            pythonPayload.put("cust_growth", assessmentRequest.getCustGrowth());

            // Call Python Microservice
            Map<String, Object> pythonResponse = restTemplate.postForObject(PYTHON_ML_URL, pythonPayload, Map.class);
            
            if (pythonResponse != null) {
                // Populate the assessment request with results
                assessmentRequest.setRiskScore((Integer) pythonResponse.get("risk_score"));
                assessmentRequest.setRiskLevel((String) pythonResponse.get("risk_level"));
                
                // Handle confidence parsing safely
                Object confObj = pythonResponse.get("confidence");
                Double conf = 0.0;
                if (confObj instanceof Number) {
                    conf = ((Number) confObj).doubleValue();
                }
                assessmentRequest.setConfidence(conf);
                
                // Convert lists to strings for DB storage
                List<String> reasonsList = (List<String>) pythonResponse.get("reasons");
                List<String> suggestionsList = (List<String>) pythonResponse.get("suggestions");
                
                assessmentRequest.setReasons(String.join(" | ", reasonsList));
                assessmentRequest.setSuggestions(String.join(" | ", suggestionsList));
                
                // Save to Database
                if (assessmentRequest.getUserId() == null) {
                    assessmentRequest.setUserId(1L); // Default if missing
                }
                MerchantRiskAssessment saved = merchantRiskAssessmentRepository.save(assessmentRequest);
                
                // Return enriched response including ID
                Map<String, Object> fullResponse = new HashMap<>(pythonResponse);
                fullResponse.put("id", saved.getId());
                fullResponse.put("createdAt", saved.getCreatedAt());
                
                return ResponseEntity.ok(fullResponse);
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Empty response from ML service"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to communicate with ML service: " + e.getMessage()));
        }
    }

    // 3. Get Prediction History
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestParam Long userId) {
        List<MerchantRiskAssessment> history = merchantRiskAssessmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(history);
    }

    // 4. Chatbot Endpoint
    @PostMapping("/chat")
    public ResponseEntity<?> chatWithAi(@RequestBody Map<String, Object> payload) {
        String message = (String) payload.get("message");
        Long userId = payload.get("userId") != null ? Long.valueOf(payload.get("userId").toString()) : 1L;

        // Simple mock chat logic that checks the latest assessment
        List<MerchantRiskAssessment> history = merchantRiskAssessmentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        String reply;
        if (message.toLowerCase().contains("risk") || message.toLowerCase().contains("score")) {
            if (!history.isEmpty()) {
                MerchantRiskAssessment latest = history.get(0);
                reply = "Your latest risk score is " + latest.getRiskScore() + " (" + latest.getRiskLevel() + "). " +
                        "Confidence is " + (latest.getConfidence() * 100) + "%. " +
                        "One reason: " + latest.getReasons().split("\\|")[0].trim() + ".";
            } else {
                reply = "You don't have any risk assessments yet. Try running an analysis from the dashboard!";
            }
        } else if (message.toLowerCase().contains("suggestion") || message.toLowerCase().contains("help")) {
            if (!history.isEmpty()) {
                MerchantRiskAssessment latest = history.get(0);
                reply = "Based on my latest analysis, I suggest: " + latest.getSuggestions().split("\\|")[0].trim();
            } else {
                reply = "I recommend running a full Merchant Risk Analysis to get personalized suggestions!";
            }
        } else {
            reply = "I'm your Pooled Pay AI Assistant. I can help analyze your merchant risk, evaluate cash flow, and suggest pooling strategies. Try asking 'What is my risk score?' or run a fresh analysis!";
        }

        return ResponseEntity.ok(Map.of(
            "reply", reply,
            "timestamp", LocalDateTime.now()
        ));
    }

    @PostMapping("/simulate-cashflow")
    public ResponseEntity<?> addSimulatedEvent(@RequestBody CashflowRecord record) {
        record.setCreatedAt(LocalDateTime.now());
        CashflowRecord saved = cashflowRecordRepository.save(record);
        return ResponseEntity.ok(saved);
    }
}
