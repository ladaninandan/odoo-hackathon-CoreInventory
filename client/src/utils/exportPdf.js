import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportToPdf(title, columns, rows, filename = 'report.pdf') {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  doc.autoTable({
    head: [columns.map((c) => c.label)],
    body: rows.map((row) => columns.map((c) => row[c.key] ?? '')),
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save(filename);
}
