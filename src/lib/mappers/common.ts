// src/lib/mappers/common.ts
export function toIsoDate(input: any): string | null {
    if (!input) return null;
    if (typeof input === 'string') return input;
    try {
      return new Date(input).toISOString();
    } catch {
      return null;
    }
  }
  
  export function toNumber(input: any, fallback = 0): number {
    const n = typeof input === 'number' ? input : Number(input);
    return Number.isFinite(n) ? n : fallback;
  }
  
  export function toInt(input: any, fallback = 0): number {
    return Math.trunc(toNumber(input, fallback));
  }
  
  export function toBool(input: any, fallback = false): boolean {
    if (typeof input === 'boolean') return input;
    if (typeof input === 'string') return input.toLowerCase() === 'true';
    if (typeof input === 'number') return input !== 0;
    return fallback;
  }
  
  export function toStringSafe(input: any, fallback = ''): string {
    if (input === undefined || input === null) return fallback;
    return String(input);
  }
  
  export function toArray<T>(input: any, mapper: (x: any) => T): T[] {
    if (!Array.isArray(input)) return [];
    return input.map(mapper);
  }
  
  export function percent0to100(input: any, fallback = 0): number {
    const n = toNumber(input, fallback);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, n));
  }
  
  export function clamp01(input: any, fallback = 0): number {
    const n = toNumber(input, fallback);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(1, n));
  }