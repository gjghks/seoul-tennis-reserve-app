export default function MyLoading() {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-slate-900 animate-pulse" aria-busy="true">
      <span className="sr-only">마이페이지를 불러오는 중입니다</span>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>

        {/* User Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 p-6 mb-8">
          <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-40 bg-gray-100 dark:bg-slate-700 rounded" />
            <div className="h-4 w-32 bg-gray-100 dark:bg-slate-700 rounded" />
          </div>
        </div>

        {/* Tennis Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 p-6 mb-8">
          <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-3 w-20 bg-gray-100 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-32 bg-gray-100 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Alert Settings Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 p-6 mb-8">
          <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-32 bg-gray-100 dark:bg-slate-700 rounded" />
                <div className="h-6 w-12 bg-gray-200 dark:bg-slate-700 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Courts Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <div className="h-4 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-100 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
