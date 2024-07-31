import {
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarWeekView,
  CalendarYearView,
} from "../../../components/ui/my-ui/calender";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Page() {
  return (
    <div className="mt-36 mb-20 mx-auto w-[900px]">
      <Calendar>
        <div className="flex items-center gap-2 mb-4">
          <Button size="sm" variant="ghost" asChild>
            <CalendarViewTrigger className="aria-[current=true]:bg-accent" view="day">
              Day
            </CalendarViewTrigger>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <CalendarViewTrigger view="week" className="aria-[current=true]:bg-accent">
              Week
            </CalendarViewTrigger>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <CalendarViewTrigger view="month" className="aria-[current=true]:bg-accent">
              Month
            </CalendarViewTrigger>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <CalendarViewTrigger view="year" className="aria-[current=true]:bg-accent">
              Year
            </CalendarViewTrigger>
          </Button>

          <span className="flex-1"></span>

          <CalendarCurrentDate formatStr="MMMM yyyy" />

          <Button asChild size="icon" variant="outline">
            <CalendarPrevTrigger>
              <ChevronLeft size={20} />
              <span className="sr-only">Previous</span>
            </CalendarPrevTrigger>
          </Button>

          <Button asChild variant="outline">
            <CalendarTodayTrigger>Today</CalendarTodayTrigger>
          </Button>

          <Button asChild size="icon" variant="outline">
            <CalendarNextTrigger>
              <ChevronRight size={20} />
              <span className="sr-only">Next</span>
            </CalendarNextTrigger>
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <CalendarDayView />
          <CalendarWeekView />
          <CalendarMonthView />
          <CalendarYearView />
        </div>
      </Calendar>
    </div>
  );
}
