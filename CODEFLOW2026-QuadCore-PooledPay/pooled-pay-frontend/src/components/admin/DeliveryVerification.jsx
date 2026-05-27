import React, { useState } from "react";

const DeliveryVerification = () => {

    const [orderId, setOrderId] = useState("");
    const [code, setCode] = useState("");

    const verifyDelivery = async () => {
        try {
            const res = await fetch(
                `http://localhost:8082/api/admin/verify-delivery/${orderId}?code=${encodeURIComponent(code)}`,
                { method: "PUT" }
            );
            if (res.ok) {
                alert("Delivery verified successfully!");
            } else {
                alert("Invalid code. Please try again.");
            }
        } catch (err) {
            alert("Network error — is the backend running on port 8082?");
        }
    };

    return (
        <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto", color: "#f8fafc" }}>
            <h2 style={{ marginBottom: "20px" }}>Verify Delivery</h2>
            <input
                type="text"
                placeholder="Order ID"
                style={{ display: "block", width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#f8fafc", fontSize: "1rem" }}
                onChange={(e) => setOrderId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Delivery Code (e.g. PP-4821)"
                style={{ display: "block", width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#f8fafc", fontSize: "1rem" }}
                onChange={(e) => setCode(e.target.value)}
            />
            <button
                onClick={verifyDelivery}
                style={{ padding: "11px 24px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#10b981,#34d399)", color: "#000", fontWeight: "700", fontSize: "0.95rem", cursor: "pointer" }}
            >
                ✅ Verify Delivery
            </button>
        </div>
    );
};

export default DeliveryVerification;
