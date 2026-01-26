export function buildIndependentSubmissionStages() {
  const defaultStages = [
    "Seminar",
    "Proposal",
    "Chapter 1",
    "Chapter 2",
    "Chapter 3",
    "Chapter 4",
    "Chapter 5",
    "Final Submission",
  ];

  const stages: Record<string, any> = {};

  defaultStages.forEach((stage, index) => {
    const key = stage.toLowerCase().replace(/\s+/g, ""); // e.g. "Chapter 1" → "chapter1"

    stages[key] = {
      content: "",
      submitted: false,
      editableByStudent: true,
      completed: false,
      order: index, // ✅ ordering preserved
      fine: {
        amount: 0,
        isPaid: false,
        applied: false,
        currency: "NGN",
        paymentService: "paystack",
      },
    };
  });

  return stages;
}
