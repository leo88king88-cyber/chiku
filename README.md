# Chiku: money and investing for kids (prototype)

A mobile-first, front-end prototype of a kids' money and investing app for India, built as an interview case study. Guardian-operated accounts, UPI-native, a learn → simulate → real ladder, and a one-tap graduation to the main investing platform at 18.

**All data is mock.** There is no backend, no real auth, no real PAN or bank data, and no real money. State lives in the browser (localStorage).

## What it demonstrates

| Flow | Who | What you see |
|---|---|---|
| 1. Parent onboarding and linking | Priya (parent) | Welcome, "what your child can and can never do", add child, guardian KYC "verified from your existing account" (pending and failed states), age-based control presets (or skip for safe defaults), monthly pocket money via mock UPI AutoPay, success with a child invite, second-child shortcut |
| 2. Savings goal | Aarav (9), Ananya (13) | Spend/save/share jars, picture-grid goal creation (or "ask a parent to fill in"), pocket money arriving and filling the jar, milestone and goal-complete celebrations, parent purchase approval, "pick your next goal". Late pocket money, extra-money requests with a reason, and "ask again tomorrow" |
| 3. Simulated to real investing | Rohan (16) with Priya approving | Practice with virtual ₹1,00,000, fund pages, weekly recap, honest comparison against an index fund, risk quiz, real SIP request with simulator history attached, parent approval (UPI AutoPay) or structured decline (too risky / wait / smaller amount), resubmit, SIP confirmation, graduation-at-18 teaser |

The UI adapts by age band. Aarav (8-11) gets big pictures, a mascot and almost no typing. Ananya (12-14) gets a cleaner teen layout with her own split and a "where did my money go" card. Rohan (15-17) gets a near-adult layout.

