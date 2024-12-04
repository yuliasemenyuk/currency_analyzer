import { useState, useEffect } from "react";
import { Currency } from "../../types";
import { getCurrencies, createCurreciesPair } from "../../services/api";
import './styles.css';

export function CurrencyPairsConfigurator() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    getCurrencies().then(({ data }) => setCurrencies(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCurreciesPair({ fromCode: from, toCode: to });
      setFrom("");
      setTo("");
    } catch (err) {
      console.error(err);
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
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>

        <select
          className="currency-select"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
        >
          <option value="">Select target currency</option>
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="monitor-button"
          disabled={!from || !to || from === to}
        >
          Start Monitoring
        </button>
      </div>
    </form>
  );
}
