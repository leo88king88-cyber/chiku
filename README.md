# Sikka by Upmoney: money and investing for kids (prototype)

A mobile-first, front-end prototype of a kids' money and investing app for India, built as an interview case study. Guardian-operated accounts, UPI-native, a learn → simulate → real ladder, and a one-tap graduation to the main investing platform at 18.

**All data is mock.** There is no backend, no real auth, no real PAN or bank data, and no real money. State lives in the browser (localStorage).

## What it demonstrates

Sikka by Upmoney is a **separate app** from the existing investing app, Upmoney (names live in `src/lib/brand.ts`; the sparrow mascot is still called Chiku). It uses the same login and KYC, so existing Upmoney users skip KYC and brand-new users can sign up and complete it.

| Flow | Who | What you see |
|---|---|---|
| 1. Parent onboarding and linking | Priya (parent) | A push notification on her lock screen (first screen), the Upmoney app with a Sikka banner, welcome, "what your child can and can never do", login with the Upmoney login (existing user, or new user with sign-up and a KYC form), add child (mobile number for 15+), guardian KYC (verified from the existing account, or pending/failed), age-based control presets (or skip for safe defaults), monthly pocket money via mock UPI AutoPay, success with a child invite, second-child shortcut |
| 2. Money, goals and tasks | Aarav (9), Ananya (13), on Priya's phone | A simple home that says what they have, split into **Can spend** and **Saved**; spending with the parent's limit; picture-grid goal creation (or "ask a parent to fill in"); pocket money arriving; milestone and goal-complete celebrations; parent purchase approval; **tasks** the parent sets that pay extra money when checked; an avatar they pick. Extra-money requests and "ask again tomorrow" |
| 3. Simulated to real investing | Rohan (16), on his own phone | A message from his parent on his lock screen, his own login (mobile + OTP), practice with virtual ₹1,00,000 next to a **Learn** tab of 7 short lessons (what a mutual fund is, NAV and units, SIPs, index vs active funds, risk and the riskometer, costs, time and compounding), each with a diagram and a one-question check, fund pages, weekly recap, honest comparison against an index fund, risk quiz, real SIP request with simulator history attached, parent approval (UPI AutoPay) or structured decline (too risky / wait / smaller amount), resubmit, SIP confirmation, graduation-at-18 teaser |

### How a child's screens are organised

Children see one calm home screen and a bottom tab bar, instead of everything on one page.
- **Home:** "You have ₹X", then two plain numbers: **Can spend** (ready to use today, with a Spend button) and **Saved** (kept safe for goals, opens the goal). Alerts such as a late payment or a waiting request appear on top, and there is one line for the next pocket money.
- **Tabs:** Aarav sees Home, Goal and Tasks. Ananya also gets Activity (where her money went). Rohan gets Home, Goal, Tasks and Invest (Practice and Learn).
- **Goal:** the goal and its progress. Teens choose how much of each pocket money they save; younger children are told the split their parent chose.
- **Tasks:** jobs Priya sets. The child taps "I did it", Priya checks and pays, and the reward lands in Can spend.
- **Spend:** pick what was bought and how much. It comes out of Can spend, within the monthly limit Priya set.
- **Avatar:** tap the avatar at the top of Home to pick or change it.

### Phones and logins

