import { Match } from '@/types/match';
import { TeamLabel } from '@/utils/team-label';
import { generateMatchCalendarUrl } from '@/utils/google-calendar';
import { CalendarPlus } from 'lucide-react';
import {
  STREAMING_LABELS,
  STREAMING_COLORS,
  getStreamingServices,
  isDifferentFromDefault
} from '@/utils/streaming';

type MatchProps = {
  matches: Match[];
};

export default function MatchCard({ matches }: MatchProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6'>
      {matches.map((match) => {
        const services = getStreamingServices(match.matchId, match.leagueName);
        const showBadges = isDifferentFromDefault(match.matchId, match.leagueName);

        return (
          <div
            key={match.matchId}
            className='p-3 shadow-lg rounded-lg border'
          >
            <div className='flex justify-between items-center mb-1'>
              <div className='flex gap-1'>
                {showBadges && services.map((service) => (
                  <span
                    key={service}
                    className={`text-[10px] px-1.5 py-0.5 rounded ${STREAMING_COLORS[service]}`}
                  >
                    {STREAMING_LABELS[service]}
                  </span>
                ))}
              </div>
              <a
                href={generateMatchCalendarUrl(match)}
                target='_blank'
                rel='noopener noreferrer'
                className='p-1 hover:bg-accent rounded transition-colors'
                title='Googleカレンダーに追加'
              >
                <CalendarPlus className='size-3.5 text-muted-foreground hover:text-foreground' />
              </a>
            </div>
            <div className='flex justify-between items-center'>
              <div className='flex-1 space-y-3'>
                <TeamLabel imageURL={match.homeEmblemUrl} name={match.home} />
                <TeamLabel imageURL={match.awayEmblemUrl} name={match.away} />
              </div>
              <div className='border-l-2 border-border h-10'></div>
              <div className='flex justify-center pl-4 flex-col items-center'>
                <div className='text-sm font-semibold mb-0.5'>
                  {match.matchDate}
                </div>
                <time className='text-base tabular-nums font-medium'>
                  {match.matchTime}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
