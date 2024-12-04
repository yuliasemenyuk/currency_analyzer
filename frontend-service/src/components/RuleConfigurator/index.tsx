import { useEffect, useState } from "react";
import { Currency } from "../../types";
import { createRule, getCurrencies } from "../../services/api";
import "./styles.css";

export function RuleConfigurator() {
  const [from, setFrom] = useState<Currency["code"]>("");
  const [to, setTo] = useState<Currency["code"]>("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [percentage, setPercentage] = useState<string>("");
  const [trendDirection, setTrendDirection] = useState<"increase" | "decrease">(
    "increase"
  );

  useEffect(() => {
    getCurrencies().then(({ data }) => setCurrencies(data));
  }, []);

  const isDisabled = !from || !to || !percentage;

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (Number(value) >= 0 && Number(value) <= 100) {
      setPercentage(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ from, to, percentage: Number(percentage) });
    try {
      await createRule({
        fromCurrencyCode: from,
        toCurrencyCode: to,
        percentage: Number(percentage),
        trendDirection: trendDirection,
        userId: "120c1bcc-a42d-4672-80b9-1d607248ff36",
      });
      setFrom("");
      setTo("");
      setPercentage("");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form className="currency-selector" onSubmit={handleSubmit}>
      <div className="selects-container">
        <select
          className="currency-select"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        >
          <option value="">From</option>
          {currencies.map(({ code, name }) => (
            <option key={code} value={code}>
              {code} - {name}
            </option>
          ))}
        </select>

        <select
          className="currency-select"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          <option value="">To</option>
          {currencies.map(({ code, name }) => (
            <option key={code} value={code}>
              {code} - {name}
            </option>
          ))}
        </select>
        <select
          className="trend-select"
          value={trendDirection}
          onChange={(e) =>
            setTrendDirection(e.target.value as "increase" | "decrease")
          }
        >
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
        </select>
        <input
          type="number"
          className="percentage-input"
          placeholder="Change %"
          min="0"
          max="100"
          value={percentage}
          onChange={handlePercentageChange}
        />
      </div>
      <button type="submit" className="save-button" disabled={isDisabled}>
        Save Rule
      </button>
    </form>
  );
}
