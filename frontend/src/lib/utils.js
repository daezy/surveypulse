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
