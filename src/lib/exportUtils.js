import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORY_ORDER = ['BIDAYA', 'ULA', 'THANIYA', 'THANAWIYYA', 'ALIYA'];

// Sort categories based on predefined order
const sortCategories = (categories) => {
  return categories.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.toUpperCase());
    const indexB = CATEGORY_ORDER.indexOf(b.toUpperCase());
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

export const exportAllToExcelCategories = (students, teams) => {
  const wb = XLSX.utils.book_new();
  
  // Get all unique categories present in students
  const categories = [...new Set(students.map(s => s.category))];
  const sortedCategories = sortCategories(categories);

  sortedCategories.forEach(category => {
    const categoryStudents = students.filter(s => s.category === category);
    
    const data = categoryStudents.map(student => {
      const team = student.selectedBy ? teams.find(t => t.id === student.selectedBy) : null;
      return {
        'Chest No': student.chestNo,
        'Name': student.name,
        'Class': student.class,
        'Team': team ? team.name : 'Unassigned',
        'Status': student.status === 'selected' ? 'Selected' : 'Available'
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const wscols = [
      {wch: 10}, // Chest No
      {wch: 30}, // Name
      {wch: 15}, // Class
      {wch: 20}, // Team
      {wch: 15}  // Status
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, category.substring(0, 31)); // Sheet names max 31 chars
  });

  XLSX.writeFile(wb, 'All_Students_By_Category.xlsx');
};

export const exportTeamToExcel = (students, team) => {
  const teamStudents = students.filter(s => s.selectedBy === team.id);
  const data = teamStudents.map(student => ({
    'Chest No': student.chestNo,
    'Name': student.name,
    'Category': student.category,
    'Class': student.class
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wscols = [
    {wch: 10},
    {wch: 30},
    {wch: 15},
    {wch: 15}
  ];
  ws['!cols'] = wscols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Team Members');
  XLSX.writeFile(wb, `Team_${team.name}_Students.xlsx`);
};

export const exportTeamToPDF = (students, team) => {
  const teamStudents = students.filter(s => s.selectedBy === team.id);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const tableWidth = pageWidth * 0.7;
  const tableMarginLeft = (pageWidth - tableWidth) / 2;
  
  doc.setFont("helvetica");

  // Header Title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("BUSTHAN ART FEST 2026", pageWidth / 2, margin, { align: "center" });

  // Subtitle
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(`Team: ${team.name} - Members`, pageWidth / 2, margin + 10, { align: "center" });

  // Divider
  doc.setDrawColor(221, 221, 221); // #DDDDDD
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 15, pageWidth - margin, margin + 15);

  const tableColumn = ["Chest No", "Name", "Category", "Class"];
  const tableRows = [];

  teamStudents.forEach(student => {
    tableRows.push([
      student.chestNo,
      student.name,
      student.category,
      student.class
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: margin + 22,
    theme: 'grid',
    tableWidth: tableWidth,
    margin: { left: tableMarginLeft },
    styles: { 
      font: 'helvetica',
      fontSize: 11,
      textColor: [17, 17, 17], // #111111
      lineColor: [189, 189, 189], // #BDBDBD
      lineWidth: 0.2, // ~1px
      cellPadding: 2, // decreased padding
      minCellHeight: 6, // decreased height
      fillColor: [255, 255, 255] // Force white background
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [17, 17, 17],
      fontStyle: 'bold',
      fontSize: 12
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255] // No shading
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: tableWidth * 0.18 },
      1: { halign: 'left', cellWidth: tableWidth * 0.40 },
      2: { halign: 'left', cellWidth: tableWidth * 0.22 },
      3: { halign: 'center', cellWidth: tableWidth * 0.20 }
    },
    didDrawPage: function (data) {
      // Footer
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150); // Gray text
      
      doc.text("Busthan Art Fest 2026", margin, pageHeight - 15);
      doc.text(`Generated on: ${dateStr}`, pageWidth - margin, pageHeight - 15, { align: "right" });
    }
  });

  doc.save(`Team_${team.name}_Students.pdf`);
};
