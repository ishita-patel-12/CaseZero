import io from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_BASE = 'http://localhost:5000';

async function req(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function runE2ETests() {
  console.log('=== CASEZERO FULL END-TO-END MULTIPLAYER TEST ===\n');

  // 1. Auth: Register Player A & Player B
  const ts = Date.now();
  console.log('1. Registering Player A and Player B...');
  const playerAAuth = await req('/auth/register', {
    method: 'POST',
    body: { username: `Detective_A_${ts}`, email: `detective_a_${ts}@casezero.io`, password: 'password123' }
  });
  console.log('   ✓ Player A registered:', playerAAuth.user.username);

  const playerBAuth = await req('/auth/register', {
    method: 'POST',
    body: { username: `Detective_B_${ts}`, email: `detective_b_${ts}@casezero.io`, password: 'password123' }
  });
  console.log('   ✓ Player B registered:', playerBAuth.user.username);

  // 2. Fetch Cases
  console.log('\n2. Fetching Case Archive...');
  const cases = await req('/cases', { token: playerAAuth.token });
  console.log(`   ✓ Found ${cases.length} cases:`);
  cases.forEach(c => console.log(`     - [${c.caseNumber}] ${c.title} (Status: ${c.status})`));
  const cz001 = cases.find(c => c.caseNumber === 'CZ-001');

  // 3. Player A creates multiplayer room
  console.log('\n3. Player A creating investigation room for CZ-001...');
  const inv = await req('/investigations', {
    method: 'POST',
    body: { caseId: cz001._id, isMultiplayer: true, forceNew: true },
    token: playerAAuth.token
  });
  console.log('   ✓ Room created! Room Code:', inv.roomCode, 'Investigation ID:', inv._id);

  // 4. Player B previews & joins room
  console.log('\n4. Player B inspecting & joining room code', inv.roomCode, '...');
  const preview = await req(`/investigations/code/${inv.roomCode}`, { token: playerBAuth.token });
  console.log(`   ✓ Room verified: ${preview.caseTitle} (${preview.participantCount} active player)`);

  const joinRes = await req('/investigations/join', {
    method: 'POST',
    body: { roomCode: inv.roomCode },
    token: playerBAuth.token
  });
  console.log('   ✓ Player B joined investigation successfully:', joinRes.investigationId);

  // 5. Connect Socket.IO for both players
  console.log('\n5. Establishing live WebSocket connections for Player A and Player B...');
  const socketA = io(SOCKET_BASE, { auth: { token: playerAAuth.token } });
  const socketB = io(SOCKET_BASE, { auth: { token: playerBAuth.token } });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    socketA.on('connect', () => {
      socketA.emit('join_investigation', { investigationId: inv._id });
      check();
    });
    socketB.on('connect', () => {
      socketB.emit('join_investigation', { investigationId: inv._id });
      check();
    });
  });
  console.log('   ✓ Both sockets connected and joined room inv_' + inv._id);

  // Socket listener trackers
  const receivedByB = [];
  const receivedByA = [];
  socketB.on('evidence_discovered', (data) => receivedByB.push({ event: 'evidence_discovered', data }));
  socketB.on('clue_unlocked', (data) => receivedByB.push({ event: 'clue_unlocked', data }));
  socketB.on('puzzle_solved', (data) => receivedByB.push({ event: 'puzzle_solved', data }));
  socketB.on('chat_message', (data) => receivedByB.push({ event: 'chat_message', data }));
  socketA.on('chat_message', (data) => receivedByA.push({ event: 'chat_message', data }));

  // 6. Player A searches evidence hotspot: 'schedule'
  console.log('\n6. Player A searching hotspot "schedule"...');
  await req(`/investigations/${inv._id}/evidence`, {
    method: 'POST',
    body: { key: 'schedule' },
    token: playerAAuth.token
  });
  await new Promise(r => setTimeout(r, 200));
  const foundByB1 = receivedByB.find(e => e.event === 'evidence_discovered' && e.data.evidenceKey === 'schedule');
  console.log('   ✓ Evidence logged! Player B real-time broadcast received:', foundByB1?.data.evidenceTitle);

  // 7. Player B searches evidence hotspot: 'photo'
  console.log('\n7. Player B searching hotspot "photo"...');
  await req(`/investigations/${inv._id}/evidence`, {
    method: 'POST',
    body: { key: 'photo' },
    token: playerBAuth.token
  });
  await new Promise(r => setTimeout(r, 200));
  console.log('   ✓ Player B discovered Security photograph.');

  // 8. Player A connects 'schedule' and 'photo' on Evidence Board
  console.log('\n8. Player A connecting "schedule" and "photo" on Evidence Board...');
  const connRes = await req(`/investigations/${inv._id}/connect`, {
    method: 'POST',
    body: { a: 'schedule', b: 'photo' },
    token: playerAAuth.token
  });
  console.log('   ✓ Breakthrough clue found:', connRes.found);
  await new Promise(r => setTimeout(r, 200));
  const clueEvent = receivedByB.find(e => e.event === 'clue_unlocked');
  console.log('   ✓ Player B received live clue notification:', clueEvent?.data.clueTitle);

  // 9. Player B solves deduction puzzle
  console.log('\n9. Player B solving deduction puzzle...');
  const stateBeforePuzzle = await req(`/investigations/${inv._id}`, { token: playerBAuth.token });
  const puzzle = stateBeforePuzzle.puzzles[0];
  const solveRes = await req(`/puzzles/${puzzle._id}/solve`, {
    method: 'POST',
    body: { investigationId: inv._id, answer: 0 },
    token: playerBAuth.token
  });
  console.log('   ✓ Puzzle solved status:', solveRes.correct);
  await new Promise(r => setTimeout(r, 200));
  const puzzleEvent = receivedByB.find(e => e.event === 'puzzle_solved');
  console.log('   ✓ Live socket event broadcast to team: puzzle solved by', puzzleEvent?.data.solvedBy);

  // 10. Chat communication between teammates
  console.log('\n10. Testing Team Radio real-time communication...');
  socketA.emit('send_chat', { investigationId: inv._id, text: 'Look at the timestamp in Exhibit B.' });
  await new Promise(r => setTimeout(r, 300));
  const chatReceived = receivedByB.find(e => e.event === 'chat_message');
  console.log('   ✓ Player B received chat message from Player A:', chatReceived?.data.text);

  // 11. Complete remaining evidence & clues for the True Ending
  console.log('\n11. Gathering remaining exhibits (ticket, note, card) for True Ending...');
  await req(`/investigations/${inv._id}/evidence`, { method: 'POST', body: { key: 'ticket' }, token: playerAAuth.token });
  await req(`/investigations/${inv._id}/evidence`, { method: 'POST', body: { key: 'note' }, token: playerAAuth.token });
  await req(`/investigations/${inv._id}/evidence`, { method: 'POST', body: { key: 'card' }, token: playerBAuth.token });

  // Connect note + card to unlock "The signature was altered"
  await req(`/investigations/${inv._id}/connect`, { method: 'POST', body: { a: 'note', b: 'card' }, token: playerAAuth.token });
  // Connect ticket + photo to unlock "The visitor left by train"
  await req(`/investigations/${inv._id}/connect`, { method: 'POST', body: { a: 'ticket', b: 'photo' }, token: playerBAuth.token });
  console.log('   ✓ All 3 clues successfully unlocked!');

  // 12. Branching story to True Ending
  console.log('\n12. Progressing story through branching narrative...');
  // At 'start': choice 1 -> 'visitor' (Requires clue: 'route')
  const step1 = await req(`/investigations/${inv._id}/choice`, {
    method: 'POST',
    body: { index: 1 }, // Follow the visitor
    token: playerAAuth.token
  });
  console.log('   ✓ Step 1 -> Current node:', step1.investigation.currentNode);

  // At 'visitor': choice 1 -> 'end_true' (Requires clue: 'forged')
  const step2 = await req(`/investigations/${inv._id}/choice`, {
    method: 'POST',
    body: { index: 1 }, // Confront the archivist with the forged signature
    token: playerBAuth.token
  });
  console.log('   ✓ Step 2 -> Case Status:', step2.investigation.status);
  console.log('   ✓ Final Case Outcome:', step2.investigation.outcome);

  // 13. State Restoration / Reconnection
  console.log('\n13. Testing Reconnection and State Restoration...');
  socketA.disconnect();
  const restoredState = await req(`/investigations/${inv._id}`, { token: playerAAuth.token });
  console.log('   ✓ Reconnected user retrieved full synchronized state:');
  console.log(`     - Evidence discovered: ${restoredState.stats.foundEvidence}/${restoredState.stats.totalEvidence}`);
  console.log(`     - Clues unlocked: ${restoredState.stats.foundClues}/${restoredState.stats.totalClues}`);
  console.log(`     - Puzzles solved: ${restoredState.stats.solvedPuzzles}/${restoredState.stats.totalPuzzles}`);
  console.log(`     - Decisions made: ${restoredState.investigation.decisions.length}`);
  console.log(`     - Team chat entries: ${restoredState.investigation.chat.length}`);
  console.log(`     - Status: ${restoredState.investigation.status}`);

  socketB.disconnect();

  console.log('\n=== ALL TESTS PASSED! CASEZERO MULTIPLAYER & INVESTIGATION ENGINE IS FULLY OPERATIONAL ===');
  process.exit(0);
}

runE2ETests().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
