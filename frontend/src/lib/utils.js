import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getStatusColor(status) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
  return colors[status] || colors.pending;
}

export function getSentimentColor(sentiment) {
  const colors = {
    positive: "text-primary",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };
  return colors[sentiment?.toLowerCase()] || colors.neutral;
}

export function getSentimentBgColor(sentiment) {
  const colors = {
    positive: "bg-primary/10",
    negative: "bg-destructive/10",
    neutral: "bg-accent",
  };
  return colors[sentiment?.toLowerCase()] || colors.neutral;
}

export function getSentimentVariant(sentiment) {
  const variants = {
    positive: "default",
    negative: "destructive",
    neutral: "secondary",
  };
  return variants[sentiment?.toLowerCase()] || "secondary";
}

export function downloadJSON(data, filename = "analysis-results.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadTextReport(
  analysisResult,
  survey,
  filename = "analysis-report.txt"
) {
  const text = generateTextReport(analysisResult, survey);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper function to extract clean text from potentially malformed JSON
function getSafeText(text) {
  if (!text) return "";

  // If it's already a clean string, return it
  if (
    typeof text === "string" &&
    !text.startsWith("{") &&
    !text.startsWith("[")
  ) {
    return text;
  }

  // Try to parse if it looks like JSON
  if (
    typeof text === "string" &&
    (text.startsWith("{") || text.startsWith("["))
  ) {
    try {
      const parsed = JSON.parse(text);
      // If parsed object has a summary field, use that
      if (parsed.summary) {
        return parsed.summary;
      }
      // If it's just a stringified object, return empty
      return "";
    } catch (e) {
      // If parsing fails, try to extract text between quotes using regex
      const summaryMatch = text.match(/"summary":\s*"([^"]+)"/);
      if (summaryMatch) {
        return summaryMatch[1].replace(/\\n/g, " ").replace(/\\/g, "");
      }
      // Return the original text as fallback
      return text;
    }
  }

  return String(text);
}

