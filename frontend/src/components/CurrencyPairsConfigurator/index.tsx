import { useState } from "react";
import { Currency, CurrencyPair } from "../../types";
import './styles.css';

interface CurrencyPairsConfiguratorProps {
  currencies: Currency[];
  monitoredPairs: CurrencyPair[];
  addMonitoredPair: (from: string, to: string) => Promise<void>;
}

export function CurrencyPairsConfigurator({
  currencies,
  monitoredPairs,
  addMonitoredPair,
}: CurrencyPairsConfiguratorProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pairExists = monitoredPairs.some(pair => pair.fromCode === from && pair.toCode === to);
    if (pairExists) {
      alert("This currency pair is already being monitored.");
      return;
    }
    await addMonitoredPair(from, to);
    setFrom("");
    setTo("");
  };

  return (
    <form className="pair-monitor" onSubmit={handleSubmit}>
      <h3>Monitor Currency Pair</h3>
      <div className="selects-container">
        <select
          className="currency-select"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
        >
          <option value="">Select base currency</option>
          {currencies.map(c => (
            <option key={c.code} value={c.code}>{c.code}</option>
          ))}
        </select>
        <select
          className="currency-select"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        >
          <option value="">Select target currency</option>
          {currencies.map(c => (
            <option key={c.code} value={c.code}>{c.code}</option>
          ))}
        </select>
        <button type="submit" className="monitor-button" disabled={!from || !to || from === to}>
          Start Monitoring
        </button>
      </div>
    </form>
  );
}