# EU AI Act Crosswalk

What the Act's documentation and logging obligations ask for, which Kontour
records produce that artifact class by construction, and what remains the
operator's job. Snapshot dated 2026-06-10.

Plain statement up front: **Kontour is evidence infrastructure, not legal
compliance.** No Kontour record makes a system compliant with Regulation (EU)
2024/1689. The Act demands processes (risk management, quality management,
conformity assessment) and outcomes (accuracy, robustness, oversight) that no
data format can supply. What Kontour supplies is the artifact layer those
processes are supposed to leave behind: append-only, attributable,
recomputable records of what was claimed, what was observed, who verified it
under what authority, and what was asked and answered. Nothing in this
document is legal advice.

---

## By construction vs by retrofit

GRC platforms (Vanta, Drata, Credo AI) document controls at organization and
program granularity: is MFA enabled, does an ISO 42001 program exist, was an
access review completed. That evidence answers "is the control configured."
Articles 12 and 19 and Annex IV demand something at a different altitude:
event-level traceability about what an AI system did and what was verified
about specific work products. A retrofit approach reconstructs that record at
audit time — screenshots, exported dashboards, attestation memos assembled
after the fact, each one a mutable artifact whose integrity rests on the
assembler. Kontour records sit at work-product granularity and are written at
the moment of the event: a VerificationEvent exists because a verification
happened, an AuthorityTrace exists because authority was held, and status is
recomputed from the accumulated ledger by a published deterministic function
rather than asserted by a dashboard. The record is the byproduct of doing the
work, not a reconstruction of it. That is the difference between evidence by
construction and evidence by retrofit — and it is the granularity gap GRC
tooling does not reach. The right relationship is complementary: Kontour
bundles feed GRC control evidence; they do not replace the GRC program.

---

## Timeline (as of June 2026)

| Date | What |
|---|---|
| 1 Aug 2024 | Regulation (EU) 2024/1689 entered into force. |
| 2 Feb 2025 | Prohibitions (Art. 5) and AI literacy (Art. 4) apply. |
| 2 Aug 2025 | GPAI model obligations and governance provisions apply. |
| 2 Aug 2026 | Original application date for high-risk obligations — superseded by the Omnibus below. |
| 7 May 2026 | Council and Parliament reach **provisional agreement** on the Digital Omnibus on AI, deferring high-risk obligations because harmonized standards and national authorities were not ready. |
| 2 Dec 2027 | High-risk obligations for stand-alone (Annex III) systems apply, per the Omnibus agreement. |
| 2 Aug 2028 | High-risk obligations for AI embedded in regulated products (Annex I) apply, per the Omnibus agreement. |

Caveat: the Omnibus takes legal effect only on formal adoption and publication
in the Official Journal, expected before 2 August 2026. The dates above are
the agreed fixed dates, not yet law as of this snapshot. The deferral extends
the runway; it does not remove the obligations.

---

## Crosswalk

Record types referenced below are defined in the Kontour Trust Format spec
(`trust.kontour.ai/v1`): TrustBundle, Claim, Evidence, VerificationPolicy,
VerificationEvent, AuthorityTrace, InquiryRecord, DerivationRule.

