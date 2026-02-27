import jsPDF from "jspdf";
import { TripPlan } from "@/types";

/** Line height multiplier for consistent spacing in PDF text blocks */
const LINE_HEIGHT = 0.38;

/**
 * Generates a PDF document from a TripPlan itinerary
 * @param tripPlan - The trip plan data to convert to PDF
 */
export const generateItineraryPDF = (tripPlan: TripPlan): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number): void => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    fontStyle: string = "normal"
  ): number => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * LINE_HEIGHT);
  };

  // Cover Page
  doc.setFillColor(40, 40, 40);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(tripPlan.destination, margin, 60);
  doc.setFontSize(24);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(200, 200, 200);
  doc.text("Expedition", margin, 80);

  // Plan details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Verified Plan TEP-1", margin, 100);

  yPosition = 120;
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Duration: ${tripPlan.duration}`, margin, yPosition);
  yPosition += 10;
  doc.text(`Style: ${tripPlan.style}`, margin, yPosition);
  yPosition += 10;
  doc.text(`Efficiency: ${tripPlan.efficiency}`, margin, yPosition);

  // Add new page for itinerary — fixed columns for alignment
  doc.addPage();
  yPosition = margin;
  const timeColWidth = 26;
  const costColWidth = 38;
  const gap = 6;
  const textStartX = margin + timeColWidth + gap;
  const textMaxWidthTrip = contentWidth - timeColWidth - costColWidth - gap * 2;
  const costRightX = pageWidth - margin - 6;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Itinerary", margin, yPosition);
  yPosition += 20;

  tripPlan.days.forEach((day) => {
    checkPageBreak(50);
    doc.setFillColor(40, 40, 40);
    doc.rect(margin, yPosition - 6, contentWidth, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Day ${day.day}: ${day.title}`, margin + 6, yPosition + 4);
    yPosition += 22;

    day.items.forEach((item) => {
      checkPageBreak(28);
      doc.setTextColor(90, 90, 90);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(item.time, margin, yPosition + 1);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const titleBaselineY = yPosition;
      const labelHeight = addWrappedText(
        item.label,
        textStartX,
        yPosition,
        textMaxWidthTrip,
        11,
        "bold"
      );
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(item.cost, costRightX, titleBaselineY, { align: "right" });

      yPosition += Math.max(labelHeight, 6);

      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(70, 70, 70);
      const noteHeight = addWrappedText(
        item.note,
        textStartX,
        yPosition,
        textMaxWidthTrip,
        10,
        "italic"
      );
      yPosition += Math.max(noteHeight, 6);

      if (item.link) {
        doc.setFontSize(9);
        doc.setTextColor(0, 100, 200);
        doc.text(`Link: ${item.link}`, textStartX, yPosition);
        yPosition += 6;
      }
      yPosition += 6;
    });
    yPosition += 8;
  });

  // Insights section
  if (tripPlan.insights && tripPlan.insights.length > 0) {
    checkPageBreak(60);
    yPosition += 10;

    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPosition - 8, contentWidth, 12, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Intelligence Summary", margin + 5, yPosition + 2);
    yPosition += 20;

    tripPlan.insights.forEach((insight) => {
      checkPageBreak(40);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(insight.title, margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(60, 60, 60);
      const insightHeight = addWrappedText(
        `"${insight.body}"`,
        margin,
        yPosition,
        contentWidth,
        10,
        "italic"
      );
      yPosition += Math.max(insightHeight, 8) + 10;
    });
  }

  // Footer on last page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Generate filename
  const filename = `${tripPlan.destination.replace(/\s+/g, "_")}_Itinerary.pdf`;

  // Save the PDF
  doc.save(filename);
};

/** Backend itinerary shape used by ItineraryCard (chat flow) */
export interface BackendItineraryForPDF {
  destination: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_plans: Array<{
    day_number: number;
    date: string;
    title: string;
    activities: Array<{
      time: string;
      activity_name: string;
      description: string;
      location?: string;
      estimated_cost?: number;
      notes?: string;
    }>;
    total_estimated_cost?: number;
    accommodation?: string;
    notes?: string;
  }>;
  total_estimated_cost?: number;
  packing_suggestions?: string[];
  travel_tips?: string[];
}

