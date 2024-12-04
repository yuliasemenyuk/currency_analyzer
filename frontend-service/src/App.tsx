import './App.css';
import { CurrencyPairsConfigurator } from './components/CurrencyPairsConfigurator';
import { MonitoredPairsList } from './components/MonitoredPairsList';
import { RuleConfigurator } from './components/RuleConfigurator';
import { RulesList } from './components/RulesList';

function App() {
  return (
    <div className="container">
      <CurrencyPairsConfigurator />
      <MonitoredPairsList />
      <RuleConfigurator />
      <RulesList />
      {/* <RatesDisplay />  */}
    </div>
  );
}

export default App;
