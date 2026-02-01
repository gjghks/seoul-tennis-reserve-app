import { fetchTennisAvailability } from '@/lib/seoulApi';
import TimeSlotsWrapper from '@/components/court/TimeSlotsWrapper';
import Link from 'next/link';

async function getCourt(id: string) {
    const services = await fetchTennisAvailability(1, 1000);
    return services.find(s => s.SVCID === id);
}

// Helper to format large numbers
const formatPrice = (price: string) => {
    return price === '유료' ? '이용료 확인 필요' : price;
};

export default async function CourtDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const court = await getCourt(id);

    if (!court) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 scrollbar-hide">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">테니스장을 찾을 수 없습니다</h2>
                    <Link href="/" className="text-green-600 hover:text-green-700 font-medium">
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    const startDate = court.RCPTBGNDT;
    const endDate = court.RCPTENDDT;

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-20 scrollbar-hide">
            {/* Top Navigation */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="container h-16 flex items-center">
                    <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="font-medium">목록으로</span>
                    </Link>
                </div>
            </div>

            <div className="container pt-8">
                <div className="grid lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Court Info */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex gap-2 mb-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {court.AREANM}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {court.MINCLASSNM}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                {court.SVCNM}
                            </h1>

                            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                        📍
                                    </span>
                                    {court.PLACENM}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                        📞
                                    </span>
                                    {court.TELNO || '문의전화 없음'}
                                </div>
                            </div>
                        </div>

                        {/* Image & Details */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                            {court.IMGURL ? (
                                <div className="aspect-video w-full bg-gray-100 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={court.IMGURL}
                                        alt={court.SVCNM}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-6">
                                        <p className="text-white font-medium">시설 전경</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video w-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    이미지가 없습니다
                                </div>
                            )}

                            <div className="p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">시설 상세정보</h3>

                                <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">이용 요금</dt>
                                        <dd className="text-base text-gray-900 font-medium">{formatPrice(court.PAYATNM)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">운영 시간</dt>
                                        <dd className="text-base text-gray-900 font-medium">{court.V_MIN} ~ {court.V_MAX}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">접수 기간</dt>
                                        <dd className="text-base text-gray-900 font-medium">
                                            {court.RCPTBGNDT.split(' ')[0]} ~ {court.RCPTENDDT.split(' ')[0]}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 mb-1">시설 상태</dt>
                                        <dd className="text-base text-green-600 font-bold">{court.SVCSTATNM}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking (Sticky) */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">예약 가능 일정</h3>
                                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                        실시간
                                    </span>
                                </div>
                                <div className="p-6">
                                    <TimeSlotsWrapper
                                        startDate={startDate}
                                        endDate={endDate}
                                        service={court}
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <h4 className="text-sm font-bold text-blue-900 mb-2">💡 예약 팁</h4>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    서울시 공공서비스예약은 <strong>회원가입</strong>이 필수입니다.
                                    미리 가입해두시면 빠른 예약이 가능합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
