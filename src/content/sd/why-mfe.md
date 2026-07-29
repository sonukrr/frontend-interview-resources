## The one-line mental model

> Think of MFE like a shopping mall. The **mall building** (shell) owns the entrance, signage, and security. Each **store** (MFE) is independently owned, decorated, and stocked. Stores don't talk to each other directly — they use the mall's PA system (custom events).

## The framing that sets the tone for the whole interview

State this early, unprompted:

> "MFE is **not a performance solution. It is an organizational solution.** A well-built SPA with hybrid rendering will outperform MFE on pure performance metrics. The benefit of MFE is team autonomy, independent deployments, and clear ownership boundaries."

## The problem it solves — a concrete scenario

Imagine a company with 15 product teams and 120 frontend engineers, all committing to one React monolith. The Cart team wants to ship a fix today:

**Without MFE:** Cart finishes their fix at 2pm. Payments has a broken build at 3pm. Nobody can deploy until Payments is fixed. Cart's fix ships two days late.

**With MFE:** Cart builds and deploys their own app. Payments being broken is Payments' problem. Cart ships at 2pm as planned.

### The four pains MFE removes

| Pain | What it feels like | MFE fix |
|---|---|---|
| Deploy coupling | "We can't ship until Team X fixes their bug" | Each team deploys independently |
| Tech lock-in | "We can't upgrade React — 8 teams would break" | Each MFE can move versions independently |
| Merge conflicts | 10 teams editing the same files daily | Each team has their own repo/codebase |
| No ownership | "Who owns this component?" | Team boundary = code boundary |

## When NOT to use MFE

MFE adds real complexity. Don't use it when:

- You have fewer than 3–4 teams
- One team owns the whole product
- You're just starting out — monolith first, split later when the pain is real

> Rule of thumb: **if your teams never block each other on deploys, you don't need MFE yet.**

## Requirement gathering — the questions to ask first

An interviewer scores heavily on whether you gather requirements before designing. Ask about the **current state**:

- What's the structure of the monolith? How many teams commit to the same repo?
- What's the deployment cycle, and what pain are you actually seeing?
- Current stack — frontend, SSR, CI/CD? Is there a BFF layer, and what does it do?
- Is there a common design system?

And the **target state**:

- What turnaround time do you want per team's deploy?
- Are all teams migrating at once, or phased?
- What are the availability and performance SLAs?

### A realistic answer set to anchor on (the case study used through this course)

- **Structure:** single React monolith, 15 product teams, 120 engineers, one repo. Hotel search, flights, account, loyalty, payments, coupons, deals — all one app.
- **Deployment:** fortnightly releases; any team's bug blocks everyone; 3 rollbacks last quarter.
- **Pain:** daily merge conflicts, no ownership, shared component changes break others, 3–4 week onboarding, testing one feature needs a full app spin-up.
- **Stack:** React 17, Webpack 4, Jenkins, Node BFF with hand-rolled Express SSR (no Next.js), REST.
- **Migration:** phased — 2–3 pilot teams first.
- **Target:** each MFE deploys in under 30 minutes, same-day, independently.

### NFRs to commit to out loud

| Metric | Target |
|---|---|
| Availability SLA | 99.99% |
| Page load | < 3s |
| LCP | < 1.8s |
| INP | < 100ms |
| CLS | < 0.1 |
| Independent deploy TAT | < 30 minutes |

## MVP scope — start small and safe

Pick **low-traffic, low-risk** domains for the pilot — e.g. Coupons and Deals, not Payments. Then phase:

1. **Phase 1** — simple project split, no stack change.
2. **Phase 2** — harden contracts, versioning, observability.
3. **Phase 3** — scale to the remaining teams.

This chapter is your opening five minutes. Everything after — architecture, federation, hygiene, resilience — hangs off this framing.
