// src/components/PreviewTable.tsx

import React from 'react';

interface Transaction {
  [key: string]: string;
}

interface PreviewTableProps {
  data: Transaction[];
}

const PreviewTable: React.FC<PreviewTableProps> = ({ data }) => {
  if (!data.length) return null;

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto border rounded">
      <table className="table-auto w-full text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 border">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header} className="px-3 py-2 border">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-1 px-1">
        Showing first 10 rows of mapped transactions.
      </p>
    </div>
  );
};

export default PreviewTable;
