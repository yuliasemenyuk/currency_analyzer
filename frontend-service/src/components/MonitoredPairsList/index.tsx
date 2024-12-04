import { useState, useEffect } from "react";
import { deleteMonitoredPair, getMonitoredPairs, updateMonitoredPair } from "../../services/api";
import { CurrencyPair } from "../../types";
import "./styles.css";

export function MonitoredPairsList() {
  const [pairs, setPairs] = useState<CurrencyPair[]>([]);

  useEffect(() => {
    getMonitoredPairs("120c1bcc-a42d-4672-80b9-1d607248ff36").then(({ data }) => {
        console.log(data, 'data');
        setPairs(data)});
  }, []);

  const handleToggleMonitoring = async (pairId: string, isEnabled: boolean) => {
    try {
      await updateMonitoredPair(pairId, { isEnabled: !isEnabled });
      setPairs(
        pairs.map((pair) =>
          pair.id === pairId ? { ...pair, isEnabled: !isEnabled } : pair
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (pairId: string) => {
    try {
      await deleteMonitoredPair(pairId);
      setPairs(pairs.filter((pair) => pair.id !== pairId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="monitored-pairs">
      <h3>Monitored Currency Pairs</h3>
      <div className="pairs-list">
        {pairs.map((pair) => (
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
              className={`toggle-button ${
                pair.isEnabled ? "enabled" : "disabled"
              }`}
              onClick={() => handleToggleMonitoring(pair.id, pair.isEnabled)}
            >
              {pair.isEnabled ? "Pause" : "Resume"}
            </button>
            <button
              className="delete-button"
              onClick={() => handleDelete(pair.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      {pairs.length === 0 && (
        <div className="no-pairs">No monitored pairs yet</div>
      )}
    </div>
  );
}
