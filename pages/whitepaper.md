# Decentralized Trust Interop Profile (DTIP)

**Version 0.7: Draft**

---

## Executive Summary

The **Decentralized Trust Interop Profile (DTIP)** is a lightweight technical profile that acts as a base layer for trust in digital data exchange. Unlike existing dataspace initiatives, DTIP ensures that every party retains full autonomy over its own trust decisions. This means there are no participants, nor is there centralized onboarding. It specifies a cohesive set of open standards that ensure interoperability across identity, trust, access, delegation, and peer-to-peer communication. DTIP is designed to operate on top of existing infrastructure, and domain-specific semantics, industry standards, or rules for participation may be plotted on top. It aims to complement dataspace initiatives such as Gaia-X, iSHARE, and the Data Space Protocol (DSP), and will work alongside eIDAS 2.0.

In DTIP, organizations, individuals, teams, or "things" are identified by a DID. The corresponding **public** DID Document serves as a foundational anchor: it contains public verifiable credentials, available service endpoints, and other relevant public metadata about the subject. Access to actual data-endpoints is granted by issuing a dedicated Access Credential, with embeded the conditions for access. These credentials may also be delegated, to partners or subcontractors, building a verifiable audit trail while doing so. Trust is established per party, by assessment of public credentials. Public credentials may include memberships, identities, declarations, or compliance credentials such as those from Gaia-X. Trust may be stored as a whitelisted DID for faster future data-exchange.

---

## Abstract

European programmes like DSSC and DSIC have made digital collaboration across organizations a strategic priority. Current initiatives such as Gaia-X, iSHARE, and the Eclipse Dataspace Protocol aim to achieve this through governance models, compliance requirements, and specialized infrastructure. While valuable, these initiatives often couple trust mechanisms tightly with governance overhead, leaving a high barrier for participation and onboarding.

A shared limitation is that even when two organizations already trust each other, they cannot exchange data directly without going through the dataspace infrastructure. The technical footprint for adoption is substantial with a high integration effort, and the introduction of new standards

