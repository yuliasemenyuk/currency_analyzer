import "./App.css";
import { CurrencyPairsManager } from "./components/CurrencyPairsManager";
import { RulesManager } from "./components/RuleManager";

function App() {
  return (
    <div className="container">
      <CurrencyPairsManager />
      <RulesManager />
      {/* <RatesDisplay />  */}
    </div>
  );
}

export default App;
