'use client';

import { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isWithinInterval,
    parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';
import classNames from 'classnames';

interface CalendarProps {
    startDate: string;
    endDate: string;
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
}

export default function Calendar({ startDate, endDate, selectedDate, onSelectDate }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const validStart = parseISO(startDate);
    const validEnd = parseISO(endDate);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const isAvailable = (day: Date) => {
        // Check if day is within valid range AND not in the past (optional logic)
        // For now purely range based
        return isWithinInterval(day, { start: validStart, end: validEnd });
    };

    return (
        <div className="bg-white">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                >
                    ‹
                </button>
                <span className="font-bold text-gray-900 text-lg">
                    {format(currentMonth, 'yyyy년 M월', { locale: ko })}
                </span>
                <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                >
                    ›
                </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div key={day} className={classNames(
                        "text-center text-xs font-semibold py-2 uppercase tracking-wide",
                        i === 0 ? "text-rose-500" : i === 6 ? "text-blue-500" : "text-gray-400"
                    )}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                {days.map((day) => {
                    const available = isAvailable(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={day.toString()} className="flex justify-center">
                            <button
                                disabled={!available}
                                onClick={() => available && onSelectDate(day)}
                                className={classNames(
                                    "w-10 h-10 flex flex-col items-center justify-center rounded-full text-sm transition-all relative",
                                    !isCurrentMonth ? "opacity-20" : "", // Fade out adjacent months
                                    !available && isCurrentMonth ? "text-gray-300 cursor-not-allowed decoration-slice line-through decoration-gray-200" : "", // Unavailable
                                    available && !isSelected ? "text-gray-700 hover:bg-green-50 hover:text-green-600 font-medium" : "", // Available
                                    isSelected ? "bg-green-600 text-white font-bold shadow-md scale-105" : "" // Selected
                                )}
                            >
                                {format(day, 'd')}

                                {/* Dots/Indicators */}
                                {available && !isSelected && (
                                    <div className="absolute bottom-1.5 w-1 h-1 bg-green-400 rounded-full" />
                                )}
                                {isToday && !isSelected && (
                                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400" /> 예약가능
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300" /> 마감/불가
                </div>
            </div>
        </div>
    );
}
