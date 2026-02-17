import React from 'react';
import { highlight } from './highlight';

function TableRenderer({ rows }: { rows: string[][] }) {
  if (rows.length === 0) return null;
  const header = rows[0];
  const body = rows.slice(1);
  
  const isWideTable = header.length > 6;
  const isMonthlyTable = header.some(h => /^\d{1,2}월$/.test(h));
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200 shadow-sm">
      <table className={`text-sm border-collapse ${isWideTable ? 'w-max min-w-full' : 'w-full'}`}>
        <thead>
          <tr className="bg-gray-100">
            {header.map((cell, i) => {
              const monthMatch = cell.match(/^(\d{1,2})월$/);
              const isCurrentMonth = monthMatch && parseInt(monthMatch[1]) === currentMonth;
              const headerKey = `${cell}-${i}`;
              return (
                <th 
                  key={headerKey} 
                  className={`${isWideTable ? 'px-2 py-2' : 'px-3 py-2.5'} text-center font-bold border border-gray-200 whitespace-nowrap ${
                    i === 0 
                      ? 'bg-gray-200 sticky left-0 z-10' 
                      : isCurrentMonth 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {cell}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIdx) => {
            const rowKey = `${row.join('|')}-${rowIdx}`;
            return (
              <tr key={rowKey} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {row.map((cell, cellIdx) => {
                  const monthMatch = header[cellIdx]?.match(/^(\d{1,2})월$/);
                  const isCurrentMonth = monthMatch && parseInt(monthMatch[1]) === currentMonth;
                  const isEmpty = cell === '-' || cell === '' || cell === '~';
                  const cellKey = `${cell}-${cellIdx}`;
                  
                  return (
                    <td 
                      key={cellKey} 
                    className={`${isWideTable ? 'px-2 py-1.5' : 'px-3 py-2'} border border-gray-200 text-center whitespace-nowrap ${
                      cellIdx === 0 
                        ? 'font-semibold text-gray-700 bg-gray-100 sticky left-0 z-10' 
                        : isCurrentMonth
                          ? isEmpty 
                            ? 'bg-blue-50/50 text-gray-400'
                            : 'bg-blue-50 text-blue-700 font-medium'
                          : isEmpty 
                            ? 'text-gray-300' 
                            : 'text-gray-600'
                    }`}
                  >
                    {isMonthlyTable && isEmpty ? (
                      <span className="text-gray-300">-</span>
                    ) : (
                      highlight(cell)
                    )}
                  </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(TableRenderer);
