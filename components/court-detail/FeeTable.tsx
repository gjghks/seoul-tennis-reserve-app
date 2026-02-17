import React from 'react';
import { FeeInfo } from './types';

function FeeTable({ fees }: { fees: FeeInfo[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-emerald-100 to-teal-100">
            <th className="px-4 py-3 text-left font-bold text-gray-800 border-b border-gray-200">구분</th>
            <th className="px-4 py-3 text-center font-bold text-gray-800 border-b border-gray-200">단위</th>
            <th className="px-4 py-3 text-center font-bold text-gray-800 border-b border-gray-200">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                평일
              </span>
            </th>
            <th className="px-4 py-3 text-center font-bold text-gray-800 border-b border-gray-200">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                야간/주말/공휴일
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {fees.map((fee, idx) => {
            const feeKey = `${fee.type}-${fee.unit || 'unit'}-${idx}`;
            return (
              <tr key={feeKey} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 font-semibold text-gray-700 border-b border-gray-100">
                  {fee.type.replace('실내 대관료', '🏠 실내').replace('실외 대관료', '🌳 실외').replace('조명료', '💡 조명')}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 text-xs border-b border-gray-100">
                  {fee.unit || '-'}
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100">
                  {fee.weekday ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
                      {fee.weekday.replace(/평일\s*:\s*/, '')}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100">
                  {fee.weekend ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold text-xs">
                      {fee.weekend.replace(/야간,?\s*주말,?\s*공휴일\s*:\s*/, '')}
                    </span>
                  ) : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(FeeTable);
