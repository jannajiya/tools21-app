// src/components/MappingFieldsTable.tsx

import React from 'react';

interface MappingFieldsTableProps {
  headers: string[];
  mapping: { [key: string]: string };
  onMappingChange: (tallyField: string, csvField: string) => void;
  requiredFields: string[]; // ✅ Add this line to fix the error
}

const TALLY_FIELDS = ['DATE', 'NARRATION', 'WITHDRAWAL', 'DEPOSIT', 'CLOSING BALANCE'];

const MappingFieldsTable: React.FC<MappingFieldsTableProps> = ({
  headers,
  mapping,
  onMappingChange,
}) => {
  return (
    <div className="overflow-x-auto border rounded p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Map Your File Columns to Tally Fields</h3>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border px-4 py-2 text-left">Tally Field</th>
            <th className="border px-4 py-2 text-left">File Column</th>
          </tr>
        </thead>
        <tbody>
          {TALLY_FIELDS.map((field) => (
            <tr key={field}>
              <td className="border px-4 py-2 font-medium">{field}</td>
              <td className="border px-4 py-2">
                <select
                  className="w-full border rounded px-2 py-1"
                  value={mapping[field] || ''}
                  onChange={(e) => onMappingChange(field, e.target.value)}
                >
                  <option value="">-- Select Column --</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MappingFieldsTable;