However, all building blocks for a lightweight, decentralized trust infrastructure already exist: the W3C Decentralized Identifiers (DIDs), Verifiable Credentials (VCs), and [DIDComm](#glossary) messages. What's missing is agreement on how to combine them into a coherent base layer for digital collaboration.

This document proposes exactly that: a base layer specifying how these existing standards should be applied for authentication, authorization, trust, delegation and communication in the context of a dataspace. The goal is not to invent something new, but to agree to a set of choices so organizations can adopt a common technical language.

**Adopted Standards:** DTIP builds on established specifications rather than defining new ones:
- [DIIP](https://fidescommunity.github.io/DIIP/) for credential formats (SD-JWT VC) and exchange protocols (OID4VCI, OID4VP)
- [DCAT](https://www.w3.org/TR/vocab-dcat-3/) for data catalog and offering descriptions
- [ODRL](https://www.w3.org/TR/odrl-model/) for usage policy expression
- [DIDComm v2](https://identity.foundation/didcomm-messaging/spec/) for secure peer-to-peer messaging

The profile is transport-agnostic, meaning it can sit on top of existing infrastructure. Organizations can adopt it incrementally, starting with basic DID authentication and adding capabilities as needed. Also the profile is agnostic about semantics, allowing any domain-specific roles or semantics.

By agreeing on these fundamentals, we create a foundation for interoperability, and open a market for specialized tools, connectors, and services tailored to specific industries.

---

## 1. Introduction

Digital collaboration requires solving several interrelated problems: identity verification, access authorization, credential exchange, and real-time coordination. Current frameworks tend to bundle these concerns together with governance requirements, creating packages that must be adopted wholesale or not at all.

This proposal inverts that pitfall: an incremental trust protocol scaling from informal partnerships to heavily regulated industries, without forcing a one-size-fits-all framework. It fulfills the technical requirements of a dataspace such as identity, trust, authorization and interoperability, but without prescribing governance. Organizations can start with what they have and adopt capabilities incrementally. Also, existing protcols like the DSP Contract Negotiation protocol, can easily be layered on top, where DIDComm could serve as the secure transport for such negotiations. But it remains optional, as also many scenarios may work fine with direct but trusted access.

The underlying technologies are mature. DIDs, Verifiable Credentials, and DIDComm have W3C specifications, multiple implementations, downloadable tools, and growing adoption. What's lacking is consensus on how to apply them in dataspace contexts.

### 1.1 Foundational Premise

The profile operates on a foundational premise:

> **Each participant retains full autonomy over their own trust decisions.**

It has 6 core principles:

1. **No Central Authority** — Trust is peer-to-peer. Each data provider defines its own access policies without mandatory scheme operators.

2. **Progressive Trust** — Start with minimal proof (DID ownership), escalate to credentials only when the resource requires it.

3. **Fine-Grained Access Control & Delegation** — Access rights are expressible, transferable, and revocable without legal overhead.

4. **Event-Driven Collaboration** — Parties are notified of changes in real-time, not just able to pull data.

5. **Transport Agnostic** — The trust protocol handles authorization, not data transfer. Use any API or transport.

6. **Incremental Adoption** — Start simple, add capabilities as requirements grow.

### 1.2 Market Opportunities

Agreeing on a common trust layer will create significant opportunities for service providers and tool builders. Because the profile defines interfaces rather than implementations, organizations need software or SaaS services to participate. And as different industries have different needs, many parallell platforms and tools will arise.

- Connector providers can build integrations bridging these standards with existing platforms like ERPs and logistics systems, competing on ease of integration and domain-specific features while maintaining interoperability.
- Trust service providers help organizations establish verifiable identity through credential issuance—chambers of commerce, compliance firms, and certification bodies all have roles to play.
- Discovery hubs index offerings across the network, with opportunities for industry-specific, regional, or compliance-focused services.
- Domain-specific tooling addresses vertical needs, since healthcare data sharing requires different features than logistics tracking or manufacturing supply chains.

This mirrors the web: open standards enable competition and specialization while interoperability prevents lock-in.

---

## 2. Technical Foundation

Two concepts form the backbone:

- **Decentralized Identifiers ([DID](#glossary))**
- **Verifiable Credentials ([VC](#glossary))**

Understanding their distinct roles, and the difference between an **identifier** and an **identity** is essential:

- The DID provides a unique **identifier**. It says nothing about who or what that identifier actually is. Think of it as an empty wallet.
- The VC provides the **identity**: a verifiable proof of a legal name, registration number, certification or membership, issued by recognized parties. It's the card inside the wallet.

Note that a VC is **bound** to a DID, meaning that a VC is always issued to one specific DID.

### 2.1 Decentralized Identifiers (DIDs)

So a **DID** is a globally unique identifier, represented by a simple string. It resolves to a **DID Document**. DIDs are not controlled by any central authority. They are anchored through various methods, on web domains (`did:web`), derived purely from cryptographic keys (`did:key`), or registered on distributed ledgers.

At its core, a DID represents a public/private key pair. The public DID Document contains the corresponding public key, and the holder possesses the private key. Anyone can verify that a message or signature came from the DID holder by checking it against the public key, without needing to contact any authority.

Every participant—whether an organization, a service endpoint, a device, or an automated agent, is identified by a DID. The specific method is not prescribed; participants choose what suits their security and operational requirements.

An exception is the iSHARE custom DID method `did:ishare`, which embeds a claim directly in the identifier. This deviates from the standard model where the identifier is purely cryptographic, and claims are carried separately in a VC.

#### 2.1.1 DID-Based Authentication

Because a DID is bound to a cryptographic key pair, it enables simple challenge-response authentication. Some service issues a random string (called a "nonce"), the client signs that with their DID's private key, and now the service can verify that signature against the public key in the DID Document. This proves control of the DID without passwords, without certificates, and without any exchange of verifiable credentials.

This mechanism underlies all interactions. Even when VCs are involved, the presenting party must always prove they control the DID to which the credentials were issued.

**SIOP (Self-Issued OpenID Provider)** is an adopted standard that formalizes this pattern, allowing DID-based authentication to integrate with existing OpenID Connect infrastructure. Organizations already using OIDC can adopt DID authentication with minimal changes.

#### 2.1.2 Services in the DID Document

The DID Document can declare services in its `service` section. It's the basis of the trust profile, and it uses three service types:

- **Public Credentials**. VCs that the holder chooses to set public for anyone to verify. Organizational identity from a business registry, membership in an industry association, compliance certifications. These credentials establish trustworthiness without requiring any interaction. A verifying party simply resolves the DID Document and checks the credentials.
- **Messaging via DIDComm**. DIDComm provides secure, authenticated communication between two DIDs. Messages are end-to-end encrypted, with sender identity cryptographically verified. DIDComm may be used for contract negotiation, subscription notifications, event updates, and also credential issuance. The DID Document publishes the endpoint where messages should be sent.
- **[Offerings](#glossary)**. The data products or services available at this DID, described using [DCAT](https://www.w3.org/TR/vocab-dcat-3/) (Data Catalog Vocabulary). An offering specifies what is available (title, description, category), what access requirements apply (credentials needed, trust level), and how to access it (API endpoints, subscription channels). The DID Document references a DCAT catalog endpoint, enabling discovery so other parties or "[discovery hubs](#glossary)" can see what's available without prior arrangement.

The approach of public credentials differs from the Eclipse Decentralized Claims Protocol (DCP). DCP requires sending VCs in a Verifiable Presentation for each and every transaction. That model does suit human-to-machine interactions, where selective disclosure of personal attributes matters and each transaction is typically one-time and focused on revealing specific claims. However, in business-to-business or machine-to-machine data sharing, the concerns differ: trust, organizational identity, and membership matter more than personal information, and relationships persist across many transactions. Public credentials are more practical, as verifiers may already have you whitelisted from a previous KYC check, making it unnecessary to continuously exchange the same organizational credentials. After initial trust verification, simple DID authentication might suffice.

#### 2.1.3 Example DID Document

```json
{
  "id": "did:web:acme-logistics.example",
  "verificationMethod": [{
    "id": "did:web:acme-logistics.example#key-1",
    "type": "JsonWebKey2020",
    "publicKeyJwk": { "kty": "EC", "crv": "P-256", "x": "...", "y": "..." }
  }],
  "authentication": ["did:web:acme-logistics.example#key-1"],
  "service": [
    {
      "id": "did:web:acme-logistics.example#didcomm",
      "type": "DIDCommMessaging",
      "serviceEndpoint": "https://acme-logistics.example/didcomm"
    },
    {
      "id": "did:web:acme-logistics.example#credentials",
      "type": "CredentialRegistry",
      "serviceEndpoint": {
        "credentials": [
          "eyJhbGciOiJFUzI1NiIsIn...I6Ik5MOTg3NjU0MzIxIn0.signature"
        ]
      }
    },
    {
      "id": "did:web:acme-logistics.example#catalog",
      "type": "DataCatalog",
      "serviceEndpoint": "https://acme-logistics.example/catalog.jsonld"
    }
  ]
}
```

This document shows an authentication key, a DIDComm messaging endpoint, a public organizational identity credential (in SD-JWT compact form), and a reference to a DCAT catalog. The JWT decodes to claims including `iss` (issuer), `sub` (subject DID), `vct` (credential type), and the organization's legal name and registration number.

### 2.2 Verifiable Credentials (VCs)

A **Verifiable Credential** is a tamper-evident digital credential containing claims about a subject, signed by an issuer. The structure includes the issuer's DID, the subject's DID, the claims being made, and cryptographic proof (a signature).

VCs may represent organizational identity from a government registry, membership in a trade association, a security certification, or an access-grant to a specific resource. The key property is verifiability: anyone can check that the credential was genuinely issued by the claimed issuer and has not been tampered with.

**Credential Format and Exchange:** DTIP adopts the [DIIP profile](https://fidescommunity.github.io/DIIP/) for credential format and exchange:

| Aspect | Specification |
|--------|---------------|
| Format | SD-JWT VC (selective disclosure capable) |
| Signature | ES256 (Secp256r1) |
| Issuance | OID4VCI (OpenID for Verifiable Credential Issuance) |
| Presentation | OID4VP (OpenID for Verifiable Presentations) |
| Revocation | IETF Token Status List |

This ensures interoperability with existing wallet implementations and credential infrastructure. Organizations already using OIDC can integrate credential exchange with minimal changes.

Except for the Access Credential, this trust profile does not specify other VC schemas or content structure. Different ecosystems use different formats: EBSI defines schemas for European identity credentials, Gaia-X specifies participant and compliance credentials, iSHARE defines its own delegation evidence format, and industry associations may define membership credentials. The profile works with any of these. What matters is that credentials follow DIIP requirements; specific claims and schemas are determined by the trust relationships each provider chooses to recognize.

**Revocation**

VCs have expiration dates, but sometimes access must be terminated before expiration—when partnerships end, employees leave, or credentials are compromised. DTIP uses the IETF Token Status List for revocation, a compact and efficient mechanism where issuers publish status lists that verifiers can check.

When verifying a credential chain, each credential's revocation status is checked. If any link in the chain has been revoked, the entire chain is invalid. This allows immediate termination of access rights at any level of the delegation hierarchy.

---

## 3. Resource Access and Delegation

DTIP supports a range of access mechanisms, from simple DID-based authentication to fine-grained credential-based control with delegation. Data owners choose the appropriate level based on their requirements—a partner verified through KYC might simply be whitelisted, while sensitive resources may require specific credentials with documented usage policies.

### 3.1 Basic Access

For resources that don't require fine-grained control, simple DID authentication suffices. The provider maintains a whitelist of authorized DIDs (or accepts any authenticated DID for public resources). Access works through challenge-response: the consumer proves they control their DID by signing a nonce, and the provider grants access if the DID is authorized for that resource.

This is fast and requires no credential exchange. It works well when the question is simply "is this a known/permitted party?" rather than "what specific rights does this party have?"

### 3.2 Controlled Access

When resources require specific permissions—scoped to particular data, limited in time, or restricted to certain actions—providers issue **Access Credentials**:

```json
{
  "type": ["VerifiableCredential", "AccessCredential"],
  "issuer": "did:web:rail-operator.example",
  "expirationDate": "2025-03-15T00:00:00Z",
  "credentialSubject": {
    "id": "did:web:logistics-partner.example",
    "resource": "https://rail-operator.example/shipments/container-7842",
    "actions": ["read", "write:status", "write:eta"],
    "delegatable": false
  },
  "credentialStatus": {
    "type": "TokenStatusList",
    "statusListCredential": "https://rail-operator.example/status/1",
    "statusListIndex": "42"
  }
}
```

This is the core of controlled access: who, what resource, which actions, until when, and whether delegation is allowed. The provider's authorization server verifies the Access Credential and issues a standard access token for the API—the same token format the API already expects.

**Using an Access Credential:** Following the DIIP profile, the consumer presents the credential via OID4VP. The provider verifies the signature (proving DID ownership), checks expiration and revocation status, and confirms the resource matches. Upon successful verification, the provider issues an access token, and API access proceeds normally.

**[Usage Policies](#glossary) (Optional):** Access Credentials can optionally include a `policy` field referencing or embedding an [ODRL](https://www.w3.org/TR/odrl-model/) policy:

```json
{
  "credentialSubject": {
    "id": "did:web:logistics-partner.example",
    "resource": "https://rail-operator.example/shipments/*",
    "actions": ["read"],
    "policy": {
      "@context": "http://www.w3.org/ns/odrl.jsonld",
      "@type": "Agreement",
      "permission": [{ "action": "use", "constraint": [{ "leftOperand": "purpose", "operator": "eq", "rightOperand": "logistics-optimization" }] }]
    }
  }
}
```

These policies are *documentation*, not technical enforcement—the profile cannot prevent a receiver from violating usage terms. What it does provide is an audit trail: the credential documents what was agreed, and access logs show who accessed what. Enforcement remains a contractual and legal matter. Organizations needing formal policy negotiation can layer protocols like DSP Contract Negotiation on top, but for most B2B relationships, the business contract and mutual trust already cover these concerns.

### 3.3 Delegated Access ([Delegation Chain](#glossary))

Organizations holding an Access Credential can delegate access to partners, subcontractors, or automated systems by issuing a new credential that embeds the original. This creates a **[delegation chain](#glossary)**—a sequence of credentials transferring access rights from party to party, with each link embedding its parent in SD-JWT compact form.

**Example: Multimodal Freight**

```
Port Authority (did:web:port.example)
    │ issues Access Credential: read/write to container manifest
    ▼
Shipping Line (did:web:shipping-line.example)
    │ delegates: read + write:customs-status
    ▼
Customs Broker (did:web:customs-broker.example)
    │ delegates: read-only, 48h validity
    ▼
Trucking Company (did:web:trucker.example)
```

Each delegation embeds its parent credential and can only grant a subset of the parent's rights. Delegators may add constraints: shorter time limits, restricted fields, narrower purposes. The data owner verifies requests by walking the embedded chain back to the original Access Credential they issued.

This enables supply chain flexibility without involving the data owner in every sub-authorization. Partners delegate to their subcontractors autonomously. Each level enforces least privilege by restricting what it passes on. The full chain remains cryptographically verifiable, providing a complete audit trail.

### 3.4 After Access is Granted

The Access Credential is the standard outcome of any successful access grant. Whether a party was verified through a whitelist, public credentials, or a trust chain, the typical result is an Access Credential specifying their permissions. This gives the consumer a reusable credential—they don't need to re-prove their trustworthiness for every request.

For simple ongoing relationships, the provider might also add the party's DID to a whitelist, enabling basic DID authentication for subsequent access. But for controlled resources, the Access Credential remains the mechanism: present credential, receive access token, call API.

Access Credentials issued after trust verification are typically non-delegatable by default. The provider verified *this* party's credentials; they haven't necessarily vetted whoever that party might want to delegate to. Delegation rights can be granted explicitly when the business relationship warrants it.

---

## 4. Establishing Trust with Unknown Parties

Establishing trust with unknown parties is a fundamental challenge in any data sharing ecosystem. Traditional dataspaces solve this through mandatory onboarding: all participants must complete a KYC (Know Your Customer) process with a central authority before they can interact. This works but creates bottlenecks and barriers to entry.

DTIP takes a different approach, consistent with the foundational premise that each participant retains full autonomy over trust decisions. There is no central onboarding authority. Instead, each data provider verifies credentials themselves, using information available in the request and in publicly resolvable DID Documents.

When an unknown party requests access, a provider has three sources of trust information:

1. **The Access Credential itself** — If the request includes an Access Credential (possibly with embedded delegation credentials), the provider can verify the entire chain back to credentials they originally issued.

2. **Public credentials in the requester's DID Document** — Organizational identity, memberships, and certifications published by the requester, verifiable without any interaction.

3. **Trust chains through credential issuers** — Public credentials from the requester can link to trusted root authorities through chains of issuer credentials, also publicly verifiable.

### 4.1 Verifying Access Credentials and Delegation

When a party presents an Access Credential—whether issued directly to them or delegated through a chain—the provider verifies the complete credential path.

For a directly-issued Access Credential, verification is straightforward: check the issuer signature, confirm the credential is not expired or revoked, and verify the presenter controls the DID to which it was issued.

For delegated access, the provider walks the embedded chain. Each delegation credential references its parent. The provider verifies that each delegation was issued by the holder of the parent credential, that each stays within the scope of its parent (no escalation of privileges), and that no credential in the chain has been revoked. The chain must terminate at an Access Credential originally issued by this provider.

Even if the provider has never seen any of the intermediate parties, cryptographic verification proves the access is legitimate. The full chain also serves as an audit trail, documenting exactly how this party came to have access.

### 4.2 Public Credentials

When an unknown party requests access without a valid Access Credential—perhaps seeking initial access—the provider can examine their public credentials.

By resolving the requester's DID Document, the provider finds credentials the party has published: organizational identity from a business registry, membership in industry associations, compliance certifications, Gaia-X participation, or other attestations. These credentials are cryptographically signed by their issuers and can be verified without any interaction with the requester.

The provider decides which credentials matter for their context. A logistics platform might require a transport operator license. A healthcare data provider might need proof of regulatory compliance. A Gaia-X participant might accept any party with a valid Gaia-X credential. Each provider sets their own policies.

### 4.3 Trust Chains via Credential Issuers

Public credentials become more powerful through **[trust chains](#glossary)**—a distinct mechanism from delegation chains. While delegation chains transfer access rights through Access Credentials, trust chains establish identity and trustworthiness through public credentials published in DID Documents.

A provider may not directly recognize the issuer of a requester's credential, but can verify trust transitively through the issuer's own public credentials.

```
Unknown Carrier (did:web:carrier.example)
    └── holds GaiaXParticipantCredential
            └── issued by Gaia-X (did:web:gaia-x.eu)
                    └── holds TrustAnchorCredential
                            └── issued by EC (did:web:ec.europa.eu) ✓ trusted root
```

The provider trusts the European Commission as a root authority. They've never seen this carrier before, but by resolving DID Documents and verifying credential signatures, they can confirm: Gaia-X is trusted by the EC, and this carrier is certified by Gaia-X. The chain is complete.

This is where ecosystem credentials like Gaia-X participation or iSHARE membership naturally fit. They become anchors in trust chains—not gatekeepers for participation, but evidence that providers can choose to recognize. An organization without Gaia-X credentials can still participate if the provider accepts other trust anchors; one with Gaia-X credentials gains automatic trust from providers who recognize that chain.

**Distinguishing the two chain types:** Delegation chains transfer specific access rights through embedded Access Credentials, flowing down from the data owner. Trust chains establish identity and trustworthiness through public credentials, flowing up to trusted root authorities. Once a provider verifies an unknown party through their trust chain, the typical next step is issuing them an Access Credential—converting verified trust into concrete access rights. This credential is usually non-delegatable, since the provider verified this specific party, not their potential subcontractors.

Each verification step involves resolving the issuer's DID Document, checking their public credentials, and verifying signatures. The entire process requires no interaction with any party—just DID resolution and cryptographic verification.

---

## 5. Discovery

How do organizations find potential data partners and available offerings across the network?

### 5.1 The Challenge

Without centralization, there's no single catalog of available data. Each DID Document contains offerings, but discovering relevant offerings requires knowing which DIDs to check in the first place.

### 5.2 Discovery Hubs

A **[Discovery Hub](#glossary)** is a service that indexes offerings from a set of DIDs and provides search capabilities. The hub periodically resolves DID Documents and indexes the offerings it finds. Users can query by category, credential requirements, keywords, or other criteria. Results link back to provider DIDs, where users can examine credentials and initiate access requests.

Hubs don't store data or mediate access—they simply make offerings discoverable.

### 5.3 Decentralized Discovery

Multiple hubs can coexist, each serving different communities. An industry association might operate a hub indexing logistics providers in their network. A regional initiative could run a hub covering European manufacturers. A compliance-focused hub might list only organizations holding specific credentials such as Gaia-X participation.

Organizations can register with multiple hubs or none. Hubs compete on coverage, search quality, and specialized features—creating a market rather than a monopoly.

### 5.4 Hub Trust

Hubs themselves are DID-identified and can publish credentials proving their legitimacy—certification by an industry body, compliance with indexing standards, endorsement by a government agency. Users choose which hubs to trust based on these credentials and the hub's reputation.

### 5.5 Market Opportunity

Discovery hubs represent a distinct market opportunity. Organizations can build and operate hubs serving specific industries or regions, generating revenue through premium listings, analytics services, matchmaking features, or verification add-ons. The open protocol means hubs can differentiate on user experience and specialized capabilities while remaining interoperable with the broader network.

---

## 6. Event-Driven Collaboration

Traditional data sharing is request-driven. The protocol adds real-time notifications for scenarios where acting on changes matters.

### 6.1 Why Notifications Matter

Consider scenarios where knowing about changes is critical. A customs broker needs to know when documentation is ready for review. A carrier should be alerted the moment a shipment is released. A manufacturer must react immediately when a supplier's inventory drops below threshold.

Polling for changes is inefficient and introduces latency. Centralized message brokers add infrastructure dependencies. Webhook-based notifications lack standardized authentication and security.

### 6.2 Subscriptions

DTIP defines a subscription mechanism over DIDComm. A consumer sends a subscription request specifying the resource or pattern to monitor, which events they care about (created, updated, deleted), their Access Credential proving authorization, and a DIDComm endpoint where notifications should be delivered.

The provider acknowledges the subscription with an identifier and expiration time. When relevant events occur, the provider sends notifications containing the event type, resource identifier, and enough context for the consumer to decide on next steps.

### 6.3 Secure Notifications

Because notifications travel over DIDComm, they are encrypted end-to-end, authenticated as genuinely from the data provider, and non-repudiable for audit purposes. This makes them suitable for triggering business processes, not just updating user interfaces.

### 6.4 Reactive Workflows

Event-driven collaboration enables workflows that would be impractical with polling. Updates can cascade across supply chain parties as each reacts to changes from their upstream partners. Threshold alerts can trigger procurement processes automatically. Document changes can initiate approval workflows. Every notification becomes part of a verifiable audit trail showing how information flowed between parties.

---

## 7. Comparison with Existing Frameworks

| Capability | iSHARE | Gaia-X | DSP/DCP | **DTIP** |
|------------|--------|--------|---------|----------|
| **Minimum onboarding** | Legal agreement + certificates | Certification | Connector + VP | Generate DID |
| **Authentication** | OAuth + certificates | Compliance check | VP with identity VCs | DID + OID4VP (DIIP) |
| **Trust establishment** | Scheme membership | Gaia-X credentials | VP with identity VCs | Public credentials |
| **Access grants** | Delegation evidence | Service offerings | Contract agreement | Access Credential |
| **Usage policies** | Contract terms | Policy rules | ODRL policies | ODRL (optional) |
| **Delegation** | Limited | Not standardized | Transfer protocol | Embedded VC chaining |
| **Discovery** | Satellite registry | Federated catalogs | Catalog protocol | DCAT + Discovery hubs |
| **Notifications** | External | Not specified | External | DIDComm v2 |

### Positioning

DTIP provides a **trust and authorization layer** independent of APIs, data formats, or governance. It answers "who is allowed to access what"—not "how should data transfer" or "what schema to use."

It serves as a base layer across diverse contexts. Compliance-heavy industries like automotive, aerospace, and healthcare benefit from precise access control and complete audit trails. Complex supply chains use it to flow access rights between multiple independent parties without central coordination. Real-time collaboration scenarios leverage DIDComm for event-driven coordination. Bilateral partnerships can formalize trusted data exchange without extensive onboarding overhead.

**Complementing Existing Frameworks:** DTIP does not compete with Gaia-X or iSHARE—it fills a gap they leave open. Gaia-X defines who is trustworthy (through participant and compliance credentials) but does not specify how to grant or verify access to specific resources. iSHARE defines delegation evidence but requires scheme membership and central registries. DTIP provides the authorization mechanics: Access Credentials for fine-grained permissions, delegation chains for supply chain flexibility, and lightweight DID authentication for parties that already trust each other.

A Gaia-X participant can adopt DTIP while remaining fully compliant—Gaia-X credentials simply become public credentials in their DID Document, usable in trust chains. An iSHARE participant can use the same Access Credential patterns without requiring all partners to join the scheme. DTIP offers a lighter path for organizations that want interoperability without the full infrastructure overhead of DSP connectors or scheme onboarding.

Organizations already in Gaia-X, iSHARE, or DSP ecosystems can use this as the underlying trust layer while maintaining their compliance commitments. Others can use it directly, with or without those credentials.

---

## 8. Implementation Considerations

### 8.1 System Requirements

Systems adopting DTIP need capabilities for DID resolution (typically via HTTP for `did:web`), signature verification for authentication proofs and credential signatures, fetching and verifying public credentials from DID Documents, and walking delegation chains to validate access rights. For real-time collaboration, a DIDComm endpoint handles subscriptions and notifications.

Existing libraries cover all requirements for major platforms, making implementation straightforward.

### 8.2 Incremental Adoption

Organizations can adopt incrementally. A typical path starts with DID authentication and partner whitelists for basic access control. Next, publishing credentials and offerings enables verification of unknown parties through public credentials and makes data products discoverable. Then, Access Credentials provide fine-grained control with delegation capabilities. DIDComm subscriptions add real-time collaboration. Finally, registering with discovery hubs increases visibility across the network.

Each phase adds value independently. Organizations start where they are and add capabilities as requirements evolve.

---

## 9. Conclusion

This proposal defines a base trust protocol for data collaboration:

| Requirement | Approach | Standard |
|-------------|----------|----------|
| Credential format | SD-JWT VC | DIIP |
| Credential exchange | OID4VCI / OID4VP | DIIP |
| Authentication | DID ownership proof | did:web, did:jwk |
| Trust establishment | Public credentials + trust chains | W3C VC |
| Access authorization | Access Credentials | DTIP schema |
| Delegation | Embedded VC chaining | DTIP schema |
| Usage policies | ODRL policies (optional) | W3C ODRL |
| Discovery | Data catalogs + hubs | W3C DCAT |
| Messaging | Encrypted notifications | DIDComm v2 |

The protocol provides what digital collaboration requires: trust, authorization, delegation, discovery, and coordination—without prescribing data formats, transfer protocols, or governance structures. Contract negotiation and detailed policy enforcement can be layered on top as needed.

**Existing infrastructure stays intact.** The protocol layers authentication, authorization, and discovery around existing data services. APIs don't change. The investment is in identity infrastructure, not rebuilding what already works.

**Open by design.** Unlike frameworks that require scheme membership or compliance certification before participation, any organization can start with nothing more than a DID. Ecosystem credentials from Gaia-X, iSHARE, or industry bodies add value when you have them—they make trust establishment faster—but they're never a barrier to entry. Each participant decides what credentials they recognize; each data owner retains full autonomy over their trust decisions.

The technologies already exist. By agreeing on how to apply them, we establish a common foundation—like HTML for documents or SMTP for email—that enables organizations to move past infrastructure debates and focus on the data collaboration itself. The open architecture creates opportunities for specialized tools, connectors, and services across industries, all interoperating through shared standards.

---

## Glossary

| Term | Definition |
|------|------------|
| **Identifier** | A DID proving control of a key pair; not identity |
| **Identity** | Verified attributes in VCs from trusted issuers |
| **DID** | Decentralized Identifier resolving to a DID Document |
| **DID Document** | Public keys, services, credentials, and catalog reference for a DID |
| **VC** | Verifiable Credential — signed, tamper-evident claim (SD-JWT VC per DIIP) |
| **VP** | Verifiable Presentation — signed credential presentation via OID4VP |
| **Access Credential** | Credential granting specific data access rights; supports delegation via embedded parent |
| **ODRL Policy** | W3C standard for expressing usage constraints (optional, documentation only) |
| **Offering** | Description of a data product or service, expressed in DCAT format |
| **Discovery Hub** | Service indexing DCAT catalogs across multiple DIDs |
| **DIDComm** | DIDComm v2 secure messaging protocol using DIDs |
| **Trust Chain** | Credential sequence linking unknown party to trusted root via public credentials; establishes identity |
| **Delegation Chain** | Credential sequence transferring access rights via embedded Access Credentials; grants resource permissions |

---

*This proposal is open for discussion and refinement. Contributions are welcome.*


## Appendix: Two Types of Credential Chains

The protocol uses two distinct types of credential chains for different purposes:

**Delegation Chains** transfer specific access rights. When an organization delegates access to a partner, it issues a new Access Credential that embeds the original (in SD-JWT compact form) in the `parentCredential` field. The partner can further delegate by issuing another credential embedding theirs. Each link grants a subset of the parent's permissions. The chain terminates at an Access Credential originally issued by the data owner. See Section 3.3 for details.

Delegation chains create a built-in audit trail. When a party presents credentials for access, the full embedded chain is visible—showing who originally granted access, through whom it was delegated, and under what constraints at each step. Data providers log this information with each access request, creating a decentralized audit trail where each organization maintains records of who accessed their resources and through what authorization path.

**Trust Chains** establish identity and trustworthiness. These work through public credentials published in DID Documents. A provider may not directly recognize an unknown party's credentials, but can verify trust transitively by resolving issuer DID Documents and following credential signatures up to trusted root authorities (e.g., Gaia-X → European Commission). See Section 4.3 for details.

The key difference: delegation chains flow *down* from the data owner to grant access rights; trust chains flow *up* from an unknown party to established authorities to prove trustworthiness.
