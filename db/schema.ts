// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable, integer, text} from 'drizzle-orm/sqlite-core';
export const demoBudget=sqliteTable('demo_budget',{id:integer('id').primaryKey(),day:text('day').notNull(),daily:integer('daily').notNull(),total:integer('total').notNull()});
