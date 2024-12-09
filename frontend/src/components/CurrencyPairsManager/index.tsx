// import { useState, useEffect } from "react";
// import { Currency, CurrencyPair } from "../../types";
// import { getCurrencies, getMonitoredPairs, startMonitoringPair, disableMonitoredPair, enableMonitoredPair, stopMonitoringPair } from "../../services/api";
// import { CurrencyPairsConfigurator } from "../CurrencyPairsConfigurator";
// import { MonitoredPairsList } from "../MonitoredPairsList";
// import {toast} from 'react-toastify';
// import './styles.css';

// export function CurrencyPairsManager() {
//   const [currencies, setCurrencies] = useState<Currency[]>([]);
//   const [monitoredPairs, setMonitoredPairs] = useState<CurrencyPair[]>([]);

//   const fetchCurrencies = async () => {
//     try {
//       const { data } = await getCurrencies();
//       setCurrencies(data);
//     } catch (err) {
//       toast.error('Failed to fetch currencies');
//       console.error(err);
//     }
//   };

//   const fetchMonitoredPairs = async () => {
//     try {
//       const { data } = await getMonitoredPairs();
//       setMonitoredPairs(data);
//     } catch (err) {
//       toast.error('Failed to fetch monitored pairs');
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     // getCurrencies().then(({ data }) => setCurrencies(data));
//     // getMonitoredPairs().then(({ data }) => setMonitoredPairs(data));
//     fetchCurrencies();
//     fetchMonitoredPairs();
//   }, []);

//   const addMonitoredPair = async (from: string, to: string) => {
//     // try {
//       await startMonitoringPair({ fromCode: from, toCode: to });
//       await fetchMonitoredPairs();
//       // const { data } = await getMonitoredPairs();
//       // setMonitoredPairs(data);
//     // } catch (err) {
//     //   toast.error('Failed to add monitored pair');
//     //   console.error(err);
//     // }
//   };

//   const toggleMonitoredPair = async (pairId: string, isEnabled: boolean) => {
//     // try {
//       if (isEnabled) {
//         await disableMonitoredPair({ pairId });
//       } else {
//         await enableMonitoredPair({ pairId });
//       }
//       // const { data } =
//        await fetchMonitoredPairs();
//       // setMonitoredPairs(data);
//     // } catch (err) {
//     //   toast.error('Failed to change status of monitored pair');
//     //   console.error(err);
//     // }
//   };

//   const deleteMonitoredPair = async (pairId: string) => {
//     // try {
//       await stopMonitoringPair(pairId);
//       await fetchMonitoredPairs();
//       // const { data } = await getMonitoredPairs();
//       // const pairsWithIndex = data.map((pair, index) => ({ ...pair, index }));
//       // setMonitoredPairs(pairsWithIndex);
//     // } catch (err) {
//     //   toast.error('Failed to delete monitored pair');
//     //   console.error(err);
//     // }
//   };


//   return (
//     <div>
//       <CurrencyPairsConfigurator
//         currencies={currencies}
//         monitoredPairs={monitoredPairs}
//         addMonitoredPair={addMonitoredPair}
//       />
//       <MonitoredPairsList
//         monitoredPairs={monitoredPairs}
//         toggleMonitoredPair={toggleMonitoredPair}
//         deleteMonitoredPair={deleteMonitoredPair}
//       />
//     </div>
//   );
// }

export const CurrencyPairsManager = null;