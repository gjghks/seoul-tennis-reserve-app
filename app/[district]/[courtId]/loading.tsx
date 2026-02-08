export default function CourtDetailLoading() {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 animate-pulse">
      <div className="bg-white border-b border-gray-100">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-20 bg-gray-200 rounded" />
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-gray-200 rounded-full" />
              <div className="w-9 h-9 bg-gray-200 rounded-full" />
            </div>
          </div>

          <div className="h-8 w-64 bg-gray-200 rounded mb-3" />

          <div className="flex items-center gap-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="h-14 w-full bg-gray-200 rounded-2xl mb-8" />

        <div className="aspect-video bg-gray-200 rounded-2xl mb-6" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full mb-2" />
              <div className="h-3 w-12 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 mb-6">
          <div className="p-5 border-b border-gray-100">
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        <div className="h-64 bg-gray-200 rounded-2xl mb-6" />
      </div>
    </div>
  );
}
