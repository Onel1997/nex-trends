/** Hook generation orchestration with framework coverage validation + targeted regen. */

import { callOpenAI } from "./openai-client.ts";
import {
  analyzeFrameworkCoverage,
  assertFullFrameworkCoverage,
  HOOK_FRAMEWORKS,
  mergeHookSets,
  type PremiumHook,
} from "./premium-hook.ts";
import {
  buildHookSystemPrompt,
  buildHookUserMessage,
  buildMissingFrameworksSystemPrompt,
  buildMissingFrameworksUserMessage,
  normalizeHookTone,
  type HookGenerationInput,
} from "./prompts/hooks.ts";
import { parsePremiumHooksResponse } from "./response-parser.ts";

const DEFAULT_MAX_REGEN_ATTEMPTS = 3;

const TONE_TEMPERATURE: Record<string, number> = {
  aggressive: 0.82,
  luxury: 0.62,
  storytelling: 0.78,
  faceless: 0.68,
  ugc: 0.8,
};

function temperatureForTone(tone: string): number {
  return TONE_TEMPERATURE[normalizeHookTone(tone)] ?? 0.75;
}

export type GeneratePremiumHooksResult = {
  hooks: PremiumHook[];
  regenAttempts: number;
  initialCoverage: ReturnType<typeof analyzeFrameworkCoverage>;
};

export async function generatePremiumHooks(
  input: HookGenerationInput,
  options?: { maxRegenAttempts?: number },
): Promise<GeneratePremiumHooksResult> {
  const maxRegenAttempts = options?.maxRegenAttempts ?? DEFAULT_MAX_REGEN_ATTEMPTS;

  const initialRaw = await callOpenAI({
    systemPrompt: buildHookSystemPrompt(input.tone, input.platform),
    userMessage: buildHookUserMessage(input),
    temperature: temperatureForTone(input.tone),
    jsonMode: true,
  });

  let hooks = parsePremiumHooksResponse(initialRaw, HOOK_FRAMEWORKS.length);
  const initialCoverage = analyzeFrameworkCoverage(hooks);
  let coverage = initialCoverage;
  let regenAttempts = 0;

  console.log("[hook-generator] initial framework coverage", {
    complete: initialCoverage.complete,
    missing: initialCoverage.missing,
    duplicates: initialCoverage.duplicates,
    covered: initialCoverage.covered.length,
  });

  while (!coverage.complete && regenAttempts < maxRegenAttempts) {
    regenAttempts++;
    const missing = coverage.missing;

    console.log("[hook-generator] regenerating missing frameworks", {
      attempt: regenAttempts,
      missing,
    });

    const regenRaw = await callOpenAI({
      systemPrompt: buildMissingFrameworksSystemPrompt(
        missing,
        input.tone,
        input.platform,
      ),
      userMessage: buildMissingFrameworksUserMessage(input, missing, hooks),
      temperature: Math.max(0.55, temperatureForTone(input.tone) - 0.08),
      jsonMode: true,
    });

    const regenHooks = parsePremiumHooksResponse(regenRaw, missing.length);
    hooks = mergeHookSets(hooks, regenHooks);
    coverage = analyzeFrameworkCoverage(hooks);

    console.log("[hook-generator] post-regen framework coverage", {
      attempt: regenAttempts,
      complete: coverage.complete,
      missing: coverage.missing,
      covered: coverage.covered.length,
    });
  }

  try {
    hooks = assertFullFrameworkCoverage(hooks);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `${message} (nach ${regenAttempts} Regenerierungsversuch${regenAttempts === 1 ? "" : "en"})`,
    );
  }

  return { hooks, regenAttempts, initialCoverage };
}
