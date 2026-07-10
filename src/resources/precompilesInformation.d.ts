/** Type declarations for the CommonJS module src/resources/precompilesInformation.js. */

interface PrecompileInfo {
  methodOverrides?: any;
  eventOverrides?: any;
}

/** Per-precompile method/event override metadata, keyed by precompile name. */
export declare const precompilesInformation: Record<string, PrecompileInfo>;

/** Override metadata for the NodeInterface precompile. */
export declare const nodeInterfaceInformation: PrecompileInfo;
