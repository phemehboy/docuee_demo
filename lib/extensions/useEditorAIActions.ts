import { useAIPanelStore } from "@/app/(root)/store/use-AI-panel-store";
import { useEditorStore } from "@/app/(root)/store/use-Editor-store";
import { Doc } from "@/convex/_generated/dataModel";
import { mockAIResponse } from "@/lib/ai/mockAI";

export function useEditorAIActions(
  project: Doc<"projects"> | null | undefined,
  stageKey: string,
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const { editor } = useEditorStore();
  const { openPanel } = useAIPanelStore();

  const runAI = async (action: string) => {
    if (!editor) return;

    console.log("Running AI action:", action);

    // Open panel immediately
    openPanel({
      action,
      stageKey,
      explanation: "AI is thinking...",
      suggestedText: "",
      isLoading: true,
    });
    console.log("Panel after initial open:", useAIPanelStore.getState());

    const stageContent = editor.getText().trim();
    const selectedText = editor.state.selection.empty
      ? null
      : editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          "\n",
        );

    const data = await mockAIResponse({
      action,
      stageKey,
      selectedText,
      fullText: stageContent.length > 0 ? stageContent : "",
      projectTitle: project?.title,
    });

    console.log("Mock AI data:", data);

    openPanel(data);
    console.log("Panel after mock data:", useAIPanelStore.getState());
  };

  return { runAI };
}
