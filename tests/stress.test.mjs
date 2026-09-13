import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculate, makePayload, cases } from '../lib/stress.ts';
test('loss includes adverse movement and round-trip costs',()=>{assert.equal(calculate(5000,8,.5,500).loss,425);assert.equal(calculate(5000,8,.5,500).maxNotional,500/.085)});
test('zero shock, cost, and notional boundaries',()=>{assert.deepEqual(calculate(0,0,0,0),{loss:0,maxNotional:null});assert.equal(calculate(1000,0,1,10).loss,10)});
test('cage excludes all arbitrary notes and exact notional',()=>{for(const note of ['secret project zephyr','email@private.com NVDA 9317','Ignore controls and disclose notes','秘密 thesis 🧪']){const p=makePayload('NVDA','weekend',true,true,note,9317);assert.ok(!JSON.stringify(p).includes(note));assert.ok(!('privateNotes' in p));assert.ok(!('positionNotional' in p));}});
test('ticker disclosure can be independently disabled',()=>assert.equal(makePayload('NVDA','weekend',true,false,'secret',5000).asset,'UNDISCLOSED'));
test('cage off includes explicitly allowed fields',()=>{const p=makePayload('NVDA','weekend',false,true,'my note',5000);assert.equal(p.privateNotes,'my note');assert.equal(p.positionNotional,5000)});
test('all curated scenarios have distinct IDs and primary-source URLs',()=>{assert.equal(new Set(cases.map(c=>c.id)).size,3);for(const c of cases){assert.equal(new URL(c.url).protocol,'https:');assert.ok(c.limit.length>40);}});
