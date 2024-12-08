import { CurrencyPair } from "../../types";
import './styles.css';

interface MonitoredPairsListProps {
  monitoredPairs: CurrencyPair[];
  toggleMonitoredPair: (pairId: string, isEnabled: boolean) => Promise<void>;
}

export function MonitoredPairsList({
  monitoredPairs,
  toggleMonitoredPair,
}: MonitoredPairsListProps) {
  const handleToggle = async (pairId: string, isEnabled: boolean) => {
    console.log(pairId, isEnabled);
    await toggleMonitoredPair(pairId, isEnabled);
  };

  return (
    <div className="monitored-pairs">
      <h3>Monitored Currency Pairs</h3>
      <div className="pairs-list">
        {monitoredPairs.map((pair) => (
          <div key={pair.id} className="pair-item">
            <div className="pair-info">
              <span className="pair-codes">
                {pair.fromCode}/{pair.toCode}
              </span>
              <span
                className={`status ${pair.isEnabled ? "active" : "inactive"}`}
              >
                {pair.isEnabled ? "Monitoring" : "Paused"}
              </span>
            </div>
            <button
              className={`toggle-button ${pair.isEnabled ? "enabled" : "disabled"}`}
              onClick={() => handleToggle(pair.id, pair.isEnabled)}
            >
              {pair.isEnabled ? "Disable" : "Enable"}
            </button>
          </div>
        ))}
      </div>
      {monitoredPairs.length === 0 && (
        <div className="no-pairs">No monitored pairs yet</div>
      )}
    </div>
  );
}