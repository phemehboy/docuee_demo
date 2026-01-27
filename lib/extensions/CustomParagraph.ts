import Paragraph from "@tiptap/extension-paragraph";

export const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-ai-assisted": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-ai-assisted"),
        renderHTML: (attributes) => {
          if (!attributes["data-ai-assisted"]) {
            return {};
          }
          return {
            "data-ai-assisted": attributes["data-ai-assisted"],
          };
        },
      },
      "data-ai-action": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-ai-action"),
        renderHTML: (attributes) => {
          if (!attributes["data-ai-action"]) {
            return {};
          }
          return {
            "data-ai-action": attributes["data-ai-action"],
          };
        },
      },
    };
  },
});
