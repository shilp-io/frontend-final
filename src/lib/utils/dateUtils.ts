export function formatDate(date: string | null | undefined): string | null {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "2-digit",
    });
  } catch {
    return null;
  }
}
