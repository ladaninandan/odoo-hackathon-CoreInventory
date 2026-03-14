import * as XLSX from 'xlsx';

export function exportToExcel(title, columns, rows, filename = 'report.xlsx') {
  const data = rows.map((row) => {
    const obj = {};
    columns.forEach((c) => { obj[c.label] = row[c.key] ?? ''; });
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
  XLSX.writeFile(wb, filename);
}
