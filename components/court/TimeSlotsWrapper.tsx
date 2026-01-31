'use client';

import { useState } from 'react';
import Calendar from './Calendar';
import TimeSlots from './TimeSlots';
import { SeoulService } from '@/lib/seoulApi';

interface WrapperProps {
    startDate: string;
    endDate: string;
    service: SeoulService;
}

export default function TimeSlotsWrapper({ startDate, endDate, service }: WrapperProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // When date is selected, we might want to scroll to slots on mobile?
    // For now simple stack.

    return (
        <div className="space-y-8">
            {/* Calendar Section */}
            <div>
                <Calendar
                    startDate={startDate}
                    endDate={endDate}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Time Slots Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">회차 선택</h4>
                    {selectedDate && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
                            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 선택됨
                        </span>
                    )}
                </div>
                <TimeSlots
                    service={service}
                    selectedDate={selectedDate}
                />
            </div>
        </div>
    );
}
