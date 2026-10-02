import { apiPost } from './apiClient';

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

export async function processAdvisorMessage(
  userMessage: string
): Promise<AdvisorChatResponse> {
  return apiPost<AdvisorChatResponse>('/api/advisor-chat', { message: userMessage });
}
