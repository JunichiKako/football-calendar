
import { saveStreamingData } from '@/actions/save-striming';
import { Match } from '@/types/match';
import { STREAMING_OPTIONS } from '@/types/streaming';


export default function StreamingManager({ 
  matches,
  initialSelections
}: { 
  matches: Match[];
  initialSelections: Record<number, string[]>;
}) {
  return (
    <form action={saveStreamingData}>
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {matches.length}試合の配信設定
        </div>
        
        {matches.map(match => (
          <div key={match.matchId} className="p-4 border rounded-lg">
            <div className="mb-3">
              <p className="font-semibold">
                {match.home} vs {match.away}
              </p>
              <p className="text-sm text-muted-foreground">
                {match.matchDate} {match.matchTime} • {match.leagueName}
              </p>
            </div>
            
            <div className="flex gap-4">
              {STREAMING_OPTIONS.map(option => (
                <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`match_${match.matchId}`}
                    value={option.id}
                    defaultChecked={initialSelections[match.matchId]?.includes(option.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        <button 
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded-md p-3 font-medium"
        >
          設定を保存
        </button>
      </div>
    </form>
  );
}