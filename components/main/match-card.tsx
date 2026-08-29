import { Match } from '@/types/match';
import { TeamLabel } from '@/utils/team-label';
import { generateMatchCalendarUrl } from '@/utils/google-calendar';
import { CalendarPlus } from 'lucide-react';

type MatchProps = {
  matches: Match[];
};

export default function MatchCard({ matches }: MatchProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6'>
      {matches.map((match) => {

        return (
          <div
            key={match.matchId}
            className='p-3 shadow-lg rounded-lg border relative'
          >
            <a
              href={generateMatchCalendarUrl(match)}
              target='_blank'
              rel='noopener noreferrer'
              className='absolute -top-2 -right-2 p-1.5 bg-background border rounded-full shadow-sm hover:bg-accent transition-colors'
              title='Googleカレンダーに追加'
            >
              <CalendarPlus className='size-3.5 text-muted-foreground hover:text-foreground' />
            </a>
            <div className='flex justify-between items-center'>
              <div className='flex-1 space-y-3'>
                <TeamLabel imageURL={match.homeEmblemUrl} name={match.home} />
                <TeamLabel imageURL={match.awayEmblemUrl} name={match.away} />
              </div>
              <div className='border-l-2 border-border h-10'></div>
              <div className='pl-4 flex flex-col items-center'>
                <div className='text-sm font-semibold mb-0.5'>
                  {match.matchDate}
                </div>
                {match.timeUndecided ? (
                  <span className='text-xs text-muted-foreground whitespace-nowrap'>
                    時刻未定
                  </span>
                ) : (
                  <time className='text-base tabular-nums font-medium'>
                    {match.matchTime}
                  </time>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
