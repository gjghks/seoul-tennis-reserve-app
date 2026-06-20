export default function CalendarLoading() {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-slate-900 animate-pulse" aria-busy="true">
      <span className="sr-only">캘린더 데이터를 불러오는 중입니다</span>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800">
        <div className="container py-4">
          <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
          <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>

      <div className="container py-6">
        {/* District Filter */}
        <div className="mb-6">
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-6 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-6 w-6 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-800 p-4 mb-8">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-4 w-8 bg-gray-200 dark:bg-slate-700 rounded mx-auto" />
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 dark:bg-slate-800 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Selected Date Courts */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
            <div className="h-5 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4">
                <div className="h-5 w-56 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-40 bg-gray-100 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
