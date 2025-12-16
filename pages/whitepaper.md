# Decentralized Trust Interop Profile (DTIP)

**Version 0.7: Draft**

---

## Abstract

The **Decentralized Trust Interop Profile (DTIP)** is a lightweight technical profile that acts as a base layer for trust in digital data exchange. Unlike existing dataspace initiatives, DTIP ensures that every party retains full autonomy over its own trust decisions. Participation simply means adhering to the technical profile, but does not require onboarding unless a specific domain requires so. It specifies a cohesive set of open standards that ensure interoperability across identity, trust, access, delegation, and peer-to-peer notifications. DTIP is designed to operate on top of existing infrastructure, and any domain-specific semantics, industry standards, or rules for participation may be layered on top. It aims to complement dataspace initiatives such as Gaia-X, iSHARE, and the Data Space Protocol (DSP), and to support human-to-machine interactions conforming to eIDAS 2.0.

In DTIP, organizations, individuals, teams, or even devices or trucks are identified by a DID. The corresponding **public** DID Document serves as a foundational anchor: it contains public verifiable credentials, available service endpoints, and other relevant public metadata about the subject. Access to actual data-endpoints is granted by issuing a dedicated Access Credential, with the conditions for access embedded. These credentials may also be delegated to partners or subcontractors, building a verifiable audit trail while doing so. Trust is established individually by assessment of the public credentials. Those may include memberships, identities, declarations, or compliance statements such as the Gaia-X credential. Trusted parties may be whitelisted by their DID for faster future data exchange.

---

## 1. Introduction

European programmes like DSSC and DSIC have made digital collaboration across organizations a strategic priority. Current initiatives such as Gaia-X, iSHARE, and the Eclipse Dataspace Protocol aim to achieve this through governance models, compliance requirements, and specialized infrastructure. While valuable, these initiatives often couple trust mechanisms tightly with governance overhead, leaving a high barrier for participation and onboarding.

A shared limitation is that even when two organizations already trust each other, they cannot exchange data directly without going through the dataspace infrastructure and onboarding. The technical footprint for adoption is relatively substantial, with high integration effort and the introduction of new standards.

