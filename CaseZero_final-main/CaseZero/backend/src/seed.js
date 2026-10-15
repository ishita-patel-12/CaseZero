import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Case, Evidence, Clue, Puzzle, Node } from './models/index.js';

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User, Case, Evidence, Clue, Puzzle, Node].map(m => m.deleteMany({})));

// Seed Default Users
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

// Seed Cases
const [c1, c2, c3] = await Case.create([
  {
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
      {
        id: 't1',
        time: '20:30',
        title: 'Archive Public Wing Closes',
        description: 'Visitors escorted out. Daytime staff clock out. Archivist Arthur Vance claims to have left.',
        unlockedBy: null
      },
      {
        id: 't2',
        time: '20:58',
        title: 'Keycard #A-114 Scanned',
        description: 'Access card registered to Curator Margaret Halloran is scanned at the East Wing corridor.',
        unlockedBy: 'card'
      },
      {
        id: 't3',
        time: '21:00',
        title: 'Vault Inspection Scheduled',
        description: 'Torn schedule notes Curator Halloran scheduled to inspect Vault 3 codex seal.',
        unlockedBy: 'schedule'
      },
      {
        id: 't4',
        time: '21:30',
        title: 'Automated Facility Lock-Up',
        description: 'Heavy security doors locked. Night security system active until morning shift.',
        unlockedBy: 'schedule'
      },
      {
        id: 't5',
        time: '21:47',
        title: 'Lobby Camera Anomaly',
        description: 'Security camera captures a visitor in a grey coat carrying a flat case toward Vault 3.',
        unlockedBy: 'photo'
      },
      {
        id: 't6',
        time: '22:15',
        title: 'Alder Station Train Departs',
        description: 'Westbound express train leaves city terminal. Voss confirmed on passenger manifest.',
        unlockedBy: 'ticket'
      },
      {
        id: 't7',
        time: '22:30',
        title: 'Guard Rounds & Vault Breach Discovered',
        description: 'Night guard arrives at Vault 3. Vault door is unlocked from inside, glass case shattered, Codex absent.',
        unlockedBy: null
      }
    ]
  },
  {
    title: 'Midnight at Blackwood Manor',
    caseNumber: 'CZ-002',
    theme: 'manor',
    difficulty: 'Hard',
    estimatedTime: '60 min',
    possibleOutcomes: 4,
    status: 'coming soon',
    description: 'A stormy night in an isolated Victorian estate ends with a locked-room death and a missing will.',
    briefing: 'Lord Reginald Blackwood was found slumped at his study desk at midnight. The study door was bolted from the inside, the heavy window shutters latched, and the grand chimney unlit. Five guests remain trapped in the drawing room by the rising river flood.',
    suspects: [
      {
        id: 's_widow',
        name: 'Lady Eleanor Blackwood',
        role: 'Heiress & Widow',
        avatar: 'curator',
        alibi: 'Reading in the conservatory during the storm.',
        motive: 'Threatened with being disinherited in the updated will.',
        opportunity: 'Possessed master skeleton key to the manor west wing.',
        notes: 'Mud stains on silk slippers.',
        suspicionLevel: 'High'
      }
    ],
    timeline: [
      {
        id: 't1',
        time: '23:00',
        title: 'Storm Knocks Out Power',
        description: 'Manor plunged into darkness. Generator fails to engage.',
        unlockedBy: null
      }
    ]
  },
  {
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
      {
        id: 's_editor',
        name: 'Cynthia Cross',
        role: 'Chief Managing Editor',
        avatar: 'archivist',
        alibi: 'At the printing press until 2:00 AM.',
        motive: 'Suppression of front-page expose regarding harbor smuggling.',
        opportunity: 'Had keys to Ward\'s private office.',
        notes: 'Refuses to release Ward\'s draft article.',
        suspicionLevel: 'Medium'
      }
    ],
    timeline: [
      {
        id: 't1',
        time: '18:15',
        title: 'Ward Returns to Darkroom',
        description: 'Ward enters the basement studio with two rolls of 35mm film.',
        unlockedBy: null
      }
    ]
  }
]);

const caseId = c1._id;
const w = a => a.map(x => ({ caseId, ...x }));

