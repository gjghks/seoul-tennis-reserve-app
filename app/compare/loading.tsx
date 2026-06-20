export default function CompareLoading() {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-slate-900 animate-pulse" aria-busy="true">
      <span className="sr-only">구별 비교 데이터를 불러오는 중입니다</span>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800">
        <div className="container py-4">
          <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
          <div className="h-8 w-56 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>

      {/* Hero Stats */}
      <div className="container py-6">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-100 dark:border-slate-800">
              <div className="h-7 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-20 bg-gray-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Average Stats Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-800 p-6 mb-8">
          <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-6 w-12 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-2" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-slate-800 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((rowIdx) => (
                  <tr key={rowIdx} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                    {[1, 2, 3, 4, 5].map((colIdx) => (
                      <td key={colIdx} className="px-4 py-3">
                        <div className="h-4 w-12 bg-gray-100 dark:bg-slate-800 rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
