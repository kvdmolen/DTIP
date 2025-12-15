# Specifications

This document provides technical specifications for the credential schemas and message formats used in DTIP. These specifications build on existing standards rather than defining new ones.

**Referenced Standards:**

- [W3C Verifiable Credentials Data Model](https://www.w3.org/TR/vc-data-model/)
- [DIDComm Messaging v2](https://identity.foundation/didcomm-messaging/spec/)
- [DIIP - Decentralized Identity Interoperability Profile](https://fidescommunity.github.io/DIIP/)
- [DCAT - Data Catalog Vocabulary](https://www.w3.org/TR/vocab-dcat-3/)
- [ODRL - Open Digital Rights Language](https://www.w3.org/TR/odrl-model/)

---

## 1. Credential Issuance and Presentation

DTIP adopts the [DIIP profile](https://fidescommunity.github.io/DIIP/) for credential issuance and presentation. This ensures interoperability with existing wallet and issuer implementations.

### 1.1 DIIP Requirements

| Aspect | Specification |
|--------|---------------|
| **Credential Format** | SD-JWT VC or W3C VC Data Model secured with SD-JWT |
| **Signature Algorithm** | ES256 (Secp256r1) |
| **DID Methods** | `did:web`, `did:jwk` |
| **Issuance Protocol** | OID4VCI (OpenID for Verifiable Credential Issuance) |
| **Presentation Protocol** | OID4VP (OpenID for Verifiable Presentations) |
| **Revocation** | IETF Token Status List |

### 1.2 Credential Exchange Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Issuer  │         │  Holder  │         │ Verifier │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │◄───OID4VCI────────►│                    │
     │  (credential       │                    │
     │   issuance)        │                    │
     │                    │                    │
     │                    │◄───OID4VP─────────►│
     │                    │  (presentation     │
     │                    │   & verification)  │
```

Implementations should follow DIIP for the mechanics of issuing and verifying credentials. This specification focuses on the **credential content** (what claims to include) rather than the exchange protocol.

---

## 2. Access Credential

The Access Credential grants specific access rights to a resource. The same schema supports both direct access grants and delegated access through an optional parent reference.

### 2.1 Schema

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://dtip.org/credentials/v1"
  ],
  "type": ["VerifiableCredential", "AccessCredential"],
  "id": "urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5",
  "issuer": "did:web:data-owner.example",
  "issuanceDate": "2025-01-15T09:00:00Z",
  "expirationDate": "2025-07-15T09:00:00Z",
  "credentialSubject": {
    "id": "did:web:data-consumer.example",
    "resource": "https://data-owner.example/api/shipments/*",
    "actions": ["read"],
    "delegatable": false
  },
  "credentialStatus": {
    "type": "TokenStatusList",
    "statusListCredential": "https://data-owner.example/status/1",
    "statusListIndex": "4"
  },
  "proof": { "...": "..." }
}
```

### 2.2 SD-JWT VC Format

When using SD-JWT VC (per DIIP), the same credential in compact form:

```
eyJhbGciOiJFUzI1NiIsInR5cCI6InZjK3NkLWp3dCJ9.eyJpc3MiOiJkaWQ6d2ViO
mRhdGEtb3duZXIuZXhhbXBsZSIsInN1YiI6ImRpZDp3ZWI6ZGF0YS1jb25zdW1lci5
leGFtcGxlIiwidmN0IjoiQWNjZXNzQ3JlZGVudGlhbCIsInJlc291cmNlIjoiaHR0c
HM6Ly9kYXRhLW93bmVyLmV4YW1wbGUvYXBpL3NoaXBtZW50cy8qIiwiYWN0aW9ucyI
6WyJyZWFkIl0sImRlbGVnYXRhYmxlIjpmYWxzZSwiZXhwIjoxNzUyNTc2MDAwfQ.sig
```

### 2.3 Required Fields

| Field | Description |
|-------|-------------|
| `issuer` | DID of the party granting access |
| `credentialSubject.id` | DID of the party receiving access |
| `credentialSubject.resource` | Resource URI or pattern |
| `credentialSubject.actions` | Array of permitted actions |
| `expirationDate` | When the credential expires |

### 2.4 Actions

| Action | Description |
|--------|-------------|
| `read` | Read access to the resource |
| `write` | Full write access |
| `write:<field>` | Write access to specific field |
| `delete` | Delete the resource |
| `subscribe` | Subscribe to notifications |
| `delegate` | Delegate access to others |

### 2.5 Optional Fields

| Field | Description |
|-------|-------------|
| `credentialSubject.delegatable` | Whether further delegation is allowed (default: `false`) |
| `credentialSubject.policy` | ODRL policy reference (see Section 3) |

### 2.6 Resource-Specific Access Credentials

When an Access Credential grants access to a specific data type (e.g., an eCMR), both the holder and verifier need to know what kind of data it provides access to. This is achieved by adding a domain-specific type to the `type` array:

```json
{
  "type": ["VerifiableCredential", "AccessCredential", "eCMRAccessCredential"],
  "credentialSubject": {
    "id": "did:web:driver.example",
    "resource": "https://carrier.example/api/ecmr/12345",
    "actions": ["read"]
  }
}
```

This pattern:
- Allows wallets to organize and filter credentials by data type
- Enables verifiers to request specific credential types via OID4VP
- Follows standard W3C VC conventions for type extensibility

**OID4VP Request Example:**

When customs requests an eCMR access credential from a driver's wallet:

```json
{
  "presentation_definition": {
    "id": "ecmr-access-request",
    "input_descriptors": [{
      "id": "ecmr-credential",
      "constraints": {
        "fields": [{
          "path": ["$.type"],
          "filter": { "contains": { "const": "eCMRAccessCredential" } }
        }]
      }
    }]
  }
}
```

The wallet finds matching credentials and presents them. The verifier confirms the credential grants access to the requested resource.

---

## 3. Delegated Access

Delegation uses the same Access Credential schema with an additional `parentCredential` field containing the original credential.

### 3.1 Schema

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://dtip.org/credentials/v1"
  ],
  "type": ["VerifiableCredential", "AccessCredential"],
  "id": "urn:uuid:7c9e82a1-4b5d-4e8f-9a2c-1d3e5f7a9b0c",
  "issuer": "did:web:data-consumer.example",
  "issuanceDate": "2025-01-16T10:00:00Z",
  "expirationDate": "2025-01-18T10:00:00Z",
  "credentialSubject": {
    "id": "did:web:subcontractor.example",
    "resource": "https://data-owner.example/api/shipments/12345",
    "actions": ["read"],
    "delegatable": false,
    "parentCredential": "eyJhbGciOiJFUzI1NiIs..."
  },
  "proof": { "...": "..." }
}
```

The `parentCredential` field contains the parent Access Credential in SD-JWT compact form. This embeds the full chain in a single credential.

### 3.2 Delegation Rules

1. **Issuer Match**: The `issuer` must match the `credentialSubject.id` of the parent
2. **Subset Only**: `resource` and `actions` cannot exceed the parent's scope
3. **Expiration**: Cannot exceed the parent's `expirationDate`
4. **Permission**: Parent must have `delegatable: true` or include `delegate` action
5. **Chain Depth**: Each level embeds its parent, creating a verifiable chain

### 3.3 Verification

1. Parse and verify the outer credential signature
2. Extract and verify the `parentCredential` (recursively for chains)
3. Confirm issuer of each level matches subject of its parent
4. Verify scope reduction at each delegation level
5. Check expiration and revocation status of all credentials
6. Confirm the chain terminates at a credential issued by the Data Owner

---

## 4. Usage Policies (ODRL)

For expressing usage constraints, DTIP references [ODRL](https://www.w3.org/TR/odrl-model/) rather than defining a custom format.

### 4.1 Policy Reference

Access Credentials can reference an ODRL policy:

```json
{
  "credentialSubject": {
    "id": "did:web:consumer.example",
    "resource": "https://owner.example/api/data",
    "actions": ["read"],
    "policy": "https://owner.example/policies/standard-use.jsonld"
  }
}
```

### 4.2 Embedded Policy

Or embed a policy directly:

```json
{
  "credentialSubject": {
    "id": "did:web:consumer.example",
    "resource": "https://owner.example/api/data",
    "actions": ["read"],
    "policy": {
      "@context": "http://www.w3.org/ns/odrl.jsonld",
      "@type": "Agreement",
      "permission": [{
        "action": "use",
        "constraint": [{
          "leftOperand": "purpose",
          "operator": "eq",
          "rightOperand": "logistics-optimization"
        }]
      }],
      "prohibition": [{
        "action": "distribute"
      }]
    }
  }
}
```

### 4.3 Policy Enforcement

Policies in DTIP are **documentation**, not technical enforcement. They create an audit trail of agreed terms. Actual enforcement depends on:

- Contractual agreements between parties
- Legal frameworks (GDPR, sector regulations)
- Trust relationships

Organizations requiring automated policy enforcement can layer protocols like DSP Contract Negotiation on top of DTIP.

---

## 5. Data Offerings (DCAT)

For describing data offerings, DTIP adopts [DCAT](https://www.w3.org/TR/vocab-dcat-3/) (Data Catalog Vocabulary), the W3C standard for data catalogs.

### 5.1 Offering in DID Document

Reference a DCAT catalog from the DID Document service section:

```json
{
  "service": [{
    "id": "did:web:provider.example#catalog",
    "type": "DataCatalog",
    "serviceEndpoint": "https://provider.example/catalog.jsonld"
  }]
}
```

### 5.2 DCAT Catalog

The catalog endpoint serves a standard DCAT document:

```json
{
  "@context": {
    "dcat": "http://www.w3.org/ns/dcat#",
    "dct": "http://purl.org/dc/terms/",
    "dtip": "https://dtip.org/ns#"
  },
  "@type": "dcat:Catalog",
  "dct:title": "Acme Logistics Data Offerings",
  "dct:publisher": {
    "@id": "did:web:acme-logistics.example"
  },
  "dcat:dataset": [
    {
      "@type": "dcat:Dataset",
      "@id": "did:web:acme-logistics.example#shipment-tracking",
      "dct:title": "Shipment Tracking API",
      "dct:description": "Real-time shipment status and location data",
      "dcat:keyword": ["logistics", "tracking", "supply-chain"],
      "dcat:distribution": [{
        "@type": "dcat:Distribution",
        "dcat:accessURL": "https://acme-logistics.example/api/shipments",
        "dcat:mediaType": "application/json",
        "dct:format": "REST API"
      }],
      "dtip:accessRequirements": {
        "dtip:authentication": "did",
        "dtip:minimumTrust": "public-credentials"
      },
      "dtip:subscription": {
        "dtip:supported": true,
        "dtip:events": ["created", "updated", "deleted"]
      }
    }
  ]
}
```

### 5.3 DTIP Extensions to DCAT

DTIP defines minimal extensions for access requirements:

| Property | Description |
|----------|-------------|
| `dtip:accessRequirements` | What is needed to access the dataset |
| `dtip:authentication` | `none`, `did`, `access-credential` |
| `dtip:minimumTrust` | `whitelist`, `public-credentials`, `trust-chain` |
| `dtip:credentialTypes` | Required credential types for trust verification |
| `dtip:subscription` | Event subscription capabilities |

### 5.4 Discovery

Discovery Hubs crawl DID Documents, fetch referenced DCAT catalogs, and index them. Standard DCAT tooling can be used for catalog management and search.

---

## 6. DIDComm Messages

DTIP uses DIDComm v2 for secure peer-to-peer messaging.

### 6.1 Subscription Protocol

Protocol URI: `https://dtip.org/protocols/subscription/1.0`

#### Subscribe Request

```json
{
  "type": "https://dtip.org/protocols/subscription/1.0/subscribe",
  "id": "msg-001",
  "from": "did:web:consumer.example",
  "to": ["did:web:owner.example"],
  "created_time": 1705750800,
  "body": {
    "resource": "https://owner.example/api/shipments/12345",
    "events": ["updated", "deleted"],
    "credential": "eyJhbGciOiJFUzI1NiIs...",
    "expires": "2025-01-25T09:00:00Z"
  }
}
```

| Field | Description |
|-------|-------------|
| `resource` | Resource URI or pattern to monitor |
| `events` | Event types: `created`, `updated`, `deleted` |
| `credential` | Access Credential (SD-JWT) proving authorization |
| `expires` | Requested subscription expiration |

#### Subscribe Acknowledgment

```json
{
  "type": "https://dtip.org/protocols/subscription/1.0/ack",
  "id": "msg-002",
  "from": "did:web:owner.example",
  "to": ["did:web:consumer.example"],
  "thid": "msg-001",
  "body": {
    "subscriptionId": "sub-789xyz",
    "expires": "2025-01-25T09:00:00Z"
  }
}
```

#### Unsubscribe

```json
{
  "type": "https://dtip.org/protocols/subscription/1.0/unsubscribe",
  "id": "msg-003",
  "from": "did:web:consumer.example",
  "to": ["did:web:owner.example"],
  "body": {
    "subscriptionId": "sub-789xyz"
  }
}
```

### 6.2 Notification Protocol

Protocol URI: `https://dtip.org/protocols/notification/1.0`

#### Resource Event

```json
{
  "type": "https://dtip.org/protocols/notification/1.0/resource-event",
  "id": "msg-100",
  "from": "did:web:owner.example",
  "to": ["did:web:consumer.example"],
  "created_time": 1705800000,
  "body": {
    "subscriptionId": "sub-789xyz",
    "event": "updated",
    "resource": "https://owner.example/api/shipments/12345",
    "timestamp": "2025-01-20T15:00:00Z",
    "summary": {
      "changedFields": ["status", "eta"]
    }
  }
}
```

The `summary` field is optional and implementation-defined. Consumers requiring full data should fetch from the API.

### 6.3 Error Codes

| Code | Description |
|------|-------------|
| `e.dtip.unauthorized` | Missing or invalid credentials |
| `e.dtip.resource-not-found` | Resource does not exist |
| `e.dtip.credential.expired` | Credential has expired |
| `e.dtip.credential.revoked` | Credential has been revoked |
| `e.dtip.delegation.invalid` | Delegation chain verification failed |

---

## 7. Summary of Standards Adoption

| Aspect | Standard | Notes |
|--------|----------|-------|
| Credential Format | SD-JWT VC (per DIIP) | Compact, selective disclosure |
| Issuance/Presentation | OID4VCI, OID4VP (per DIIP) | Standard wallet protocols |
| DID Methods | did:web, did:jwk (per DIIP) | Web-based and key-based |
| Revocation | IETF Token Status List | Efficient status checks |
| Data Catalog | DCAT | W3C standard for data catalogs |
| Usage Policies | ODRL | W3C standard for rights expression |
| Messaging | DIDComm v2 | Secure peer-to-peer messaging |

---

## 8. Implementation Notes

### What DTIP Specifies

- Access Credential schema and delegation mechanism
- DTIP-specific extensions to DCAT for access requirements
- DIDComm message types for subscriptions and notifications

### What DTIP References

- DIIP for credential issuance and presentation mechanics
- DCAT for data catalog structure
- ODRL for usage policy expression

### What Implementations Decide

- Key management and storage
- Authorization server integration
- Domain-specific credential types
- Notification delivery guarantees

---

*Feedback on these specifications is welcome.*
