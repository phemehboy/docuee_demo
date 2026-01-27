import { actions } from "@/constants";

export interface MockAIResponse {
  action: string;
  stageKey: string;
  explanation: string;
  suggestedText: string;
  isLoading: boolean;
  error?: boolean;
}

export async function mockAIResponse({
  action,
  stageKey,
  selectedText,
  fullText,
  projectTitle,
}: {
  action: string;
  stageKey: string;
  selectedText?: string | null;
  fullText?: string;
  projectTitle?: string;
}): Promise<MockAIResponse> {
  // Small delay to simulate network call
  await new Promise((resolve) => setTimeout(resolve, 500));

  const actionMeta = actions.find((a) => a.action === action);

  return {
    action,
    stageKey,
    explanation:
      action === "STRUCTURE_SECTION"
        ? "AI suggests a logical flow and subheadings for this section."
        : action === "EXPLAIN_SECTION"
          ? "AI explains the core ideas you might include here."
          : action === "IMPROVE_CLARITY"
            ? "AI rewrites the text to be more concise and academically formal."
            : action === "FIND_GAPS"
              ? "AI highlights weak points and missing arguments in this section."
              : "AI suggestion provided.",
    suggestedText: selectedText
      ? `${selectedText} — [mock AI enhanced content for ${actionMeta?.label}]`
      : `Here’s a mock suggestion for stage "${stageKey}" in project "${projectTitle}" for action "${actionMeta?.label}"`,
    isLoading: false,
  };
}
