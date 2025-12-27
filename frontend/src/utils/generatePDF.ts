import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- 1. Define Types (Fixes "Parameter has any type" errors) ---
interface Activity {
  time?: string;
  name: string;
  cost_estimate?: string | number;
  description?: string;
}

interface DayPlan {
  day_number: number;
  theme: string;
  activities: Activity[];
}

interface TripData {
  destination: string;
  total_estimated_cost: string;
  duration: number;
  daily_plans: DayPlan[];
}

// --- 2. Main Function ---
export const generatePDF = (tripData: TripData) => {
  const doc = new jsPDF();

  // Title & Header
  doc.setFontSize(22);
  doc.setTextColor(0, 150, 255); // Cyan color
  doc.text(`Trip to ${tripData.destination}`, 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Total Cost: ${tripData.total_estimated_cost}`, 14, 30);
  doc.text(`Duration: ${tripData.duration} Days`, 14, 36);

  let finalY = 45;

  // Loop through Days
  tripData.daily_plans.forEach((day) => {
    
    // Check if we need a new page BEFORE starting a new day
    if (finalY > 250) {
      doc.addPage();
      finalY = 20;
    }

    // Day Header
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`Day ${day.day_number}: ${day.theme}`, 14, finalY);
    finalY += 8;

    // Prepare Table Data
    const tableBody = day.activities.map((act) => [
      act.time || "Anytime",
      act.name,
      act.cost_estimate || "N/A",
      // Safe truncation: checks if description exists first
      (act.description || "").substring(0, 50) + "..." 
    ]);

    // Draw Table
    autoTable(doc, {
      startY: finalY,
      head: [['Time', 'Activity', 'Cost', 'Details']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 255] },
      margin: { top: 10 },
    });

    // Update Y position for next loop
    // 'lastAutoTable' property exists on the doc object when using the plugin
    const lastTable = (doc as any).lastAutoTable;
    finalY = lastTable ? lastTable.finalY + 15 : finalY + 15;
  });

  // Save
  doc.save(`${tripData.destination}_Itinerary.pdf`);
};