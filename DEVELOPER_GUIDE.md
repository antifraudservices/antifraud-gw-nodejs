# Developer Guide

This guide provides practical instructions for setting up and running the project, and for interacting with its API.

## Project Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the root of the project. You can copy `.env.example` if it exists. At a minimum, you will need to define `PORT`.

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The server will start, typically on port 3000.

4.  **Run Tests:**
    ```bash
    npm test
    ```

## Core Architectural Concepts

Before using the API, it is **essential** to read and understand the master architecture document:
- **[Architecture Patterns (`ARCHITECTURE_PATTERNS.md`)](ARCHITECTURE_PATTERNS.md)**

## API Interaction Examples

All write operations are asynchronous. You will receive a `202 Accepted` response with a `thid` (Transaction ID). You must then poll the `_search` endpoint with this `thid` to get the result.

### Onboarding a New Tenant

**(curl examples will be added here once all tests are passing)**

### Onboarding Employees in a Batch

**(curl examples will be added here once all tests are passing)**
---

