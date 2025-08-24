import React, { useState, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';
import 'react-toastify/dist/ReactToastify.css';

const GSTR2A: React.FC = () => {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [multiUpload, setMultiUpload] = useState(false);

  const totalStats = useMemo(() => {
    const invoices = new Set<string>();
    let totalTaxable = 0, totalIGST = 0, totalCGST = 0, totalSGST = 0, totalCess = 0;

    previewData.forEach((row) => {
      const invoice = row['Invoice Number'];
      const getNum = (val: string) => parseFloat(val?.replace(/,/g, '') || '0');

      if (invoice) invoices.add(invoice);
      totalTaxable += getNum(row['Taxable Value']);
      totalIGST += getNum(row['Integrated Tax Amount']);
      totalCGST += getNum(row['Central Tax Amount']);
      totalSGST += getNum(row['State/UT Tax Amount']);
      totalCess += getNum(row['Cess Amount']);
    });

    return {
      uniqueInvoices: invoices.size,
      totalTaxableValue: totalTaxable.toFixed(2),
      totalIGST: totalIGST.toFixed(2),
      totalCGST: totalCGST.toFixed(2),
      totalSGST: totalSGST.toFixed(2),
      totalCess: totalCess.toFixed(2),
    };
  }, [previewData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    if (multiUpload) {
      Array.from(files).forEach(file => formData.append('files', file));
    } else {
      formData.append('file', files[0]);
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/parse-gstr2a', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      const combinedPreview = Array.isArray(result.preview)
        ? result.preview
        : Object.values(result.preview).flat();

      setPreviewData(combinedPreview);
      setColumns(result.columns);
      setRowCount(result.count || combinedPreview.length);
    } catch (err) {
      console.error('Error uploading GSTR-2A file:', err);
      toast.error('Failed to upload or parse the GSTR-2A file.');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const numericFields = [
      'Taxable Value',
      'Integrated Tax Amount',
      'Central Tax Amount',
      'State/UT Tax Amount',
      'Cess Amount',
    ];

    const formattedData = previewData.map((row) => {
      const newRow: { [key: string]: any } = {};
      columns.forEach((col) => {
        const rawVal = row[col];
        if (numericFields.includes(col)) {
          const num = parseFloat(String(rawVal).replace(/,/g, ''));
          newRow[col] = isNaN(num) ? '' : num;
        } else {
          newRow[col] = rawVal;
        }
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(formattedData, { header: columns });
    const range = XLSX.utils.decode_range(ws['!ref'] || '');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const colHeader = columns[C];
      if (numericFields.includes(colHeader)) {
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
          const cell = ws[cellAddress];
          if (cell && typeof cell.v === 'number') {
            cell.z = '#,##0.00';
            cell.t = 'n';
          }
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GSTR-2A Preview');
    XLSX.writeFile(wb, 'GSTR-2A-Preview.xlsx');
  };

  const formatNumber = (val: string) => {
    const num = parseFloat(val.replace(/,/g, '').replace(/[^\d.-]/g, ''));
    return isNaN(num) ? val : num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      <ToastContainer />
      <h1 className="text-2xl font-semibold mb-4">GSTR-2A CSV Preview Tool</h1>

      <div className="flex items-center gap-4 mb-3">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          multiple={multiUpload}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={multiUpload}
            onChange={(e) => setMultiUpload(e.target.checked)}
          />
          Enable Multi-File Upload
        </label>
      </div>

      {loading && <p className="text-blue-600 text-sm mb-4">Processing file(s), please wait...</p>}

      {previewData.length > 0 && (
        <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded shadow-sm text-sm space-y-1">
          <p><strong>Total Bills:</strong> {totalStats.uniqueInvoices}</p>
          <p><strong>Total Taxable Value:</strong> ₹ {totalStats.totalTaxableValue}</p>
          <p><strong>Integrated Tax (IGST):</strong> ₹ {totalStats.totalIGST}</p>
          <p><strong>Central Tax (CGST):</strong> ₹ {totalStats.totalCGST}</p>
          <p><strong>State/UT Tax (SGST):</strong> ₹ {totalStats.totalSGST}</p>
          <p><strong>Cess Amount:</strong> ₹ {totalStats.totalCess}</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={exportToExcel}
              className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Export to Excel
            </button>
          </div>
        </div>
      )}

      {previewData.length > 0 && (
        <div>
          <div className="text-sm text-gray-600 mb-2">
            Showing {previewData.length} of {rowCount} valid transactions.
          </div>

          <div className="overflow-x-auto max-h-[60vh] border rounded">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {columns.map((col, i) => {
                    const isNumericField = [
                      'Taxable Value',
                      'Integrated Tax Amount',
                      'Central Tax Amount',
                      'State/UT Tax Amount',
                      'Cess Amount'
                    ].includes(col);
                    return (
                      <th
                        key={i}
                        className={`px-4 py-2 border font-semibold ${isNumericField ? 'text-right' : 'text-left'}`}
                      >
                        {col}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    {columns.map((col, colIndex) => {
                      const rawVal = row[col] || '';
                      const isNumericField = [
                        'Taxable Value',
                        'Integrated Tax Amount',
                        'Central Tax Amount',
                        'State/UT Tax Amount',
                        'Cess Amount'
                      ].includes(col);
                      return (
                        <td
                          key={colIndex}
                          className={`px-4 py-2 text-sm ${isNumericField ? 'text-right' : 'text-gray-700'}`}
                        >
                          {isNumericField ? formatNumber(rawVal) : rawVal || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && previewData.length === 0 && (
        <p className="text-sm text-gray-500 mt-4">Upload a valid GSTR-2A CSV file to begin.</p>
      )}
    </div>
  );
};

export default GSTR2A;