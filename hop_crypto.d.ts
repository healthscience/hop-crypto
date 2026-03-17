/* tslint:disable */
/* eslint-disable */

export class SovereignKeypair {
    free(): void;
    [Symbol.dispose](): void;
    derive_sub_key(seed: Uint8Array, label: string): Uint8Array;
    constructor(seed: Uint8Array);
    get_public_key(): Uint8Array;
    sign_intent(intent_msg: string): Uint8Array;
}

export function derive_master_seed(password: string, salt: Uint8Array): Uint8Array;

export function init_panic_hook(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_sovereignkeypair_free: (a: number, b: number) => void;
    readonly derive_master_seed: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly sovereignkeypair_derive_sub_key: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly sovereignkeypair_from_seed: (a: number, b: number) => [number, number, number];
    readonly sovereignkeypair_get_public_key: (a: number) => [number, number];
    readonly sovereignkeypair_sign_intent: (a: number, b: number, c: number) => [number, number];
    readonly init_panic_hook: () => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
