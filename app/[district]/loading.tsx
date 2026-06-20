export default function DistrictLoading() {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-slate-900 animate-pulse" aria-busy="true">
      <span className="sr-only">자치구 테니스장 목록을 불러오는 중입니다</span>

      <div className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800">
        <div className="container py-4">
          <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
          <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>

      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <div className="h-10 w-20 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-10 w-20 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="h-4 w-32 bg-gray-100 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full" />
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="h-3 w-16 bg-gray-100 dark:bg-slate-800 rounded mb-1" />
                    <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700 rounded" />
                  </div>
                  <div>
                    <div className="h-3 w-16 bg-gray-100 dark:bg-slate-800 rounded mb-1" />
                    <div className="h-4 w-12 bg-gray-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="h-8 w-full bg-gray-200 dark:bg-slate-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
