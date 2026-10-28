# Lab02 Student Manual Style Contract v0.1

> Draft extracted from two accepted calibration samples. This is a short working contract for the later Whole-Manual Rewrite Proposal; it does not authorize or perform that rewrite.

## 1. Audience

Write for students following an Instructor-prepared Lab environment. Assume they can follow the commands and record observations shown in the section. Do not assume they already understand LTE／eMBMS protocol roles, packet-decoder behavior, or runtime root-cause analysis.

## 2. Core principle

**Humanization changes the reader path, not the technical truth.** Make the reason for an action and the meaning of an observation easier to follow without changing what the evidence establishes.

## 3. Preserve

- Keep formal protocol, component, error, and decoder-setting names intact. Explain a term beside its use; do not rename it for simplicity.
- Keep commands and their semantics exact, including arguments, IPs, interfaces, ports, options, and decoder preferences.
- Keep expected observations distinct from observed results, interpretation, and claims. A procedure or configuration alone is not a successful result.
- Preserve each evidence source, provenance class, time/session scope, and bounded status. Label historical incidents and reference captures as such; do not turn them into the student's current-run result.
- Retain warnings, caveats, limitations, unknowns, and stop conditions even when they make the prose longer.
- State what an observation supports and what it does not prove. Do not generalize from one capture, one frame, or one incident to every Runtime.

## 4. Rewrite

- Start with a reader anchor: what question is being answered, what just happened, or where this step fits.
- Explain why the action or check matters before or alongside the instructions.
- Tell the student what to do or look for, what they should record, and how to interpret each result.
- Replace dense transitions, unexplained jargon, and long passive explanations with a short ordered path. Keep the technical terms themselves.
- Move reviewer-facing provenance detail to a clearly labeled review note when useful, but keep the student-facing boundary that changes how the result should be understood.

## 5. Explanation / Protocol pattern

Use the parts that fit; these are prompts, not mandatory headings for every section:

1. **Why this matters** — the question this observation helps answer.
2. **What to look for / do** — the packet, field, command, or action.
3. **What you should see** — the bounded expected observation or a clearly labeled example.
4. **What it means** — the narrow conclusion supported by that observation.
5. **What it does NOT prove** — the next layer, full pipeline, or general behavior not established.

If using a reference frame or prior capture, identify it as a reference and do not imply that students must see the same frame or result in their own run.

## 6. Troubleshooting pattern

Use this decision path for symptoms and checks:

1. **What happened?** Describe the message or symptom without naming a cause.
2. **Check this first** — give the smallest bounded, relevant checks in order.
3. **Why this check matters** — say which layer or condition it examines.
4. **What the result means** — distinguish pass, fail, and unresolved results, including the time window.
5. **What it does NOT prove** — state which higher-layer outcome or root cause remains unknown.
6. **When to stop and ask Instructor** — make stop conditions explicit; do not turn the checks into an unverified repair procedure.

## 7. Forbidden transformations

- Symptom → root cause; correlation or event order → causation; reported observation → direct verification.
- One bounded run or capture → universal, repeated, stable, or guaranteed behavior.
- Address, route, ping, configuration, or decoder setup → proof of LTE／eMBMS service success.
- Reference example → student result; decoder failure or zero matches → proof that a protocol is absent.
- Formal protocol terminology → an informal replacement that changes its technical meaning.
- Shortening that removes a source label, `REPORTED_ONLY` status, warning, limitation, uncertainty, or stop condition.
- Adding a fix, restart sequence, hardware diagnosis, or performance conclusion that the accepted samples do not support.

## 8. Boundary Diff checklist

Before accepting a Humanizer rewrite, check:

- [ ] Formal terminology and command／configuration semantics are unchanged.
- [ ] Evidence source, provenance, scope, and observation status are preserved.
- [ ] Observation, interpretation, and claim remain distinct; claim strength is unchanged.
- [ ] Warnings, caveats, limitations, unknowns, and stop conditions remain present.
- [ ] No single-run result became a general expectation or guarantee.
- [ ] No symptom became a cause, and no correlation became causation.
- [ ] No unsupported fix, restart, hardware／software fault, or performance claim was added.
- [ ] The student can identify why the step matters, what to observe, and what to do when the result is unresolved.

---

## Extraction basis

- [Calibration sample 1: SIB13 → MCCH → MTCH](student-manual-golden-section-sib13-mcch-mtch.md)
- [Calibration sample 2: `Error receiving samples`](student-manual-calibration-error-receiving-samples.md)

This contract contains no third calibration pattern. The Explanation／Protocol and Troubleshooting patterns above are the two section-specific reader paths exercised by those samples.
