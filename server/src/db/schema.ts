
import { pgTable, text, integer, boolean, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for session states
export const sessionStateEnum = pgEnum('session_state', ['waitingForInputs', 'resultsCalculated', 'roundEnded']);

// Sessions table
export const sessionsTable = pgTable('sessions', {
  id: text('id').primaryKey(),
  current_round_number: integer('current_round_number').notNull().default(1),
  state: sessionStateEnum('state').notNull().default('waitingForInputs'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Participants table
export const participantsTable = pgTable('participants', {
  id: text('id').primaryKey(),
  session_id: text('session_id').notNull().references(() => sessionsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  is_connected: boolean('is_connected').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Round inputs table
export const roundInputsTable = pgTable('round_inputs', {
  id: text('id').primaryKey(),
  participant_id: text('participant_id').notNull().references(() => participantsTable.id, { onDelete: 'cascade' }),
  session_id: text('session_id').notNull().references(() => sessionsTable.id, { onDelete: 'cascade' }),
  round_number: integer('round_number').notNull(),
  shares: jsonb('shares').notNull(), // JSON object: { participant_id: percentage }
  dealbreaker: integer('dealbreaker').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const sessionsRelations = relations(sessionsTable, ({ many }) => ({
  participants: many(participantsTable),
  roundInputs: many(roundInputsTable)
}));

export const participantsRelations = relations(participantsTable, ({ one, many }) => ({
  session: one(sessionsTable, {
    fields: [participantsTable.session_id],
    references: [sessionsTable.id]
  }),
  roundInputs: many(roundInputsTable)
}));

export const roundInputsRelations = relations(roundInputsTable, ({ one }) => ({
  participant: one(participantsTable, {
    fields: [roundInputsTable.participant_id],
    references: [participantsTable.id]
  }),
  session: one(sessionsTable, {
    fields: [roundInputsTable.session_id],
    references: [sessionsTable.id]
  })
}));

// TypeScript types for the table schemas
export type Session = typeof sessionsTable.$inferSelect;
export type NewSession = typeof sessionsTable.$inferInsert;
export type Participant = typeof participantsTable.$inferSelect;
export type NewParticipant = typeof participantsTable.$inferInsert;
export type RoundInput = typeof roundInputsTable.$inferSelect;
export type NewRoundInput = typeof roundInputsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  sessions: sessionsTable,
  participants: participantsTable,
  roundInputs: roundInputsTable
};
