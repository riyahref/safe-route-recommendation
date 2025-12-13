import { useState } from 'react';
import { triggerEvent } from '../services/api';
import { useStore } from '../store/useStore';

export default function DevControlsPanel() {
  const { routes, mockApiPayloads, setMockApiPayloads } = useStore();
  const [selectedSegment, setSelectedSegment] = useState('s1');
  const [loading, setLoading] = useState<string | null>(null);

  const handleEvent = async (event: string, segmentId?: string) => {
    try {
      setLoading(event);
      const result = await triggerEvent(event, segmentId);
      console.log('Event triggered:', result);

      // Update mock API payloads display
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

  // Get unique segments from routes
  const availableSegments = Array.from(
    new Set(routes.flatMap((r) => r.segments))
  );

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

        <div>
          <label className="block text-sm text-gray-400 mb-1">Segment for Construction</label>
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm mb-2"
          >
            {availableSegments.length > 0 ? (
              availableSegments.map((seg) => (
                <option key={seg} value={seg}>
                  {seg}
                </option>
              ))
            ) : (
              <option value="s1">s1</option>
            )}
          </select>
          <button
            onClick={() => handleEvent('toggleConstruction', selectedSegment)}
            disabled={loading !== null}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-medium disabled:opacity-50"
          >
            {loading === 'toggleConstruction' ? 'Toggling...' : 'Toggle Construction'}
          </button>
        </div>

        {mockApiPayloads && (
          <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
            <h3 className="text-sm font-semibold mb-2">Last Event Payload</h3>
            <pre className="text-xs text-gray-300 overflow-auto max-h-40">
              {JSON.stringify(mockApiPayloads, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}



