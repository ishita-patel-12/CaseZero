import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Case, Evidence, Clue, Puzzle, Node } from './models/index.js';

export async function safeSeed() {
  console.log('[SafeSeed] Starting non-destructive database initialization...');

  // 1. Seed default users ONLY if they do not exist (preserves any existing users)
  const existingUsersCount = await User.countDocuments();
  if (existingUsersCount === 0) {
    console.log('[SafeSeed] No users found. Creating default admin and detective accounts...');
    const passwordHash = await bcrypt.hash('password123', 10);
    await User.create([
      {
        username: 'Lead Investigator',
        email: 'admin@casezero.io',
        password: passwordHash,
        role: 'admin'
      },
      {
        username: 'Detective Holmes',
        email: 'detective@casezero.io',
        password: passwordHash,
        role: 'player'
      }
    ]);
    console.log('[SafeSeed] Default accounts created (admin@casezero.io / detective@casezero.io).');
  } else {
    console.log(`[SafeSeed] Existing user records detected (${existingUsersCount} user(s)). Existing users left untouched.`);
  }

  // 2. Upsert Case CZ-001: The Vanishing Manuscript
  const cz001Data = {
    title: 'The Vanishing Manuscript',
    caseNumber: 'CZ-001',
    theme: 'archive',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    possibleOutcomes: 3,
    status: 'open',
    description: 'A priceless manuscript disappears from a high-security vault hours before an international exhibition.',
    briefing: 'The Aldermere Codex was locked in Vault 3 at 21:30. By morning the case was empty and the electronic perimeter alarm never sounded. Four individuals held security clearance to the archive wing. One of them is orchestrating a deception.',
    suspects: [
      {
        id: 's_curator',
        name: 'Margaret Halloran',
        role: 'Chief Museum Curator',
        avatar: 'curator',
        alibi: 'Claims she was working in her office until 22:00, then left through the staff entrance.',
        motive: 'Disputed insurance payout and escalating debts from private art auctions.',
        opportunity: 'Possessed primary keycard #A-114 and vault combination.',
        notes: 'Handwriting analysis shows distinctive looped "M". Insists her security access card was stolen or cloned.',
        suspicionLevel: 'High'
      },
      {
        id: 's_archivist',
        name: 'Arthur Vance',
        role: 'Senior Vault Archivist',
        avatar: 'archivist',
        alibi: 'Stated he departed the premises at 20:30 before general lock-up.',
        motive: 'Recently denied promotion; known contact in black-market antiquities antiquarian circles.',
        opportunity: 'Had access to the curator\'s desk drawer and blank museum letterhead.',
        notes: 'Unexplained train travel receipts and ledger discrepancies in the restoration budget.',
        suspicionLevel: 'Critical'
      },
      {
        id: 's_courier',
        name: 'Gregory Voss',
        role: 'Antique Dealer & Courier',
        avatar: 'courier',
        alibi: 'No registered address; spotted at Alder Station boarding the 22:15 westbound train.',
        motive: 'Hired courier paid to transport high-value contraband across county lines.',
        opportunity: 'Captured on lobby security cameras carrying a flat leather case at 21:47.',
        notes: 'A train ticket to Alder Station with his name pencilled on the reverse was discarded on the museum coat rack.',
        suspicionLevel: 'High'
      },
      {
        id: 's_guard',
        name: 'Donald Burke',
        role: 'Night Shift Guard',
        avatar: 'guard',
        alibi: 'Conducted scheduled security perimeter rounds at 20:30 and 22:30.',
        motive: 'Low salary, but no criminal record or suspicious transactions found.',
        opportunity: 'Controlled the alarm bypass logs and guard station monitors.',
        notes: 'Confirmed perimeter doors were electronically sealed at 21:30 as protocol dictated.',
        suspicionLevel: 'Low'
      }
    ],
    timeline: [
      { id: 't1', time: '20:30', title: 'Archive Public Wing Closes', description: 'Visitors escorted out. Daytime staff clock out. Archivist Arthur Vance claims to have left.', unlockedBy: null },
      { id: 't2', time: '20:58', title: 'Keycard #A-114 Scanned', description: 'Access card registered to Curator Margaret Halloran is scanned at the East Wing corridor.', unlockedBy: 'card' },
      { id: 't3', time: '21:00', title: 'Vault Inspection Scheduled', description: 'Torn schedule notes Curator Halloran scheduled to inspect Vault 3 codex seal.', unlockedBy: 'schedule' },
      { id: 't4', time: '21:30', title: 'Automated Facility Lock-Up', description: 'Heavy security doors locked. Night security system active until morning shift.', unlockedBy: 'schedule' },
      { id: 't5', time: '21:47', title: 'Lobby Camera Anomaly', description: 'Security camera captures a visitor in a grey coat carrying a flat case toward Vault 3.', unlockedBy: 'photo' },
      { id: 't6', time: '22:15', title: 'Alder Station Train Departs', description: 'Westbound express train leaves city terminal. Voss confirmed on passenger manifest.', unlockedBy: 'ticket' },
      { id: 't7', time: '22:30', title: 'Guard Rounds & Vault Breach Discovered', description: 'Night guard arrives at Vault 3. Vault door is unlocked from inside, glass case shattered, Codex absent.', unlockedBy: null }
    ]
  };

  const case1 = await Case.findOneAndUpdate(
    { caseNumber: 'CZ-001' },
    { $set: cz001Data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // CZ-001 Evidence
  const c1Evidence = [
    { key: 'schedule', title: 'Torn exhibition schedule', type: 'document', hotspot: 'Wastebasket by the desk', importance: 'high', description: 'Half a printed museum schedule crumpled in the office wastebasket.', content: 'Doors locked 21:30. Night guard rounds resume 22:30. Curator M. Halloran to inspect Vault 3 at 21:00.', metadata: { location: 'Curator Office - Wastebasket', condition: 'Torn & creased', printedDate: '24-OCT 18:00', documentId: 'SCH-884' } },
    { key: 'photo', title: 'Security photograph', type: 'photograph', hotspot: 'Camera monitor', importance: 'critical', description: 'Grainy surveillance still captured from Lobby Camera B.', content: 'Timestamp 21:47. A visitor in a grey coat carries a flat leather case toward Vault 3. Their face is turned away.', metadata: { camera: 'Lobby B - East Angle', time: '21:47:04', fps: '8 fps analogue', sensor: 'B/W Low-Light CCTV' } },
    { key: 'note', title: 'Handwritten note', type: 'document', hotspot: 'Open drawer', importance: 'high', description: 'Hastily scribbled message on official museum letterhead, found slipped under the vault door.', content: '"Vault 3 before the bells. Bring the case. — E. Halloran"', metadata: { paper: 'Aldermere Museum Watermark', ink: 'Iron gall fountain pen', signature: 'E. Halloran (Erratic slant)' } },
    { key: 'ticket', title: 'Train ticket', type: 'object', hotspot: 'Coat rack', importance: 'medium', description: 'Single-fare railway ticket from Central to Alder Station.', content: 'Departs 22:15. Purchased in cash. Pencilled on the back: "Ask for Voss."', metadata: { origin: 'Grand Central', destination: 'Alder Station Platform 4', departure: '22:15', fare: 'Cash receipt #4028' } },
    { key: 'card', title: 'Museum access card #A-114', type: 'digital', hotspot: 'Display case', importance: 'high', description: 'Electronic magnetic keycard belonging to senior museum administration.', content: 'Issued to Margaret Halloran, curator. Last used 20:58. Registered signature: "M. Halloran", looped M.', metadata: { cardId: 'A-114', holder: 'Margaret Halloran', accessTier: 'Tier 1 - Master Vault', rfidFrequency: '13.56 MHz Encrypted' } }
  ];
  for (const ev of c1Evidence) {
    await Evidence.findOneAndUpdate({ caseId: case1._id, key: ev.key }, { $set: { caseId: case1._id, ...ev } }, { upsert: true });
  }

  // CZ-001 Clues
  const c1Clues = [
    { key: 'inside', title: 'Someone was inside after lock-up', description: 'The perimeter doors locked at 21:30, yet a visitor appears on camera inside the vault corridor at 21:47.', relatedEvidence: ['schedule', 'photo'] },
    { key: 'forged', title: 'The signature was altered', description: 'The conspirator\'s note is signed "E." but Curator Halloran\'s official access card is signed "M." with an ornate looped M. Someone deliberately forged her handwriting.', relatedEvidence: ['note', 'card'] },
    { key: 'route', title: 'The visitor left by train', description: 'The visitor carrying the flat leather case had a ticket departing for Alder Station at 22:15. The manuscript was smuggled out of town immediately.', relatedEvidence: ['ticket', 'photo'] }
  ];
  for (const cl of c1Clues) {
    await Clue.findOneAndUpdate({ caseId: case1._id, key: cl.key }, { $set: { caseId: case1._id, ...cl } }, { upsert: true });
  }

  // CZ-001 Puzzles
  const c1Puzzles = [
    {
      key: 'who',
      title: 'Who could have entered?',
      type: 'deduction',
      question: 'Doors locked automatically at 21:30, yet the camera recorded an intruder at 21:47. Which explanation reconciles every physical piece of evidence?',
      options: [
        'The curator forged a note and let a visitor in after lock-up',
        'The guard removed the manuscript during his 22:30 rounds',
        'The manuscript was never in the vault',
        'The alarm failed and no one was inside'
      ],
      answer: 0,
      hints: [
        'Compare the photograph timestamp (21:47) with the lock-up time on the schedule (21:30).',
        'Look at which staff member had access before the doors were sealed.'
      ],
      grantsClue: 'inside'
    }
  ];
  for (const pz of c1Puzzles) {
    await Puzzle.findOneAndUpdate({ caseId: case1._id, key: pz.key }, { $set: { caseId: case1._id, ...pz } }, { upsert: true });
  }

  // CZ-001 Narrative Nodes
  const c1Nodes = [
    { key: 'start', title: 'The empty case', content: 'Vault 3 is eerily silent. A faint rectangular dust outline marks where the 14th-century Aldermere Codex lay only hours ago. You stand at the threshold with your investigation team. You can confront Curator Halloran in her office or trace the stranger captured on the lobby security cameras.', choices: [{ text: 'Question the curator', to: 'curator' }, { text: 'Follow the visitor', to: 'visitor', requiresClue: 'route' }] },
    { key: 'curator', title: 'Halloran’s office', content: 'Margaret Halloran sits behind a mahogany desk. She is composed—unnervingly so. When questioned, she adamantly denies writing the note found under the vault door and hands over her access card without hesitation. "Someone is setting me up," she whispers.', choices: [{ text: 'Accuse the curator', to: 'end_wrong' }, { text: 'Trace the ticket instead', to: 'visitor', requiresClue: 'route' }] },
    { key: 'visitor', title: 'Alder Station Platform', content: 'Rain beats down on the train platform. The stationmaster distinctly recalls a man in a grey coat answering to the name Gregory Voss. Your team intercepts Voss, but his leather case contains only blank parchment and lead weights. Someone else took the genuine Codex.', choices: [{ text: 'Arrest the visitor', to: 'end_partial' }, { text: 'Confront the archivist with the forged signature', to: 'end_true', requiresClue: 'forged' }] },
    { key: 'end_wrong', title: 'Framed: Wrong Suspect', ending: true, outcome: 'You arrested Curator Halloran on circumstantial evidence. During her arraignment, forensic handwriting analysts proved her signature was forged. Halloran was fully exonerated, but the real conspirator escaped with the Aldermere Codex to an unlisted private buyer.', content: 'The forgery was a masterclass in misdirection, and your team walked straight into the trap.' },
    { key: 'end_partial', title: 'Half the Truth: The Courier Fallen', ending: true, outcome: 'You captured Gregory Voss, the hired courier. Under interrogation, Voss confesses he was paid two thousand pounds in cash to carry the dummy case to Alder Station as a decoy. The mastermind behind the theft remains anonymous, and the real Codex was never recovered.', content: 'Voss was merely a pawn on the board. The real kingpin remains in the shadows.' },
    { key: 'end_true', title: 'Case Closed: Complete Conviction', ending: true, outcome: 'The archivist Arthur Vance broke under questioning when confronted with the forged letterhead and the flawed "M" signature. Vance copied Halloran\'s credentials, unlocked Vault 3 before 21:30, used Voss as an oblivious decoy, and stashed the genuine Codex inside the archive bindery. The manuscript is restored to the museum.', content: 'Flawless deduction. The distinctive looped M in the curator’s authentic signature shattered Vance’s alibi.' }
  ];
  for (const nd of c1Nodes) {
    await Node.findOneAndUpdate({ caseId: case1._id, key: nd.key }, { $set: { caseId: case1._id, ...nd } }, { upsert: true });
  }
  console.log('[SafeSeed] Case CZ-001 (The Vanishing Manuscript) initialized.');

  // 3. Upsert Case CZ-002: Midnight at Blackwood Manor (Full playable case)
  const cz002Data = {
    title: 'Midnight at Blackwood Manor',
    caseNumber: 'CZ-002',
    theme: 'manor',
    difficulty: 'Hard',
    estimatedTime: '55–65 min',
    possibleOutcomes: 4,
    status: 'open',
    description: 'A violent storm isolates Blackwood Manor from the surrounding village. Shortly before midnight, Lord Reginald Blackwood is discovered dead inside his study, its heavy door bolted from within. The shutters remain latched. There is no obvious route by which an intruder could have escaped. His newly signed will has disappeared.',
    briefing: "At 23:55 on an October night in 1898, servants forced open Lord Reginald Blackwood's study after he failed to answer the midnight bell.\n\nHe was dead at his desk. The bolt had been secured from inside. Both window shutters were latched. His final will, signed earlier that evening, could not be found.\n\nThe storm has washed out the manor road, leaving six people trapped under one roof.\n\nThe household agrees on almost nothing about the last two hours. One account places the physician in the east corridor. Another places the solicitor in the library. The grandfather clock stopped at 22:17, yet its mechanism appears undamaged.\n\nYour task is to reconstruct the last evening, locate the missing will, expose any deliberate deception, and establish who is responsible for what happened.",
    suspects: [
      { id: 's_widow', name: 'Lady Eleanor Blackwood', role: 'Widow and co-trustee of the Blackwood estate', avatar: 'widow', alibi: 'Claims she remained in the conservatory after an argument with Reginald and never returned to the study.', motive: 'The missing will appears to remove her control over several estate properties.', opportunity: 'She had visited the study earlier that evening and understood Reginald\'s private routines.', notes: 'Her silk slippers have a trace of wet soil, but the soil does not match the disturbed earth near the study window. She conceals the fact that she planned to leave the estate.', suspicionLevel: 'High' },
      { id: 's_physician', name: 'Dr. Simon Vale', role: 'Family physician and personal friend', avatar: 'physician', alibi: 'States he delivered a night draught at 21:10 and spent the remainder of the evening in the library.', motive: 'Disputed treatment records and rumours that Lord Reginald planned to seek another medical opinion.', opportunity: 'Free movement through the east corridor and unattended access to the study desk.', notes: 'His ledger shows an altered entry for the October prescription. He was heard in sharp conversation with Reginald before dinner.', suspicionLevel: 'High' },
      { id: 's_solicitor', name: 'Edwin Pike', role: 'Family solicitor and executor', avatar: 'solicitor', alibi: 'Claims he was drafting codicils in the small parlour and retired early.', motive: 'The revised will included an audit clause that would expose unauthorised transfers from the estate trust.', opportunity: 'Brought the revised documents to the manor himself and held the original draft papers.', notes: 'A brass folio clasp was found damaged in his travelling coat. He denies having opened Reginald\'s private safe.', suspicionLevel: 'Critical' },
      { id: 's_housekeeper', name: 'Miriam Frost', role: 'Senior housekeeper', avatar: 'housekeeper', alibi: 'Supervised the secure latching of exterior shutters and pantry doors between 21:00 and 22:30.', motive: 'Fears dismissal under the terms of a new trust that would reduce household staff.', opportunity: 'Possesses keys to all interior household doors, excluding Reginald\'s private study bolt.', notes: 'Heard the study bolt shoot into place at 21:42. Her account of the corridor sounds is unusually precise.', suspicionLevel: 'Medium' },
      { id: 's_niece', name: 'Clara Blackwood', role: 'Niece and aspiring painter', avatar: 'niece', alibi: 'Claims she was practicing the piano in the music room throughout the storm.', motive: 'Stands to lose an inheritance allowance if Reginald\'s charitable trust was ratified.', opportunity: 'The music room adjoins the conservatory corridor and provides a clear view of the study doorway.', notes: 'Her piano playing stopped abruptly at 22:15, fifteen minutes before the generator failed.', suspicionLevel: 'Medium' },
      { id: 's_steward', name: 'Thomas Reed', role: 'Estate steward and generator attendant', avatar: 'steward', alibi: 'Was tending to the failing petrol generator in the outbuilding from 22:00 onward.', motive: 'Bitter over docked wages following a flood that damaged the estate stables.', opportunity: 'Understood the layout of the manor\'s exterior service ladders and cellar vents.', notes: 'His work coat carries grease and peat moss, but the cellar vent beneath the study shows no fresh disturbance.', suspicionLevel: 'Low' }
    ],
    timeline: [
      { id: 'bt1', time: '20:45', title: 'Lord Reginald Retires to the Study', description: 'Lord Reginald leaves the dinner table abruptly and requests that his evening tea and cordial be brought to the study.', unlockedBy: null },
      { id: 'bt2', time: '21:10', title: 'Tonic Delivered', description: 'Dr. Simon Vale records the delivery of the regular household night tonic. The bottle is sealed before it is left for the household.', unlockedBy: 'medical_ledger' },
      { id: 'bt3', time: '21:26', title: 'Solicitor Enters the Study', description: 'Edwin Pike is seen entering the study carrying a leather document folio. The visit is brief and its full purpose is not disclosed in his account.', unlockedBy: 'folio_impression' },
      { id: 'bt4', time: '21:42', title: 'Study Bolt Secured', description: 'The housekeeper Miriam Frost reports hearing the heavy study bolt slide into position from the corridor outside.', unlockedBy: 'study_bolt' },
      { id: 'bt5', time: '22:17', title: 'Grandfather Clock Stops', description: 'The manor\'s grandfather clock ceases to function, displaying the time 22:17. The mechanism will later be found to have been deliberately stopped.', unlockedBy: 'stopped_clock' },
      { id: 'bt6', time: '23:03', title: 'Generator Fails', description: 'The electrical generator fails during the height of the storm. Thomas Reed is at the generator shed. The manor is plunged into partial darkness.', unlockedBy: null },
      { id: 'bt7', time: '23:55', title: 'Study Forced Open', description: 'Servants force the study door after Lord Reginald fails to answer the midnight bell. He is found dead at his desk. The signed will is nowhere in the room.', unlockedBy: null }
    ]
  };

  const case2 = await Case.findOneAndUpdate(
    { caseNumber: 'CZ-002' },
    { $set: cz002Data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // CZ-002 Evidence (9 exhibits)
  const c2Evidence = [
    { key: 'study_bolt', title: 'Interior study bolt', type: 'physical', hotspot: 'Study door bolt', importance: 'Critical', description: 'The heavy study bolt recovered when servants forced the door.', content: 'The bolt was intact and had been engaged from inside. The physical marks are inconsistent with the idea that it was simply pulled back from the outside after the door closed. Examination confirms the locking was deliberate and could not have been operated through the door gap.', metadata: { location: 'Study door — interior face', condition: 'Intact; no signs of forced retraction', material: 'Wrought iron, period-original fitment' } },
    { key: 'shutter_latch', title: 'Window shutters', type: 'physical', hotspot: 'Window shutters', importance: 'High', description: "The study's heavy interior window shutters.", content: 'Their dust line remains largely undisturbed. The latch does not show evidence of a recent forced opening, and the exterior ledge does not support the theory of an escape through the window.', metadata: { location: 'Study — north-facing window', condition: 'Latched; dust pattern intact', material: 'Painted oak with iron latch' } },
    { key: 'stopped_clock', title: 'Stopped grandfather clock', type: 'physical', hotspot: 'Grandfather clock', importance: 'Critical', description: 'A clock showing 22:17 when discovered.', content: 'Inspection reveals that a small piece of paper was deliberately wedged into the pendulum mechanism, preventing the pendulum from completing its arc. The clock was stopped manually.', metadata: { location: 'Study — east corner, beside the bookcase', condition: 'Hands fixed at 22:17; pendulum wedged' } },
    { key: 'cordial_glass', title: 'Half-finished cordial glass', type: 'physical', hotspot: 'Cordial tray', importance: 'Critical', description: 'A half-finished glass recovered near the writing desk.', content: 'Residue on the glass and irregular marks near the decanter indicate that the drink deserves further examination. A second ring mark on the tray suggests it was lifted and returned.', metadata: { location: 'Writing desk — silver cordial tray', condition: 'Partially consumed' } },
    { key: 'medical_ledger', title: "Physician's treatment ledger", type: 'document', hotspot: "Physician's ledger", importance: 'High', description: "Dr. Vale's record of the evening's visit.", content: "The entry records the regular night tonic delivered at 21:10. Additional notes establish that the bottle had been sealed before it was left for the household.", metadata: { location: "Dr. Vale's medical bag", condition: 'Leather-bound', entryTime: '21:10' } },
    { key: 'will_fragment', title: 'Burned codicil fragment', type: 'document', hotspot: 'Fireplace grate', importance: 'Critical', description: 'A partially burned document recovered from the fireplace.', content: "The surviving words refer to transferring estate income to a local flood-relief trust and ordering an audit of estate payments 'at first light'.", metadata: { location: 'Study fireplace grate', condition: 'Partially destroyed; edges carbonised' } },
    { key: 'estate_ledger', title: 'Estate payment ledger', type: 'document', hotspot: 'Writing desk ledger', importance: 'Critical', description: 'A ledger of transfers from the Blackwood estate.', content: "Repeated payments have been routed through Pike's legal practice under an obsolete authorisation dating to 1891. The supporting documentation for three significant transfers is missing.", metadata: { location: 'Writing desk — open to October 1898 entries', condition: 'Leather-bound; entries legible' } },
    { key: 'folio_impression', title: 'Leather folio impression', type: 'physical', hotspot: 'Leather folio', importance: 'High', description: 'Pressure marks left on the desk blotter after papers and a leather document folio were removed.', content: "The impression preserves parts of the heading for the final codicil and the shape of the missing folio clasp in the blotter's soft surface. The clasp shape corresponds to a broken brass fitting later found in Pike's coat pocket.", metadata: { location: 'Writing desk blotter — left quadrant', condition: 'Blotter impression' } },
    { key: 'wax_trace', title: 'Black sealing wax fragment', type: 'physical', hotspot: 'Desk blotter', importance: 'High', description: 'A small fragment of black sealing wax recovered beside the blotter.', content: "The partial seal impression is consistent with the distinctive seal used on Edwin Pike's legal documents. Pike uses black wax exclusively and a personalised heraldic seal stamp.", metadata: { location: 'Writing desk blotter — right edge, near inkwell', condition: 'Partially broken' } }
  ];
  for (const ev of c2Evidence) {
    await Evidence.findOneAndUpdate({ caseId: case2._id, key: ev.key }, { $set: { caseId: case2._id, ...ev } }, { upsert: true });
  }

  // CZ-002 Clues (5 clues)
  const c2Clues = [
    { key: 'sealed_room', title: 'The room was sealed from within', description: 'The evidence rules out the obvious escape routes. The locked room was real, not an elaborate door trick.', type: 'critical', relatedEvidence: ['study_bolt', 'shutter_latch'] },
    { key: 'tonic_tampered', title: "The drink's timeline does not fit", description: 'The sealed tonic was delivered before the solicitor\'s private visit. The drink\'s later condition establishes a plausible opportunity for tampering.', type: 'critical', relatedEvidence: ['cordial_glass', 'medical_ledger'] },
    { key: 'will_motive', title: 'The missing will reveals a motive', description: "The revised will demanded an audit that would expose suspicious transfers involving Pike's legal practice.", type: 'critical', relatedEvidence: ['will_fragment', 'estate_ledger'] },
    { key: 'pike_link', title: "The solicitor's papers were inside the study", description: "The folio marks and distinctive black seal link Pike's documents to the study desk.", type: 'critical', relatedEvidence: ['folio_impression', 'wax_trace'] },
    { key: 'clock_staged', title: 'The apparent time was staged', description: "The grandfather clock had been deliberately stopped rather than disabled by the power failure.", type: 'critical', relatedEvidence: ['stopped_clock', 'wax_trace'] }
  ];
  for (const cl of c2Clues) {
    await Clue.findOneAndUpdate({ caseId: case2._id, key: cl.key }, { $set: { caseId: case2._id, ...cl } }, { upsert: true });
  }

  // CZ-002 Puzzles (3 puzzles)
  const c2Puzzles = [
    { key: 'locked_room', title: 'The Locked-Room Reconstruction', type: 'deduction', question: 'The door was bolted from inside and the shutters remained closed. Which explanation best fits the physical evidence?', options: ['Pike escaped through an undiscovered chimney passage.', 'Blackwood secured the door himself after the decisive encounter; the locked room does not prove that nobody harmed him beforehand.', 'Eleanor used a hidden external mechanism to operate the bolt.', 'The generator outage opened the shutters.'], answer: 1, hints: ['Compare the condition of the bolt with the marks around the window latches.', 'Consider whether the perpetrator needed to enter or leave after the room was secured.'], grantsClue: 'sealed_room' },
    { key: 'missing_will', title: 'The Missing Will', type: 'deduction', question: 'Which explanation best connects the missing will to the financial records?', options: ['The housekeeper removed it to protect the staff cottages.', 'Clara misplaced it while searching for family correspondence.', "Pike removed the revised will because its audit provisions threatened to expose suspicious estate transfers.", 'Thomas destroyed it while repairing the generator.'], answer: 2, hints: ['Look at what the surviving codicil demands happens at first light.', "Compare the estate ledger with the solicitor's documented access to the study."], grantsClue: 'will_motive' },
    { key: 'false_time', title: 'The False Time', type: 'deduction', question: 'Why cannot the stopped grandfather clock establish the time of death?', options: ['The storm caused every clock in the manor to stop.', 'The mechanism was deliberately wedged, so the displayed time was staged.', 'The clock was always seventeen minutes slow.', 'Blackwood had forgotten to wind it.'], answer: 1, hints: ['The generator powers the lights, not the clockwork pendulum.', 'Inspect the paper recovered from the mechanism and compare its traces with the other evidence.'], grantsClue: 'clock_staged' }
  ];
  for (const pz of c2Puzzles) {
    await Puzzle.findOneAndUpdate({ caseId: case2._id, key: pz.key }, { $set: { caseId: case2._id, ...pz } }, { upsert: true });
  }

  // CZ-002 Narrative Nodes
  const c2Nodes = [
    { key: 'start', title: 'The Locked Study', ending: false, outcome: null, content: "You enter the study after the servants have forced the door. Reginald lies motionless behind his desk. The shutters remain secured, the grandfather clock reads 22:17, and the revised will is nowhere to be found.", choices: [{ text: 'Reconstruct the physical crime scene', to: 'study', requiresClue: null }, { text: 'Question those trapped in the manor', to: 'interviews', requiresClue: null }] },
    { key: 'study', title: 'Nothing Left by Accident', ending: false, outcome: null, content: "The room looks undisturbed, but its details disagree. The bolt is genuine, the window is sealed, and the drink near the desk appears to have been disturbed. A piece of paper has been wedged into the grandfather clock.", choices: [{ text: 'Accuse Dr. Vale based on the medical evidence', to: 'end_doctor', requiresClue: null }, { text: 'Compare the glass with the physician\'s ledger', to: 'medical', requiresClue: 'tonic_tampered' }, { text: 'Investigate the missing will and accounts', to: 'will', requiresClue: 'will_motive' }] },
    { key: 'interviews', title: 'Six Accounts, One Timeline', ending: false, outcome: null, content: "Every person in the manor has a reason to fear the contents of the missing will. Eleanor resented its implications. Clara risks losing her inheritance. Dr. Vale controls the medical record. Miriam knows the household's routines.", choices: [{ text: 'Accuse Eleanor of destroying the will', to: 'end_widow', requiresClue: null }, { text: 'Re-examine the cordial and medical records', to: 'medical', requiresClue: 'tonic_tampered' }, { text: 'Trace the legal documents and missing will', to: 'will', requiresClue: 'will_motive' }] },
    { key: 'medical', title: 'Before the Door Was Locked', ending: false, outcome: null, content: "The timing of the sealed tonic and the solicitor's private visit creates a crucial interval. Whoever tampered with the drink did not need to escape from a room that was later locked from inside.", choices: [{ text: "Trace the seal and folio marks to Pike", to: 'confront_pike', requiresClue: 'pike_link' }, { text: 'Arrest the physician without further corroboration', to: 'end_doctor', requiresClue: null }, { text: "Examine the missing will's financial implications", to: 'will', requiresClue: 'will_motive' }] },
    { key: 'will', title: 'The Last Codicil', ending: false, outcome: null, content: "The fragment from the fireplace records a proposed transfer of the estate's income and a financial audit at first light. The estate ledger contains transfers that cannot be adequately explained.", choices: [{ text: 'Confront Pike using the folio and seal evidence', to: 'confront_pike', requiresClue: 'pike_link' }, { text: 'Recover the documentary evidence but stop short of a murder accusation', to: 'end_partial', requiresClue: null }, { text: 'Return to the medical evidence before making a conclusion', to: 'medical', requiresClue: 'tonic_tampered' }] },
    { key: 'confront_pike', title: "The Solicitor's Account", ending: false, outcome: null, content: "Pike insists that the folio contained only routine papers. The physical impression, wax fragment, and missing will contradict his account.", choices: [{ text: 'Use the staged clock to reconstruct the final minutes', to: 'clock_review', requiresClue: 'clock_staged' }, { text: 'Secure the will but leave the death unexplained', to: 'end_partial', requiresClue: null }] },
    { key: 'clock_review', title: 'The Last Seventeen Minutes', ending: false, outcome: null, content: "The clock was stopped manually, and the power failure is a false explanation. The stopped mechanism, Pike's access to the legal papers, the financial motive, and the drink's timeline now point toward a single sequence of deliberate deception.", choices: [{ text: 'Present the full chain of evidence and charge Pike', to: 'end_true', requiresClue: 'tonic_tampered' }, { text: 'Close the financial investigation but leave the cause of death unresolved', to: 'end_partial', requiresClue: null }] },
    { key: 'end_widow', title: 'The Wrong Heir', ending: true, outcome: "Eleanor is accused because of the inheritance dispute and her concealed plans to leave. But the financial evidence and the medical timeline are not explained by her account. The case is closed prematurely.", content: "The accusation against Lady Eleanor Blackwood rests on circumstantial evidence. Within a fortnight the charge collapses. Edwin Pike has quietly departed England." },
    { key: 'end_doctor', title: 'A Convenient Diagnosis', ending: true, outcome: "Dr. Vale's inconsistent account makes him an easy target. The investigation exposes omissions in his testimony but does not establish that he handled the missing will or manipulated the clock.", content: "Vale's evasiveness is suspicious but not incriminating. He did not handle the legal documents and could not have produced the wax seal impression. The charge fails at the inquest." },
    { key: 'end_partial', title: 'The Missing Will Recovered', ending: true, outcome: "The investigation establishes that Pike concealed the revised will and that the estate accounts were manipulated. The document is recovered and the financial fraud is exposed. However, the team cannot conclusively connect the tampered drink to the death.", content: "Pike is arrested for financial fraud. The recovered will is executed by the surviving trustee. Reginald Blackwood's death is recorded as unexplained." },
    { key: 'end_true', title: 'Case Closed — The Midnight Deception', ending: true, outcome: "Confronted with the linked physical evidence, the financial motive, and the reconstructed timeline, Edwin Pike's story collapses. He had discovered that the revised will would trigger an audit of the funds he had diverted. He tampered with the cordial and removed the new will before the study was secured.", content: "The chain of evidence is complete. The folio impression and wax seal place Pike's documents in the study. The financial ledger establishes his motive. Reginald bolted the study himself. Edwin Pike is charged with murder and fraud." }
  ];
  for (const nd of c2Nodes) {
    await Node.findOneAndUpdate({ caseId: case2._id, key: nd.key }, { $set: { caseId: case2._id, ...nd } }, { upsert: true });
  }
  console.log('[SafeSeed] Case CZ-002 (Midnight at Blackwood Manor) initialized with full playable dataset.');

  // 4. Upsert Case CZ-003: The Last Photograph (Coming soon teaser)
  const cz003Data = {
    title: 'The Last Photograph',
    caseNumber: 'CZ-003',
    theme: 'darkroom',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    possibleOutcomes: 2,
    status: 'coming soon',
    description: 'An investigative journalist disappears after developing an underexposed negative in a basement darkroom.',
    briefing: 'Julian Ward went missing forty-eight hours ago. His darkroom chemicals were still warm, his safe forced open, and an unwashed silver-gelatin photographic plate left drying in the wash tray. In the corner of the negative, a silhouette reflects in an antique mirror.',
    suspects: [
      { id: 's_editor', name: 'Cynthia Cross', role: 'Chief Managing Editor', avatar: 'archivist', alibi: 'At the printing press until 2:00 AM.', motive: 'Suppression of front-page expose regarding harbor smuggling.', opportunity: 'Had keys to Ward\'s private office.', notes: 'Refuses to release Ward\'s draft article.', suspicionLevel: 'Medium' }
    ],
    timeline: [
      { id: 't1', time: '18:15', title: 'Ward Returns to Darkroom', description: 'Ward enters the basement studio with two rolls of 35mm film.', unlockedBy: null }
    ]
  };

  await Case.findOneAndUpdate(
    { caseNumber: 'CZ-003' },
    { $set: cz003Data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('[SafeSeed] Case CZ-003 (The Last Photograph) initialized.');

  const totalCases = await Case.countDocuments();
  console.log(`[SafeSeed] Database initialization complete. Active dossiers in database: ${totalCases}`);
  return { totalCases };
}

// Support direct command-line execution: node src/safe-seed.js
if (process.argv[1] && process.argv[1].endsWith('safe-seed.js')) {
  import('dotenv/config').then(async () => {
    if (!process.env.MONGO_URI) {
      console.error('[SafeSeed] ERROR: MONGO_URI is not defined.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    await safeSeed();
    await mongoose.disconnect();
    console.log('[SafeSeed] Disconnected from MongoDB. Done.');
    process.exit(0);
  });
}
