# ADR 0005 — Isolated environments and exact Terraform apply

## Status

Accepted

## Context

A single production Terraform root and a copied GitHub variable (`MFE_SITES_JSON`) drifted from live infrastructure. Production deploys did not wait on staging verification.

## Decision

- Keep three Terraform roots (`shared`, `staging`, `production`) with separate state keys. Do not use workspaces.
- Derive staging/production domains from `config/mfes.json`.
- Publish deploy targets to SSM instead of GitHub variables.
- Plan with `-detailed-exitcode`, policy-scan the JSON plan, and apply that exact checksummed binary plan.
- Production Terraform apply and MFE promotion run only after every affected-MFE staging smoke and PDT matrix leg succeeds.

## Consequences

- Developers do not copy bucket names or CloudFront IDs.
- Destructive production changes require an explicit `allow_destructive` input.
- Drift detection reports only; it never auto-applies.
