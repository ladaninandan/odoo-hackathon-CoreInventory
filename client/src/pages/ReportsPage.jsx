import { useState } from 'react';
import api from '../services/api';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/common/Button';
import { exportToPdf } from '../utils/exportPdf';
import { exportToExcel } from '../utils/exportExcel';
import { FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [loading, setLoading] = useState('');

  const stockColumns = [
    { key: 'productName', label: 'Product' },
    { key: 'productSku', label: 'SKU' },
    { key: 'warehouseName', label: 'Warehouse' },
    { key: 'currentStock', label: 'Stock' },
    { key: 'value', label: 'Value (₹)' },
  ];

  const handleExport = async (format) => {
    setLoading(format);
    try {
      const { data } = await api.get('/reports/stock-summary');
      const rows = data.data.summary;

      if (format === 'pdf') {
        exportToPdf('Stock Summary Report', stockColumns, rows, 'stock-summary.pdf');
        toast.success('PDF downloaded');
      } else {
        exportToExcel('Stock Summary', stockColumns, rows, 'stock-summary.xlsx');
        toast.success('Excel downloaded');
      }
    } catch (err) {
      toast.error('Failed to generate report');
    }
    setLoading('');
  };

  return (
    <PageWrapper title="Reports" description="Generate and export reports">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stock Summary PDF */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-100 p-3">
              <FileDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Stock Summary PDF</h3>
              <p className="text-xs text-gray-500">Current stock levels across all warehouses</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleExport('pdf')} disabled={!!loading}>
            {loading === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Download PDF
          </Button>
        </div>

        {/* Stock Summary Excel */}
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3">
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Stock Summary Excel</h3>
              <p className="text-xs text-gray-500">Full stock data in spreadsheet format</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleExport('excel')} disabled={!!loading}>
            {loading === 'excel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Download Excel
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
