import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./App.css";
import { RulesManager } from "./components/RuleManager";
import {AuthForm} from "./components/AuthForm";
import {Loader} from "./components/Loader";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get("token");
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (token: string) => {
    setToken(token);
  };

  if (loading) {
    return <Loader />;
  }


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
