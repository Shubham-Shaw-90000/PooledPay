package com.pooledpay.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String subject = "Password Reset Request - Pooled Pay";
        String message = "You have requested to reset your password.\n\n" +
                "Click the link below to change your password:\n" + resetUrl + "\n\n" +
                "This link will expire in 30 minutes.\n\n" +
                "If you did not request this, please ignore this email.";

        if (mailSender != null && !fromEmail.isEmpty()) {
            try {
                SimpleMailMessage email = new SimpleMailMessage();
                email.setFrom(fromEmail);
                email.setTo(to);
                email.setSubject(subject);
                email.setText(message);
                mailSender.send(email);
                logger.info("Sent password reset email to {}", to);
            } catch (Exception e) {
                logger.error("Failed to send email to {}. Error: {}", to, e.getMessage());
                // Fallback to console logging for local dev
                logger.info("Mock Email Output:\nSubject: {}\nTo: {}\nBody:\n{}", subject, to, message);
            }
        } else {
            logger.warn("Mail config missing. Mock Email Output:\nSubject: {}\nTo: {}\nBody:\n{}", subject, to, message);
        }
    }
}
