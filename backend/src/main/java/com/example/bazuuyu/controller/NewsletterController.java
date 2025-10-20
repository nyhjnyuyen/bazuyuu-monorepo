// src/main/java/com/example/bazuuyu/controller/NewsletterController.java
package com.example.bazuuyu.controller;

import com.example.bazuuyu.dto.request.SubscribeRequest;
import com.example.bazuuyu.entity.NewsletterSubscriber;
import com.example.bazuuyu.repository.NewsletterSubscriberRepository;
import com.example.bazuuyu.service.TokenService;
import com.example.bazuuyu.service.NewsletterMailer;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private final NewsletterSubscriberRepository repo;
    private final TokenService tokenService;
    private final NewsletterMailer mailer;

    public NewsletterController(NewsletterSubscriberRepository repo,
                                TokenService tokenService,
                                NewsletterMailer mailer) {
        this.repo = repo;
        this.tokenService = tokenService;
        this.mailer = mailer;
    }

    @PostMapping("/subscribe")
    @Transactional
    public ResponseEntity<?> subscribe(@RequestBody SubscribeRequest req) {
        String email = (req.email() == null ? "" : req.email().trim().toLowerCase());
        if (email.isEmpty() || !email.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email"));
        }

        NewsletterSubscriber sub = repo.findByEmailIgnoreCase(email)
                .orElseGet(() -> new NewsletterSubscriber(email));

        if (sub.isUnsubscribed()) {
            // re-subscribe flow
            sub.setUnsubscribed(false);
            sub.setVerified(false);
        }

        if (sub.isVerified()) {
            repo.save(sub);
            return ResponseEntity.ok(Map.of("message", "Already subscribed"));
        }

        // new or not yet verified → generate token and email
        String token = tokenService.newTokenHex(32); // 32 bytes → 64 hex
        sub.setToken(token);
        sub.setVerified(false);
        repo.save(sub);
        mailer.sendConfirmEmail(sub.getEmail(), token);

        return ResponseEntity.ok(Map.of("message", "Check your inbox to confirm!"));
    }

    @GetMapping("/confirm")
    @Transactional
    public ResponseEntity<?> confirm(@RequestParam("token") String token) {
        var opt = repo.findAll().stream()
                .filter(s -> token.equals(s.getToken()))
                .findFirst();
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or used token"));
        }
        var sub = opt.get();
        sub.setVerified(true);
        sub.setToken(null); // single-use
        repo.save(sub);
        return ResponseEntity.ok(Map.of("message", "Subscription confirmed"));
    }

    @PostMapping("/unsubscribe")
    @Transactional
    public ResponseEntity<?> unsubscribe(@RequestParam(value = "token", required = false) String token,
                                         @RequestBody(required = false) Map<String,String> body) {
        if (token != null && !token.isBlank()) {
            var sub = repo.findAll().stream()
                    .filter(s -> token.equals(s.getToken()))
                    .findFirst()
                    .orElse(null);
            if (sub == null) return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
            sub.setUnsubscribed(true);
            sub.setVerified(false);
            sub.setToken(null);
            repo.save(sub);
            return ResponseEntity.ok(Map.of("message", "You are unsubscribed"));
        }

        String email = body == null ? null : body.get("email");
        if (email == null) return ResponseEntity.badRequest().body(Map.of("error", "Provide token or email"));
        var sub = repo.findByEmailIgnoreCase(email).orElse(null);
        if (sub == null) return ResponseEntity.ok(Map.of("message", "Already unsubscribed"));
        String t = tokenService.newTokenHex(32);
        sub.setToken(t);
        repo.save(sub);
        mailer.sendUnsubscribeLink(sub.getEmail(), t);
        return ResponseEntity.ok(Map.of("message", "Unsubscribe link sent"));
    }
}
