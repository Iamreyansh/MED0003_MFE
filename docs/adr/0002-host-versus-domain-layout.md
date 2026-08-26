# ADR 0002 — Host shell versus domain layout

## Status

Accepted

## Context

The Pharmacy Portal host (MED0002) owns routing, session, navigation, and app chrome. Federating that chrome would multiply failure blast radius and duplicate session/nav logic across remotes.

## Decision

- MED0002 owns the global shell: header, sidebar, bottom nav, router, session, permissions, guards, and secrets.
- Each remote owns only domain layout: page sections, tabs, workflows, responsive feature structure, and loading/error/empty states.
- Domain layout is composed inside the remote root. It is never a second federated remote or a required extra expose.

## Consequences

- Remote failures stay isolated inside host `<main>`.
- Host still mounts a single `./Mfe` module per remote.
- New remotes must not expose `./Layout`, `./Shell`, or `./App`.
