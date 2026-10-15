// Central CaseZero media & visual asset registry

export const BRAND_ASSETS = {
  emblem: '/assets/brand/casezero-emblem.svg',
  deskHero: '/assets/backgrounds/desk.jpg',
  grain: '/assets/textures/film-grain.svg'
};

export const CASE_MEDIA = {
  'CZ-001': {
    hero: '/assets/cases/cz-001/hero.jpg',
    scene: '/assets/cases/cz-001/scene.jpg',
    suspects: {
      s_curator: '/assets/cases/cz-001/suspect-curator.jpg',
      s_archivist: '/assets/cases/cz-001/suspect-archivist.jpg',
      s_courier: '/assets/cases/cz-001/suspect-courier.jpg',
      s_guard: '/assets/cases/cz-001/suspect-guard.jpg'
    },
    // Hotspot coordinates on the actual scene photo (percentages: left%, top%, width%, height%)
    hotspots: {
      'Wastebasket by the desk': {
        key: 'schedule',
        label: 'Office Wastebasket',
        sublabel: 'Discarded paper & documents',
        x: 24.5,
        y: 89.0,
        pinX: 25,
        pinY: 83
      },
      'Camera monitor': {
        key: 'photo',
        label: 'CCTV Surveillance Console',
        sublabel: 'Lobby Camera B feed',
        x: 16.5,
        y: 38.0,
        pinX: 16.5,
        pinY: 34
      },
      'Open drawer': {
        key: 'note',
        label: 'Curator Desk Drawer',
        sublabel: 'Unsecured archive correspondence',
        x: 35.0,
        y: 64.0,
        pinX: 35.0,
        pinY: 60
      },
      'Coat rack': {
        key: 'ticket',
        label: 'Standing Coat Rack',
        sublabel: 'Visitor overcoat & belongings',
        x: 42.0,
        y: 34.0,
        pinX: 42.0,
        pinY: 26
      },
      'Display case': {
        key: 'card',
        label: 'Breached Display Pedestal',
        sublabel: 'Empty Codex housing',
        x: 70.0,
        y: 38.0,
        pinX: 70.0,
        pinY: 30
      }
    }
  },
  'CZ-002': {
    hero: '/assets/cases/cz-002/hero.svg',
    scene: '/assets/cases/cz-002/scene.svg',
    suspects: {
      s_widow: '/assets/cases/cz-002/suspect-widow.svg',
      widow: '/assets/cases/cz-002/suspect-widow.svg',
      s_physician: '/assets/cases/cz-002/suspect-physician.svg',
      physician: '/assets/cases/cz-002/suspect-physician.svg',
      s_solicitor: '/assets/cases/cz-002/suspect-solicitor.svg',
      solicitor: '/assets/cases/cz-002/suspect-solicitor.svg',
      s_housekeeper: '/assets/cases/cz-002/suspect-housekeeper.svg',
      housekeeper: '/assets/cases/cz-002/suspect-housekeeper.svg',
      s_niece: '/assets/cases/cz-002/suspect-niece.svg',
      niece: '/assets/cases/cz-002/suspect-niece.svg',
      s_steward: '/assets/cases/cz-002/suspect-steward.svg',
      steward: '/assets/cases/cz-002/suspect-steward.svg'
    },
    hotspots: {
      'Study door bolt': {
        key: 'study_bolt',
        label: 'Study Door Bolt',
        sublabel: 'Heavy wrought-iron interior bolt',
        pinX: 18.2,
        pinY: 35.5
      },
      'Window shutters': {
        key: 'shutter_latch',
        label: 'North Window Shutters',
        sublabel: 'Heavy oak shutters & undisturbed sill',
        pinX: 37.5,
        pinY: 26.0
      },
      'Grandfather clock': {
        key: 'stopped_clock',
        label: 'Grandfather Clock',
        sublabel: 'Stopped at 22:17; wedged pendulum',
        pinX: 83.2,
        pinY: 38.0
      },
      'Cordial tray': {
        key: 'cordial_glass',
        label: 'Silver Cordial Tray',
        sublabel: 'Decanter & half-consumed cordial glass',
        pinX: 66.5,
        pinY: 59.0
      },
      "Physician's ledger": {
        key: 'medical_ledger',
        label: "Physician's Treatment Ledger",
        sublabel: 'Dr. Vale’s treatment record & 21:10 entry',
        pinX: 37.0,
        pinY: 58.5
      },
      'Fireplace grate': {
        key: 'will_fragment',
        label: 'Fireplace Grate',
        sublabel: 'Charred remains of legal codicil',
        pinX: 56.5,
        pinY: 75.0
      },
      'Writing desk ledger': {
        key: 'estate_ledger',
        label: 'Estate Payment Ledger',
        sublabel: 'Financial records of 1891 diverted funds',
        pinX: 45.5,
        pinY: 58.0
      },
      'Leather folio': {
        key: 'folio_impression',
        label: 'Legal Document Folio',
        sublabel: 'Desk impression & broken brass clasp',
        pinX: 31.0,
        pinY: 61.5
      },
      'Desk blotter': {
        key: 'wax_trace',
        label: 'Writing Desk Blotter',
        sublabel: 'Black legal sealing wax fragment',
        pinX: 61.5,
        pinY: 60.5
      }
    }
  },
  'CZ-003': {
    hero: '/assets/cases/cz-003/hero.svg',
    scene: '/assets/cases/cz-003/hero.svg',
    suspects: {
      s_editor: '/assets/cases/cz-001/suspect-archivist.jpg'
    },
    hotspots: {}
  }
};

export function getCaseMedia(caseNumber) {
  const norm = (caseNumber || 'CZ-001').toUpperCase().trim();
  return CASE_MEDIA[norm] || CASE_MEDIA['CZ-001'];
}

export function getSuspectAvatar(caseNumber, suspectId) {
  const media = getCaseMedia(caseNumber);
  return media?.suspects?.[suspectId] || '/assets/cases/cz-001/suspect-curator.jpg';
}
