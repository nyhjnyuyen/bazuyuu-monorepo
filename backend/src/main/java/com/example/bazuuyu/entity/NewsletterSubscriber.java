package com.example.bazuuyu.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
        name = "newsletter_subscribers",
        uniqueConstraints = @UniqueConstraint(name = "uk_newsletter_email", columnNames = "email")
)
public class NewsletterSubscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private boolean verified = false;

    @Column(length = 64)
    private String token;

    @Column(nullable = false)
    private boolean unsubscribed = false;

    public NewsletterSubscriber() {}
    public NewsletterSubscriber(String email) { this.email = email; }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public boolean isUnsubscribed() { return unsubscribed; }
    public void setUnsubscribed(boolean unsubscribed) { this.unsubscribed = unsubscribed; }
}