| Obligation | What the Act asks for | Kontour record(s), by construction | What the operator still owns |
|---|---|---|---|
| **Art. 12(1)** — record-keeping | High-risk systems shall technically allow automatic recording of events (logs) over the lifetime of the system. | VerificationEvent and Evidence are append-only by definition — events are never updated, they accumulate as a ledger inside a TrustBundle. The integrity story (no mutation, no last-write-wins on merge) is stronger than a conventional mutable log. | Making the AI system itself emit events; deciding which runtime events are log-worthy; capturing raw telemetry (Kontour ingests testimony, it is not a tracing SDK). The Act binds the *system*; Kontour records the *work products and verifications around it*. |
| **Art. 12(2)(a)** — traceability for risk situations | Logging sufficient to identify situations that may present a risk or a substantial modification. | Blocking, non-passing Evidence flips a claim to `disputed` deterministically; `superseded` marks substantial modification of an assertion. The status function makes "when did this become a risk situation" answerable at any past `now`. | Defining what counts as a risk situation or substantial modification; acting on it (Art. 79 ff.). |
| **Art. 12(2)(b)** — post-market monitoring support | Logging that facilitates Art. 72 post-market monitoring. | InquiryRecord: every consumer question resolved against the ledger, with frozen input-claim statuses and `statusFunctionVersion`, so monitoring conclusions are re-derivable later. | The Art. 72 monitoring plan and system itself, and Art. 73 serious-incident reports to authorities. |
| **Art. 12(3)** — biometric (Annex III 1(a)) specifics | Record period of each use, reference database, input data that led to a match, and the natural persons who verified the results. | AuthorityTrace names the actor, the authority held, and the validity window — exactly the "identification of the natural persons involved in the verification" record. VerificationEvent binds actor, method, and evidence IDs to each verification. | Capturing the runtime data (use periods, database refs, match inputs) and feeding it in as Evidence; the two-person verification process of Art. 14(5). |
| **Art. 19(1)** — provider log retention | Keep automatically generated logs at least six months (longer where other law requires). | Records never mutate, so retention is pure storage policy — nothing in the format expires or compacts history. InquiryRecords never go stale because they assert what was knowable at a moment, not present-tense truth. | The retention policy itself, storage, deletion schedules, and GDPR interplay. Six months is a floor the operator must enforce. |
| **Art. 11 + Annex IV §2(g)** — validation and testing documentation | Validation and testing procedures used, results, metrics, and logs/reports dated and signed by responsible persons. | Claim (what is asserted about the system) + VerificationPolicy (declared required evidence, methods, acceptance criteria) + VerificationEvent (dated, attributed result) is precisely "test procedure, criteria, result, who, when." Annex IV evidence sections can be generated from bundles instead of written retrospectively. | Designing the validation procedures, choosing the metrics, running the tests. Kontour records testimony about testing; it does not perform any. |
| **Annex IV §2(e), §3** — human oversight assessment; capabilities and limitations | Assessment of oversight measures; description of capabilities, limitations, accuracy levels, foreseeable unintended outcomes per user group. | Each capability/limitation statement becomes a Claim with attached Evidence and live status — the model/system-card decomposition. A card whose every line has recomputable status, instead of prose self-attestation. | The actual measurements and the honesty of the claims. A claim with status `unknown` or `proposed` is documentation of a gap, not a pass. |
| **Annex IV §6** — lifecycle changes | Description of changes made to the system through its lifecycle. | `superseded` and `rejected` are terminal ledger events; history is append-only, so the change trail is the record itself. `schemaVersion` and `statusFunctionVersion` pin how past states were evaluated. | Change management process, re-assessment of conformity after substantial modification (Art. 43(4)). |
| **Art. 14(4)(c)–(d)** — interpret, override | Overseers must be able to correctly interpret output and decide to disregard, override, or reverse it. | An override is a first-class record: a VerificationEvent with `resolvesDispute: true` whose actor must hold an active AuthorityTrace at decision time — who overrode what, under which authority, with claim state frozen at that moment. InquiryRecord gives interpretable answers that come with receipts or admit they have none. | The oversight interface, the stop mechanism (Art. 14(4)(e)), automation-bias training, and competence of overseers. Kontour records the override; it does not provide the button. |
| **Art. 26(2)** — deployer assigns oversight | Deployers assign oversight to natural persons with competence, training, authority, and support. | AuthorityTrace is the assignment record: actor, authorityType, subject, validFrom/validUntil/revokedAt. "Who held oversight authority over this system in March" is a query, not an email archaeology project. | Selecting, training, and supporting those persons; the assignment decision itself. |
| **Art. 26(5)** — deployer monitoring and escalation | Monitor operation per instructions for use; inform provider/distributor/authority of risks and serious incidents; suspend use. | Monitoring observations land as Evidence; a risk finding is blocking Evidence driving `disputed`; the escalation decision is an attributable VerificationEvent. DerivationRules turn "is this deployment within its instructions for use" into a named, versioned, recomputable check. | Actually monitoring, the regulatory notifications, and the suspension decision. |
| **Art. 26(6)** — deployer log retention | Keep logs under deployer control at least six months. | Same as Art. 19: append-only bundles make retention a storage decision, and bundles cross the provider/deployer boundary without the receiver needing the producer's internals — the same record serves both parties' obligations. | Retention policy and storage on the deployer side. |
| **Art. 26(7), 26(11)** — informing workers and affected persons | Notify worker representatives before workplace deployment; inform persons subject to high-risk AI decisions. | Thin support only: a notification *event* can be recorded as Evidence so the fact of disclosure is attestable. | Essentially everything — the notification content, channels, timing, and legal sufficiency. This is an obligation Kontour records, not one it discharges. |

