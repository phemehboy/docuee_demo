import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Project } from "./Project";

interface ProjectIdPageProps {
  params: Promise<{ projectId: Id<"projects">; id: string }>;
}

const ProjectIdPage = async ({ params }: ProjectIdPageProps) => {
  const { projectId, id } = await params;

  if (!projectId) {
    throw new Error("Project ID is missing or invalid");
  }

  return <Project projectId={projectId} id={id} />;
};

export default ProjectIdPage;
