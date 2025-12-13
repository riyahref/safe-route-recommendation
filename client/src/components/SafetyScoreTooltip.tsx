import { useState } from 'react';

interface SafetyScoreTooltipProps {
  score: number;
  breakdown: {
    base_score: number;
    weather_penalty: number;
    crowd_penalty: number;
    darkness_penalty: number;
    construction_penalty: number;
  };
}

export default function SafetyScoreTooltip({ score, breakdown }: SafetyScoreTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-blue-400 hover:text-blue-300 underline text-xs"
      >
        Explain
      </button>
      {isOpen && (
        <div className="absolute z-50 w-80 p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-sm left-0 top-6">
          <div className="font-semibold mb-2">Safety Score Formula</div>
          <div className="text-xs text-gray-300 mb-3 font-mono bg-gray-900 p-2 rounded">
            safety_score = base_score - weather_penalty + crowd_bonus - darkness_penalty - construction_penalty
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Base Score:</span>
              <span>{breakdown.base_score.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Weather Penalty:</span>
              <span className="text-red-400">-{breakdown.weather_penalty.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Crowd:</span>
              <span className={breakdown.crowd_penalty >= 0 ? 'text-green-400' : 'text-red-400'}>
                {breakdown.crowd_penalty >= 0 ? '+' : ''}{breakdown.crowd_penalty.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Darkness Penalty:</span>
              <span className="text-red-400">-{breakdown.darkness_penalty.toFixed(1)}</span>
            </div>
            {breakdown.construction_penalty > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Construction:</span>
                <span className="text-red-400">-{breakdown.construction_penalty.toFixed(1)}</span>
              </div>
            )}
            <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between font-semibold">
              <span>Final Score:</span>
              <span>{score.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