export async function downloadPDFReport(
  analysisResult,
  survey,
  filename = "analysis-report.pdf"
) {
  // Dynamic import to reduce bundle size
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Helper function to add text with automatic page breaks
  const addText = (text, fontSize = 10, isBold = false, indent = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont(undefined, isBold ? "bold" : "normal");

    const lines = doc.splitTextToSize(text, maxWidth - indent);

    lines.forEach((line) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin + indent, yPosition);
      yPosition += fontSize * 0.5;
    });

    yPosition += 2;
  };

  const addSpace = (space = 5) => {
    yPosition += space;
  };

  const addDivider = () => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  };

  // Title
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("SURVEY ANALYSIS REPORT", pageWidth / 2, 20, { align: "center" });

  yPosition = 40;
  doc.setTextColor(0, 0, 0);

  // Survey Information Section
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.setTextColor(59, 130, 246);
  doc.text("Survey Information", margin, yPosition);
  yPosition += 10;
  doc.setTextColor(0, 0, 0);

  // Light gray background box
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, yPosition - 5, maxWidth, 60, "F");

  doc.setFontSize(10);

  // Title
  doc.setFont(undefined, "bold");
  doc.text("Title:", margin + 5, yPosition);
  doc.setFont(undefined, "normal");
  const titleLines = doc.splitTextToSize(survey.title, maxWidth - 40);
  doc.text(titleLines, margin + 30, yPosition);
  yPosition += titleLines.length * 5 + 3;

  // Description
  if (survey.description) {
    doc.setFont(undefined, "bold");
    doc.text("Description:", margin + 5, yPosition);
    doc.setFont(undefined, "normal");
    const descLines = doc.splitTextToSize(survey.description, maxWidth - 40);
    doc.text(descLines, margin + 30, yPosition);
    yPosition += descLines.length * 5 + 3;
  }

  // Tags
  if (survey.tags && survey.tags.length > 0) {
    doc.setFont(undefined, "bold");
    doc.text("Tags:", margin + 5, yPosition);
    doc.setFont(undefined, "normal");
    doc.text(survey.tags.join(", "), margin + 30, yPosition);
    yPosition += 8;
  }

  // Stats row
  const statsStartY = yPosition;
  doc.setFont(undefined, "bold");
  doc.text("Type:", margin + 5, yPosition);
  doc.setFont(undefined, "normal");
  doc.text(
    survey.survey_type === "structured" ? "Multi-Question" : "Single Question",
    margin + 30,
    yPosition
  );

  doc.setFont(undefined, "bold");
  doc.text("Responses:", margin + 95, yPosition);
  doc.setFont(undefined, "normal");
  doc.text(
    String(analysisResult.total_responses_analyzed || survey.total_responses),
    margin + 122,
    yPosition
  );
  yPosition += 6;

  if (survey.total_participants) {
    doc.setFont(undefined, "bold");
    doc.text("Participants:", margin + 5, yPosition);
    doc.setFont(undefined, "normal");
    doc.text(String(survey.total_participants), margin + 30, yPosition);
  }

  doc.setFont(undefined, "bold");
  doc.text("Processing:", margin + 95, yPosition);
  doc.setFont(undefined, "normal");
  doc.text(
    `${analysisResult.processing_time?.toFixed(1) || "N/A"}s`,
    margin + 122,
    yPosition
  );
  yPosition += 6;

  doc.setFont(undefined, "bold");
  doc.text("Date:", margin + 5, yPosition);
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  doc.text(formatDate(analysisResult.created_at), margin + 30, yPosition);

  yPosition += 15;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  addSpace(10);

  // Multi-question survey analysis
  if (
    analysisResult.survey_type === "structured" &&
    analysisResult.question_analyses
  ) {
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Analysis by Question", margin, yPosition);
    yPosition += 8;
    addDivider();
    addSpace(5);

    analysisResult.question_analyses.forEach((qa, idx) => {
      // Question header
      doc.setFillColor(245, 245, 245);
      if (yPosition > pageHeight - margin - 10) {
        doc.addPage();
        yPosition = margin;
      }
      doc.rect(margin, yPosition - 5, maxWidth, 8, "F");
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(
        `Question ${idx + 1}: ${qa.question_text}`,
        margin + 2,
        yPosition
      );
      yPosition += 10;

      addText(`Response Count: ${qa.response_count}`, 9, false, 5);
      addSpace(3);

      // Summary
      if (qa.summary) {
        const cleanSummary = getSafeText(qa.summary);
        if (cleanSummary) {
          addText("Summary:", 10, true, 5);
          addText(cleanSummary, 9, false, 10);
          addSpace(5);
        }
      }

      // Key Findings - handle both array and JSON string
      let findings = qa.key_findings;
      if (typeof qa.key_findings === "string") {
        try {
          const parsed = JSON.parse(qa.key_findings);
          findings = parsed.key_findings || parsed;
        } catch (e) {
          findings = [];
        }
      }

      if (findings && Array.isArray(findings) && findings.length > 0) {
        addText("Key Findings:", 10, true, 5);
        findings.forEach((finding, i) => {
          const cleanFinding = getSafeText(finding);
          if (cleanFinding) {
            addText(`${i + 1}. ${cleanFinding}`, 9, false, 10);
          }
        });
        addSpace(5);
      }

      // Sentiment
      if (qa.sentiment) {
        addText("Sentiment Analysis:", 10, true, 5);
        console.log("Sentiment data:", qa.sentiment);
        const sentimentLabel =
          qa.sentiment.label || qa.sentiment.overall || "Not Available";
        const sentimentScore =
          qa.sentiment.score || qa.sentiment.confidence || 0;
        console.log("Parsed:", { sentimentLabel, sentimentScore });
        addText(
          `Overall: ${sentimentLabel} (${(sentimentScore * 100).toFixed(
            1
          )}% confidence)`,
          9,
          false,
          10
        );
        addSpace(5);
      }

      // Topics
      if (qa.topics && qa.topics.length > 0) {
        addText("Main Topics:", 10, true, 5);
        qa.topics.slice(0, 5).forEach((topic, i) => {
          addText(
            `${i + 1}. ${topic.topic} (${topic.frequency} mentions)`,
            9,
            false,
            10
          );
          if (topic.keywords && topic.keywords.length > 0) {
            addText(`Keywords: ${topic.keywords.join(", ")}`, 8, false, 15);
          }
        });
        addSpace(5);
      }

      addSpace(10);
    });
  }
  // Simple survey analysis
  else {
    // Summary
    if (analysisResult.summary) {
      const cleanSummary = getSafeText(analysisResult.summary);
      if (cleanSummary) {
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text("Overall Summary", margin, yPosition);
        yPosition += 8;
        addDivider();
        addText(cleanSummary, 10);
        addSpace(10);
      }
    }

    // Key Findings - handle both array and JSON string
    let findings = analysisResult.key_findings;
    if (typeof analysisResult.key_findings === "string") {
      try {
        const parsed = JSON.parse(analysisResult.key_findings);
        findings = parsed.key_findings || parsed;
      } catch (e) {
        findings = [];
      }
    }

    if (findings && Array.isArray(findings) && findings.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Key Findings", margin, yPosition);
      yPosition += 8;
      addDivider();
      findings.forEach((finding, i) => {
        const cleanFinding = getSafeText(finding);
        if (cleanFinding) {
          addText(`${i + 1}. ${cleanFinding}`, 10);
        }
      });
      addSpace(10);
    }

    // Sentiment
    if (analysisResult.overall_sentiment) {
      const sentimentLabel =
        analysisResult.overall_sentiment.label ||
        analysisResult.overall_sentiment.overall ||
        "Not Available";
      const sentimentScore =
        analysisResult.overall_sentiment.score ||
        analysisResult.overall_sentiment.confidence ||
        0;

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Sentiment Analysis", margin, yPosition);
      yPosition += 8;
      addDivider();
      addText(`Overall Sentiment: ${sentimentLabel}`, 10, true);
      addText(`Confidence: ${(sentimentScore * 100).toFixed(1)}%`, 10);

      if (analysisResult.sentiment_distribution) {
        addSpace(5);
        addText("Distribution:", 10, true);
        Object.entries(analysisResult.sentiment_distribution).forEach(
          ([sentiment, count]) => {
            const percentage = (
              (count / analysisResult.total_responses_analyzed) *
              100
            ).toFixed(1);
            addText(
              `${sentiment}: ${count} responses (${percentage}%)`,
              9,
              false,
              5
            );
          }
        );
      }
      addSpace(10);
    }

    // Topics
    if (analysisResult.topics && analysisResult.topics.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Main Topics", margin, yPosition);
      yPosition += 8;
      addDivider();
      analysisResult.topics.slice(0, 10).forEach((topic, i) => {
        addText(`${i + 1}. ${topic.topic}`, 10, true);
        addText(`Frequency: ${topic.frequency} mentions`, 9, false, 5);
        if (topic.keywords && topic.keywords.length > 0) {
          addText(`Keywords: ${topic.keywords.join(", ")}`, 9, false, 5);
        }
        addSpace(3);
      });
      addSpace(10);
    }

    // Open Problems
    if (
      analysisResult.open_problems &&
      analysisResult.open_problems.length > 0
    ) {
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Identified Issues & Opportunities", margin, yPosition);
      yPosition += 8;
      addDivider();
      analysisResult.open_problems.forEach((problem, i) => {
        addText(
          `${i + 1}. ${problem.title} [Priority: ${problem.priority}]`,
          10,
          true
        );
        addText(`Category: ${problem.category}`, 9, false, 5);
        addText(problem.description, 9, false, 5);
        addSpace(5);
      });
    }
  }

  // Save the PDF
  doc.save(filename);
}

