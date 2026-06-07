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
  type HookGenerationInput,
} from "./prompts/hooks.ts";
import { parsePremiumHooksResponse } from "./response-parser.ts";

const DEFAULT_MAX_REGEN_ATTEMPTS = 3;

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
    temperature: 0.75,
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
      temperature: 0.65,
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
