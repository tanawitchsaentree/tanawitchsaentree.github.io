---
name: safety-critical-design-review
description: Reviews UI/UX designs, control panels, dashboards, confirmation flows, or any interface where a mistake has real consequences (safety, financial, irreversible, or high-harm), using human-factors failure patterns documented in real accidents (Casey's Set Phasers on Stun — Therac-25, Three Mile Island, cockpit redesigns, Torrey Canyon, Bhopal). Trigger whenever the user designs or reviews a safety-critical or high-stakes interface, an irreversible action, an alert/alarm system, or a redesign of a familiar interface, or needs to justify a specific UI decision to stakeholders.
---

# Safety-Critical Design Review

Human error is usually a symptom of bad design, not the root cause. Check any interface with real consequences against the five failure patterns below before it ships.

## Checklist

| Pattern | Check | Fix if failing |
|---|---|---|
| Real-state feedback (Three Mile Island) | Does every indicator show actual system state, not just the command sent? | Wire the indicator to the confirmed result, not the request |
| Irreversible-action safeguard (Therac-25) | Is there an independent safeguard for irreversible/high-harm actions, not software-only logic? | Add a hardware or architecturally-separate check; never let one code path be the only thing standing between the action and harm |
| Mode visibility (Torrey Canyon) | Is the current operating mode always visible, not just shown at the moment of switching? | Add a persistent mode indicator, not a transient toast |
| Muscle-memory transition (Rental Car) | If this redesigns a familiar interface, is there a transition/retraining plan? | Phase the change, or keep the trained action mapped the same way even if the visuals change |
| Alarm signal-to-noise (Bhopal) | What's the false-positive rate of this alert? | If high, raise the threshold or remove the alert — a noisy alarm trains people to ignore all alarms |

## Output format
Table of Pattern → Status (✅/⚠️/❌) → Fix, same rows as above. Then, if requested, produce a short **defense statement**: one sentence per failing-turned-fixed pattern, naming the real incident it maps to, suitable for justifying the decision to a stakeholder (e.g., "This needs a separate confirmation step because software-only safeguards is exactly what failed in the Therac-25 case").

## Guardrail
Don't add confirmation steps or alerts anywhere the consequence doesn't warrant it — over-applying these patterns creates its own alarm-fatigue problem. Calibrate friction to actual severity, and say so explicitly when a pattern doesn't apply.
