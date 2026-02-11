import Link from 'next/link';
import { SeoulService } from '@/lib/seoulApi';
import { KOREAN_TO_SLUG } from '@/lib/constants/districts';
import { isCourtAvailable } from '@/lib/utils/courtStatus';

interface SimilarCourtsProps {
  currentCourtId: string;
  currentPlaceName: string;
  district: string;
  allCourts: SeoulService[];
  isNeoBrutalism: boolean;
}

export default function SimilarCourts({
  currentCourtId,
  currentPlaceName,
  district,
  allCourts,
  isNeoBrutalism,
}: SimilarCourtsProps) {
  const differentFacilities = allCourts
    .filter(court => court.SVCID !== currentCourtId && court.PLACENM !== currentPlaceName)
    .sort((a, b) => {
      const aIsSameDistrict = a.AREANM === district;
      const bIsSameDistrict = b.AREANM === district;
      if (aIsSameDistrict && !bIsSameDistrict) return -1;
      if (!aIsSameDistrict && bIsSameDistrict) return 1;

      const aIsAvailable = isCourtAvailable(a.SVCSTATNM);
      const bIsAvailable = isCourtAvailable(b.SVCSTATNM);
      if (aIsAvailable && !bIsAvailable) return -1;
      if (!aIsAvailable && bIsAvailable) return 1;

      return 0;
    });

  const seen = new Set<string>();
  const uniqueFacilities = differentFacilities.filter(court => {
    if (seen.has(court.PLACENM)) return false;
    seen.add(court.PLACENM);
    return true;
  });

  const filteredCourts = uniqueFacilities.slice(0, 5);

  if (filteredCourts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className={`text-xl font-bold mb-1 ${
          isNeoBrutalism ? 'text-black' : 'text-gray-900'
        }`}>
          비슷한 테니스장
        </h2>
        <p className={`text-sm ${
          isNeoBrutalism ? 'text-black/60' : 'text-gray-500'
        }`}>
          같은 지역 또는 인근 지역의 다른 테니스장을 확인해보세요
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-3 ${
        isNeoBrutalism ? '' : 'sm:grid-cols-2'
      }`}>
        {filteredCourts.map((court) => {
          const isAvailable = isCourtAvailable(court.SVCSTATNM);
          const isSameDistrict = court.AREANM === district;
          const courtSlug = KOREAN_TO_SLUG[court.AREANM];

          return (
            <Link
              key={court.SVCID}
              href={`/${courtSlug}/${encodeURIComponent(court.SVCID)}`}
              className={`group transition-all ${
                isNeoBrutalism
                  ? 'border-2 border-black rounded-[5px] p-4 hover:shadow-[6px_6px_0px_0px_#000] hover:translate-x-[-3px] hover:translate-y-[-3px]'
                  : 'border border-gray-200 rounded-xl p-4 hover:border-green-500 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-sm truncate ${
                    isNeoBrutalism ? 'text-black' : 'text-gray-900'
                  }`}>
                    {court.SVCNM}
                  </h3>
                  <p className={`text-xs truncate ${
                    isNeoBrutalism ? 'text-black/50' : 'text-gray-500'
                  }`}>
                    {court.PLACENM}
                  </p>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-[3px] whitespace-nowrap ${
                  isNeoBrutalism
                    ? `border border-black ${
                        isAvailable
                          ? 'bg-[#a3e635] text-black'
                          : 'bg-[#fca5a5] text-black'
                      }`
                    : `${
                        isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-50 text-red-600'
                      }`
                }`}>
                  {court.SVCSTATNM}
                </span>
              </div>

              <div className={`flex items-center gap-2 text-xs mb-2 ${
                isNeoBrutalism ? 'text-black/60' : 'text-gray-600'
              }`}>
                <span className={`px-2 py-1 rounded-[3px] ${
                  isNeoBrutalism
                    ? 'bg-white border border-black/20'
                    : 'bg-gray-100'
                }`}>
                  {court.PAYATNM}
                </span>
                {court.V_MIN && court.V_MAX && (
                  <span className={`px-2 py-1 rounded-[3px] ${
                    isNeoBrutalism
                      ? 'bg-white border border-black/20'
                      : 'bg-gray-100'
                  }`}>
                    {court.V_MIN} - {court.V_MAX}
                  </span>
                )}
              </div>

              {!isSameDistrict && (
                <p className={`text-xs font-medium ${
                  isNeoBrutalism ? 'text-black/40' : 'text-gray-400'
                }`}>
                  📍 {court.AREANM}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
