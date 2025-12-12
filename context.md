# Trust Protocol Project Context

This document summarizes the project context, key decisions, and design philosophy for continuing work in Claude Code.

---

## Project Overview

We're developing a **proposal for a lightweight trust protocol** for decentralized data sharing between organizations. It's not a new framework—it's a proposal for how to apply existing W3C standards (DIDs, VCs, DIDComm) as a common base layer for dataspaces.

**Key framing:** The technologies already exist. We're just proposing that everyone adopts the same choices so we can move past infrastructure debates.

---

## Documents Created

1. **trust-protocol-whitepaper.md** — The main proposal document (~460 lines)
   - Abstract, Introduction, Technical Foundation, Access/Delegation, Trust Establishment, Discovery, Event-Driven Collaboration, Comparison, Implementation, Conclusion, Glossary

2. **trust-protocol-examples.md** — Practical implementation examples (~350 lines)
   - 6 progressive examples showing incremental adoption
   - Each example shows: scenario, starting point, what changes, components needed, what's NOT needed, implementation notes

---

## Tone and Positioning

### What this IS:
- A **proposal**, not a new framework or product
- Built entirely on **existing standards** (DIDs, VCs, DIDComm, SIOP)
- A **base layer** like HTML or SMTP—solidifying choices so everyone speaks the same language
- **Pragmatic and lightweight**—start with just a DID, add capabilities as needed
- **Open by design**—any organization can participate without scheme membership

### What this is NOT:
- Not competing with Gaia-X, iSHARE, or DSP—complementing them
- Not prescribing governance, data formats, or transfer protocols
- Not claiming to technically enforce usage policies (that's contractual/legal)

### Key phrases to maintain:
- "Each participant retains full autonomy over their trust decisions"
- "Existing infrastructure stays intact"
- "Open by design"
- Technologies as "trust anchors" not "gatekeepers"

---

## Key Technical Decisions

### Access-VCs are the core mechanism
- Simple structure: who, what resource, which actions, expiration, delegatable (yes/no)
- Verification leads to a standard **access token** for the API
- APIs don't change—they still accept bearer tokens as before

### Usage policies are OPTIONAL documentation
- Not technical enforcement (the protocol can't prevent violations)
- Provides audit trail for compliance
- Enforcement is contractual/legal matter
- DSP-style policy negotiation can layer on top if needed

### Access-VCs issued after trust verification are typically non-delegatable
- Provider verified *this* party's credentials
- Delegation rights granted explicitly when business relationship warrants it

### Public credentials vs VP exchange
- Public credentials in DID Document preferred for B2B
- VP exchange (DCP pattern) better for human-to-machine with selective disclosure
- After KYC/trust verification, simple DID authentication suffices

### Ecosystem credentials (Gaia-X, iSHARE) are optional trust anchors
- They accelerate trust establishment
- They're never barriers to entry
- Organizations without them can still participate if provider accepts other trust anchors

---

## Relationship to Other Initiatives

| Initiative | What they do | Gap this fills |
|------------|--------------|----------------|
| **Gaia-X** | Defines who is trustworthy (compliance credentials) | How to grant/verify access to specific resources |
| **iSHARE** | Delegation evidence, but requires scheme membership | Same patterns without requiring all partners to join |
| **DSP/DCP** | Contract negotiation, but heavy infrastructure | Lighter path, direct sharing between trusting parties |

**Key message:** You can be Gaia-X compliant AND use this protocol. Gaia-X credentials become public credentials in your DID Document.

---

## Document Structure Decisions

### Whitepaper structure:
1. Abstract (with limitations of current initiatives paragraph)
2. Introduction (Why Now, Foundational Premise, Market Opportunities)
3. Technical Foundation (DIDs, VCs—with subsections)
4. Resource Access and Delegation (Basic, Controlled, Delegated, After Access)
5. Establishing Trust with Unknown Parties
6. Discovery
7. Event-Driven Collaboration
8. Comparison with Existing Frameworks
9. Implementation Considerations
10. Conclusion
11. Glossary

### Examples structure:
- Each example has: Scenario, Starting Point, What Changes, Components Required (table), What's NOT Needed, Implementation Notes
- Progressive complexity: simple auth → Access-VCs → delegation → unknown parties → notifications → discovery
- Always emphasize what stays the same (APIs don't change)
- Light references to iSHARE/Gaia-X showing this is lighter/more open

---

## Terminology Consistency

| Use | Avoid |
|-----|-------|
| "the protocol" | "this proposal" (when referring to technical approach) |
| "transport-agnostic" | "protocol-agnostic" (was confusing) |
| "trust anchors" | "gatekeepers" |
| "Access-VC" | "access token as VC" |
| "usage policies (optional)" | "usage control" |
| "documentation" (for policies) | "enforcement" |

---

## Open Items / Future Work

- No specific VC schemas defined (intentionally—works with EBSI, Gaia-X, iSHARE, custom)
- Discovery hub specification could be elaborated
- DIDComm message formats for subscriptions could be specified
- Reference implementations needed

---

## Style Guidelines

- Prose over bullets (unless truly a list)
- Keep it readable for both technical and management audiences
- Be honest about limitations (e.g., usage policy enforcement)
- Positive framing—highlight openness, not criticism of alternatives
- Concrete examples help (logistics, supply chain scenarios)

---

*Last updated after discussion about usage policies being optional documentation, not technical enforcement.*