import { ReactFlowData, TransitionConfig } from '../types';
import { convertDrawioToReactFlow } from './drawioToReactFlow';
import { convertExcalidrawToReactFlow } from './excalidrawToReactFlow';

/**
 * Dispatches to the correct diagram converter based on the source URL's extension.
 * `.excalidraw` → JSON parser. Anything else (including `.drawio`) falls through to the
 * legacy draw.io XML parser.
 */
export async function convertDiagramToReactFlow(
  content: string,
  sourceUrl: string,
  onNavigate?: (link: string) => void,
  transitions?: TransitionConfig[],
): Promise<ReactFlowData> {
  if (sourceUrl.toLowerCase().endsWith('.excalidraw')) {
    return convertExcalidrawToReactFlow(content, onNavigate, transitions);
  }
  return convertDrawioToReactFlow(content, onNavigate, transitions);
}
