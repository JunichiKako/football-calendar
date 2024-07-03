"use client";

import { cn } from "@/lib/utils";
import {
  Locale,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInHours,
  differenceInMinutes,
  format,
  getMonth,
  isSameDay,
  isSameHour,
  isSameMonth,
  setHours,
  setMonth,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { ja } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";


type View = "day" | "week" | "month" | "year";

type ContextType = {
  view: View;
  setView: (view: View) => void;
  date: Date;
  setDate: (date: Date) => void;
  events: Event[];
  locale: Locale;
  setEvents: (date: Event[]) => void;
  addEvent: (date: Event) => void;
  removeEvent: (id: string) => void;
  enableHotkeys?: boolean;
  today: Date;
};

const Context = createContext<ContextType>({} as ContextType);

// ここにチーム名とかの型を今後追加する？
type Event = {
  id: string;
  start: Date;
  end: Date;
  title: string;
};

type CalendarProps = {
  children: ReactNode;
  defaultDate?: Date;
  events?: Event[];
  locale?: Locale;
  enableHotkeys?: boolean;
};

// カレンダー自体の挙動を管理するコンポーネント
const Calendar = ({
  children,
  defaultDate = new Date(),
  locale = ja,
  enableHotkeys = true,
  events: defaultEvents = [
    {
      id: "1",
      start: new Date("2024-06-04T09:00:00Z"),
      end: new Date("2024-06-04T10:30:00Z"),
      title: "test",
    },
  ],
}: CalendarProps) => {
  const searchParams = useSearchParams();
  // URLのクエリパラメータからviewを取得している。なければデフォルトでmonthを表示する
  const [view, setView] = useState<View>((searchParams.get("view") as View) || "month");
  const [date, setDate] = useState(defaultDate);
  const [events, setEvents] = useState<Event[]>(defaultEvents);
  const router = useRouter();
  // 現在のURLのパスを取得
  const pathname = usePathname();

  // usecallbackで関数を再レンダリング時に再生成しないようにしている
  const addEvent = useCallback((event: Event) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  // SearchParmasを変数paramsに格納して、viewの値をセットしている
  // その後、router.replaceでURLを更新している

  // routerの値が変わるたびに実行されるのはなぜ？
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("view", view);
    router.replace(`${pathname}?${params.toString()}`);
  }, [view, searchParams, router, pathname]);

  // useHotkeys("m", () => setView("month"), {
  //   enabled: enableHotkeys,
  // });

  // useHotkeys("w", () => setView("week"), {
  //   enabled: enableHotkeys,
  // });

  // useHotkeys("y", () => setView("year"), {
  //   enabled: enableHotkeys,
  // });

  // useHotkeys("d", () => setView("day"), {
  //   enabled: enableHotkeys,
  // });

  return (
    <Context.Provider
      value={{
        view,
        setView,
        date,
        setDate,
        events,
        setEvents,
        addEvent,
        locale,
        removeEvent,
        enableHotkeys,
        today: new Date(),
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useCalendar = () => useContext(Context);

// カレンダーのビューを変更するためのトリガー
const CalendarViewTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & {
    view: View;
  }
>(({ children, view, ...props }) => {
  const { view: currentView, setView } = useCalendar();

  return (
    <button aria-current={currentView === view} {...props} onClick={() => setView(view)}>
      {children}
    </button>
  );
});
CalendarViewTrigger.displayName = "CalendarViewTrigger";

// カレンダーの日を表示するコンポーネント
const CalendarDayView = () => {
  const { view } = useCalendar();

  if (view !== "day") return null;

  return (
    <div className="flex relative">
      <TimeTable />
      <div></div>
    </div>
  );
};

// カレンダーの月を表示するコンポーネント
const CalendarMonthView = () => {
  const { date, view, events, locale } = useCalendar();

  const monthDates = useMemo(() => getDaysInMonth(date), [date]);
  const weekDays = useMemo(() => generateWeekdays(locale), [locale]);

  if (view !== "month") return null;

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 gap-px">
        {weekDays.map((day, i) => (
          <div
            key={day}
            className={cn(
              "mb-2 text-right text-sm text-muted-foreground pr-2",
              [0, 6].includes(i) && "text-muted-foreground/50"
            )}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr p-px grid-cols-7 gap-px">
        {monthDates.map((_date) => {
          const currentEvents = events.filter((event) => isSameDay(event.start, _date));

          return (
            <div
              className={cn(
                "ring-1 space-y-1 p-2 text-sm text-muted-foreground ring-border",
                !isSameMonth(date, _date) && "text-muted-foreground/50"
              )}
              key={_date.toString()}
            >
              <span>{format(_date, "d")}</span>

              {currentEvents.map((event) => {
                return (
                  <div
                    key={event.id}
                    className="px-1 py-0.5 rounded text-sm flex items-center gap-1"
                  >
                    <div className="size-2 shrink-0 bg-pink-500 rounded-full"></div>
                    <span className="flex-1 truncate">{event.title}</span>
                    <time className="tabular-nums text-muted-foreground/50 text-xs">
                      {format(event.start, "HH:mm")}
                    </time>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// カレンダーの年を表示するコンポーネント
const CalendarYearView = () => {
  const { view, date, today, locale } = useCalendar();

  const months = useMemo(() => {
    if (!view) {
      return [];
    }

    return Array.from({ length: 12 }).map((_, i) => {
      return getDaysInMonth(setMonth(date, i));
    });
  }, [date, view]);

  const weekDays = useMemo(() => generateWeekdays(locale), [locale]);

  if (view !== "year") return null;

  return (
    <div className="grid grid-cols-4 gap-10">
      {months.map((days, i) => (
        <div key={i}>
          <span className="text-xl">{i + 1}月</span>

          <div className="grid grid-cols-7 gap-2 my-5">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid gap-x-2 text-center grid-cols-7 text-xs tabular-nums">
            {days.map((_date) => {
              return (
                <div
                  key={_date.toString()}
                  className={cn(getMonth(_date) !== i && "text-muted-foreground")}
                >
                  <div
                    className={cn(
                      "aspect-square grid place-content-center size-full",
                      isSameDay(today, _date) &&
                        getMonth(_date) === i &&
                        "bg-primary text-primary-foreground rounded-full"
                    )}
                  >
                    {format(_date, "d")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
// カレンダーの週を表示するコンポーネント
const CalendarWeekView = () => {
  const { view, date, locale, events } = useCalendar();

  const weekDates = useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(start, i);
      const hours = [...Array(24)].map((_, i) => setHours(day, i));
      weekDates.push(hours);
    }

    return weekDates;
  }, [date]);

  const headerDays = useMemo(() => {
    const daysOfWeek = [];
    for (let i = 0; i < 7; i++) {
      const result = addDays(startOfWeek(date, { weekStartsOn: 0 }), i);
      daysOfWeek.push(format(result, "d日(EEEEEE)", { locale }));
    }
    return daysOfWeek;
  }, [date, locale]);

  if (view !== "week") return null;

  return (
    <div className="flex flex-col relative">
      <div className="flex sticky top-0 bg-card z-10 border-b mb-3">
        <div className="w-12"></div>
        {headerDays.map((day, i) => (
          <div
            key={i}
            className={cn(
              "text-center flex-1 pb-2 text-sm text-muted-foreground",
              [0, 6].includes(i) && "text-muted-foreground/50"
            )}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="flex flex-1">
        <div className="w-fit">
          <TimeTable />
        </div>
        <div className="grid grid-cols-7 flex-1">
          {weekDates.map((hours, i) => {
            return (
              <div
                className={cn(
                  "h-full text-sm text-muted-foreground border-l first:border-l-0",
                  [0, 6].includes(i) && "bg-muted/50"
                )}
                key={i}
              >
                {hours.map((hour, i) => {
                  console.log(hour);

                  return (
                    <div className="h-20 border-t" key={i}>
                      {events
                        .filter((event) => isSameHour(event.start, hour))
                        .map((event) => {
                          const hoursDifference = differenceInMinutes(event.end, event.start) / 60;

                          return (
                            <div
                              key={event.id}
                              className="rounded bg-sky-500 p-2 text-xs relative text-sky-700 font-semibold"
                              style={{
                                height: `${hoursDifference * 100}%`,
                              }}
                            >
                              {event.title}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
// 次の日、週、月、年に移動するためのトリガー
const CalendarNextTrigger = forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ children, onClick, ...props }, ref) => {
    const { date, setDate, view, enableHotkeys } = useCalendar();

    const next = useCallback(() => {
      if (view === "day") {
        setDate(addDays(date, 1));
      } else if (view === "week") {
        setDate(addWeeks(date, 1));
      } else if (view === "month") {
        setDate(addMonths(date, 1));
      } else if (view === "year") {
        setDate(addYears(date, 1));
      }
    }, [date, view, setDate]);

    useHotkeys("ArrowRight", () => next(), {
      enabled: enableHotkeys,
    });

    return (
      <button
        ref={ref}
        {...props}
        onClick={(e) => {
          next();
          onClick?.(e);
        }}
      >
        {children}
      </button>
    );
  }
);
CalendarNextTrigger.displayName = "CalendarNextTrigger";

// 前の日、週、月、年に移動するためのトリガー
const CalendarPrevTrigger = forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ children, onClick, ...props }, ref) => {
    const { date, setDate, view, enableHotkeys } = useCalendar();

    useHotkeys("ArrowLeft", () => prev(), {
      enabled: enableHotkeys,
    });

    const prev = useCallback(() => {
      if (view === "day") {
        setDate(subDays(date, 1));
      } else if (view === "week") {
        setDate(subWeeks(date, 1));
      } else if (view === "month") {
        setDate(subMonths(date, 1));
      } else if (view === "year") {
        setDate(subYears(date, 1));
      }
    }, [date, view, setDate]);

    return (
      <button
        ref={ref}
        {...props}
        onClick={(e) => {
          prev();
          onClick?.(e);
        }}
      >
        {children}
      </button>
    );
  }
);
CalendarPrevTrigger.displayName = "CalendarPrevTrigger";

// 今日の日付に移動するためのトリガー
const CalendarTodayTrigger = forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ children, onClick, ...props }, ref) => {
    const { setDate, enableHotkeys, today } = useCalendar();

    useHotkeys("t", () => jumpToToday(), {
      enabled: enableHotkeys,
    });

    const jumpToToday = useCallback(() => {
      setDate(today);
    }, [today, setDate]);

    return (
      <button
        ref={ref}
        {...props}
        onClick={(e) => {
          jumpToToday();
          onClick?.(e);
        }}
      >
        {children}
      </button>
    );
  }
);
CalendarTodayTrigger.displayName = "CalendarTodayTrigger";
// カレンダーの現在の日付を表示するコンポーネント
const CalendarCurrentDate = ({ formatStr }: { formatStr: string }) => {
  const { date } = useCalendar();

  return (
    <time dateTime={date.toISOString()} className="tabular-nums">
      {format(date, formatStr)}
    </time>
  );
};

// カレンダーの時間割を表示するコンポーネント
const TimeTable = () => {
  return (
    <div className="pr-2 w-12">
      {[...Array(25)].map((_, i) => {
        return (
          <div className="text-right relative text-xs text-muted-foreground/50 h-20" key={i}>
            <p className="top-0 -translate-y-1/2">{i === 24 ? 0 : i}:00</p>
          </div>
        );
      })}
    </div>
  );
};

// カレンダーの月の日数を取得する関数
const getDaysInMonth = (date: Date) => {
  const startOfMonthDate = startOfMonth(date);
  const startOfWeekForMonth = startOfWeek(startOfMonthDate, {
    weekStartsOn: 0,
  });

  let currentDate = startOfWeekForMonth;
  const calendar = [];

  while (calendar.length < 42) {
    calendar.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return calendar;
};

// カレンダーの曜日を取得する関数
const generateWeekdays = (locale: Locale) => {
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), i);
    daysOfWeek.push(format(date, "EEEEEE", { locale }));
  }
  return daysOfWeek;
};

export {
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarWeekView,
  CalendarYearView
};

