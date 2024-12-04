import './App.css';
import { CurrencyPairsConfigurator } from './components/CurrencyPairsConfigurator';
import { RuleConfigurator } from './components/RuleConfigurator';

function App() {
  return (
    <div className="container">
      <CurrencyPairsConfigurator />
      <RuleConfigurator />
      {/* <RulesList />
      <RatesDisplay /> */}
    </div>
  );
}

export default App;
