import { ISchool } from "../database/models/school.model";

export function buildInitialSubmissionStages(school: ISchool) {
  const stages: Record<string, any> = {};

  (school.projectStages || []).forEach((stage, index) => {
    const key = stage.toLowerCase().replace(/\s+/g, ""); // e.g. "Chapter 1" → "chapter1"
    stages[key] = {
      content: "",
      submitted: false,
      editableByStudent: true,
      completed: false,
      order: index, // ✅ ensure every stage has an order
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
