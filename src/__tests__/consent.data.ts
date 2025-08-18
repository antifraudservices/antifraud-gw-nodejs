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


export const testConsentRegisterOrganizationSchemaJsonLD = {
  "@context": "https://schema.org",
  "@type": "AuthorizeAction",
  "agent": {
    "@type": "Person", // the representative
    "givenName": "Given Name(s)", // local given name(s) and middle name (s) with special characters
    "familyName": "Surname1", // first surname in the local language (including special characters).
    "additionalName": "Surname2", // second surname in Spanish spoken countries or mother's maiden name in the US and other countries
    "email": "user1@example.com",
    "mobile": "+10000000000",
    "role": "<ROLE_CODE>", // ISCO08 employee role    
    "name": "GIVEN NAMES SURNAME1 SURNAME2" // full name ICAO 9303 trasliteration
  },
  "provider": { // hosting service for the request
    "@type": "Organization",
    "url": "https://hosting.soschain.org/"
  },  
  "recipient": { // tenant organization requesting registration
    "@type": "Organization",
    "url": "example.com", // web domain
    "legalName": "ORGANIZATION LEGAL NAME",
    "identifier": "" // no previously registered on the federated network
  },
  "instrument": "https://example.org/consent/form.pdf",
  "purpose": "https://terminology.hl7.org/CodeSystem/v3-ActReason|SRVC" // rovision of a service to an individual or organization
}