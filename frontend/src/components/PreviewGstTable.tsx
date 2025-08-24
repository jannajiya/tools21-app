import React from 'react';

export interface PreviewGstTableProps {
  data: Record<string, string>[];
  maxHeight?: string;
}

const PreviewGstTable: React.FC<PreviewGstTableProps> = ({ data, maxHeight }) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  return (
    <div
      className="w-full overflow-y-auto border border-gray-200 rounded shadow-sm"
      style={{ maxHeight: maxHeight || '400px' }}
    >
      <table className="w-full text-sm table-fixed">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {headers.map((key) => (
              <th key={key} className="px-2 py-2 text-left border border-gray-300 whitespace-nowrap">
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {headers.map((key, j) => (
                <td key={j} className="px-2 py-1 border border-gray-200 truncate">
                  {row[key] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewGstTable;
