# Gateway Template - Node.js & TypeScript

This repository provides a robust, asynchronous, and policy-driven API gateway template. It is designed for building secure, multi-tenant systems that handle complex data interactions, and integration with technologies like Financial API (FAPI), DIDComm and blockchain.

## Project Documentation

This project's documentation is split into several key files. Start here to understand the architecture, development patterns, and testing strategies.

1.  **[Architecture Patterns (`ARCHITECTURE_PATTERNS.md`)](ARCHITECTURE_PATTERNS.md)**
    This is the **most important document**. It is the single source of truth for the core architectural decisions, data flows, and API structure. It serves as a formal specification and a "prompt" for any AI-assisted development to ensure consistency. **Read this first.**

2.  **[Developer Guide (`DEVELOPER_GUIDE.md`)](DEVELOPER_GUIDE.md)**
    This guide provides practical instructions for developers, including setup, running the server, and examples of how to interact with the API using `curl`.

3.  **[Testing Strategy (`src/__tests__/README.md`)](src/__tests__/README.md)**
    This document explains the testing philosophy, the structure of the integration tests, and how to add new test cases.

## Quick Start

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Run tests:
    ```bash
    npm test
    ```
