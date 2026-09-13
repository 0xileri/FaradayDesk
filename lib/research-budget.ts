// One aggregate counter, no IPs, notes, tickers, or personal identifiers.
export const reserveSQL=`INSERT INTO demo_budget(id,day,daily,total) VALUES(1,?,1,1)
 ON CONFLICT(id) DO UPDATE SET day=excluded.day,daily=CASE WHEN demo_budget.day=excluded.day THEN demo_budget.daily+1 ELSE 1 END,total=demo_budget.total+1
 WHERE demo_budget.total<200 AND (demo_budget.day<>excluded.day OR demo_budget.daily<25)
 RETURNING total`;
export async function reserveResearch(db:D1Database|undefined){
 if(!db)throw Error('Demo research budget is unavailable.');
 const day=new Date().toISOString().slice(0,10);
 const row=await db.prepare(reserveSQL).bind(day).first();
 return !!row;
}
