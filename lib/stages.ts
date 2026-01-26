export function keyToLabel(key?: string | null) {
  if (!key) return "N/A"; // ✅ safeguard

  return (
    key
      // Add space before numbers → "chapter1" → "chapter 1"
      .replace(/([a-z])([0-9])/gi, "$1 $2")
      // Add space before capital letters → "finalSubmission" → "final Submission"
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Replace underscores/hyphens with spaces
      .replace(/[-_]/g, " ")
      // Insert spaces for common concatenated words (finalsubmission → final submission)
      .replace(/(final|submission|chapter|proposal)/gi, " $1")
      // Normalize spaces
      .replace(/\s+/g, " ")
      .trim()
      // Capitalize first letter of each word
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
  );
}

// turn admin label into canonical key (same as your buildInitialSubmissionStages)
export function labelToKey(label: string) {
  return label.toLowerCase().replace(/\s+/g, "");
}
