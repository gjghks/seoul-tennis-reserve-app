export default function TodayLoading() {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-slate-900 animate-pulse" aria-busy="true">
      <span className="sr-only">오늘 예약 가능한 테니스장을 불러오는 중입니다</span>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800">
        <div className="container py-4">
          <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
          <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container py-6">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-100 dark:border-slate-800">
              <div className="h-6 w-12 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-16 bg-gray-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* District Groups */}
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((districtIdx) => (
            <div key={districtIdx} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
              {/* District Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
                <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>

              {/* Court Cards */}
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {[1, 2, 3].map((courtIdx) => (
                  <div key={courtIdx} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="h-5 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-4 w-32 bg-gray-100 dark:bg-slate-800 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full ml-2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-4 w-20 bg-gray-100 dark:bg-slate-800 rounded" />
                      <div className="h-4 w-20 bg-gray-100 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
