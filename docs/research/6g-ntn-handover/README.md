# 6G LEO / NTN Handover Research Parking

> **Research Parking**
>
> **Not part of current Lab01 / Lab02 validated mainline**
>
> **No real LEO / NTN runtime integration has been validated**

- Lifecycle: `RESEARCH_PARKING / CONCEPT_PROTOTYPE`
- Implementation status: `NOT_INTEGRATED`

## Purpose

This directory preserves a candidate Neuro-Symbolic RRM / Handover Supervisor
architecture for future 6G LEO / NTN research. Preservation in the Repository is
documentation only; it is not implementation, deployment, standards compliance,
or Runtime evidence.

## Research Status

A research prototype architecture has been defined. It combines an AI proposal,
a symbolic guard, dynamic trust arbitration, deterministic fallback, and
PHY-aware constraints. It is a candidate starting point for future 6G NTN / LEO
handover research.

No real LEO handover, NTN scheduler integration, srsRAN scheduler integration,
MAC / RRC mobility control, or Doppler compensation has been implemented or
validated by this documentation.

## Core Architecture

The candidate flow is:

`PHY/MAC Telemetry` → `Observation Builder` → `AI Agent` → `AIProposal` →
`SymbolicGuard` → `DynamicArbitrator lambda(t)` → `RRMAction` →
`Protocol Adapter` → `MAC / RRC / Scheduler / Mobility Execution`

The architecture keeps AI output at proposal level. Protocol causality and PHY
conditions can veto a proposal, and arbitration selects either the accepted
proposal or a deterministic fallback.

## Implementation Roadmap

- **Phase A — Pure Simulator:** evaluate the architecture with synthetic orbit,
  link, mobility, and handover observations.
- **Phase B — 5G SDR Observability Integration:** evaluate whether existing
  non-sensitive logs and metrics can map into research observation structures.
- **Phase C — RRM / Handover Adapters:** evaluate adapters only after separate
  design, implementation, safety, and review authorization.

All three phases are future candidates, not current implementation status.

## Relation to Current 5G SDR

The current project may provide future observability references such as
srsRAN / srsLTE logs, PHY and MAC metrics, RRC events, packet observations, and
ZeroMQ timing. This directory does not claim those sources are already mapped,
available for this research, or integrated with an NTN model. It changes no
Lab01 / Lab02 Runtime, configuration, scheduler, source code, or validation
record.

## Current Limitations

- No 3GPP NTN compliance claim.
- No real LEO / NTN handover implementation.
- No srsRAN scheduler integration.
- No MAC / RRC mobility-control implementation.
- No validated real Doppler compensation.
- No accepted bridge to another RAN control architecture; any such bridge
  requires a separate research intake and decision.

## Entry Documents

- [Neuro-Symbolic RRM and Handover Supervisor for 6G LEO / NTN](neuro_symbolic_rrm_handoff.md)
  — substantive architecture, state-machine constraints, edge cases, conceptual
  pseudocode, and candidate roadmap.
