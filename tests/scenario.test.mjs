import test from 'node:test';
import assert from 'node:assert/strict';
import {scenario,nextState,dateLabel} from '../scenario.mjs';
test('baseline capacity clears before the next arrival',()=>{const p=scenario();assert.equal(p.conflictDays,0);assert.equal(p.stages[0].date,'Oct 12');assert.equal(p.stages[1].date,'Oct 22');});
test('delay shifts every displayed date and reveals a one-day dry-room conflict',()=>{const p=scenario('proposed');assert.equal(p.conflictDays,1);assert.deepEqual(p.stages.map(s=>s.date),['Oct 14','Oct 24','Nov 16','Nov 26']);assert.equal(p.state,'proposed');});
test('confirming does not erase a capacity conflict',()=>{assert.equal(scenario(nextState('proposed')).conflictDays,1);});
test('replay returns to original dates without accumulating delay',()=>{assert.deepEqual(scenario(nextState('confirmed')),scenario('planned'));});
test('date labels are timezone independent and cross month boundaries',()=>{assert.equal(dateLabel(9,31,2),'Nov 2');});
