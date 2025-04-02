// src/__tests__/consent.data.ts

import { testUserEmail, testUserFullNameICAO } from "./common.data";

export const testConsentSchemaJsonLD = {
    "@context": "https://schema.org",
    "@type": "AuthorizeAction",
    "agent": {
      "@type": "Person",
      "email": testUserEmail,
      "name": testUserFullNameICAO
    },
    "recipient": {
      "@type": "Organization",
      "url": "https://somesector.example.com/notifications/"
    },
    "instrument": "https://example.org/consent/form.pdf",
    "purpose": "https://terminology.hl7.org/CodeSystem/v3-ActReason|METAMGT"
}