import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LedgerModal from '../components/LedgerModal';
import Footer from '../components/Footer';
import { normalizeToDateString } from '../utils/dateFormatter';
import { FiUpload } from 'react-icons/fi';

interface MappingFields {
  DATE: string;
  NARRATION: string;
  WITHDRAWAL: string;
  DEPOSIT: string;
  CLOSING: string;
}

const requiredFields: (keyof MappingFields)[] = ['DATE', 'NARRATION', 'WITHDRAWAL', 'DEPOSIT', 'CLOSING'];

const CustomMapping: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [headers, setHeaders] = useState<string[]>([]);
  const [mappedFields, setMappedFields] = useState<MappingFields>({
    DATE: '',
    NARRATION: '',
    WITHDRAWAL: '',
    DEPOSIT: '',
    CLOSING: '',
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      handleGenerate();
      return;
    }

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a valid .csv file.');
      resetUploadState();
      return;
    }

    parseCSV(selectedFile);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const droppedFile = event.dataTransfer.files?.[0];

    if (!droppedFile || !droppedFile.name.endsWith('.csv')) {
      toast.error('Only .csv files are supported.');
      resetUploadState();
      return;
    }

    parseCSV(droppedFile);
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = result.data as any[];

        if (!result.meta.fields || result.meta.fields.length < 2) {
          toast.error('Invalid CSV structure.');
          resetUploadState();
          return;
        }

        setHeaders(result.meta.fields);
        setPreviewData(parsed);
        setIsFileUploaded(true);
        setShowWelcome(false);
        toast.success('File parsed successfully!');
      },
      error: () => {
        toast.error('Failed to parse CSV file.');
        resetUploadState();
      },
    });
  };

  const resetUploadState = () => {
    setShowWelcome(true);
    setIsFileUploaded(false);
    setPreviewData([]);
    setHeaders([]);
  };

  const handleFieldChange = (field: keyof MappingFields, value: string) => {
    setMappedFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGenerate = () => {
    const values = Object.values(mappedFields);
    const uniqueValues = new Set(values);

    if (values.some((v) => !v)) {
      toast.error('Please map all required fields.');
      return;
    }

    if (uniqueValues.size < values.length) {
      toast.error('Each field must be mapped to a unique column.');
      return;
    }

    setShowModal(true);
  };

  const handleModalConfirm = async (ledger: string) => {
    setShowModal(false);
    setIsGenerating(true);

    try {
      const transactions = previewData.map((row) => {
        const date = normalizeToDateString(row[mappedFields.DATE]);
        const narration = row[mappedFields.NARRATION];
        const withdrawal = parseFloat(row[mappedFields.WITHDRAWAL]) || 0;
        const deposit = parseFloat(row[mappedFields.DEPOSIT]) || 0;
        const amount = withdrawal || deposit;
        const type = deposit > 0 ? 'Receipt' : 'Payment';
        const balance = parseFloat(row[mappedFields.CLOSING]) || 0;

        return { date, narration, amount, type, balance };
      });

      const response = await fetch('http://localhost:5000/generate-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parsedData: transactions, partyLedger: ledger }),
      });

      if (!response.ok) throw new Error('Failed to generate XML');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${ledger}_Mapped_Tally.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Tally XML downloaded successfully!');
    } catch (error) {
      toast.error('Error generating XML.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />

      {showWelcome ? (
        <div
          className={`min-h-screen w-full flex flex-col items-center justify-center text-center px-4 transition duration-300 ${
            dragOver ? 'bg-blue-50 border-4 border-blue-400 border-dashed' : 'bg-white'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="max-w-md w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Bank Statement Converter</h1>
            <p className="text-gray-600 mb-6">
              Upload your bank statement CSV to generate Tally XML
            </p>
            <button
              onClick={triggerFileInput}
              className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
            >
              Upload CSV File
            </button>
          </div>
        </div>
      ) : !isFileUploaded ? (
        <div className="h-screen flex flex-col items-center justify-center text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4" />
          <p className="text-lg">Processing your file...</p>
        </div>
      ) : (
        <div className="p-4 max-w-6xl mx-auto min-h-screen flex flex-col space-y-6">
          {/* Field Mapping */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Map Fields</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {requiredFields.map((field) => (
                <div key={field}>
                  <label htmlFor={`map-${field}`} className="block text-sm font-medium mb-1">
                    {field}
                  </label>
                  <select
                    id={`map-${field}`}
                    value={mappedFields[field]}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select column</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          {previewData.length > 0 && Object.values(mappedFields).every((val) => val) && (
            <div className="rounded border border-gray-300 dark:border-gray-700 overflow-auto max-h-[45vh]">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                  <tr>
                    {requiredFields.map((field) => {
                      const mappedCol = mappedFields[field];
                      return (
                        <th
                          key={field}
                          className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-200 border-b"
                        >
                          {mappedCol || field}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 7).map((row, index) => (
                    <tr key={index} className="border-b dark:border-gray-700">
                      {requiredFields.map((field) => {
                        const mappedCol = mappedFields[field];
                        if (!mappedCol) return null;
                        const value = row[mappedCol];
                        const display = field === 'DATE' ? normalizeToDateString(value) : value;
                        return (
                          <td key={mappedCol} className="px-4 py-2 text-gray-800 dark:text-gray-100">
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400 px-4 py-1">
                Showing first {previewData.slice(0, 7).length} of {previewData.length} rows
              </div>
            </div>
          )}

          {/* Generate Button */}
          {previewData.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleGenerate}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Tally XML'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload FAB */}
      {!showWelcome && !isGenerating && (
        <button
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
          onClick={triggerFileInput}
          title="Upload new CSV"
        >
          <FiUpload size={20} />
        </button>
      )}

      <LedgerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
      />

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default CustomMapping;