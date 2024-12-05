import { useEffect, useState } from "react";
import { Rule, RuleSchema } from "../../types";
import { getUsersRules, unsubscribeRule, updateRule } from "../../services/api";
import { z } from "zod";
import "./styles.css";

export function RulesList() {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    getUsersRules('040dff52-8aa1-41a6-bc2f-d578170df96c').then(({ data }) => {
      const validatedRules = z.array(RuleSchema).parse(data);
      setRules(validatedRules);
    });
  }, []);

  const handleToggle = async (id: string, isEnabled: boolean) => {
    await unsubscribeRule(id, { isEnabled: !isEnabled });
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, isEnabled: !isEnabled } : rule
      )
    );
  };

  return (
    <div className="rules-list">
      {rules.map((rule) => (
        <div key={rule.id} className="rule-item">
          <div className="rule-info">
            <span>
              {rule.currencyPair.fromCode} → {rule.currencyPair.toCode}
            </span>
            <span>
              {rule.percentage}% {rule.trendDirection}
            </span>
          </div>
          <div className="rule-actions">
            <button
              className={`toggle-button ${
                rule.isEnabled ? "enabled" : "disabled"
              }`}
              onClick={() => handleToggle(rule.id, rule.isEnabled)}
            >
              {rule.isEnabled ? "Disable" : "Enable"}
            </button>
            <button className="edit-button">Edit</button>
          </div>
        </div>
      ))}
    </div>
  );
}
