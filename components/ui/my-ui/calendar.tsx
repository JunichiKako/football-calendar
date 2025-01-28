'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@radix-ui/react-alert-dialog';
import { VariantProps, cva } from 'class-variance-authority';
import {
  Locale,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInMinutes,
  format,
  getMonth,
  isSameDay,
  isSameHour,
  isSameMonth,
  isToday,
  setHours,
  setMonth,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { X } from 'lucide-react';
import {
  ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { AlertDialogFooter, AlertDialogHeader } from '../alert-dialog';
import { removeMatchSelections } from '@/actions/add-my-calendar';

type View = 'day' | 'week' | 'month' | 'year';

type ContextType = {
  view: View;
  setView: (view: View) => void;
  date: Date;
  setDate: (date: Date) => void;
  events: CalendarEvent[];
  locale: Locale;
  setEvents: (
    events: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])
  ) => void;
  onChangeView?: (view: View) => void;
  onEventClick?: (event: CalendarEvent) => void;
  enableHotkeys?: boolean;
  today: Date;
};

const Context = createContext<ContextType>({} as ContextType);

export type CalendarEvent = {
  id: string;
  start: Date;
  end: Date;
  title: string;
  leagueName: string; 
};

type CalendarProps = {
  children: ReactNode;
  defaultDate?: Date;
  events?: CalendarEvent[];
  view?: View;
  locale?: Locale;
  enableHotkeys?: boolean;
  onChangeView?: (view: View) => void;
  onEventClick?: (event: CalendarEvent) => void;
};

