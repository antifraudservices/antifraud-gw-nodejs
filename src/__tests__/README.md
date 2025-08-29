# API and Testing Strategy Overview

This document outlines the complete architecture and testing strategy for the API, focusing on its asynchronous FAPI-compliant nature, data models, and multi-tenant design.

## 1. Overall Architecture & FAPI Flow

The API is designed as a **non-blocking, asynchronous service** following the FAPI (Financial-grade API) pattern.

The flow is as follows:
1.  **Initial Request**: A client sends an `HTTP POST` to a specific action endpoint (e.g., `.../Practitioner/_batch`). The body contains a secure DIDComm envelope.
2.  **Immediate `202 Accepted`**: The server validates the request, queues the job, and immediately responds with `HTTP 202 Accepted` and a `thid` (thread ID).
3.  **Polling for Response**: The client then makes one or more `HTTP POST` requests to the **`_search`** action endpoint for that resource (e.g., `.../Practitioner/_search`). The body of this polling request contains the `thid`.
4.  **Final `200 OK`**: Once the job is complete, the `_search` endpoint responds with `HTTP 200 OK` and the final result.

## 2. API Path Structure

The API uses a structured, versioned, and multi-tenant path that explicitly declares the data format being used:
`/<tenant_id>/<cds>-<jurisdiction>/<version>/<sector>/<section>/<format>/<resourceType>/<_action>`

- **`tenant_id`**: The `alternateName` of the tenant (e.g., `org1`).
- **`cds-jurisdiction`**: Common Data Service and jurisdiction (e.g., `cds-es`).
- **`version`**: API version (e.g., `v1`).
- **`sector`**: Industry sector (e.g., `healthcare`).
- **`section`**: Data domain within the sector (e.g., `entity`, `clinical`).
- **`format`**: The data specification context (e.g., `org.schema.person`, `org.hl7.fhir.r4`).
- **`resourceType`**: The type of resource being handled (e.g., `Practitioner`, `Group`).
- **`_action`**: The operation (`_batch`, `_search`).

## 3. The DIDComm Envelope

All data is exchanged inside a secure DIDComm envelope, which is a signed JWT. This ensures the authenticity and integrity of every message.

- **Header (`alg`, `kid`, `typ`):** Specifies the signing algorithm and the key ID of the sender.
- **Payload (`iss`, `aud`, `thid`, `body`):**
    - `iss`: The issuer (who sent the message).
    - `aud`: The audience (the intended recipient, i.e., this API).
    - `thid`: The unique ID for the request-response thread.
    - `body`: The core payload of the message. For our API, this is a lean, command-style FHIR `Bundle`.

## 4. Tenant & Admin Onboarding

The system bootstraps itself from the environment configuration. A user does not register the first tenant.

1.  **System Startup**: On startup, the service checks for the presence of `DEMO_ORG1_*` variables in the environment (`.env` file).
2.  **Automatic Bootstrapping**: If these variables exist, the service automatically calls the `TenantManager` to register the initial tenant (`ORG1`) and the `EmployeeManager` to create its designated administrator employee.
3.  **Further Tenants**: Subsequent tenants would be registered by an authorized administrator from an existing, trusted tenant.

## 5. Employee & Group Management (`_batch` Endpoint)

All entity management is done via a `_batch` endpoint.
- **Offline-First:** This approach is designed for offline-first applications. A client app can batch any number of create/update/delete operations into a single `Bundle` and send it when a connection is available.
- **Lean, Command-Style Bundle:** The `Bundle` sent by our applications is lean. Each `entry` contains:
    - `fullUrl`: The URN of the entity.
    - `meta.claims`: A self-contained object with `@context`, `@type`, and the actual data claims. The server is responsible for normalizing these claims for storage.
    - `request`: The method, e.g., `{ "method": "PUT" }`.

## 6. Client-Centric Data Model

The architecture makes a critical distinction between organizational and personal data.
- **Tenant Vaults:** A tenant (e.g., `ORG1`) has its own vault containing its operational data: employees, professional groups, roles, etc.
- **Client Vaults:** A client (a person) has their own **independent vault**. Their ID is their vault ID. This vault is created for them by a custodian tenant (`ORG1`).
- **Connection Channels (`List`):** To connect a client with professional groups, a `List` resource is created *inside the client's vault*. This list contains references to `Group` resources, which may exist in the client's own vault (e.g., "Family Group") or in a tenant's vault (e.g., on office with distinct professionals). This maintains the client's sovereignty over their own data connections.
