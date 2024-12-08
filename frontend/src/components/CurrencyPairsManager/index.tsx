import { useState, useEffect } from "react";
import { Currency, CurrencyPair } from "../../types";
import { getCurrencies, getMonitoredPairs, startMonitoringPair, disableMonitoredPair, enableMonitoredPair } from "../../services/api";
import { CurrencyPairsConfigurator } from "../CurrencyPairsConfigurator";
import { MonitoredPairsList } from "../MonitoredPairsList";
import {toast} from 'react-toastify';
import './styles.css';

export function CurrencyPairsManager() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [monitoredPairs, setMonitoredPairs] = useState<CurrencyPair[]>([]);

  useEffect(() => {
    getCurrencies().then(({ data }) => setCurrencies(data));
    getMonitoredPairs().then(({ data }) => setMonitoredPairs(data));
  }, []);

  const addMonitoredPair = async (from: string, to: string) => {
    try {
      await startMonitoringPair({ fromCode: from, toCode: to });
      const { data } = await getMonitoredPairs();
      setMonitoredPairs(data);
    } catch (err) {
      toast.error('Failed to add monitored pair');
      console.error(err);
    }
  };

  const toggleMonitoredPair = async (pairId: string, isEnabled: boolean) => {
    console.log(isEnabled, "isEnabled");
    try {
      if (isEnabled) {
        await disableMonitoredPair({ pairId });
      } else {
        await enableMonitoredPair({ pairId });
      }
      const { data } = await getMonitoredPairs();
      setMonitoredPairs(data);
    } catch (err) {
      toast.error('Failed to change status of monitored pair');
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
        toggleMonitoredPair={toggleMonitoredPair}
      />
    </div>
  );
}