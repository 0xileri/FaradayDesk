import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DatabaseSync} from 'node:sqlite';
import {reserveSQL} from '../lib/research-budget.ts';
test('atomic budget caps at 25 daily and 200 total, including day rollover',()=>{const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE demo_budget(id INTEGER PRIMARY KEY,day TEXT NOT NULL,daily INTEGER NOT NULL,total INTEGER NOT NULL)');const stmt=db.prepare(reserveSQL);for(let day=1;day<=8;day++){for(let i=1;i<=25;i++)assert.ok(stmt.get('day'+day));assert.equal(stmt.get('day'+day),undefined);}assert.equal(stmt.get('day9'),undefined);assert.equal(db.prepare('SELECT total FROM demo_budget').get().total,200);db.close();});
