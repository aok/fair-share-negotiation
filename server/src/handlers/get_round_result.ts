
import { type RoundResult } from '../schema';

export declare function getRoundResult(sessionId: string, roundNumber: number): Promise<RoundResult | null>;
