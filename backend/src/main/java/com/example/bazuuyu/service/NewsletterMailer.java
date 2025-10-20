package com.example.bazuuyu.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NewsletterMailer {
    private static final Logger log = LoggerFactory.getLogger(NewsletterMailer.class);

    private final JavaMailSender mailSender;

    @Value("${app.public-base-url:http://localhost:3000}")
    private String publicBaseUrl;

    public void sendConfirmEmail(String to, String token) {
        String link = publicBaseUrl + "/newsletter/confirm?token=" + token;
        send(to, "Confirm your subscription",
                "Hi,\n\nPlease confirm your Bazuuyu newsletter subscription:\n" + link + "\n\nThanks!");
    }

    public void sendUnsubscribeLink(String to, String token) {
        String link = publicBaseUrl + "/newsletter/unsubscribe?token=" + token;
        send(to, "Unsubscribe link",
                "Hi,\n\nClick to unsubscribe from Bazuuyu newsletter:\n" + link + "\n\nSorry to see you go.");
    }

    private void send(String to, String subject, String body) {
        try {
            var msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception e) {
            log.warn("Email send failed to {} (will still proceed): {}", to, e.toString());
        }
    }
}