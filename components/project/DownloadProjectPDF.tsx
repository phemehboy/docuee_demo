"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  pdf,
  View,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

import { Download } from "lucide-react";
import { getConvexClient } from "@/lib/convex/convexClient";

interface DownloadProjectPDFProps {
  projectId: Id<"projects">;
  fileName?: string;
  buttonClassName?: string;
  buttonLabel?: string;
  noLabel?: boolean;
}

const styles = StyleSheet.create({
  page: { padding: 30 },
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  h3: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  h4: { fontSize: 14, fontWeight: "bold", marginBottom: 6 },
  p: { fontSize: 12, lineHeight: 1.6, marginBottom: 6 },
  li: { fontSize: 12, marginBottom: 4, marginLeft: 12 },
});

export const DownloadProjectPDF: React.FC<DownloadProjectPDFProps> = ({
  projectId,
  fileName,
  buttonClassName,
  buttonLabel,
  noLabel,
}) => {
  const convexClient = getConvexClient();

  // Render HTML to PDF-friendly format
  const renderHtmlContent = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const children: React.ReactNode[] = [];

    doc.body.childNodes.forEach((node, index) => {
      switch (node.nodeName) {
        case "H1":
          children.push(
            <Text style={styles.h1} key={index}>
              {node.textContent}
            </Text>,
          );
          break;
        case "H2":
          children.push(
            <Text style={styles.h2} key={index}>
              {node.textContent}
            </Text>,
          );
          break;
        case "H3":
          children.push(
            <Text style={styles.h3} key={index}>
              {node.textContent}
            </Text>,
          );
          break;
        case "H4":
          children.push(
            <Text style={styles.h4} key={index}>
              {node.textContent}
            </Text>,
          );
          break;
        case "P":
          children.push(
            <Text style={styles.p} key={index}>
              {node.textContent}
            </Text>,
          );
          break;
        case "UL":
          node.childNodes.forEach((liNode, liIndex) => {
            if (liNode.nodeName === "LI") {
              children.push(
                <Text style={styles.li} key={`${index}-${liIndex}`}>
                  • {liNode.textContent}
                </Text>,
              );
            }
          });
          break;
        case "OL":
          node.childNodes.forEach((liNode, liIndex) => {
            if (liNode.nodeName === "LI") {
              children.push(
                <Text style={styles.li} key={`${index}-${liIndex}`}>
                  {liIndex + 1}. {liNode.textContent}
                </Text>,
              );
            }
          });
          break;
      }
    });

    return (
      <View wrap style={{ marginTop: 10 }}>
        {children}
      </View>
    );
  };

  const handleDownload = async () => {
    try {
      const projectData = await convexClient.query(
        api.projects.getProjectById,
        {
          id: projectId,
        },
      );
      if (!projectData) return console.error("Project not found");

      const stagesArray = Object.entries(projectData.submissionStages || {})
        .map(([stageName, data]) => ({ stageName, ...data }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const MyPDFDocument = (
        <Document>
          {stagesArray.map(
            (stage) =>
              stage.content && (
                <Page size="A4" style={styles.page} key={stage.stageName}>
                  {renderHtmlContent(stage.content)}
                </Page>
              ),
          )}
        </Document>
      );

      const blob = await pdf(MyPDFDocument).toBlob();
      saveAs(blob, fileName || `${projectData.title}-project.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  return (
    <button
      onClick={handleDownload}
      title={buttonLabel || "Download Project PDF"} // Tooltip on hover or tap
      className={
        buttonClassName ||
        "flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded-md transition cursor-pointer"
      }
    >
      <Download className="h-5 w-5" />
      {!noLabel && (
        <span className="hidden sm:inline">
          {buttonLabel || "Download Project PDF"}
        </span>
      )}
    </button>
  );
};
