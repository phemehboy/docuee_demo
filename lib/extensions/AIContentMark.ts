import { Mark } from "@tiptap/core";

export const AIContentMark = Mark.create({
  name: "aiContent",

  addAttributes() {
    return {
      aiId: {
        default: null,
      },
      originalHash: {
        default: null,
      },
      originalLength: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-ai-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        ...HTMLAttributes,
        "data-ai-id": HTMLAttributes.aiId,
        class: "ai-generated",
      },
      0,
    ];
  },
});
