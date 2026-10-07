/** Safe identifiers and comments for generated source files. */
export function exportSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "palette";
}

export function exportComment(value: string): string {
  return value.replace(/[<>\r\n{}]/g, " ").replace(/\*\//g, " ");
}
