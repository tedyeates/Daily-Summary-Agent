import { google } from 'googleapis';
import { getGoogleAuthClient } from '../lib/auth.js';

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    location?: string;
    isAllDay: boolean;
    status: string; // 'confirmed' | 'tentative' | 'cancelled'
    showAs?: string; // 'free' | 'busy' etc (transparency field)
}

function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

function endOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d;
}

function parseEvent(event: any): CalendarEvent {
    const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);
    return {
        id: event.id,
        title: event.summary ?? '(no title)',
        start: event.start?.dateTime ?? event.start?.date ?? '',
        end: event.end?.dateTime ?? event.end?.date ?? '',
        description: event.description ?? undefined,
        location: event.location ?? undefined,
        isAllDay,
        status: event.status ?? 'confirmed',
        showAs: event.transparency ?? 'busy',
    };
}

/**
 * Fetches events for today only.
 */
export async function fetchTodayEvents(): Promise<CalendarEvent[]> {
    const auth = getGoogleAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });
    const now = new Date();

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay(now).toISOString(),
        timeMax: endOfDay(now).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    return (res.data.items ?? []).map(parseEvent);
}

// TODO: include other calendars smartly like film club and bin collection and holidays
/**
 * Fetches events for the next 7 days (excluding today).
 */
export async function fetchWeekEvents(): Promise<CalendarEvent[]> {
    const auth = getGoogleAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay(tomorrow).toISOString(),
        timeMax: endOfWeek(now).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    return (res.data.items ?? []).map(parseEvent);
}

/**
 * Formats calendar events into a plain-text block for the LLM prompt.
 */
export function formatEventsForPrompt(
	events: CalendarEvent[], 
	isToday: boolean = false
): string {
    if (events.length === 0) return 'No events.';

    return events.map((e) => {
        let date = isToday ? '' : new Date(e.start).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            timeZone: 'Europe/London',
        });

        let time =  e.isAllDay ? 'All day' : new Date(e.start).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/London',
        }); 

        const desc = e.description ? `\n  Notes: ${e.description.slice(0, 120)}` : '';
        const loc = e.location ? `\n  Location: ${e.location}` : '';

        return `- ${date} ${time}: ${e.title}${loc}${desc}`;
    }).join('\n');
}