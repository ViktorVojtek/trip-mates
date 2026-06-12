import { calculateMatchScore } from '../utils/helpers';

interface MatchScoreProps {
  userPrefs: string | null;
  tripPrefs: string | null;
}

export default function MatchScore({ userPrefs, tripPrefs }: MatchScoreProps) {
  if (!userPrefs || !tripPrefs) return null;

  const score = calculateMatchScore(userPrefs, tripPrefs);

  const colorClass =
    score >= 70
      ? 'text-green-700 bg-green-50 border-green-200'
      : score >= 40
        ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
        : 'text-red-700 bg-red-50 border-red-200';

  const barColor = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  const label = score >= 70 ? 'Great match' : score >= 40 ? 'Partial match' : 'Low match';

  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm ${colorClass}`}>
      <div>
        <span className="font-medium">{label}</span>
        <span className="text-xs ml-1 opacity-75">({score}%)</span>
      </div>
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
