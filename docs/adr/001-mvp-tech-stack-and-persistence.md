# ADR-001: MVP Tech Stack & Persistence Strategy

## Status

Accepted

## Context

The goal is to build an MVP Online Judge quickly using familiar tools. The primary objective is to demonstrate MERN stack proficiency while keeping the system flexible for future changes.

## Decision

* Use Node.js (MERN stack) for backend
* Use a NoSQL document database (MongoDB-style)
* Design schema in a way that can later be translated to relational tables if needed

## Consequences

### Positive

* Faster development due to familiarity
* Flexible schema → easy iteration
* Easy to pivot to SQL later if required

### Negative

* No strict schema enforcement
* Future migration to SQL will require effort