- **Priya's phone** is used by Priya, Aarav and Ananya. Children under 15 have no phone of their own. Priya's home is a family overview (totals, what's waiting for her, tasks) with a card per child showing three numbers (**Total**, **Spent** since the last pocket money, **Left**), the pocket money she pays, and recent spends. She adds tasks and pays them on a Tasks page, and each child's page opens from the card with **Open Aarav's page**. Inside a child's session, back never reaches Priya's screens (browser or in-app back is blocked from leaving the child area). The only way out is **Hand back to Priya**, behind her PIN (demo: any 4 digits).
- **Rohan's phone** is separate. Children aged 15 to 17 get their own phone, so the parent enters their mobile number when adding them. Rohan opens the invite message, logs in with that number and an OTP (demo: any 6 digits), picks an avatar, and can **Log out**. The invite only works for the number it was sent to.
- **Parent login:** the demo number `98765 43210` has an existing Upmoney account (KYC reused). Any other number is a new user: OTP, name, then a short KYC form (PAN in the right format plus DigiLocker consent). New KYC goes to "under review"; the demo links on that screen mark it verified or failed.

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
- **Play:** opens the same screens as a clickable prototype. Switch between Priya and Ananya at any time; state is shared and persists, and the switcher lands on the open request. "Options and scenes" has scenario switches and a jump-to-scene menu that seeds any step.
- **Architecture:** one view per step (`features/wireframe/screens`), used by both the static frames and Play. A typed state machine (`machine.ts`: active → milestone → completed → unlockRequested → unlocked or declined), its own persisted store, and seeded scenes (`scenes.ts`). The live demo's data is never touched.

## The demo toolbar

On desktop the app sits in a phone frame with the toolbar beside it, and a label above the phone says whose phone it is. On a phone the toolbar is behind the "Demo" pill at the top right.

- **Who is using the app:** Priya, Aarav, Ananya, Rohan. Switching lands on the open item (for example Priya's approvals when something is waiting). Rohan's first switch starts at his lock screen, because he has to log in.
- **Data:** **Load demo family** (Aarav, Ananya and Rohan with jars, a goal and a practice portfolio; Rohan's invite is not yet accepted) and **Reset demo data** (back to Priya's lock screen).

The old scenario switches are now part of the screens themselves: **Send ₹500 now** on Priya's dashboard replaces "drop pocket money", and small "Demo: skip to tomorrow" / "skip ahead a week" links and "Demo: mark as verified / failed" links appear where a wait or a KYC review is shown.

## 5-minute demo script

Setup: open the app and toolbar → **Reset demo data**. The first screen is Priya's lock screen. Tip: let each celebration overlay finish (about 3 seconds) before the next tap.

**Part 1: Priya signs up (about 1:45)**
1. Tap the **Upmoney** notification "Introducing Sikka by Upmoney". It opens the Upmoney app.
2. In the Upmoney app tap **Try now** on the Sikka banner.
3. Welcome → **Get started** → **Got it, continue**.
4. Login: the number is prefilled and has an existing Upmoney account → **Send OTP** → any 6 digits. (To show a new user, use any other number: OTP, name, then a KYC form.)
5. Type **Aarav**, choose **8 to 11 · Little saver** → **Continue**.
6. KYC shows "You're verified" because it reuses the Upmoney KYC → **Continue**.
7. Controls: **Looks good**. Pocket money: ₹500 on the 1st → **Set up UPI AutoPay** → **PhonePe** → **Approve** → any 6-digit PIN.
8. Success with the invite code → **Hand the phone to Aarav** → pick a buddy → **Let's go!** (Press back: it stays in Aarav's space.)

**Part 2: Money, goals and tasks on Priya's phone (about 1:45)**
9. Toolbar → **Load demo family**. Priya's home shows the whole family: a strip to open each child, totals, and a card per child with Total, Spent, Left, her monthly pocket money and recent spends.
10. **Open Aarav's page**: "You have ₹1,650" split into **Can spend** and **Saved**. Tap the avatar at the top to pick one. Tap **Spend** → **Snacks** → ₹50 → **Spend ₹50**.
11. **Tasks** tab → **Make my bed** → **I did it**. Back on **Home** scroll down → **Hand back to Priya** → PIN `1234`. Priya sees "tasks waiting" on Aarav's card → tap it → **Approve and pay**. Try **Add a task** too (pick a child, a task and a reward).
12. **Open Aarav's page** → **Saved** tile → **Pick a goal** → **Lego set** → **Yes, that's my goal!** → hand back. On Aarav's card tap **Send ₹500 now** twice, then **Open Aarav's page**: coins fall, then **You did it, Aarav!** → **See it!** → **Ask Priya to buy it** → **Back home** → hand back. Priya lands on Approvals → **Approve purchase**. **Open Aarav's page** shows "Approved!".
13. **Open Ananya's page** (teen layout, Activity tab, **Goal** tab with her saving rate) → **Ask for extra money** → ₹500 → **A gift** → **Send request** → hand back. Priya: **Ask again tomorrow**. Open Ananya's page: locked button → **Demo: skip to tomorrow** → **Ask again**.

**Part 3: Rohan on his own phone (about 1:30)**
14. Toolbar persona **Rohan** (his own phone, label above the phone changes): lock screen with a message from Priya → tap it → his number is prefilled → **Send OTP** → any 6 digits → pick a buddy → **Let's go!**
15. **Practice portfolio** (chart, weekly recap) → **Fast-forward 1 week** → **Compare**.
16. Back on the investing page tap the **Learn** tab (or the green "Learn the basics" card) → **What is a mutual fund?** → read the diagram → answer **The fund manager at the AMC** → **Next** for NAV and units. Return with **Practice**.
17. **I'm ready for a real SIP** → quiz: **Invest a bit more**, **3 years or more**, **Growing it**, **True** → **Continue** → keep the index fund, **₹500** → **Send to Priya**.
18. Toolbar persona **Priya** (lands on Approvals with his history) → **Decline…** → **Too risky** + **Smaller amount** → **Send decision**.
19. Toolbar persona **Rohan** (sees the reasons) → **Change and resubmit** → **Send to Priya**. Persona **Priya** → **Approve SIP** → **PhonePe** → **Approve** → PIN. Persona **Rohan** → "Your first real SIP is on!" → **What happens when I turn 18?**

## Project structure

```
src/
  app/          router (lazy screens), AppShell, PhoneFrame, error screen, parent login gate
  demo/         DemoToolbar, personas, smart persona routing
  store/        Zustand store (persisted), types, presets, celebration queue
  theme/        age bands (kid / teen / pro) mapped to CSS variables in index.css
  components/   ui/ (Button, Sheet, Jar, ProgressRing, LineChart…), mascot/
  features/     auth/ (mobile + OTP)  onboarding/  goals/  invest/ (incl. learn/ lessons)  parent/  shell/  wireframe/
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