Real investing is parent-approved SIPs in curated mutual funds, delivery-based only (no derivatives, intraday, margin or crypto). *Mutual fund investments are subject to market risks.*

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build on :4173
npm run lint       # oxlint
```

Node 20+ recommended. Stack: Vite, React 19, TypeScript, Tailwind v4, React Router, Framer Motion, Zustand (persisted).

## Deploy (Vercel)

Import the repo in Vercel. Framework preset Vite is detected (build `npm run build`, output `dist`). `vercel.json` contains the SPA rewrite so deep links and refreshes work (for example `/c/invest/quiz`), and long-cache headers for hashed assets.

## UX flows: `/c/wireframe`

A design-flow page for the two core journeys, **Priya** (parent, onboarding through approving a request) and **Ananya** (child, goal through unlock).

- **Storyboard:** a swipeable strip of screens per flow, with step numbers, arrows and notes under each (what the user does, the design decision and why, states handled). State chips under a frame switch it between its states (for example KYC verified, pending, failed). A connector marks where Ananya's "ask to unlock" appears in Priya's approvals, and either end jumps to the other.
- **Wireframe / Styled:** the same components with tokens flattened to grayscale and illustrations swapped for labelled boxes.
- **Play:** opens the same screens as a clickable prototype. Switch between Priya and Ananya at any time; state is shared and persists, and the switcher lands on the open request. "Options and scenes" has scenario switches and a jump-to-scene menu that seeds any step.
- **Architecture:** one view per step (`features/wireframe/screens`), used by both the static frames and Play. A typed state machine (`machine.ts`: active → milestone → completed → unlockRequested → unlocked or declined), its own persisted store, and seeded scenes (`scenes.ts`). The live demo's data is never touched.

## The demo toolbar

On desktop the app sits in a phone frame with the toolbar beside it. On a phone the toolbar is behind the "Demo" pill at the top right.

- **Persona**: Priya, Aarav, Ananya, Rohan. Switching lands on the open item: Priya goes to approvals if anything is waiting, a child goes to their pending approval or SIP status.
- **Jump to flow**: start of each flow.
- **Scenarios**: guardian KYC (verified, pending, failed), pocket money late, auto-decline next SIP, "Next day", "Skip a week".
- **Money**: "Drop pocket money now" (active child, or all children from Priya's view) and "Birthday money +₹500 to Save".
- **Data**: "Load demo family" (Aarav, Ananya, Rohan with jars, a goal and a practice portfolio), and "Reset demo data".

## 5-minute demo script

Setup: open the app, toolbar → **Reset demo data**. Persona is **Priya**. Tip: let each celebration overlay finish (about 3 seconds) before the next tap; a drop can queue an arrival, a milestone and a goal-complete moment in a row.

**Part 1: Parent onboarding (about 1:45)**
1. Welcome → **Get started** → **Got it, continue**.
2. Type **Aarav**, choose **8 to 11 · Little saver** → **Continue**.
3. KYC shows "You're verified" from the existing account. Edge state: toolbar *Guardian KYC* → **Failed** (explains the reason, **Retry verification** moves it to pending), then set it back to **Verified** → **Continue**.
4. Controls: point out the age preset and **Why these settings?** → **Looks good** (alternatives: **Customise**, or **Skip for now, use safe defaults**).
5. Pocket money: ₹500 on the 1st → **Set up UPI AutoPay** → **PhonePe** → **Approve** → any 6-digit PIN.
6. Success screen with the invite code → **Go to dashboard**. Toolbar → **Load demo family** to bring in all three children.

**Part 2: Savings goal (about 1:45)**
7. Toolbar persona **Aarav** (big kid layout, mascot, jars). Empty state → **Pick a goal** → **Lego set** → **Yes, that's my goal!**
8. Toolbar → **Drop pocket money now**: coins fall, jars rise. Drop once more → **You did it, Aarav!** → **See it!** → **Ask Priya to buy it**.
9. Toolbar persona **Priya** (lands on Approvals) → **Approve purchase**. Toolbar persona **Aarav** (lands on "Approved!") → **Pick your next goal**.
10. Toolbar persona **Ananya** (teen layout): **Change** the split, scroll to "Where did my money go?". Toggle *Pocket money late* to show the late banner, then turn it off.
11. Ananya → **Request extra money** → ₹500 → **A gift** → **Send request**. Persona **Priya** → **Ask again tomorrow**. Persona **Ananya** (button locked) → toolbar **Next day** → **Ask again**.

**Part 3: Simulated to real SIP (about 1:30)**
12. Toolbar persona **Rohan** → **Practice portfolio** (chart, weekly recap) → **Fast-forward 1 week** → **Compare** (honest framing against the index fund) → **I'm ready for a real SIP**.
13. Quiz: **Invest a bit more**, **3 years or more**, **Growing it**, **True** → **Continue**. Keep the index fund, choose **₹500** → **Send to Priya** (simulator history attached).
14. Toolbar persona **Priya** (lands on Approvals, sees the history and risk check) → **Decline…** → **Too risky** + **Smaller amount** → **Send decision**.
15. Toolbar persona **Rohan** (sees the reasons) → **Change and resubmit** (prefilled with a lower-risk fund and the suggested amount) → **Send to Priya**.
16. Toolbar persona **Priya** → **Approve SIP** → **PhonePe** → **Approve** → PIN. Toolbar persona **Rohan** → "Your first real SIP is on!" → **What happens when I turn 18?**

## Project structure

```
src/
  app/          router (lazy screens), AppShell, PhoneFrame, error screen
  demo/         DemoToolbar, personas, smart persona routing
  store/        Zustand store (persisted), types, presets, celebration queue
  theme/        age bands (kid / teen / pro) mapped to CSS variables in index.css
  components/   ui/ (Button, Sheet, Jar, ProgressRing, LineChart…), mascot/
  features/     onboarding/  goals/  invest/  parent/  shell/
  lib/          money (₹ grouping), dates
```

Age-adaptive theming: `data-band="kid|teen|pro"` on the phone frame sets CSS variables (radius, border, sticker shadow, type scale). Components stay band-agnostic; only a few layouts (child home, goal flow) branch on the band.

## Quality notes

- Checked every screen and key state at 360, 390 and 430px for horizontal overflow, tap targets under 44px, text under 14px, and WCAG AA text contrast.
- Screens are code-split with a skeleton fallback. Unknown routes show a friendly 404. A render or chunk-load error shows a recovery screen with a reset.
- Animations use transforms and opacity, and respect the device's reduced-motion setting.
- Saved state is sanitised on load, so a corrupted localStorage cannot crash the app.

## Limitations

Mock market data (deterministic, includes large moves over long fast-forwards), fictional fund names, no real UPI, KYC or payments, and a single browser's localStorage as the "backend". No automated tests yet.
