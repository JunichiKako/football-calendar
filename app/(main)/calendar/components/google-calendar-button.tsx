"use client";
import { Button } from "@/components/ui/button";
import type { CalendarEvent } from "@/components/ui/my-ui/calendar";

export function GoogleCalendarButton({ events }: { events: CalendarEvent[] }) {
  const handleAddToGoogleCalendar = () => {
    const event = events[0]; // 簡単のため最初のイベントのみ
    const formatDate = (date: Date) => date.toISOString().replace(/[-:.]/g, "");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${formatDate(event.start)}/${formatDate(event.end)}`;
    window.open(url, "_blank");
  };

  return (
    <Button variant="outline" onClick={handleAddToGoogleCalendar}>
      Add to Google Calendar
    </Button>
  );
}
