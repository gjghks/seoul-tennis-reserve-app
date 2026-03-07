export default function RecordsLoading() {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 animate-pulse" aria-busy="true">
      <span className="sr-only">경기 기록을 불러오는 중입니다</span>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-32 bg-gray-200 rounded" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
        </div>

        <div className="max-w-2xl">
          {/* Stats Section */}
          <div className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="h-6 w-12 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Record Cards */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-32 bg-gray-100 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
