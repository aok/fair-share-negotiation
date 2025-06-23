
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createSessionInputSchema,
  joinSessionInputSchema,
  submitRoundInputSchema,
  updateParticipantConnectionSchema
} from './schema';

// Import handlers
import { createSession } from './handlers/create_session';
import { joinSession } from './handlers/join_session';
import { getSession } from './handlers/get_session';
import { submitRoundInput } from './handlers/submit_round_input';
import { getSessionStatus } from './handlers/get_session_status';
import { updateParticipantConnection } from './handlers/update_participant_connection';
import { startNextRound } from './handlers/start_next_round';
import { getRoundResult } from './handlers/get_round_result';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Session management
  createSession: publicProcedure
    .input(createSessionInputSchema)
    .mutation(({ input }) => createSession(input)),

  joinSession: publicProcedure
    .input(joinSessionInputSchema)
    .mutation(({ input }) => joinSession(input)),

  getSession: publicProcedure
    .input(z.string())
    .query(({ input }) => getSession(input)),

  getSessionStatus: publicProcedure
    .input(z.string())
    .query(({ input }) => getSessionStatus(input)),

  // Round management
  submitRoundInput: publicProcedure
    .input(submitRoundInputSchema)
    .mutation(({ input }) => submitRoundInput(input)),

  startNextRound: publicProcedure
    .input(z.string())
    .mutation(({ input }) => startNextRound(input)),

  getRoundResult: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      roundNumber: z.number().int().positive()
    }))
    .query(({ input }) => getRoundResult(input.sessionId, input.roundNumber)),

  // Participant management
  updateParticipantConnection: publicProcedure
    .input(updateParticipantConnectionSchema)
    .mutation(({ input }) => updateParticipantConnection(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
