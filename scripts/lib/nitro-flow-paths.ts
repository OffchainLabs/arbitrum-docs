import { FLOWS } from '../../components/widgets/NitroTxFlow/flows.ts';
import { type CodeRef, type Step, codeRefs } from '../../components/widgets/NitroTxFlow/model.ts';

/** Every code ref a step cites, including those inside its detail flow. */
function stepRefs(step: Step): CodeRef[] {
  const own = [...(step.code ? [step.code] : []), ...step.citations];
  return step.detail ? [...own, ...step.detail.flow.steps.flatMap(stepRefs)] : own;
}

/**
 * The code refs of every flow in the Nitro flow widget for `repo`, each labelled with the flow and
 * the first top-level step that cites it, directly or in its detail flow.
 */
export function modelPaths(
  repo: 'nitro' | 'nitro-contracts',
): Array<{ path: string; label: string }> {
  const seen = new Set<string>();
  const result: Array<{ path: string; label: string }> = [];
  for (const flow of Object.values(FLOWS)) {
    for (const ref of codeRefs(flow)) {
      if (ref.repo !== repo || seen.has(ref.path)) continue;
      seen.add(ref.path);
      const step = flow.steps.find((s) =>
        stepRefs(s).some((r) => r.repo === ref.repo && r.path === ref.path),
      );
      result.push({ path: ref.path, label: `${ref.path} (${flow.id}, step ${step?.id})` });
    }
  }
  return result;
}
