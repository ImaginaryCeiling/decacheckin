const { set, isBefore } = require('date-fns');

function getStatus(now, cutoffString) {
  const [hours, minutes] = cutoffString.split(':').map(Number);
  const cutoffTime = set(now, { hours, minutes, seconds: 0, milliseconds: 0 });
  
  console.log(`Now: ${now.toLocaleTimeString()}, Cutoff: ${cutoffTime.toLocaleTimeString()}`);

  if (isBefore(now, cutoffTime)) {
    return 'CONFERENCE';
  } else {
    return 'CHECKED_OUT';
  }
}

console.log('--- Tests ---');

const morning = new Date('2025-12-01T10:00:00');
const status1 = getStatus(morning, '17:00');
console.log('10:00 vs 17:00 ->', status1, status1 === 'CONFERENCE' ? 'PASS' : 'FAIL');

const evening = new Date('2025-12-01T18:00:00');
const status2 = getStatus(evening, '17:00');
console.log('18:00 vs 17:00 ->', status2, status2 === 'CHECKED_OUT' ? 'PASS' : 'FAIL');

const exact = new Date('2025-12-01T17:00:00');
const status3 = getStatus(exact, '17:00');
console.log('17:00 vs 17:00 ->', status3, status3 === 'CHECKED_OUT' ? 'PASS' : 'FAIL');

