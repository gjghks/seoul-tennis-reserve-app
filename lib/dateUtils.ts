import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatKoreanDate(dateString: string) {
    try {
        const date = parseISO(dateString);
        return format(date, 'M월 d일 (EEE)', { locale: ko });
    } catch (e) {
        return dateString;
    }
}

export function formatKoreanTime(time: string) {
    // Assuming time format "HH:mm"
    return time;
}

// Generate slots based on V_MIN ~ V_MAX or return null if not parseable
export function generateTimeSlots(start: string, end: string) {
    const slots = [];
    let current = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);

    // Assume 2-hour slots for tennis courts usually
    while (current < endHour) {
        const next = current + 2;
        slots.push(`${current.toString().padStart(2, '0')}:00 ~ ${next.toString().padStart(2, '0')}:00`);
        current = next;
    }
    return slots;
}
