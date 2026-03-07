export default function TrendsLoading() {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 animate-pulse" aria-busy="true">
      <span className="sr-only">경쟁률 추이 데이터를 불러오는 중입니다</span>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-4">
          <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="container py-6">
        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg" />
          ))}
        </div>

        {/* Chart Area */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>

        {/* Heatmap Section */}
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-8">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((dayIdx) => (
              <div key={dayIdx}>
                <div className="h-4 w-12 bg-gray-200 rounded mb-2 mx-auto" />
                <div className="space-y-1">
                  {[1, 2, 3, 4].map((timeIdx) => (
                    <div key={timeIdx} className="h-8 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* District Rates */}
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="h-5 w-32 bg-gray-200 rounded" />
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
