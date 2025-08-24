// src/pages/CsvParser.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCsvData } from '../context/CsvContext';
import Footer from '../components/Footer';
import LedgerModal from '../components/LedgerModal';

const CsvParser = () => {
  const { parsedData, basicDetails } = useCsvData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Download XML when user confirms ledger name
  const handleConfirmLedger = async (ledgerName: string) => {
    setIsModalOpen(false);

    try {
      const res = await fetch('http://localhost:5000/generate-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parsedData, basicDetails, partyLedger: ledgerName }),
      });

      if (!res.ok) throw new Error('Failed to generate XML');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tally_import.xml';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error('Failed to download XML');
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Account Summary</h1>

        {/* ✅ Account Summary */}
{basicDetails ? (
  <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-6 shadow-lg transition-all duration-300">
    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
      📘 Account Summary
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-blue-500">👤</span>
        <span><strong>Account Holder:</strong> {basicDetails.accountHolder}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-green-600">🔢</span>
        <span><strong>Account Number:</strong> {basicDetails.accountNumber}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-purple-600">🗓️</span>
        <span><strong>Statement Period:</strong> {basicDetails.statementPeriod}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-orange-600">💰</span>
        <span><strong>Opening Balance:</strong> ₹{basicDetails.openingBalance}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-rose-500">🏦</span>
        <span><strong>Closing Balance:</strong> ₹{basicDetails.closingBalance}</span>
      </div>
    </div>
  </div>
) : (
  <p className="text-gray-500">No account summary available. Please upload a valid CSV file.</p>
)}
        {/* ✅ Download XML Button */}
        {parsedData.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 mb-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            Download Tally XML
          </button>
        )}

        {/* ✅ Transactions Table */}
        {parsedData.length > 0 ? (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-base">
              <thead className="bg-blue-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Narration</th>
                  <th className="px-4 py-2 text-left font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold">Type</th>
                  <th className="px-4 py-2 text-left font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {parsedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <td className="px-4 py-2">{item.date}</td>
                    <td className="px-4 py-2">{item.narration}</td>
                    <td className="px-4 py-2">₹{item.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">{item.type}</td>
                    <td className="px-4 py-2">₹{item.balance.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No transactions to display. Please upload a CSV file from the homepage.</p>
        )}
      </div>

      {/* ✅ Modal for Ledger Input */}
      <LedgerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmLedger}
      />

      <Footer />
    </>
  );
};

export default CsvParser;