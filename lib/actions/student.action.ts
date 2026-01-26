"use server";

import { connectToDatabase } from "../database";
import Student from "../database/models/student.model";

import { handleError } from "../utils";

export async function createStudent(
  userId: string,
  details: {
    school: string | null;
  },
) {
  try {
    await connectToDatabase();

    const existingStudent = await Student.findOne({ userId });

    if (existingStudent) {
      existingStudent.school = details.school;

      const updatedStudent = await existingStudent.save();

      if (!updatedStudent) {
        console.error("Failed to update the student record.", {
          userId,
          details,
        });
        throw new Error("Failed to update student. Please try again.");
      }

      return JSON.parse(JSON.stringify(updatedStudent));
    }

    const newStudent = await Student.create({
      userId,
      school: details.school,
    });

    if (!newStudent) {
      console.error("No student record was created.", { userId, details });
      throw new Error("Failed to create student. Please try again.");
    }

    return JSON.parse(JSON.stringify(newStudent));
  } catch (error) {
    console.error("Error creating student:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null,
      userId,
      details,
    });
    throw new Error("Failed to create student. Please try again later.");
  }
}

export async function getStudentByUserId(userId: string) {
  try {
    await connectToDatabase();

    // Then find the student with that userId
    const student = await Student.findOne({ userId }).populate([
      {
        path: "userId",
        populate: [
          "school",
          "department",
          "level",
          "program",
          "studyMode",
          "designation",
          "supervisor",
          "hodDepartment",
        ],
      },
      { path: "school" }, // 👈 force populate Student.school
      { path: "supervisor" },
      { path: "department" },
      { path: "level" },
      { path: "program" },
      { path: "studyMode" },
      { path: "semester" }, // since you added this too
      { path: "group" },
    ]);

    return JSON.parse(JSON.stringify(student));
  } catch (error) {
    handleError(error);
    return null;
  }
}
