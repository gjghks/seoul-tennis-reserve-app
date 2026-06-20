import React from 'react';
import { FeeInfo } from './types';

function FeeTable({ fees }: { fees: FeeInfo[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40">
            <th className="px-4 py-3 text-left font-bold text-gray-800 dark:text-slate-200 border-b border-gray-200 dark:border-slate-700">구분</th>
            <th className="px-4 py-3 text-center font-bold text-gray-800 dark:text-slate-200 border-b border-gray-200 dark:border-slate-700">단위</th>
            <th className="px-4 py-3 text-center font-bold text-gray-800 dark:text-slate-200 border-b border-gray-200 dark:border-slate-700">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                평일
              </span>
            </th>
            <th className="px-4 py-3 text-center font-bold text-gray-800 dark:text-slate-200 border-b border-gray-200 dark:border-slate-700">
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
              <tr key={feeKey} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-800'}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-slate-200 border-b border-gray-100 dark:border-slate-800">
                  {fee.type.replace('실내 대관료', '🏠 실내').replace('실외 대관료', '🌳 실외').replace('조명료', '💡 조명')}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 dark:text-slate-400 text-xs border-b border-gray-100 dark:border-slate-800">
                  {fee.unit || '-'}
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100 dark:border-slate-800">
                  {fee.weekday ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                      {fee.weekday.replace(/평일\s*:\s*/, '')}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-center border-b border-gray-100 dark:border-slate-800">
                  {fee.weekend ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-semibold text-xs">
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
