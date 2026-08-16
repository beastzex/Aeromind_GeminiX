import { generateVisionText, ProviderKeys } from './aiProviders';

export interface ParsedBoardingPass {
  flightNo: string;
  carrier: string;
  origin: string;
  destination: string;
  dep: string;
  arr: string;
  gate?: string;
  terminal?: string;
  seat?: string;
  pnr?: string;
  aircraft?: string;
}

const EXTRACTION_PROMPT = `You are a boarding pass OCR extraction engine. Read the boarding pass image and return ONLY a JSON object (no markdown fences, no commentary) with these exact keys:
{"flightNo": string, "carrier": string, "origin": string, "destination": string, "dep": string, "arr": string, "gate": string|null, "terminal": string|null, "seat": string|null, "pnr": string|null, "aircraft": string|null}
"origin" and "destination" should be full "City (IATA)" strings if visible, e.g. "Delhi (DEL)". "dep" and "arr" are the departure/arrival times as printed. If a field truly isn't visible on the pass, use null for it — never invent a value. If this image is not a boarding pass at all, return {"error": "not_a_boarding_pass"}.`;

export async function parseBoardingPassImage(
  imageBase64: string,
  mimeType: string,
  keys: ProviderKeys
): Promise<ParsedBoardingPass> {
  const raw = (await generateVisionText(EXTRACTION_PROMPT, imageBase64, mimeType, keys))?.trim();
  if (!raw) {
    throw new Error('No vision model available or it returned no content');
  }

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not locate JSON in model response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (parsed.error === 'not_a_boarding_pass') {
    throw new Error('Image does not appear to be a boarding pass');
  }
  if (!parsed.flightNo || !parsed.origin || !parsed.destination) {
    throw new Error('Could not confidently read required fields from this boarding pass');
  }

  return parsed as ParsedBoardingPass;
}
