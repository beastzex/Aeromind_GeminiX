import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export interface ToolCallCitation {
  toolName: string;
  source: string;
  timestamp: string;
  data: Record<string, unknown>;
}

interface AdvisorChatResponse {
  reply: string;
  citations: ToolCallCitation[];
}

const advisorChatCallable = httpsCallable<{ message: string }, AdvisorChatResponse>(
  functions,
  'advisorChat'
);

export async function processAdvisorMessage(
  userMessage: string
): Promise<AdvisorChatResponse> {
  const res = await advisorChatCallable({ message: userMessage });
  return res.data;
}
