export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Normalize CSS hex notation, keeping embedded alpha separate from RGB. */
export function normalizeHexColor(input: string): { color: string; alpha: number } | null {
  const raw = input.trim().replace(/^#/, "");
  if (!/^(?:[a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/i.test(raw)) return null;
  const hex = raw.length <= 4 ? [...raw].map(c => c + c).join("") : raw;
  return { color: `#${hex.slice(0, 6).toUpperCase()}`, alpha: hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1 };
}

export function readStoredList<T>(key: string, validate: (item: unknown) => T | null): T[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.map(validate).filter((item): item is T => item !== null) : [];
  } catch {
    return [];
  }
}
