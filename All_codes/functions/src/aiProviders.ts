// Gemini is the primary model for both text and vision; Groq is the
// fallback when Gemini is unavailable, errors, or its key isn't set.
export interface ProviderKeys {
  geminiApiKey?: string;
  groqApiKey?: string;
}

const GEMINI_MODEL = 'gemini-3.7-flash';
const GROQ_TEXT_MODEL = 'openai/gpt-oss-120b';
const GROQ_VISION_MODEL = 'qwen/qwen3.6-27b';

export async function generateText(
  systemPrompt: string,
  userMessage: string,
  keys: ProviderKeys
): Promise<{ text: string; provider: 'gemini' | 'groq' } | null> {
  if (keys.geminiApiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: keys.geminiApiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `${systemPrompt}\n\nUser: ${userMessage}`,
      });
      if (response.text) return { text: response.text, provider: 'gemini' };
    } catch {
      // Fall through to Groq
    }
  }

  if (keys.groqApiKey) {
    try {
      const Groq = (await import('groq-sdk')).default;
      const client = new Groq({ apiKey: keys.groqApiKey });
      const completion = await client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        model: GROQ_TEXT_MODEL,
        temperature: 0.2,
      });
      const text = completion.choices[0]?.message?.content;
      if (text) return { text, provider: 'groq' };
    } catch {
      // Caller falls back to its own grounded template
    }
  }

  return null;
}

export async function generateVisionText(
  promptText: string,
  imageBase64: string,
  mimeType: string,
  keys: ProviderKeys
): Promise<string | null> {
  if (keys.geminiApiKey) {
    try {
      const { GoogleGenAI, createUserContent, createPartFromBase64 } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: keys.geminiApiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: createUserContent([promptText, createPartFromBase64(imageBase64, mimeType)]),
      });
      if (response.text) return response.text;
    } catch {
      // Fall through to Groq
    }
  }

  if (keys.groqApiKey) {
    try {
      const Groq = (await import('groq-sdk')).default;
      const client = new Groq({ apiKey: keys.groqApiKey });
      const completion = await client.chat.completions.create({
        model: GROQ_VISION_MODEL,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            ] as any,
          },
        ],
      });
      return completion.choices[0]?.message?.content?.trim() || null;
    } catch {
      return null;
    }
  }

  return null;
}
