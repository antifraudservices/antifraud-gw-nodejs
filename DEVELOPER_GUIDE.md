# Developer's Guide: Integrating with the Secure Gateway API

This guide explains how to interact with the Gateway API, which is designed with a security-first, asynchronous, and multi-tenant architecture, following FAPI, JARM, and DIDComm patterns.

### 1. Design Philosophy (inspired on Financial API, FHIR API and Consumer Data Standards)

*   **Security First:** All sensitive communication is protected within a cryptographic envelope (JWE containing a JWS). No business payload is ever exposed directly.
*   **Asynchronous by Default:** Operations that require significant processing (e.g., blockchain verification) do not block the connection. A job is submitted, and the client polls for the result.
*   **Multi-Tenant:** The API is built to serve multiple organizations (`tenants`) in a securely isolated manner.
*   **Format Agnostic:** The core of the API is bilingual, capable of producing `FHIR Bundle` or `JSON:API Document` responses to support different data standards.

### 2. The API Path Structure

All API requests follow a standardized, hierarchical URL structure. This allows the Gateway to understand the request's context before processing the secure payload.

**URL Format:**
`POST /:tenantId/cds-:jurisdiction/v1/:sectorType/:section/:format/:resourceType/:action`

| Parameter | Description | Example |
| :--- | :--- | :--- |
| `:tenantId` | The unique identifier for the target organization. | `organization-1` |
| `:jurisdiction` | The two-letter territory or jurisdiction code. | `xx` |
| `:sectorType` | The business sector (e.g., `healthcare`, `emergency`). | `some-sector` |
| `:section` | A sub-section or compartment within the sector. | `index` |
| `:format` | The primary data standard being used. | `some-standard` |
| `:resourceType`| The type of resource being acted upon. | `Resource` |
| `:action` | The operation to be performed, **always prefixed with `_`**. | `_action` |

**Example URL:**
`POST /organization-1/cds-xx/v1/some-sector/index/some-standard/Resource/_action`

---

### 3. The Asynchronous Flow: Request & Poll

The interaction is a two-step process: submitting a job and then polling for its result.

#### Step 1: Initiate the Job (Secure Request)

To start a new job, you must construct a JWE and send it as a form parameter.

*   **Endpoint:** `POST /{your-full-cds-path}`
*   **Header:** `Content-Type: application/x-www-form-urlencoded`
*   **Body:** `request=<your-JWE-string>`

**The JWS Payload (Inside the JWE)**

The JWE decrypts to a JWS, whose payload is a JSON object. This object contains the essential metadata and the actual business data.

| Key | Description | Example |
| :--- | :--- | :--- |
| `iss` | **Issuer.** Your unique client identifier. | `"urn:client:software-id"` |
| `aud` | **Audience.** The **full URL of the tenant's base endpoint** on the Gateway. This is a critical security field. | `"https://gateway-api.example.com/organization-1"` |
| `thid`| **Thread ID.** A **unique UUID v4** you generate for this specific request. | `"a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"` |
| `type`| The `Content-Type` of the `body` property. | `"fhir+json"` or `"application/x-www-form-urlencoded"` |
| `body`| The business payload. | *(See examples below)* |

**Security Note on Audience (`aud`):** The Gateway will strictly validate that the `aud` claim in your JWS payload **exactly matches** the base URL of the tenant endpoint you are sending the request to. Any mismatch will result in an immediate rejection of the request.

**Example A: JSON `body` for `_update`**
Use this when sending a complex object.

```json
{
  "aud": "https://gateway-api.example.com/organization-1",
  "thid": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "type": "fhir+json",
  "body": {
    "resourceType": "Consent",
    "status": "active",
    "...": "..."
  }
}
```

**Example B: URL-Encoded `body` for `_search`**
Use this to securely send search parameters. The `body` is a **single string**.

```json
{
  "aud": "https://gateway-api.example.com/organization-1",
  "thid": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
  "type": "application/x-www-form-urlencoded",
  "body": "status=active&identifier=urn:uuid:1234"
}
```

**Immediate Response:**
If the request is well-formed, the Gateway **always** responds immediately with:
`HTTP 202 Accepted`

This confirms the job was accepted into the processing queue. It does not mean the job is complete.

#### Step 2: Poll for the Result

To get the job's result, periodically send a POST request to the **exact same endpoint**, using the `thid` from your initial request.

*   **Endpoint:** `POST /{the-same-full-cds-path}`
*   **Header:** `Content-Type: application/x-www-form-urlencoded`
*   **Body:** `thid=a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d`

**Possible Polling Responses:**
*   `HTTP 202 Accepted`: The job is still in progress. Wait and try again.
*   `HTTP 200 OK`: The job is complete. The body contains the secure response.
*   `HTTP 404 Not Found`: The `thid` is invalid or has expired.

---

### 4. The Secure Response (JARM)

When you receive a `HTTP 200 OK`, the result is protected in a **JARM (JWT Secured Authorization Response Mode)** format. The format depends on the `Accept` header you send in your **polling request**.

| `Accept` Header Sent | Response `Content-Type` | Response Body Format |
| :--- | :--- | :--- |
| (Omitted or `*/*`) | `application/x-www-form-urlencoded` | `response=<JWT-containing-the-result>` |
| `application/x-www-form-urlencoded` | `application/x-www-form-urlencoded` | `response=<JWT-containing-the-result>` |
| `application/jwt` | `application/jwt` | `<JWT-containing-the-result>` (as raw text) |

**Recommendation (Default Behavior):** Use the `response=<JWT>` format. It is the most robust and secure pattern for this flow. The final JWT is a JWE/JWS whose decrypted payload will contain a FHIR `Bundle` or a `JSON:API` Document, which provides the results, even for errors.
