# Testing Strategy

This document outlines the testing strategy for the Gateway's primary endpoints.

## 1. Test Suite: Asynchronous FAPI Flow (`tenant.test.ts`)

This is the most critical integration test. It validates the entire secure, asynchronous communication protocol from end to end.

### 1.1. `describe('Asynchronous FAPI Flow (/tenant/cds-...)', ...)`

#### `it('should accept a new job, return 202, and then return the final result upon polling')`

-   **Purpose:** To simulate the complete "happy path" of a client submitting a secure, asynchronous job and successfully retrieving the result.
-   **Setup:**
    -   Mock the `decodeRequest` middleware to simulate a successful JWE/JWS decryption.
    -   Ensure the mock in-memory queue and response store are running.
-   **Steps:**
    1.  **Initial Request (Job Submission):**
        -   `POST` to a valid, complex CDS URL (e.g., `/test-tenant/.../Consent/_update`).
        -   Set `Content-Type` to `application/x-w...`.
        -   Send a body containing a `request=` parameter and a test `thid`.
        -   **Assert:** The HTTP status is `202 Accepted`.
    2.  **Polling Request (Result Retrieval):**
        -   Wait a short period (> 100ms) for the mock worker to complete the job.
        -   `POST` to the **same** CDS URL.
        -   Set `Content-Type` and `Accept` headers to `application/x-w...`.
        -   Send a body containing the `thid=` parameter from the first request.
        -   **Assert:** The HTTP status is `200 OK`.
    3.  **Response Validation:**
        -   **Assert:** The response `Content-Type` is `application/x-w...`.
        -   **Assert:** The response body is a string that starts with `response=`.
        -   **Assert:** The content of the `response=` parameter is the expected JSON `Bundle`.

---

## 2. Test Suite: Well-Known Endpoints (`well-known.test.ts`)

This suite validates the public key and DID discovery endpoints, which are essential for clients to interact with the system.

### 2.1. `describe('/.well-known Endpoints', ...)`

#### `it('should return a valid JWKS for a known tenant')`

-   **Purpose:** To ensure that the JWKS endpoint correctly serves the public keys for a given tenant.
-   **Setup:**
    -   Mock the `DatabaseAdapter`.
    -   The mock should return a predefined array of public key objects when queried for a specific tenant's 'keys' section.
-   **Steps:**
    1.  `GET` `/test-tenant/.well-known/jwks.json`.
    2.  **Assert:** The HTTP status is `200 OK`.
    3.  **Assert:** The `Content-Type` is `application/json`.
    4.  **Assert:** The response body is a valid JSON object.
    5.  **Assert:** The JSON object contains a `keys` array.
    6.  **Assert:** The keys in the array match the ones provided by the mock database adapter and do **not** contain any private key material.

#### `it('should return a valid DID Document for a known tenant')`

-   **Purpose:** To ensure the DID Document is correctly constructed.
-   **Steps:**
    1.  `GET` `/test-tenant/.well-known/did.json`.
    2.  **Assert:** The HTTP status is `200 OK`.
    3.  **Assert:** The `Content-Type` is `application/json`.
    4.  **Assert:** The `id` field in the DID document correctly matches the format `did:web:hostname:tenantId`.
    5.  **Assert:** The `verificationMethod` and `keyAgreement` sections are present and contain the keys from the JWKS.

#### `it('should return a 404 for an unknown tenant')`

-   **Purpose:** To ensure the system correctly handles requests for tenants that do not exist.
-   **Setup:**
    -   The mock database adapter should be configured to return an empty array or `null` when queried for the unknown tenant.
-   **Steps:**
    1.  `GET` `/unknown-tenant/.well-known/jwks.json`.
    2.  **Assert:** The HTTP status is `404 Not Found`.
