"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PresentationPage } from "@/components/project/presentation";
import { Id } from "@/convex/_generated/dataModel";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ProjectPresentation() {
  const router = useRouter();
  const params = useParams();
  const { projectId } = params;

  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch project
  const project = useQuery(api.projects.getProjectById, {
    id: projectId as Id<"projects">,
  });

  if (!project) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  // Slides are stored inside project.generatedSlides
  const slides = project.generatedSlides || [];

  // Can generate slides if user is Pro and no slides exist yet
  const canGenerateSlides =
    project.studentSubscriptionType === "pro" && slides.length === 0;

  return canGenerateSlides ? (
    <>
      <Button
        variant="outline"
        className=" hover:text-blue-500 absolute top-4 left-4"
        onClick={() =>
          router.replace(
            `/user/${project.studentUserId}/projects/${project.projectId}`
          )
        }
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      <div className="flex flex-col items-center justify-center h-screen px-6">
        <div className="bg-white/90 rounded-xl border shadow-md p-6 max-w-xl text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🎤 Prepare Your Presentation
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Turn your completed project into slides for defense or presentation.
          </p>
          <Button
            className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-full"
            disabled={isGenerating}
            onClick={async () => {
              try {
                setIsGenerating(true);

                const res = await fetch(`/api/ai/generate-slides`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ projectId: project._id }),
                });

                if (!res.ok) {
                  throw new Error("Failed to generate slides");
                }

                router.refresh(); // reload project with slides
              } catch (err) {
                alert("Failed to generate slides");
              } finally {
                setIsGenerating(false);
              }
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate AI Slides"
            )}
          </Button>
        </div>
      </div>
    </>
  ) : (
    <PresentationPage
      allPresentations={[
        {
          id: project._id,
          title: project.title,
          slides: project.generatedSlides || [],
        },
      ]}
      onBack={() =>
        router.push(
          `/user/${project.studentUserId}/projects/${project.projectId}`
        )
      }
    />
  );
}
