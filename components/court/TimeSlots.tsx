'use client';

import { generateTimeSlots } from '@/lib/dateUtils';
import { SeoulService } from '@/lib/seoulApi';

interface TimeSlotsProps {
    service: SeoulService;
    selectedDate: Date | null;
}

export default function TimeSlots({ service, selectedDate }: TimeSlotsProps) {
    if (!selectedDate) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400 border border-dashed border-gray-200 rounded-xl h-full min-h-[300px]">
                <span className="text-4xl mb-2">📅</span>
                <p>날짜를 선택해주세요</p>
            </div>
        );
    }

    // Generate slots based on API time range
    const slots = generateTimeSlots(service.V_MIN, service.V_MAX);

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                회차 선택
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {slots.map((slot, index) => (
                            <a
                                key={index}
                                href={service.SVCURL}
                                target="_blank"
                                rel="noreferrer"
                                className="group flex flex-col p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
                            >
                                <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700">
                                    {index + 1}회차
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    {slot}
                                </span>
                                <span className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                                    예약하기 →
                                </span>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-10">
                        예약 가능한 회차가 없습니다.
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
                <a
                    href={service.SVCURL}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary w-full justify-center py-3 text-base shadow-lg shadow-green-100"
                >
                    공공서비스예약 바로가기
                </a>
                <p className="text-xs text-gray-400 text-center mt-3">
                    * 실제 예약은 서울시 공공서비스예약 사이트에서 진행됩니다.
                </p>
            </div>
        </div>
    );
}