---

## Honest gaps — what the Act demands that Kontour does not provide

- **Risk management system (Art. 9).** A continuous, iterative process run by
  humans. Kontour can hold its outputs as claims and evidence; it is not the
  process and ships no risk taxonomy.
- **Data and data governance (Art. 10).** Training/validation/testing data
  quality, representativeness, bias examination. Out of scope entirely.
- **Accuracy, robustness, cybersecurity (Art. 15).** Kontour records metrics
  someone else measured. It computes trust status, not model performance.
- **Quality management system (Art. 17) and conformity assessment (Art. 43).**
  Organizational processes and (mostly internal) assessment procedures. GRC
  and audit territory; Kontour feeds them evidence.
- **EU declaration of conformity (Art. 47), CE marking (Art. 48),
  registration in the EU database (Art. 49).** Legal acts by the provider.
  No record format performs them.
- **Fundamental rights impact assessment (Art. 27)** and **serious-incident
  reporting (Art. 73).** Deployer/provider duties to authorities; Kontour can
  timestamp that they happened, nothing more.
- **No regulatory blessing of any format.** No EU instrument specifies a data
  schema for Art. 12/19 logs, and the CEN-CENELEC JTC 21 harmonized standards
  in progress (prEN 18228 risk management, prEN 18284 data governance,
  prEN 18286 QMS) specify management processes, not interchange formats.
  "Article 12-grade" is our engineering judgment about integrity properties,
  not a certification — none exists to obtain.
- **Runtime telemetry capture.** Kontour is not an observability stack. It
  turns selected telemetry and human acts into durable testimony; something
  else (OTel, CI, reviewers) has to produce the raw signal.

---

## Sources

Primary:

- Regulation (EU) 2024/1689 (EU AI Act), consolidated text on EUR-Lex:
  https://eur-lex.europa.eu/eli/reg/2024/1689/oj
- Article 12 (Record-keeping): https://artificialintelligenceact.eu/article/12/
- Article 14 (Human oversight): https://artificialintelligenceact.eu/article/14/
- Article 19 (Automatically generated logs): https://artificialintelligenceact.eu/article/19/
- Article 26 (Obligations of deployers): https://artificialintelligenceact.eu/article/26/
- Annex IV (Technical documentation): https://artificialintelligenceact.eu/annex/4/
- Council press release on the Digital Omnibus on AI provisional agreement, 7 May 2026:
  https://www.consilium.europa.eu/en/press/press-releases/2026/05/07/artificial-intelligence-council-and-parliament-agree-to-simplify-and-streamline-rules/
- European Commission AI Act implementation timeline:
  https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act
- EC AI Act standardisation (JTC 21 mandate):
  https://digital-strategy.ec.europa.eu/en/policies/ai-act-standardisation

Analysis of the Omnibus changes:

- Gibson Dunn, "EU AI Act Omnibus Agreement — Postponed High-Risk Deadlines and Other Key Changes":
  https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/
- Covington, "EU AI Act Update: Timeline Relief, Targeted Simplification, and New Prohibitions":
  https://www.insideprivacy.com/artificial-intelligence/eu-ai-act-update-timeline-relief-targeted-simplification-and-new-prohibitions/
- DLA Piper, "The Digital AI Omnibus: Proposed deferral of high risk AI obligations":
  https://knowledge.dlapiper.com/dlapiperknowledge/globalemploymentlatestdevelopments/2026/The-Digital-AI-Omnibus-Proposed-deferral-of-high-risk-AI-obligations-under-the-AI-Act

Internal:

- Kontour Trust Format specification: `surface/spec/README.md`
- Differentiation and interop: `docs/differentiation-and-interop.md`
- Trust format landscape (EU AI Act section): `docs/ideation/trust-format-landscape.md`