// Evidence for CZ-001 (Main Playable Case)
await Evidence.create(w([
  {
    key: 'schedule',
    title: 'Torn exhibition schedule',
    type: 'document',
    hotspot: 'Wastebasket by the desk',
    importance: 'high',
    description: 'Half a printed museum schedule crumpled in the office wastebasket.',
    content: 'Doors locked 21:30. Night guard rounds resume 22:30. Curator M. Halloran to inspect Vault 3 at 21:00.',
    metadata: {
      location: 'Curator Office - Wastebasket',
      condition: 'Torn & creased',
      printedDate: '24-OCT 18:00',
      documentId: 'SCH-884'
    }
  },
  {
    key: 'photo',
    title: 'Security photograph',
    type: 'photograph',
    hotspot: 'Camera monitor',
    importance: 'critical',
    description: 'Grainy surveillance still captured from Lobby Camera B.',
    content: 'Timestamp 21:47. A visitor in a grey coat carries a flat leather case toward Vault 3. Their face is turned away.',
    metadata: {
      camera: 'Lobby B - East Angle',
      time: '21:47:04',
      fps: '8 fps analogue',
      sensor: 'B/W Low-Light CCTV'
    }
  },
  {
    key: 'note',
    title: 'Handwritten note',
    type: 'document',
    hotspot: 'Open drawer',
    importance: 'high',
    description: 'Hastily scribbled message on official museum letterhead, found slipped under the vault door.',
    content: '"Vault 3 before the bells. Bring the case. — E. Halloran"',
    metadata: {
      paper: 'Aldermere Museum Watermark',
      ink: 'Iron gall fountain pen',
      signature: 'E. Halloran (Erratic slant)'
    }
  },
  {
    key: 'ticket',
    title: 'Train ticket',
    type: 'object',
    hotspot: 'Coat rack',
    importance: 'medium',
    description: 'Single-fare railway ticket from Central to Alder Station.',
    content: 'Departs 22:15. Purchased in cash. Pencilled on the back: "Ask for Voss."',
    metadata: {
      origin: 'Grand Central',
      destination: 'Alder Station Platform 4',
      departure: '22:15',
      fare: 'Cash receipt #4028'
    }
  },
  {
    key: 'card',
    title: 'Museum access card #A-114',
    type: 'digital',
    hotspot: 'Display case',
    importance: 'high',
    description: 'Electronic magnetic keycard belonging to senior museum administration.',
    content: 'Issued to Margaret Halloran, curator. Last used 20:58. Registered signature: "M. Halloran", looped M.',
    metadata: {
      cardId: 'A-114',
      holder: 'Margaret Halloran',
      accessTier: 'Tier 1 - Master Vault',
      rfidFrequency: '13.56 MHz Encrypted'
    }
  }
]));

// Clues for CZ-001
await Clue.create(w([
  {
    key: 'inside',
    title: 'Someone was inside after lock-up',
    description: 'The perimeter doors locked at 21:30, yet a visitor appears on camera inside the vault corridor at 21:47.',
    relatedEvidence: ['schedule', 'photo']
  },
  {
    key: 'forged',
    title: 'The signature was altered',
    description: 'The conspirator\'s note is signed "E." but Curator Halloran\'s official access card is signed "M." with an ornate looped M. Someone deliberately forged her handwriting.',
    relatedEvidence: ['note', 'card']
  },
  {
    key: 'route',
    title: 'The visitor left by train',
    description: 'The visitor carrying the flat leather case had a ticket departing for Alder Station at 22:15. The manuscript was smuggled out of town immediately.',
    relatedEvidence: ['ticket', 'photo']
  }
]));

// Puzzles for CZ-001
await Puzzle.create(w([
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
]));

// Narrative Nodes for CZ-001
await Node.create(w([
  {
    key: 'start',
    title: 'The empty case',
    content: 'Vault 3 is eerily silent. A faint rectangular dust outline marks where the 14th-century Aldermere Codex lay only hours ago. You stand at the threshold with your investigation team. You can confront Curator Halloran in her office or trace the stranger captured on the lobby security cameras.',
    choices: [
      { text: 'Question the curator', to: 'curator' },
      { text: 'Follow the visitor', to: 'visitor', requiresClue: 'route' }
    ]
  },
  {
    key: 'curator',
    title: 'Halloran’s office',
    content: 'Margaret Halloran sits behind a mahogany desk. She is composed—unnervingly so. When questioned, she adamantly denies writing the note found under the vault door and hands over her access card without hesitation. "Someone is setting me up," she whispers.',
    choices: [
      { text: 'Accuse the curator', to: 'end_wrong' },
      { text: 'Trace the ticket instead', to: 'visitor', requiresClue: 'route' }
    ]
  },
  {
    key: 'visitor',
    title: 'Alder Station Platform',
    content: 'Rain beats down on the train platform. The stationmaster distinctly recalls a man in a grey coat answering to the name Gregory Voss. Your team intercepts Voss, but his leather case contains only blank parchment and lead weights. Someone else took the genuine Codex.',
    choices: [
      { text: 'Arrest the visitor', to: 'end_partial' },
      { text: 'Confront the archivist with the forged signature', to: 'end_true', requiresClue: 'forged' }
    ]
  },
  {
    key: 'end_wrong',
    title: 'Framed: Wrong Suspect',
    ending: true,
    outcome: 'You arrested Curator Halloran on circumstantial evidence. During her arraignment, forensic handwriting analysts proved her signature was forged. Halloran was fully exonerated, but the real conspirator escaped with the Aldermere Codex to an unlisted private buyer.',
    content: 'The forgery was a masterclass in misdirection, and your team walked straight into the trap.'
  },
  {
    key: 'end_partial',
    title: 'Half the Truth: The Courier Fallen',
    ending: true,
    outcome: 'You captured Gregory Voss, the hired courier. Under interrogation, Voss confesses he was paid two thousand pounds in cash to carry the dummy case to Alder Station as a decoy. The mastermind behind the theft remains anonymous, and the real Codex was never recovered.',
    content: 'Voss was merely a pawn on the board. The real kingpin remains in the shadows.'
  },
  {
    key: 'end_true',
    title: 'Case Closed: Complete Conviction',
    ending: true,
    outcome: 'The archivist Arthur Vance broke under questioning when confronted with the forged letterhead and the flawed "M" signature. Vance copied Halloran\'s credentials, unlocked Vault 3 before 21:30, used Voss as an oblivious decoy, and stashed the genuine Codex inside the archive bindery. The manuscript is restored to the museum.',
    content: 'Flawless deduction. The distinctive looped M in the curator’s authentic signature shattered Vance’s alibi.'
  }
]));

console.log('CaseZero database successfully seeded with CZ-001, CZ-002, CZ-003 and demo users.');
process.exit(0);
