import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function cellValue(val) {
  if (val == null || val === '') return '';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : '';
  return String(val);
}

export function exportToPdf(title, columns, rows, filename = 'report.pdf') {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

  const safeRows = Array.isArray(rows) ? rows : [];
  const head = [columns.map((c) => c.label)];
  const body = safeRows.map((row) => columns.map((c) => cellValue(row[c.key])));

  autoTable(doc, {
    head,
    body: body.length ? body : [['No data', ...Array(columns.length - 1).fill('')]],
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  doc.save(filename);
}