function generateTextReport(analysis, survey) {
  const lines = [];
  const divider = "=".repeat(80);
  const separator = "-".repeat(80);

  // Header
  lines.push(divider);
  lines.push("SURVEY ANALYSIS REPORT");
  lines.push(divider);
  lines.push("");

  // Survey Information
  lines.push("SURVEY INFORMATION");
  lines.push(separator);
  lines.push(`Title: ${survey.title}`);
  if (survey.description) {
    lines.push(`Description: ${survey.description}`);
  }
  if (survey.tags && survey.tags.length > 0) {
    lines.push(`Tags: ${survey.tags.join(", ")}`);
  }
  lines.push(
    `Survey Type: ${
      survey.survey_type === "structured" ? "Multi-Question" : "Single Question"
    }`
  );
  lines.push(
    `Total Responses: ${
      analysis.total_responses_analyzed || survey.total_responses
    }`
  );
  if (survey.total_participants) {
    lines.push(`Total Participants: ${survey.total_participants}`);
  }
  lines.push(`Analysis Date: ${formatDate(analysis.created_at)}`);
  lines.push(
    `Processing Time: ${analysis.processing_time?.toFixed(2) || "N/A"} seconds`
  );
  lines.push("");
  lines.push("");

  // Multi-question survey analysis
  if (analysis.survey_type === "structured" && analysis.question_analyses) {
    lines.push("ANALYSIS BY QUESTION");
    lines.push(divider);
    lines.push("");

    analysis.question_analyses.forEach((qa, idx) => {
      lines.push(`QUESTION ${idx + 1}: ${qa.question_text}`);
      lines.push(separator);
      lines.push(`Response Count: ${qa.response_count}`);
      lines.push("");

      // Summary
      if (qa.summary) {
        lines.push("Summary:");
        lines.push(qa.summary);
        lines.push("");
      }

      // Key Findings
      if (qa.key_findings && qa.key_findings.length > 0) {
        lines.push("Key Findings:");
        qa.key_findings.forEach((finding, i) => {
          lines.push(`  ${i + 1}. ${finding}`);
        });
        lines.push("");
      }

      // Sentiment Analysis
      if (qa.sentiment) {
        lines.push("Sentiment Analysis:");
        lines.push(
          `  Overall: ${qa.sentiment.label} (${(
            qa.sentiment.score * 100
          ).toFixed(1)}% confidence)`
        );
        lines.push("");
      }

      // Topics
      if (qa.topics && qa.topics.length > 0) {
        lines.push("Main Topics:");
        qa.topics.forEach((topic, i) => {
          lines.push(
            `  ${i + 1}. ${topic.topic} (mentioned ${topic.frequency} times)`
          );
          if (topic.keywords && topic.keywords.length > 0) {
            lines.push(`     Keywords: ${topic.keywords.join(", ")}`);
          }
          if (topic.sample_responses && topic.sample_responses.length > 0) {
            lines.push(
              `     Sample: "${topic.sample_responses[0].substring(0, 100)}..."`
            );
          }
        });
        lines.push("");
      }

      // Open Problems
      if (qa.open_problems && qa.open_problems.length > 0) {
        lines.push("Identified Issues:");
        qa.open_problems.forEach((problem, i) => {
          lines.push(`  ${i + 1}. ${problem.title} [${problem.priority}]`);
          lines.push(`     ${problem.description}`);
        });
        lines.push("");
      }

      lines.push("");
    });
  }
  // Simple survey analysis
  else {
    // Overall Summary
    if (analysis.summary) {
      lines.push("OVERALL SUMMARY");
      lines.push(separator);
      lines.push(analysis.summary);
      lines.push("");
      lines.push("");
    }

    // Key Findings
    if (analysis.key_findings && analysis.key_findings.length > 0) {
      lines.push("KEY FINDINGS");
      lines.push(separator);
      analysis.key_findings.forEach((finding, i) => {
        lines.push(`${i + 1}. ${finding}`);
      });
      lines.push("");
      lines.push("");
    }

    // Sentiment Analysis
    if (analysis.overall_sentiment) {
      lines.push("SENTIMENT ANALYSIS");
      lines.push(separator);
      lines.push(`Overall Sentiment: ${analysis.overall_sentiment.label}`);
      lines.push(
        `Confidence: ${(analysis.overall_sentiment.score * 100).toFixed(1)}%`
      );

      if (analysis.sentiment_distribution) {
        lines.push("");
        lines.push("Distribution:");
        Object.entries(analysis.sentiment_distribution).forEach(
          ([sentiment, count]) => {
            const percentage = (
              (count / analysis.total_responses_analyzed) *
              100
            ).toFixed(1);
            lines.push(`  ${sentiment}: ${count} responses (${percentage}%)`);
          }
        );
      }
      lines.push("");
      lines.push("");
    }

    // Topics
    if (analysis.topics && analysis.topics.length > 0) {
      lines.push("MAIN TOPICS");
      lines.push(separator);
      analysis.topics.forEach((topic, i) => {
        lines.push(`${i + 1}. ${topic.topic}`);
        lines.push(`   Frequency: ${topic.frequency} mentions`);
        if (topic.keywords && topic.keywords.length > 0) {
          lines.push(`   Keywords: ${topic.keywords.join(", ")}`);
        }
        if (topic.sample_responses && topic.sample_responses.length > 0) {
          lines.push(
            `   Sample Response: "${topic.sample_responses[0].substring(
              0,
              150
            )}..."`
          );
        }
        lines.push("");
      });
      lines.push("");
    }

    // Open Problems
    if (analysis.open_problems && analysis.open_problems.length > 0) {
      lines.push("IDENTIFIED ISSUES & OPPORTUNITIES");
      lines.push(separator);
      analysis.open_problems.forEach((problem, i) => {
        lines.push(
          `${i + 1}. ${problem.title} [Priority: ${problem.priority}]`
        );
        lines.push(`   Category: ${problem.category}`);
        lines.push(`   Description: ${problem.description}`);
        lines.push(
          `   Supporting Evidence: ${
            problem.supporting_responses?.length || 0
          } responses`
        );
        lines.push("");
      });
      lines.push("");
    }
  }

  // Footer
  lines.push(divider);
  lines.push("End of Report");
  lines.push(divider);

  return lines.join("\n");
}

export function downloadCSV(data, filename = "analysis-results.csv") {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string"
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
}
