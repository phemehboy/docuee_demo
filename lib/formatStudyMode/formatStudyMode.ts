export function formatStudyMode(raw: any): string {
  if (!raw) return "";

  // Extract the name if it's an object like { name: "full-time" }
  const name = typeof raw === "object" && "name" in raw ? raw.name : raw;

  if (typeof name !== "string") return "";

  return name
    .replace(/-/g, " ") // convert hyphens to spaces
    .split(" ") // split into words
    .filter(Boolean) // remove extra spaces
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) // capitalize each word
    .join(" ");
}
