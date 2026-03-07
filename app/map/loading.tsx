export default function MapLoading() {
  return (
    <div className="min-h-screen pb-20 bg-gray-50 animate-pulse" aria-busy="true">
      <span className="sr-only">지도를 불러오는 중입니다</span>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-4">
          <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
          <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Controls */}
      <div className="container py-4 flex gap-2">
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Map Container */}
      <div className="container">
        <div className="w-full h-96 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
