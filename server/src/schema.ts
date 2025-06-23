
import { z } from 'zod';

// Session schema
export const sessionSchema = z.object({
  id: z.string(),
  current_round_number: z.number().int().nonnegative(),
  state: z.enum(['waitingForInputs', 'resultsCalculated', 'roundEnded']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Session = z.infer<typeof sessionSchema>;

// Participant schema
export const participantSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  name: z.string(),
  is_connected: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Participant = z.infer<typeof participantSchema>;

// Round input schema
export const roundInputSchema = z.object({
  id: z.string(),
  participant_id: z.string(),
  session_id: z.string(),
  round_number: z.number().int().positive(),
  shares: z.record(z.string(), z.number().min(0).max(100)), // participant_id -> percentage
  dealbreaker: z.number().int().min(0).max(100),
  created_at: z.coerce.date()
});

export type RoundInput = z.infer<typeof roundInputSchema>;

// Input schemas for API operations
export const createSessionInputSchema = z.object({
  participant_name: z.string().min(1).max(50)
});

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;

export const joinSessionInputSchema = z.object({
  session_id: z.string(),
  participant_name: z.string().min(1).max(50)
});

export type JoinSessionInput = z.infer<typeof joinSessionInputSchema>;

export const submitRoundInputSchema = z.object({
  session_id: z.string(),
  participant_id: z.string(),
  round_number: z.number().int().positive(),
  shares: z.record(z.string(), z.number().min(0).max(100))
    .refine(
      (shares) => {
        const total = Object.values(shares).reduce((sum, share) => sum + share, 0);
        return Math.abs(total - 100) < 0.01; // Allow for floating point precision
      },
      { message: "Shares must sum to 100%" }
    ),
  dealbreaker: z.number().int().min(0).max(100)
});

export type SubmitRoundInputInput = z.infer<typeof submitRoundInputSchema>;

export const updateParticipantConnectionSchema = z.object({
  participant_id: z.string(),
  is_connected: z.boolean()
});

export type UpdateParticipantConnectionInput = z.infer<typeof updateParticipantConnectionSchema>;

// Response schemas
export const sessionWithParticipantsSchema = z.object({
  session: sessionSchema,
  participants: z.array(participantSchema)
});

export type SessionWithParticipants = z.infer<typeof sessionWithParticipantsSchema>;

export const roundResultSchema = z.object({
  round_number: z.number().int().positive(),
  average_shares: z.record(z.string(), z.number()), // participant_id -> average percentage
  dealbreaker_violations: z.array(z.object({
    participant_id: z.string(),
    participant_name: z.string(),
    average_share: z.number(),
    dealbreaker: z.number()
  })),
  dealbreakers_sum_exceeded: z.boolean(),
  total_dealbreakers: z.number()
});

export type RoundResult = z.infer<typeof roundResultSchema>;

export const sessionStatusSchema = z.object({
  session: sessionSchema,
  participants: z.array(participantSchema),
  round_inputs_count: z.number().int().nonnegative(),
  pending_participants: z.array(z.string()) // participant IDs who haven't submitted
});

export type SessionStatus = z.infer<typeof sessionStatusSchema>;
