import { useState, useEffect } from "react";
import { Currency, CurrencyPair } from "../../types";
import { getCurrencies, getMonitoredPairs, startMonitoringPair, deleteMonitoredPair } from "../../services/api";
import { CurrencyPairsConfigurator } from "../CurrencyPairsConfigurator";
import { MonitoredPairsList } from "../MonitoredPairsList";
import './styles.css';

export function CurrencyPairsManager() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [monitoredPairs, setMonitoredPairs] = useState<CurrencyPair[]>([]);

  useEffect(() => {
    getCurrencies().then(({ data }) => setCurrencies(data));
    getMonitoredPairs('040dff52-8aa1-41a6-bc2f-d578170df96c').then(({ data }) => setMonitoredPairs(data));
  }, []);

  const addMonitoredPair = async (from: string, to: string) => {
    try {
      await startMonitoringPair({ userId: '040dff52-8aa1-41a6-bc2f-d578170df96c', fromCode: from, toCode: to });
      const { data } = await getMonitoredPairs('040dff52-8aa1-41a6-bc2f-d578170df96c');
      setMonitoredPairs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const removeMonitoredPair = async (pairId: string) => {
    try {
      await deleteMonitoredPair(pairId);
      const { data } = await getMonitoredPairs('040dff52-8aa1-41a6-bc2f-d578170df96c');
      setMonitoredPairs(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <CurrencyPairsConfigurator
        currencies={currencies}
        monitoredPairs={monitoredPairs}
        addMonitoredPair={addMonitoredPair}
      />
      <MonitoredPairsList
        monitoredPairs={monitoredPairs}
        removeMonitoredPair={removeMonitoredPair}
      />
    </div>
  );
}