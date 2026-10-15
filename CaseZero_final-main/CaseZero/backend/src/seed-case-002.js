/**
 * seed-case-002.js — CaseZero: Midnight at Blackwood Manor
 *
 * SAFE IDEMPOTENT SCRIPT. Run as many times as needed.
 *
 * ✔ Never deletes Users, Investigations, or CZ-001/CZ-003 records.
 * ✔ Finds the existing CZ-002 Case document and updates it in-place.
 * ✔ Preserves the existing MongoDB _id.
 * ✔ Upserts Evidence, Clue, Puzzle, and Node records using caseId+key.
 * ✔ Prints a clear summary at the end.
 *
 * Usage: npm run seed:case002
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { Case, Evidence, Clue, Puzzle, Node } from './models/index.js';

// ─── Connect ────────────────────────────────────────────────────────────────
await mongoose.connect(process.env.MONGO_URI);
console.log('✔ Connected to MongoDB');

// ─── Locate existing CZ-002 Case (created by the original seed) ─────────────
let caseDoc = await Case.findOne({ caseNumber: 'CZ-002' });
if (!caseDoc) {
  console.error('✖ CZ-002 not found in the database. Run the original seed first to create the stub.');
  await mongoose.disconnect();
  process.exit(1);
}
console.log(`✔ Found CZ-002 (id: ${caseDoc._id}). Updating in-place…`);

// ─── Update the Case document ─────────────────────────────────────────────
await Case.findByIdAndUpdate(caseDoc._id, {
  title: 'Midnight at Blackwood Manor',
  caseNumber: 'CZ-002',
  theme: 'manor',
  difficulty: 'Hard',
  estimatedTime: '55–65 min',
  possibleOutcomes: 4,
  status: 'open',
  description:
    'A violent storm isolates Blackwood Manor from the surrounding village. Shortly before midnight, Lord Reginald Blackwood is discovered dead inside his study, its heavy door bolted from within. The shutters remain latched. There is no obvious route by which an intruder could have escaped. His newly signed will has disappeared.',
  briefing:
    "At 23:55 on an October night in 1898, servants forced open Lord Reginald Blackwood's study after he failed to answer the midnight bell.\n\nHe was dead at his desk. The bolt had been secured from inside. Both window shutters were latched. His final will, signed earlier that evening, could not be found.\n\nThe storm has washed out the manor road, leaving six people trapped under one roof.\n\nThe household agrees on almost nothing about the last two hours. One account places the physician in the east corridor. Another places the solicitor in the library. The grandfather clock stopped at 22:17, yet its mechanism appears undamaged.\n\nYour task is to reconstruct the last evening, locate the missing will, expose any deliberate deception, and establish who is responsible for what happened.",
  suspects: [
    {
      id: 's_widow',
      name: 'Lady Eleanor Blackwood',
      role: 'Widow and co-trustee of the Blackwood estate',
      avatar: 'widow',
      alibi:
        'Claims she remained in the conservatory after an argument with Reginald and never returned to the study.',
      motive:
        'The missing will appears to remove her control over several estate properties.',
      opportunity:
        'She had visited the study earlier that evening and understood Reginald\'s private routines.',
      notes:
        'Her silk slippers have a trace of wet soil, but the soil does not match the disturbed earth near the study window. She conceals the fact that she planned to leave the estate.',
      suspicionLevel: 'High'
    },
    {
      id: 's_physician',
      name: 'Dr. Simon Vale',
      role: 'Family physician',
      avatar: 'physician',
      alibi:
        'Says he was treating an injury in the servants\' hall when the storm worsened.',
      motive:
        'Reginald had recently questioned discrepancies in his private medical accounts.',
      opportunity:
        'He delivered the household\'s regular night tonic at 21:10.',
      notes:
        'His treatment ledger establishes the timing of the delivery, but he initially omits a later conversation with Reginald. His evasiveness makes him suspicious, but his testimony alone does not establish guilt.',
      suspicionLevel: 'High'
    },
    {
      id: 's_solicitor',
      name: 'Edwin Pike',
      role: 'Family solicitor and estate legal adviser',
      avatar: 'solicitor',
      alibi:
        'Claims he spent the final hours writing letters in the library.',
      motive:
        'The revised will demands an audit of estate accounts and threatens to expose diverted funds associated with his legal practice.',
      opportunity:
        'He entered the study with a leather folio at 21:26 and had access to the documents relating to the revised will.',
      notes:
        'A distinctive black sealing wax and a broken brass folio clasp connect his belongings to material recovered from the study. His account of the final evening contradicts the physical record.',
      suspicionLevel: 'Critical'
    },
    {
      id: 's_housekeeper',
      name: 'Miriam Frost',
      role: 'Housekeeper',
      avatar: 'housekeeper',
      alibi: 'Preparing food and supplies in the kitchen.',
      motive:
        'The proposed estate restructuring threatened the cottages occupied by long-serving staff.',
      opportunity:
        'She knew the house\'s routine, the study\'s service bell, and the household\'s nightly schedule.',
      notes:
        'She heard a bolt slide at approximately 21:42, earlier than some accounts of the final encounter suggest.',
      suspicionLevel: 'Medium'
    },
    {
      id: 's_niece',
      name: 'Clara Blackwood',
      role: 'The late Lord\'s niece and former beneficiary',
      avatar: 'niece',
      alibi: 'Playing piano in the drawing room during much of the evening.',
      motive: 'The missing will could disinherit her.',
      opportunity:
        'She had been alone in the study earlier that afternoon while discussing family correspondence.',
      notes:
        'Her recollection of the music she played helps establish part of the evening\'s sequence. She withheld an earlier argument with Reginald but was not responsible for his death.',
      suspicionLevel: 'High'
    },
    {
      id: 's_steward',
      name: 'Thomas Reed',
      role: 'Groundskeeper and generator attendant',
      avatar: 'steward',
      alibi: 'Inspecting the electrical generator when the power failed.',
      motive:
        'Reginald intended to replace him following repeated maintenance complaints.',
      opportunity:
        'He could access exterior paths, the service entrance, and the manor\'s maintenance records.',
      notes:
        'Muddy marks near the window initially implicate him, but their tread pattern does not match his boots. The mechanical grandfather clock could not have stopped merely because the electrical generator failed.',
      suspicionLevel: 'Medium'
    }
  ],
  timeline: [
    {
      id: 'bt1',
      time: '20:45',
      title: 'Argument in the Study',
      description:
        'Lady Eleanor Blackwood leaves the study following a private argument with Lord Reginald. She retreats to the conservatory and claims not to return.',
      unlockedBy: null
    },
    {
      id: 'bt2',
      time: '21:10',
      title: 'Tonic Delivered',
      description:
        'Dr. Simon Vale records the delivery of the regular household night tonic. The bottle is sealed before it is left for the household.',
      unlockedBy: 'medical_ledger'
    },
    {
      id: 'bt3',
      time: '21:26',
      title: 'Solicitor Enters the Study',
      description:
        'Edwin Pike is seen entering the study carrying a leather document folio. The visit is brief and its full purpose is not disclosed in his account.',
      unlockedBy: 'folio_impression'
    },
    {
      id: 'bt4',
      time: '21:42',
      title: 'Study Bolt Secured',
      description:
        'The housekeeper Miriam Frost reports hearing the heavy study bolt slide into position from the corridor outside.',
      unlockedBy: 'study_bolt'
    },
    {
      id: 'bt5',
      time: '22:17',
      title: 'Grandfather Clock Stops',
      description:
        'The manor\'s grandfather clock ceases to function, displaying the time 22:17. The mechanism will later be found to have been deliberately stopped.',
      unlockedBy: 'stopped_clock'
    },
    {
      id: 'bt6',
      time: '23:03',
      title: 'Generator Fails',
      description:
        'The electrical generator fails during the height of the storm. Thomas Reed is at the generator shed. The manor is plunged into partial darkness.',
      unlockedBy: null
    },
    {
      id: 'bt7',
      time: '23:55',
      title: 'Study Forced Open',
      description:
        'Servants force the study door after Lord Reginald fails to answer the midnight bell. He is found dead at his desk. The signed will is nowhere in the room.',
      unlockedBy: null
    }
  ]
});
console.log('✔ Case document updated.');

const caseId = caseDoc._id;

// ─── Helper: upsert a document by caseId + key ───────────────────────────
async function upsert(Model, key, data) {
  const result = await Model.findOneAndUpdate(
    { caseId, key },
    { caseId, key, ...data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return result;
}

// ─── Evidence (9 exhibits) ─────────────────────────────────────────────────
const evidenceData = [
  {
    key: 'study_bolt',
    title: 'Interior study bolt',
    type: 'physical',
    hotspot: 'Study door bolt',
    importance: 'Critical',
    description: 'The heavy study bolt recovered when servants forced the door.',
    content:
      'The bolt was intact and had been engaged from inside. The physical marks are inconsistent with the idea that it was simply pulled back from the outside after the door closed. Examination confirms the locking was deliberate and could not have been operated through the door gap.',
    metadata: {
      location: 'Study door — interior face',
      condition: 'Intact; no signs of forced retraction',
      material: 'Wrought iron, period-original fitment',
      observations: 'Slight abrasion on the guide rail consistent with repeated use; no external tool marks'
    }
  },
  {
    key: 'shutter_latch',
    title: 'Window shutters',
    type: 'physical',
    hotspot: 'Window shutters',
    importance: 'High',
    description: "The study's heavy interior window shutters.",
    content:
      'Their dust line remains largely undisturbed. The latch does not show evidence of a recent forced opening, and the exterior ledge does not support the theory of an escape through the window. The window sill has no disturbed paintwork or scratch marks consistent with a person having passed through.',
    metadata: {
      location: 'Study — north-facing window',
      condition: 'Latched; dust pattern intact',
      material: 'Painted oak with iron latch',
      observations: 'Fine dust line on inner sill confirms shutters were not opened recently'
    }
  },
  {
    key: 'stopped_clock',
    title: 'Stopped grandfather clock',
    type: 'physical',
    hotspot: 'Grandfather clock',
    importance: 'Critical',
    description: 'A clock showing 22:17 when discovered.',
    content:
      'Inspection reveals that a small piece of paper was deliberately wedged into the pendulum mechanism, preventing the pendulum from completing its arc. The clock was stopped manually. The electrical outage cannot explain its position: the grandfather clock is a mechanical pendulum instrument and operates entirely independently of the manor\'s electrical system.',
    metadata: {
      location: 'Study — east corner, beside the bookcase',
      condition: 'Hands fixed at 22:17; pendulum wedged',
      mechanism: 'Mechanical pendulum; independent of electrical supply',
      paperFragment: 'Small folded paper recovered from the pendulum chamber'
    }
  },
  {
    key: 'cordial_glass',
    title: 'Half-finished cordial glass',
    type: 'physical',
    hotspot: 'Cordial tray',
    importance: 'Critical',
    description: 'A half-finished glass recovered near the writing desk.',
    content:
      'Residue on the glass and irregular marks near the decanter indicate that the drink deserves further examination. The glass appears to have been handled after it was set down: a second ring mark on the tray suggests it was lifted and returned. The glass alone cannot identify who handled it or establish what caused the death, but its condition is inconsistent with a single undisturbed use.',
    metadata: {
      location: 'Writing desk — silver cordial tray',
      condition: 'Partially consumed; faint second contact ring visible on tray',
      contents: 'Elderflower cordial; slight residue on interior glass surface',
      observations: 'Decanter stopper replaced at an angle inconsistent with normal service'
    }
  },
  {
    key: 'medical_ledger',
    title: "Physician's treatment ledger",
    type: 'document',
    hotspot: "Physician's ledger",
    importance: 'High',
    description: "Dr. Vale's record of the evening's visit.",
    content:
      "The entry records the regular night tonic delivered at 21:10. Additional notes establish that the bottle had been sealed before it was left for the household. Its later condition conflicts with Pike's claim that he did not handle anything on the study desk during his visit: the seal was broken by the time servants entered the study.",
    metadata: {
      location: "Dr. Vale's medical bag — recovered from the servants' hall",
      condition: 'Leather-bound; ink entries dated and signed',
      entryTime: '21:10',
      documentId: 'VALE-LEDGER-OCT-98',
      observations: 'The 21:10 entry is written in a different ink colour, suggesting it was added later'
    }
  },
  {
    key: 'will_fragment',
    title: 'Burned codicil fragment',
    type: 'document',
    hotspot: 'Fireplace grate',
    importance: 'Critical',
    description: 'A partially burned document recovered from the fireplace.',
    content:
      "The surviving words refer to transferring estate income to a local flood-relief trust and ordering an audit of estate payments 'at first light'. The document uses formal legal language consistent with a codicil appended to a larger will. The full signed will is missing from the study.",
    metadata: {
      location: 'Study fireplace grate — partially burned',
      condition: 'Partially destroyed; edges carbonised',
      survivingText: 'References to flood-relief trust and estate payment audit',
      documentType: 'Legal codicil — formal phrasing and witnessed signature line visible'
    }
  },
  {
    key: 'estate_ledger',
    title: 'Estate payment ledger',
    type: 'document',
    hotspot: 'Writing desk ledger',
    importance: 'Critical',
    description: 'A ledger of transfers from the Blackwood estate.',
    content:
      "Repeated payments have been routed through Pike's legal practice under an obsolete authorisation dating to 1891. The supporting documentation for three significant transfers is missing from the file. The entries establish a possible motive for concealing the revised will's audit provisions, but a financial discrepancy alone is not proof of murder.",
    metadata: {
      location: 'Writing desk — open to October 1898 entries',
      condition: 'Leather-bound; entries legible; several pages folded or removed',
      suspiciousEntries: 'Three transfers via Pike legal practice under obsolete 1891 authorisation',
      totalValue: 'Approximately £2,400 over fourteen months'
    }
  },
  {
    key: 'folio_impression',
    title: 'Leather folio impression',
    type: 'physical',
    hotspot: 'Leather folio',
    importance: 'High',
    description:
      'Pressure marks left on the desk blotter after papers and a leather document folio were removed.',
    content:
      "The impression preserves parts of the heading for the final codicil and the shape of the missing folio clasp in the blotter's soft surface. The record places legal documents on the study desk shortly before the door was bolted. The clasp shape corresponds to a broken brass fitting later found in Pike's coat pocket.",
    metadata: {
      location: 'Writing desk blotter — left quadrant',
      condition: 'Blotter impression; partially legible text in reverse',
      impressionDetails: 'Codicil heading fragment and rectangular clasp profile',
      relatedItem: 'Broken brass clasp — recovered from Edwin Pike\'s coat'
    }
  },
  {
    key: 'wax_trace',
    title: 'Black sealing wax fragment',
    type: 'physical',
    hotspot: 'Desk blotter',
    importance: 'High',
    description: 'A small fragment of black sealing wax recovered beside the blotter.',
    content:
      "The partial seal impression is consistent with the distinctive seal used on Edwin Pike's legal documents. Pike uses black wax exclusively and a personalised heraldic seal stamp. Its position, combined with the folio impression, links Pike's papers to material found inside the study after his visit.",
    metadata: {
      location: 'Writing desk blotter — right edge, near inkwell',
      condition: 'Partially broken; seal impression visible on lower face',
      waxColour: 'Black — consistent with Pike\'s documented practice',
      sealPattern: 'Partial heraldic device matching Pike\'s known legal seal'
    }
  }
];

let evidenceCreated = 0, evidenceUpdated = 0;
for (const ev of evidenceData) {
  const existing = await Evidence.findOne({ caseId, key: ev.key });
  await upsert(Evidence, ev.key, ev);
  existing ? evidenceUpdated++ : evidenceCreated++;
}
console.log(`✔ Evidence: ${evidenceCreated} created, ${evidenceUpdated} updated`);

// ─── Clues (5 clues) ──────────────────────────────────────────────────────
const clueData = [
  {
    key: 'sealed_room',
    title: 'The room was sealed from within',
    description:
      'The evidence rules out the obvious escape routes. The locked room was real, not an elaborate door trick. The killer did not necessarily need to escape after the door was bolted — harm could have been done during an earlier visit.',
    type: 'critical',
    relatedEvidence: ['study_bolt', 'shutter_latch']
  },
  {
    key: 'tonic_tampered',
    title: "The drink's timeline does not fit",
    description:
      'The sealed tonic was delivered before the solicitor\'s private visit. The drink\'s later condition establishes a plausible opportunity for tampering during that interval. Further evidence is needed to identify the responsible person.',
    type: 'critical',
    relatedEvidence: ['cordial_glass', 'medical_ledger']
  },
  {
    key: 'will_motive',
    title: 'The missing will reveals a motive',
    description:
      "The revised will demanded an audit that would expose suspicious transfers involving Pike's legal practice. Removing the will would conceal both a financial motive and the documentary trail connecting those transfers to a person of interest.",
    type: 'critical',
    relatedEvidence: ['will_fragment', 'estate_ledger']
  },
  {
    key: 'pike_link',
    title: "The solicitor's papers were inside the study",
    description:
      "The folio marks and distinctive black seal link Pike's documents to the study desk. His account of not handling the final will's paperwork is no longer credible when compared against the physical evidence.",
    type: 'critical',
    relatedEvidence: ['folio_impression', 'wax_trace']
  },
  {
    key: 'clock_staged',
    title: 'The apparent time was staged',
    description:
      "The grandfather clock had been deliberately stopped rather than disabled by the power failure. The wax fragment and folio impression link the physical manipulation to Pike's documentary trail, establishing a pattern of deliberate deception.",
    type: 'critical',
    relatedEvidence: ['stopped_clock', 'wax_trace']
  }
];

let clueCreated = 0, clueUpdated = 0;
for (const cl of clueData) {
  const existing = await Clue.findOne({ caseId, key: cl.key });
  await upsert(Clue, cl.key, cl);
  existing ? clueUpdated++ : clueCreated++;
}
console.log(`✔ Clues: ${clueCreated} created, ${clueUpdated} updated`);

// ─── Puzzles (3 puzzles) ──────────────────────────────────────────────────
const puzzleData = [
  {
    key: 'locked_room',
    title: 'The Locked-Room Reconstruction',
    type: 'deduction',
    question:
      'The door was bolted from inside and the shutters remained closed. Which explanation best fits the physical evidence?',
    options: [
      'Pike escaped through an undiscovered chimney passage.',
      'Blackwood secured the door himself after the decisive encounter; the locked room does not prove that nobody harmed him beforehand.',
      'Eleanor used a hidden external mechanism to operate the bolt.',
      'The generator outage opened the shutters.'
    ],
    answer: 1,
    hints: [
      'Compare the condition of the bolt with the marks around the window latches.',
      'Consider whether the perpetrator needed to enter or leave after the room was secured.'
    ],
    grantsClue: 'sealed_room'
  },
  {
    key: 'missing_will',
    title: 'The Missing Will',
    type: 'deduction',
    question:
      'Which explanation best connects the missing will to the financial records?',
    options: [
      'The housekeeper removed it to protect the staff cottages.',
      'Clara misplaced it while searching for family correspondence.',
      "Pike removed the revised will because its audit provisions threatened to expose suspicious estate transfers.",
      'Thomas destroyed it while repairing the generator.'
    ],
    answer: 2,
    hints: [
      'Look at what the surviving codicil demands happens at first light.',
      "Compare the estate ledger with the solicitor's documented access to the study."
    ],
    grantsClue: 'will_motive'
  },
  {
    key: 'false_time',
    title: 'The False Time',
    type: 'deduction',
    question:
      'Why cannot the stopped grandfather clock establish the time of death?',
    options: [
      'The storm caused every clock in the manor to stop.',
      'The mechanism was deliberately wedged, so the displayed time was staged.',
      'The clock was always seventeen minutes slow.',
      'Blackwood had forgotten to wind it.'
    ],
    answer: 1,
    hints: [
      'The generator powers the lights, not the clockwork pendulum.',
      'Inspect the paper recovered from the mechanism and compare its traces with the other evidence.'
    ],
    grantsClue: 'clock_staged'
  }
];

let puzzleCreated = 0, puzzleUpdated = 0;
for (const pz of puzzleData) {
  const existing = await Puzzle.findOne({ caseId, key: pz.key });
  await upsert(Puzzle, pz.key, pz);
  existing ? puzzleUpdated++ : puzzleCreated++;
}
console.log(`✔ Puzzles: ${puzzleCreated} created, ${puzzleUpdated} updated`);

// ─── Narrative Nodes ──────────────────────────────────────────────────────
const nodeData = [
  {
    key: 'start',
    title: 'The Locked Study',
    ending: false,
    outcome: null,
    content:
      "You enter the study after the servants have forced the door. Reginald lies motionless behind his desk. The shutters remain secured, the grandfather clock reads 22:17, and the revised will is nowhere to be found. Outside, rising water prevents anyone from leaving the manor.",
    choices: [
      { text: 'Reconstruct the physical crime scene', to: 'study', requiresClue: null },
      { text: 'Question those trapped in the manor', to: 'interviews', requiresClue: null }
    ]
  },
  {
    key: 'study',
    title: 'Nothing Left by Accident',
    ending: false,
    outcome: null,
    content:
      "The room looks undisturbed, but its details disagree. The bolt is genuine, the window is sealed, and the drink near the desk appears to have been disturbed. A piece of paper has been wedged into the grandfather clock. Someone went to considerable effort to shape the appearance of this room.",
    choices: [
      { text: 'Accuse Dr. Vale based on the medical evidence', to: 'end_doctor', requiresClue: null },
      { text: 'Compare the glass with the physician\'s ledger', to: 'medical', requiresClue: 'tonic_tampered' },
      { text: 'Investigate the missing will and accounts', to: 'will', requiresClue: 'will_motive' }
    ]
  },
  {
    key: 'interviews',
    title: 'Six Accounts, One Timeline',
    ending: false,
    outcome: null,
    content:
      "Every person in the manor has a reason to fear the contents of the missing will. Eleanor resented its implications. Clara risks losing her inheritance. Dr. Vale controls the medical record. Miriam knows the household's routines. Thomas controls the generator. Pike handled the final legal documents. No account agrees entirely with any other.",
    choices: [
      { text: 'Accuse Eleanor of destroying the will', to: 'end_widow', requiresClue: null },
      { text: 'Re-examine the cordial and medical records', to: 'medical', requiresClue: 'tonic_tampered' },
      { text: 'Trace the legal documents and missing will', to: 'will', requiresClue: 'will_motive' }
    ]
  },
  {
    key: 'medical',
    title: 'Before the Door Was Locked',
    ending: false,
    outcome: null,
    content:
      "The timing of the sealed tonic and the solicitor's private visit creates a crucial interval. Whoever tampered with the drink did not need to escape from a room that was later locked from inside. The medical record raises suspicion but does not, by itself, identify the culprit. A second trail of evidence leads to the missing legal papers.",
    choices: [
      { text: "Trace the seal and folio marks to Pike", to: 'confront_pike', requiresClue: 'pike_link' },
      { text: 'Arrest the physician without further corroboration', to: 'end_doctor', requiresClue: null },
      { text: "Examine the missing will's financial implications", to: 'will', requiresClue: 'will_motive' }
    ]
  },
  {
    key: 'will',
    title: 'The Last Codicil',
    ending: false,
    outcome: null,
    content:
      "The fragment from the fireplace records a proposed transfer of the estate's income and a financial audit at first light. The estate ledger contains transfers that cannot be adequately explained. The disappearance of the signed will would protect someone whose financial records were about to be examined by an independent auditor.",
    choices: [
      { text: 'Confront Pike using the folio and seal evidence', to: 'confront_pike', requiresClue: 'pike_link' },
      { text: 'Recover the documentary evidence but stop short of a murder accusation', to: 'end_partial', requiresClue: null },
      { text: 'Return to the medical evidence before making a conclusion', to: 'medical', requiresClue: 'tonic_tampered' }
    ]
  },
  {
    key: 'confront_pike',
    title: "The Solicitor's Account",
    ending: false,
    outcome: null,
    content:
      "Pike insists that the folio contained only routine papers. The physical impression, wax fragment, and missing will contradict his account. His explanation for the missing codicil changes when confronted with the financial records. The final question is whether the staged clock and the disturbed drink connect him to Reginald's death.",
    choices: [
      { text: 'Use the staged clock to reconstruct the final minutes', to: 'clock_review', requiresClue: 'clock_staged' },
      { text: 'Secure the will but leave the death unexplained', to: 'end_partial', requiresClue: null }
    ]
  },
  {
    key: 'clock_review',
    title: 'The Last Seventeen Minutes',
    ending: false,
    outcome: null,
    content:
      "The clock was stopped manually, and the power failure is a false explanation. The stopped mechanism, Pike's access to the legal papers, the financial motive, and the drink's timeline now point toward a single sequence of deliberate deception. Every physical detail in this room was arranged to mislead.",
    choices: [
      { text: 'Present the full chain of evidence and charge Pike', to: 'end_true', requiresClue: 'tonic_tampered' },
      { text: 'Close the financial investigation but leave the cause of death unresolved', to: 'end_partial', requiresClue: null }
    ]
  },
  // ─── Endings ─────────────────────────────────────────────────────────────
  {
    key: 'end_widow',
    title: 'The Wrong Heir',
    ending: true,
    outcome:
      "Eleanor is accused because of the inheritance dispute and her concealed plans to leave. But the financial evidence and the medical timeline are not explained by her account. The case is closed prematurely. New information later undermines the accusation, and the real perpetrator remains at large.",
    content:
      "The accusation against Lady Eleanor Blackwood rests on the mud on her slippers and her hidden intention to leave the estate. It does not account for the folio impression, the wax seal, or the disturbed drink's timeline. Within a fortnight the charge collapses. Edwin Pike has quietly departed England."
  },
  {
    key: 'end_doctor',
    title: 'A Convenient Diagnosis',
    ending: true,
    outcome:
      "Dr. Vale's inconsistent account makes him an easy target. The investigation exposes omissions in his testimony but does not establish that he handled the missing will or manipulated the clock. The evidence points elsewhere, and the charge fails.",
    content:
      "Vale's evasiveness about his later conversation with Reginald is suspicious but not incriminating. He did not handle the legal documents and could not have produced the wax seal impression. The charge against him fails at the inquest, and the signed will is never recovered."
  },
  {
    key: 'end_partial',
    title: 'The Missing Will Recovered',
    ending: true,
    outcome:
      "The investigation establishes that Pike concealed the revised will and that the estate accounts were manipulated. The document is recovered and the financial fraud is exposed. However, the team cannot conclusively connect the tampered drink and staged clock to the death. The theft is solved, but the central death remains officially unresolved.",
    content:
      "Pike is arrested for the suppression of a legal instrument and financial fraud against the estate. The recovered will is executed by the surviving trustee. Reginald Blackwood's death is recorded as unexplained. Without the completed chain of evidence, no murder charge can be sustained."
  },
  {
    key: 'end_true',
    title: 'Case Closed — The Midnight Deception',
    ending: true,
    outcome:
      "Confronted with the linked physical evidence, the financial motive, and the reconstructed timeline, Edwin Pike's story collapses. He had discovered that the revised will would trigger an audit of the funds he had diverted. During his visit before the study was locked, he tampered with the night's cordial and removed the new will. Reginald later secured the study himself. Pike stopped the grandfather clock to create a false time of death and confuse the reconstruction of the final hours. The room was genuinely locked from within. The deception relied on the assumption that the person responsible must have escaped after the bolt was engaged. The will is recovered, the estate fraud is exposed, and Pike is brought to justice.",
    content:
      "The chain of evidence is complete. The folio impression and wax seal place Pike's documents in the study. The financial ledger establishes his motive. The staged clock and disturbed drink reveal the method. The locked room was not the puzzle: Reginald bolted it himself, long after the harm was done. Edwin Pike is charged with murder and fraud. The signed will is produced. The Blackwood estate passes to its rightful trustees."
  }
];

let nodeCreated = 0, nodeUpdated = 0;
for (const nd of nodeData) {
  const existing = await Node.findOne({ caseId, key: nd.key });
  await upsert(Node, nd.key, nd);
  existing ? nodeUpdated++ : nodeCreated++;
}
console.log(`✔ Narrative nodes: ${nodeCreated} created, ${nodeUpdated} updated`);

// ─── Stale-record check (non-destructive) ─────────────────────────────────
const knownEvidenceKeys = evidenceData.map(e => e.key);
const knownClueKeys = clueData.map(c => c.key);
const knownPuzzleKeys = puzzleData.map(p => p.key);
const knownNodeKeys = nodeData.map(n => n.key);

const staleEvidence = await Evidence.find({ caseId, key: { $nin: knownEvidenceKeys } });
const staleClues = await Clue.find({ caseId, key: { $nin: knownClueKeys } });
const stalePuzzles = await Puzzle.find({ caseId, key: { $nin: knownPuzzleKeys } });
const staleNodes = await Node.find({ caseId, key: { $nin: knownNodeKeys } });

if (staleEvidence.length || staleClues.length || stalePuzzles.length || staleNodes.length) {
  console.warn('\n⚠  Stale CZ-002 records detected (NOT deleted — inspect manually):');
  staleEvidence.forEach(e => console.warn(`   Evidence: key="${e.key}"`));
  staleClues.forEach(c => console.warn(`   Clue: key="${c.key}"`));
  stalePuzzles.forEach(p => console.warn(`   Puzzle: key="${p.key}"`));
  staleNodes.forEach(n => console.warn(`   Node: key="${n.key}"`));
} else {
  console.log('✔ No stale CZ-002 records found.');
}

// ─── Final summary ────────────────────────────────────────────────────────
console.log('\n──────────────────────────────────────────────────');
console.log('CZ-002 seed complete. Summary:');
console.log(`  Case     : CZ-002 updated (id: ${caseDoc._id})`);
console.log(`  Status   : open`);
console.log(`  Evidence : 9 records upserted`);
console.log(`  Clues    : 5 records upserted`);
console.log(`  Puzzles  : 3 records upserted`);
console.log(`  Nodes    : ${nodeData.length} records upserted`);
console.log('  CZ-001   : untouched');
console.log('  Users    : untouched');
console.log('  Investigations: untouched');
console.log('──────────────────────────────────────────────────\n');

await mongoose.disconnect();
process.exit(0);
