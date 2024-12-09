import { CurrencyPair } from "../../types";
import "./styles.css";

interface MonitoredPairsListProps {
  monitoredPairs: CurrencyPair[];
  toggleMonitoredPair: (pairId: string, isEnabled: boolean) => Promise<void>;
  deleteMonitoredPair: (pairId: string) => Promise<void>;
}

export function MonitoredPairsList({
  monitoredPairs,
  toggleMonitoredPair,
  deleteMonitoredPair,
}: MonitoredPairsListProps) {
  const handleToggle = async (pairId: string, isEnabled: boolean) => {
    await toggleMonitoredPair(pairId, isEnabled);
  };

  const handleDelete = async (pairId: string) => {
    await deleteMonitoredPair(pairId);
  };

  // const sortedPairs = monitoredPairs.sort((a, b) => a.index - b.index);

  return (
    <div className="monitored-pairs">
      <h3>Monitored Currency Pairs</h3>
      <ul className="pairs-list">
        {monitoredPairs.map((pair) => (
          <li key={pair.id} className="pair-item">
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
              className={`toggle-button ${
                pair.isEnabled ? "enabled" : "disabled"
              }`}
              onClick={() => handleToggle(pair.id, pair.isEnabled)}
            >
              {pair.isEnabled ? "Disable" : "Enable"}
            </button>
            <button
              className="delete-button"
              onClick={() => handleDelete(pair.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
