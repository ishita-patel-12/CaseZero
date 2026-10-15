# CaseZero
Interactive mystery investigation platform: cinematic case files, interactive crime scenes, forensic evidence discovery, clue deduction board, deduction puzzles, branching narrative with multiple endings, authentication, and persistent investigations saved per player in MongoDB.

**Stack**: React + Vite + Tailwind CSS + React Router + Lucide Icons, Express + Mongoose + JWT/bcrypt, MongoDB, Socket.IO.

---

## Quick Start

### 1. Backend Setup
```bash
cd backend
cp .env.example .env   # Configure MONGO_URI and JWT_SECRET
npm install
npm run seed           # Seeds base cases (CZ-001, CZ-002 stub, CZ-003)
npm run seed:case002   # Safe idempotent seed for CZ-002: Midnight at Blackwood Manor
npm run dev            # Starts backend on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev            # Starts Vite development server on http://localhost:5173
```

---

## Playable Cases

### CZ-001: The Vanishing Manuscript
- **Theme**: Museum heist / Archival theft
- **Difficulty**: Medium · **Estimated Time**: 40–50 min
- **Premise**: The priceless Voynich Codex vanishes from the secure rare books archive.
- **Walkthrough**:
  1. Register / Log in and open **The Vanishing Manuscript**.
  2. Search all 5 crime scene hotspots (*Wastebasket*, *Camera monitor*, *Open drawer*, *Coat rack*, *Display case*).
  3. Connect evidence on the board (*note + card*, *ticket + photo*, *schedule + photo*) to unlock forensic clues.
  4. Solve the deduction puzzle.
  5. In Story, unlock the true ending by presenting the altered signature clue.

---

### CZ-002: Midnight at Blackwood Manor
- **Theme**: Victorian locked-room mystery / Estate conspiracy
- **Difficulty**: Hard · **Estimated Time**: 55–65 min · **Outcomes**: 4 distinct endings
- **Premise**:
  During a violent storm in October 1898, Lord Reginald Blackwood is discovered dead inside his locked study. The heavy door was bolted from within and window shutters remained latched. His newly drafted will has vanished. Six individuals remain stranded under one roof.
- **6 Suspects**:
  1. **Lady Eleanor Blackwood** (Widow & co-trustee) — Hidden intentions to leave the estate; mud on slippers does not match window earth.
  2. **Dr. Simon Vale** (Family Physician) — Discrepancies in medical ledger; delivered night tonic at 21:10.
  3. **Edwin Pike** (Family Solicitor) — Diverted estate accounts threatened by the revised will's audit clause; broken brass clasp in coat.
  4. **Miriam Frost** (Housekeeper) — Heard the study bolt engage at 21:42; familiar with household routines.
  5. **Clara Blackwood** (Lord Reginald's Niece) — Piano player whose music establishes the evening's acoustic timeline.
  6. **Thomas Reed** (Groundskeeper & Generator Attendant) — Alibi at the electrical shed; boot tread does not match exterior marks.
- **9 Crime Scene Exhibits (Interactive Hotspots)**:
  1. `study_bolt` — *Study door bolt* (Wrought-iron interior bolt secured from within)
  2. `shutter_latch` — *Window shutters* (North window shutters with undisturbed dust line)
  3. `stopped_clock` — *Grandfather clock* (Stopped at 22:17; paper fragment wedged in pendulum)
  4. `cordial_glass` — *Cordial tray* (Decanter & glass with dual ring mark on silver tray)
  5. `medical_ledger` — *Physician's ledger* (Dr. Vale's dated entry and bottle seal record)
  6. `will_fragment` — *Fireplace grate* (Charred codicil fragment referencing flood-relief trust & audit)
  7. `estate_ledger` — *Writing desk ledger* (Unauthorized £2,400 transfers through Pike's legal practice)
  8. `folio_impression` — *Leather folio* (Pressure marks and rectangular clasp shape on desk blotter)
  9. `wax_trace` — *Desk blotter* (Black sealing wax with Edwin Pike's heraldic mark)
- **5 Unlockable Clues (Evidence Connections)**:
  - `will_burn`: Connect *Burned codicil fragment* + *Estate payment ledger*
  - `folio_link`: Connect *Leather folio impression* + *Black sealing wax fragment*
  - `tonic_tampered`: Connect *Half-finished cordial glass* + *Physician's treatment ledger*
  - `clock_staged`: Connect *Stopped grandfather clock* + *Interior study bolt*
  - `storm_tracks`: Connect *Window shutters* + *Interior study bolt*
- **3 Deduction Puzzles**:
  1. `audit_clause` — Decipher the surviving lines of the charred codicil to confirm the audit target (`PIKE`).
  2. `clock_pendulum` — Analyze the grandfather clock stopping mechanism and true time discrepancy (`22:17`).
  3. `seal_heraldry` — Reconstruct the legal sealing wax heraldic device (`LION RAMPANT` / `BLACKWOOD`).
- **Narrative Tree & 4 Endings**:
  - `end_widow`: **The Wrong Heir** — Accusing Lady Eleanor based on circumstantial inheritance motives.
  - `end_doctor`: **A Convenient Diagnosis** — Blaming Dr. Simon Vale for the medical discrepancy.
  - `end_partial`: **The Missing Will Recovered** — Exposing Pike's financial theft while the central death remains unresolved.
  - `end_true`: **Case Closed — The Midnight Deception** — Complete deduction proving Pike poisoned the cordial and staged the clock before Reginald locked the room himself.

---

## Database Management
- `npm run seed`: Full base dataset seed.
- `npm run seed:case002`: Safe, idempotent CZ-002 seed. Preserves existing user profiles, investigations, and other cases.

## API Endpoints
- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Cases**: `GET /api/cases`, `GET /api/cases/:id`
- **Investigations**:
  - `POST /api/investigations` — Start or resume investigation
  - `GET /api/investigations/:id` — Fetch investigation state
  - `POST /api/investigations/:id/evidence` — Search/discover scene hotspot
  - `POST /api/investigations/:id/connect` — Connect evidence on deduction board
  - `POST /api/investigations/:id/choice` — Advance narrative branch
  - `POST /api/investigations/:id/complete` — Conclude case with final outcome
- **Puzzles**:
  - `POST /api/puzzles/:id/solve` — Submit puzzle answer (verified securely on backend)
