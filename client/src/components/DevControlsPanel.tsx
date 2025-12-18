import { useState } from 'react';
import { triggerEvent } from '../services/api';
import { useStore } from '../store/useStore';

export default function DevControlsPanel() {
  const { setMockApiPayloads } = useStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleEvent = async (event: string, active?: boolean) => {
    try {
      setLoading(event);
      const result = await triggerEvent(event, active);
      console.log('Event triggered:', result);

      setMockApiPayloads({
        lastEvent: event,
        timestamp: new Date().toISOString(),
        result,
      });
    } catch (error) {
      console.error('Error triggering event:', error);
      alert('Failed to trigger event');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Dev Controls</h2>

      <div className="space-y-3">
        <button
          onClick={() => handleEvent('startStorm')}
          disabled={loading !== null}
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white font-medium disabled:opacity-50"
        >
          {loading === 'startStorm' ? 'Triggering...' : 'Start Storm'}
        </button>

        <button
          onClick={() => handleEvent('crowdSpike')}
          disabled={loading !== null}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium disabled:opacity-50"
        >
          {loading === 'crowdSpike' ? 'Triggering...' : 'Crowd Spike'}
        </button>

        <button
          onClick={() => handleEvent('toggleConstruction', true)}
          disabled={loading !== null}
          className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-medium disabled:opacity-50"
        >
          {loading === 'toggleConstruction' ? 'Toggling...' : 'Toggle Construction'}
        </button>
      </div>
    </div>
  );
}