/**
 * Generates a PDF from the backend itinerary format (chat itinerary card).
 * Uses a fixed time column, content area, and cost column for clean alignment.
 * @param itinerary - Backend itinerary from the chat/API
 */
export const generateItineraryPDFFromBackend = (
  itinerary: BackendItineraryForPDF
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - 2 * margin;

  // Fixed columns for consistent alignment: time | content | cost
  const timeColWidth = 26;
  const costColWidth = 38;
  const gap = 6;
  const textStartX = margin + timeColWidth + gap;
  const textMaxWidth = contentWidth - timeColWidth - costColWidth - gap * 2;
  const costRightX = pageWidth - margin - 6;

  let yPosition = margin;

  const checkPageBreak = (requiredSpace: number): void => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    fontStyle: string = "normal"
  ): number => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * LINE_HEIGHT);
  };

  // Cover
  doc.setFillColor(40, 40, 40);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(itinerary.destination, margin, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(
    `${itinerary.start_date} to ${itinerary.end_date}`,
    margin,
    78
  );
  if (itinerary.total_estimated_cost != null) {
    doc.setFontSize(14);
    doc.text(
      `Total Budget: $${itinerary.total_estimated_cost.toFixed(0)}`,
      margin,
      95
    );
  }

  doc.addPage();
  yPosition = margin;

  // Itinerary title with a bit more space
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Itinerary", margin, yPosition);
  yPosition += 20;

  itinerary.daily_plans.forEach((day) => {
    checkPageBreak(52);
    doc.setFillColor(45, 45, 45);
    doc.rect(margin, yPosition - 6, contentWidth, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Day ${day.day_number}: ${day.title} (${day.date})`,
      margin + 6,
      yPosition + 4
    );
    yPosition += 22;

    day.activities.forEach((activity) => {
      checkPageBreak(28);
      const blockStartY = yPosition;

      // Time (left column)
      doc.setTextColor(90, 90, 90);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(activity.time, margin, yPosition + 1);

      // Activity title and cost on same baseline: cost right-aligned in cost column
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const titleHeight = addWrappedText(
        activity.activity_name,
        textStartX,
        yPosition,
        textMaxWidth,
        11,
        "bold"
      );
      const titleBaselineY = yPosition;

      if (activity.estimated_cost != null && activity.estimated_cost > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(
          `$${activity.estimated_cost.toFixed(0)}`,
          costRightX,
          titleBaselineY,
          { align: "right" }
        );
      }

      yPosition += Math.max(titleHeight, 6);

      // Description (same left as title, consistent indentation)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      const descHeight = addWrappedText(
        activity.description,
        textStartX,
        yPosition,
        textMaxWidth,
        10
      );
      yPosition += Math.max(descHeight, 6) + 6;
    });

    if (day.total_estimated_cost != null) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(60, 60, 60);
      doc.text(
        `Day total: $${day.total_estimated_cost.toFixed(0)}`,
        textStartX,
        yPosition
      );
      yPosition += 10;
    }
    yPosition += 4;
  });

  if (
    (itinerary.packing_suggestions?.length ?? 0) > 0 ||
    (itinerary.travel_tips?.length ?? 0) > 0
  ) {
    checkPageBreak(44);
    yPosition += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Packing & Tips", margin, yPosition);
    yPosition += 14;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    if (itinerary.packing_suggestions?.length) {
      itinerary.packing_suggestions.forEach((item) => {
        checkPageBreak(8);
        const h = addWrappedText(item, margin + 4, yPosition, contentWidth - 8, 10);
        yPosition += Math.max(h, 6);
      });
      yPosition += 4;
    }
    if (itinerary.travel_tips?.length) {
      itinerary.travel_tips.forEach((item) => {
        checkPageBreak(8);
        const h = addWrappedText(item, margin + 4, yPosition, contentWidth - 8, 10);
        yPosition += Math.max(h, 6);
      });
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  const filename = `${itinerary.destination.replace(/\s+/g, "_")}_Itinerary.pdf`;
  doc.save(filename);
};
