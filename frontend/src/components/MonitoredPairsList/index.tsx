import { CurrencyPair } from "../../types";
import './styles.css';

interface MonitoredPairsListProps {
  monitoredPairs: CurrencyPair[];
  removeMonitoredPair: (pairId: string) => Promise<void>;
}

export function MonitoredPairsList({
  monitoredPairs,
  removeMonitoredPair,
}: MonitoredPairsListProps) {
  console.log(monitoredPairs, 'monitoredPairs');
  const handleDelete = async (pairId: string) => {
    await removeMonitoredPair(pairId);
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
              className="delete-button"
              onClick={() => handleDelete(pair.id)}
            >
              Delete
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