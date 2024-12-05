import "./App.css";
import { CurrencyPairsManager } from "./components/CurrencyPairsManager";
import { RuleConfigurator } from "./components/RuleConfigurator";
import { RulesList } from "./components/RulesList";

function App() {
  return (
    <div className="container">
      <CurrencyPairsManager />
      <RuleConfigurator />
      <RulesList />
      {/* <RatesDisplay />  */}
    </div>
  );
}

export default App;
