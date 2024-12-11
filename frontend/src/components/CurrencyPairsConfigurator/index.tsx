import { useState, useMemo } from "react";
import { Currency, CurrencyPair } from "../../types";
import { toast } from 'react-toastify';
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

  const sortedCurrencies = useMemo(() => {
    return currencies.sort((a, b) => a.code.localeCompare(b.code));
  }, [currencies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pairExists = monitoredPairs.some(pair => pair.fromCode === from && pair.toCode === to);
    if (pairExists) {
      toast.info("This currency pair is already being monitored.");
      return;
    }
    try {
      await addMonitoredPair(from, to);
      setFrom("");
      setTo("");
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message || "Failed to add currency pair.");
    }
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
          {sortedCurrencies.map(c => (
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
          {sortedCurrencies.map(c => (
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