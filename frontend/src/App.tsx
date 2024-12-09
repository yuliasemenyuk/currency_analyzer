import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./App.css";
import { RulesManager } from "./components/RuleManager";
import {AuthForm} from "./components/AuthForm";

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = Cookies.get("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleAuthSuccess = (token: string) => {
    setToken(token);
  };

  return (
    <div className="container">
      {token ? (
        <RulesManager />
      ) : (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;
