package com.example.bazuuyu.repository;

import com.example.bazuuyu.entity.NewsletterSubscriber;   // <-- make sure THIS import matches
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NewsletterSubscriberRepository
        extends JpaRepository<NewsletterSubscriber, Long> {

    boolean existsByEmailIgnoreCase(String email);
    Optional<NewsletterSubscriber> findByEmailIgnoreCase(String email);
}