However, all building blocks for a lightweight, decentralized trust infrastructure already exist: the W3C [Decentralized Identifiers](#glossary) (DIDs), [Verifiable Credentials](#glossary) (VCs), and [DIDComm](#glossary) messages. What's missing is agreement on how to combine them into a coherent base layer for digital collaboration.

This whitepaper proposes exactly that: a base layer specifying how these existing standards should be applied for authentication, authorization, trust, delegation and communication, in the context of a dataspace. The goal is not to invent something new, but to agree to a set of choices so organizations can adopt a common technical language. An incremental trust protocol scaling from informal partnerships to heavily regulated industries, without forcing a one-size-fits-all framework. It fulfills the technical requirements of a dataspace such as identity, trust, authorization and interoperability, but without prescribing governance. Organizations can start with what they have and adopt capabilities incrementally. Also, existing protocols like the DSP Contract Negotiation protocol can easily be layered on top, where DIDComm could serve as the secure transport for such negotiations. But it remains optional, as also many scenarios may work fine with direct but trusted access.

The underlying technologies are mature. DIDs, Verifiable Credentials, and DIDComm all have W3C specifications, multiple implementations, downloadable tools, and growing adoption. What's lacking is consensus on how to apply them in dataspace contexts.

DTIP builds on established specifications rather than defining new ones:
- [DIIP](https://fidescommunity.github.io/DIIP/) for credential formats (SD-JWT VC) and exchange protocols (OID4VCI, OID4VP)
- [DCAT](https://www.w3.org/TR/vocab-dcat-3/) for data catalog and offering descriptions
- [ODRL](https://www.w3.org/TR/odrl-model/) for usage policy expression
- [DIDComm v2](https://identity.foundation/didcomm-messaging/spec/) for secure peer-to-peer messaging

The profile is agnostic about data-transport, meaning it can sit on top of existing infrastructure. Adoption may be incremental, starting with basic DID authentication for known parties, and adding capabilities as needed. Also the profile is agnostic about semantics, allowing any domain-specific roles or semantics being added on top.

### 1.1 Foundational Premise

The profile operates on a foundational premise:

> **Self-Sovereign Trust: each participant retains full autonomy over their own trust decisions**

If trust already exists, the profile enables parties to collaborate directly, without onboarding or compliance checks. If trust does not exist, data owners independently define what trust requirements must be met, and shares that with data consumers, allowing those consumers to comply in order to gain access.

DTIP has 5 core principles:

1. **Only Open Standards** — DTIP is based purely on existing standards (DIDs, VCs, DCAT, ODRL, DIDComm).

2. **Infrastructure is Preserved** — Existing APIs or data formats are maintained, only Authorization is changed.

3. **Complexity is Progressive** — Start simple, only add extra services when needed.

4. **Access is Delegatable** — Access to some resource may be passed down to other parties.

5. **Collaboration is Event-Driven** — Subscribe to updates on resources to receive real-time notifications.


### 1.2 Market Opportunities

Agreeing on a common trust layer will create significant market opportunities for specialized tools, connectors, and services tailored to specific industries. Organizations will still need software packages or SaaS services to become part of the network. And as different industries have different needs, a variety of platforms, tools and services will arise, sometimes with domain-specific features:

- **Connectors** for interfacing with existing platforms like ERPs and logistics systems.
- **Trust Services** to help organizations assess trust.
- **Discovery Hubs** to index offerings across the network.
- And many more..

---

## 2. Technical Foundation

The backbone of DTIP consists of two common, W3C-standardized concepts:

- **Decentralized Identifiers**
- **Verifiable Credentials**

Understanding the difference between an **identifier** and an **identity** is essential:

- An **identifier** is a unique string. Think of it as an empty wallet.
- An **identity** is a statement of who you are. It's the card inside the wallet.

The DID provides the **identifier**, with the added value that one can prove the ownership of that identifier through a cryptographic signature.

The VC provides the **identity**: a specific claim by some trusted party about some subject. VCs may represent organizational identity from a government registry, membership in a trade association, a statement from the Chamber of Commerce, a security certification, or an access-grant to a specific resource. The key property is verifiability: anyone can check that the credential was genuinely issued by the claimed issuer and has not been tampered with.

DTIP adopts the [DIIP profile](https://fidescommunity.github.io/DIIP/) for credential format and exchange.

The VC is always issued to a DID, and therefore they are bound. To prove the VC is yours, you need to prove ownership of the DID. Therefore a VC is safe to publish on the web as no one else can prove ownership. Where an OAuth token is always short-lived as it directly provides access, the VC is long-lived.

### 2.1 DID-Based Authentication

Only with the DID, one could already login. Because a DID is essentially a cryptographic public/private key pair, it by itself enables authentication by signing a given challenge (called a "nonce"). This mechanism is the basis for all interactions. Even when VCs are involved, the presenting party must always prove they control the DID to which the credentials were issued.

**SIOP (Self-Issued OpenID Provider)** is the adopted standard that formalizes this pattern, allowing DID-based authentication to integrate with existing OpenID Connect infrastructure. Organizations already using OIDC can adopt DID authentication with minimal changes.

### 2.2 DID Document

A DID resolves to a public **DID Document**. That public DID Document contains the public key, while the holder possesses the private key. Anyone can verify that a message or signature came from the DID holder by checking it against the public key, without needing to contact any authority.

**Services in the DID Document**

The DID Document can declare services in its `service` section. It's the basis of the trust profile, and DTIP uses three service types:

- **Public Credentials**. VCs that the holder chooses to set public for anyone to verify.
- **Offerings**. The data products or services available at this DID, described using [DCAT](https://www.w3.org/TR/vocab-dcat-3/)
- **DIDComm Endpoints**. [DIDComm](#2.4DIDComm) provides secure, authenticated communication between two DIDs.

### 2.3 VC Revocation

VCs have expiration dates, but sometimes access must be terminated before expiration—when partnerships end, employees leave, or credentials are compromised. DTIP uses the IETF Token Status List for revocation, a compact and efficient mechanism where issuers publish status lists that verifiers can check.

When verifying a credential chain, each credential's revocation status is checked. If any link in the chain has been revoked, the entire chain is invalid. This allows immediate termination of access rights at any level of the delegation hierarchy.

### 2.4 DIDComm

DIDComm is a peer-to-peer messaging system, based on webhooks specified in the DID Document. Messages are end-to-end encrypted, with sender identity cryptographically verified. DIDComm may be used for notifications, event updates, contract negotiation, and also for issuance of credentials when the receiving party is known by DID.

### 2.5 Examples

Below is a DID Document presenting an authentication key, a DIDComm messaging endpoint, a public organizational identity credential (in SD-JWT compact form), and a reference to a DCAT catalog:

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

Below is an example of a verifiable credential representing an organizational identity:

```json
{
  "type": ["VerifiableCredential", "ChamberOfCommerceCredential"],
  "issuer": "did:web:kvk.nl",
  "issuanceDate": "2024-06-01T00:00:00Z",
  "expirationDate": "2025-06-01T00:00:00Z",
  "credentialSubject": {
    "id": "did:web:acme-logistics.example",
    "legalName": "Acme Logistics B.V.",
    "registrationNumber": "NL12345678"
  }
}
```

### 2.6 Note on other dataspace initiatives

The iSHARE custom DID method `did:ishare` embeds a claim directly in the identifier. This deviates from the standard model where the identifier is purely cryptographic, and claims are carried separately in a VC.

The Eclipse Decentralized Claims Protocol (DCP) requires sending VCs in a Verifiable Presentation for each transaction. That model suits human-to-machine interactions where each transaction is typically one-off. However, in business-to-business and machine-to-machine interactions, the concerns differ: relationships persist across many transactions. Verifiers may already have you whitelisted from a previous KYC check, making it unnecessary to continuously exchange the same organizational credentials. After initial trust verification, simple DID authentication might suffice.

---

## 3. Access to Resources & Delegation

A core principle of DTIP is that when two or more parties already know and trust each other, they should be able to exchange data without long onboarding or compliance tests. Perhaps they already exchange data via APIs, and should be able to continue doing so while still being part of a larger network. That is what DTIP ensures.

When certain resources require access rules, then the access credential is required.

### 3.1 Basic Access

For resources that don't require fine-grained control, simple [DID Based authentication](#2.1DID-BasedAuthentication) suffices. The provider maintains a whitelist of authorized DIDs (or accepts any authenticated DID for public resources). Access is granted when the consumer proves they control their DID by signing a nonce.

This is fast and requires no credential exchange. It works well when the question is simply "is this a known/permitted party?" rather than "what specific rights does this party have?"

### 3.2 Controlled Access

When resources require specific permissions, e.g. scoped to particular data, limited in time, or restricted to certain actions, data owners issue an **Access Credential**. This is the core of controlled access: who, what resource, which actions, until when, and whether delegation is allowed.

Following the DIIP profile, the Data Consumer presents the credential via OID4VP. The provider verifies the signature (proving DID ownership), checks expiration and revocation status, and confirms the resource matches. Upon successful verification, the provider issues a short-lived OAuth access token, and API access proceeds normally.

Access Credentials may include a [Usage Policy](#glossary) in the `policy` field referencing or embedding an [ODRL](https://www.w3.org/TR/odrl-model/) policy.

These policies are *documentation*, not technical enforcement—the profile cannot prevent a receiver from violating usage terms. What it does provide is an audit trail: the credential documents what was agreed, and access logs show who accessed what. Enforcement remains a contractual and legal matter. Organizations needing formal policy negotiation can layer protocols like DSP Contract Negotiation on top, but for most B2B relationships, the business contract and mutual trust already cover these concerns.

### 3.3 Resource Types

When the credential grants access to a specific data type (e.g., an eCMR), a domain-specific type can be added to the `type` array: `["VerifiableCredential", "AccessCredential", "eCMRAccessCredential"]`. This enables verifiers to request specific credential types via OID4VP—for example, customs can request "an eCMRAccessCredential" from a driver's wallet. The provider's authorization server verifies the Access Credential and issues a standard access token for the API—the same token format the API already expects.


### 3.4 Delegating Access

Organizations holding an Access Credential may delegate access to partners, subcontractors, or automated systems by issuing a new credential that embeds the original credential. This creates a **delegation chain**: a sequence of credentials transferring access rights from party to party, with each link embedding its parent in SD-JWT compact form.

**Example: Freight Forwarding**

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


### 3.5 Example Access Credential

Access Credential with type `eCMR`, delegated (so it has a parent), and a policy:

```json
{
  "type": ["VerifiableCredential", "AccessCredential", "eCMRAccessCredential"],
  "issuer": "did:web:rail-operator.example",
  "expirationDate": "2025-03-15T00:00:00Z",
  "credentialSubject": {
    "id": "did:web:logistics-partner.example",
    "resource": "https://rail-operator.example/shipments/container-7842",
    "actions": ["read", "write:status", "write:eta"],
    "delegatable": true,
    "parent": "ey......",
    "policy": {
      "@context": "http://www.w3.org/ns/odrl.jsonld",
      "@type": "Agreement",
      "permission": [{ "action": "use", "constraint": [{ "leftOperand": "purpose", "operator": "eq", "rightOperand": "logistics-optimization" }] }]
    }
  },
  "credentialStatus": {
    "type": "TokenStatusList",
    "statusListCredential": "https://rail-operator.example/status/1",
    "statusListIndex": "42"
  }
}
```

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

An offering specifies what is available (title, description, category), what access requirements apply (credentials needed, trust level), and how to access it (API endpoints, subscription channels). The DID Document references a DCAT catalog endpoint, enabling discovery so other parties or "[discovery hubs](#glossary)" can see what's available without prior arrangement.

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