const Calendar = ({
  children,
  defaultDate = new Date(),
  locale = enUS,
  enableHotkeys = true,
  view: _defaultMode = 'month',
  onEventClick,
  events: defaultEvents = [],
  onChangeView,
}: CalendarProps) => {
  const [view, setView] = useState<View>(_defaultMode);
  const [date, setDate] = useState(defaultDate);
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);

  const changeView = (view: View) => {
    setView(view);
    onChangeView?.(view);
  };

  useHotkeys('m', () => changeView('month'), {
    enabled: enableHotkeys,
  });

  useHotkeys('w', () => changeView('week'), {
    enabled: enableHotkeys,
  });

  useHotkeys('y', () => changeView('year'), {
    enabled: enableHotkeys,
  });

  useHotkeys('d', () => changeView('day'), {
    enabled: enableHotkeys,
  });

  return (
    <Context.Provider
      value={{
        view,
        setView,
        date,
        setDate,
        events,
        setEvents,
        locale,
        enableHotkeys,
        onEventClick,
        onChangeView,
        today: new Date(),
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useCalendar = () => useContext(Context);

const CalendarViewTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & {
    view: View;
  }
>(({ children, view, ...props }, ref) => {
  const { view: currentView, setView, onChangeView } = useCalendar();

  return (
    <Button
      ref={ref}
      aria-current={currentView === view}
      size='sm'
      variant='ghost'
      {...props}
      onClick={() => {
        setView(view);
        onChangeView?.(view);
      }}
    >
      {children}
    </Button>
  );
});
CalendarViewTrigger.displayName = 'CalendarViewTrigger';

const EventGroup = ({
  events,
  hour,
}: {
  events: CalendarEvent[];
  hour: Date;
}) => {
  const { setEvents } = useCalendar();
  const hourEvents = events.filter((event) => isSameHour(event.start, hour));

  const getEventStyle = (leagueName: string): string => {
    switch (leagueName) {
      case 'Premier League':
        return 'bg-[#3D195B] text-white border border-white/20';
      case 'Bundesliga':
        return 'bg-[#D3010C] text-white border border-white/20';
      case 'Primera Division':
        return 'bg-[#EE8707] text-white border border-white/20';
      case 'Serie A':
        return 'bg-[#18305B] text-white border border-white/20';
      case 'Ligue 1':
        return 'bg-[#091C3E] text-white border border-white/20';
      default:
        return 'bg-gray-500/80 text-white border border-white/20';
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await removeMatchSelections(eventId);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className='relative h-20'>
      <div className='absolute inset-0' style={{ zIndex: 0 }}>
        <div className='w-full h-full border-t' />
      </div>

      {hourEvents.map((event, index) => {
        const hoursDifference =
          differenceInMinutes(event.end, event.start) / 60;
        const startPosition = event.start.getMinutes() / 60;

        return (
          <div
            key={event.id}
            className={cn(
              'absolute hover:z-10',
              'p-2 rounded-md shadow-sm',
              getEventStyle(event.leagueName)
            )}
            style={{
              top: `${startPosition * 100}%`,
              height: `${hoursDifference * 100}%`,
              width: '25%',
              left: `${index * 25}%`,
              zIndex: index,
            }}
          >
            <div className='flex flex-col gap-1 overflow-hidden'>
              <div className='flex items-start justify-between'>
                <div className='font-semibold truncate'>{event.title}</div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-6 w-6 p-0'>
                      <X className='h-4 w-4' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogPortal>
                    <AlertDialogOverlay className='fixed inset-0  z-50' />
                    <AlertDialogContent className='fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[51] max-w-md w-[90%] bg-white dark:text-black shadow-lg rounded-lg p-4'>
                      <AlertDialogHeader className='mb-4'>
                        <AlertDialogTitle>イベントの削除</AlertDialogTitle>
                        <AlertDialogDescription>
                          本当にこのイベントを削除しますか？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <Button variant='outline' className='text-white'>
                            キャンセル
                          </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button
                            variant='destructive'
                            onClick={() => handleDelete(event.id)}
                          >
                            削除
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogPortal>
                </AlertDialog>
              </div>
              <div className='text-xs whitespace-nowrap opacity-90'>
                {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
const CalendarDayView = () => {
  const { view, events, date } = useCalendar();

  if (view !== 'day') return null;

  const hours = [...Array(24)].map((_, i) => setHours(date, i));

  return (
    <div className='flex relative pt-2 overflow-auto h-full'>
      <TimeTable />
      <div className='flex-1'>
        {hours.map((hour) => {
          // その時間のイベントを取得
          const hourEvents = events.filter((event) =>
            isSameHour(event.start, hour)
          );
          // 2つ以上のイベントがある場合のみ分割表示
          const shouldSplit = hourEvents.length > 1;

          return (
            <EventGroup key={hour.toString()} hour={hour} events={events} />
          );
        })}
      </div>
    </div>
  );
};

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
      daysOfWeek.push(result);
    }
    return daysOfWeek;
  }, [date]);

  if (view !== 'week') return null;

  return (
    <div className='flex flex-col relative overflow-auto h-full'>
      <div className='flex sticky top-0 bg-card z-10 border-b mb-3'>
        <div className='w-12'></div>
        {headerDays.map((date, i) => (
          <div
            key={date.toString()}
            className={cn(
              'text-center flex-1 gap-1 pb-2 text-sm text-muted-foreground flex items-center justify-center',
              [0, 6].includes(i) && 'text-muted-foreground/50'
            )}
          >
            {format(date, 'E', { locale })}
            <span
              className={cn(
                'h-6 grid place-content-center',
                isToday(date) &&
                  'bg-primary text-primary-foreground rounded-full size-6'
              )}
            >
              {format(date, 'd')}
            </span>
          </div>
        ))}
      </div>
      <div className='flex flex-1'>
        <div className='w-fit'>
          <TimeTable />
        </div>
        <div className='grid grid-cols-7 flex-1'>
          {weekDates.map((hours, i) => {
            return (
              <div
                className={cn(
                  'h-full text-sm text-muted-foreground border-l first:border-l-0',
                  [0, 6].includes(i) && 'bg-muted/50'
                )}
                key={hours[0].toString()}
              >
                {hours.map((hour) => {
                  // その時間のイベントを取得
                  const hourEvents = events.filter((event) =>
                    isSameHour(event.start, hour)
                  );
                  // 2つ以上のイベントがある場合のみ分割表示
                  const shouldSplit = hourEvents.length > 1;

                  return (
                    <EventGroup
                      key={hour.toString()}
                      hour={hour}
                      events={hourEvents}
                    />
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

const CalendarMonthView = () => {
  const { date, view, events, locale, setView, setDate } = useCalendar(); // setViewとsetDateを追加

  const monthDates = useMemo(() => getDaysInMonth(date), [date]);
  const weekDays = useMemo(() => generateWeekdays(locale), [locale]);

  if (view !== 'month') return null;

  // 日付クリック時のハンドラー
  const handleDateClick = (clickedDate: Date) => {
    setDate(clickedDate);
    setView('day');
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='grid grid-cols-7 gap-px sticky top-0 bg-background border-b'>
        {weekDays.map((day, i) => (
          <div
            key={day}
            className={cn(
              'mb-2 text-right text-sm text-muted-foreground pr-2',
              [0, 6].includes(i) && 'text-muted-foreground/50'
            )}
          >
            {day}
          </div>
        ))}
      </div>
      <div className='grid overflow-hidden -mt-px flex-1 auto-rows-fr p-px grid-cols-7 gap-px'>
        {monthDates.map((_date) => {
          const currentEvents = events.filter((event) =>
            isSameDay(event.start, _date)
          );

          return (
            <div
              onClick={() => handleDateClick(_date)} // クリックハンドラーを追加
              className={cn(
                'ring-1 p-2 text-sm text-muted-foreground ring-border overflow-auto cursor-pointer hover:bg-accent/50', // スタイルを追加
                !isSameMonth(date, _date) && 'text-muted-foreground/50'
              )}
              key={_date.toString()}
            >
              <span
                className={cn(
                  'size-6 grid place-items-center rounded-full mb-1 sticky top-0',
                  isToday(_date) && 'bg-primary text-primary-foreground'
                )}
              >
                {format(_date, 'd')}
              </span>

              {currentEvents.map((event) => {
                return (
                  <div
                    key={event.id}
                    className='px-1 rounded text-xs flex items-center gap-1'
                  >
                    <div className={cn('shrink-0')}></div>
                    <span className='flex-1 truncate'>{event.title}</span>
                    <time className='tabular-nums text-muted-foreground/50 text-xs'>
                      {format(event.start, 'HH:mm')}
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

  if (view !== 'year') return null;

  return (
    <div className='grid grid-cols-4 gap-10 overflow-auto h-full'>
      {months.map((days, i) => (
        <div key={days[0].toString()}>
          <span className='text-xl'>{i + 1}</span>

          <div className='grid grid-cols-7 gap-2 my-5'>
            {weekDays.map((day) => (
              <div
                key={day}
                className='text-center text-xs text-muted-foreground'
              >
                {day}
              </div>
            ))}
          </div>

          <div className='grid gap-x-2 text-center grid-cols-7 text-xs tabular-nums'>
            {days.map((_date) => {
              return (
                <div
                  key={_date.toString()}
                  className={cn(
                    getMonth(_date) !== i && 'text-muted-foreground'
                  )}
                >
                  <div
                    className={cn(
                      'aspect-square grid place-content-center size-full tabular-nums',
                      isSameDay(today, _date) &&
                        getMonth(_date) === i &&
                        'bg-primary text-primary-foreground rounded-full'
                    )}
                  >
                    {format(_date, 'd')}
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

const CalendarNextTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { date, setDate, view, enableHotkeys } = useCalendar();

  const next = useCallback(() => {
    if (view === 'day') {
      setDate(addDays(date, 1));
    } else if (view === 'week') {
      setDate(addWeeks(date, 1));
    } else if (view === 'month') {
      setDate(addMonths(date, 1));
    } else if (view === 'year') {
      setDate(addYears(date, 1));
    }
  }, [date, view, setDate]);

  useHotkeys('ArrowRight', () => next(), {
    enabled: enableHotkeys,
  });

  return (
    <Button
      size='icon'
      variant='outline'
      ref={ref}
      {...props}
      onClick={(e) => {
        next();
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
});
CalendarNextTrigger.displayName = 'CalendarNextTrigger';

const CalendarPrevTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { date, setDate, view, enableHotkeys } = useCalendar();

  useHotkeys('ArrowLeft', () => prev(), {
    enabled: enableHotkeys,
  });

  const prev = useCallback(() => {
    if (view === 'day') {
      setDate(subDays(date, 1));
    } else if (view === 'week') {
      setDate(subWeeks(date, 1));
    } else if (view === 'month') {
      setDate(subMonths(date, 1));
    } else if (view === 'year') {
      setDate(subYears(date, 1));
    }
  }, [date, view, setDate]);

  return (
    <Button
      size='icon'
      variant='outline'
      ref={ref}
      {...props}
      onClick={(e) => {
        prev();
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
});
CalendarPrevTrigger.displayName = 'CalendarPrevTrigger';

const CalendarTodayTrigger = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ children, onClick, ...props }, ref) => {
  const { setDate, enableHotkeys, today } = useCalendar();

  useHotkeys('t', () => jumpToToday(), {
    enabled: enableHotkeys,
  });

  const jumpToToday = useCallback(() => {
    setDate(today);
  }, [today, setDate]);

  return (
    <Button
      variant='outline'
      ref={ref}
      {...props}
      onClick={(e) => {
        jumpToToday();
        onClick?.(e);
      }}
    >
      {children}
    </Button>
  );
});
CalendarTodayTrigger.displayName = 'CalendarTodayTrigger';

const CalendarCurrentDate = () => {
  const { date, view } = useCalendar();

  return (
    <time dateTime={date.toISOString()} className='tabular-nums text-sm'>
      {format(date, view === 'day' ? 'dd MMMM yyyy' : 'MMMM yyyy')}
    </time>
  );
};

const TimeTable = () => {
  const now = new Date();

  return (
    <div className='pr-2 w-12'>
      {Array.from(Array(25).keys()).map((hour) => {
        return (
          <div
            className='text-right relative text-xs text-muted-foreground/50 h-20 last:h-0'
            key={hour}
          >
            {now.getHours() === hour && (
              <div
                className='absolute z- left-full translate-x-2 w-dvw h-[2px] bg-red-500'
                style={{
                  top: `${(now.getMinutes() / 60) * 100}%`,
                }}
              >
                <div className='size-2 rounded-full bg-red-500 absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'></div>
              </div>
            )}
            <p className='top-0 -translate-y-1/2'>
              {hour === 24 ? 0 : hour}:00
            </p>
          </div>
        );
      })}
    </div>
  );
};

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

const generateWeekdays = (locale: Locale) => {
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(startOfWeek(new Date(), { weekStartsOn: 0 }), i);
    daysOfWeek.push(format(date, 'EEEEEE', { locale }));
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
  CalendarYearView,
};
