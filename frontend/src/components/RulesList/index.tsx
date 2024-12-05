import { Rule } from "../../types";
import "./styles.css";

interface RulesListProps {
  rules: Rule[];
  editMode: { [key: string]: boolean };
  editedRule: Partial<Rule>;
  onToggle: (rule: Rule) => Promise<void>;
  onEdit: (rule: Partial<Rule>) => void;
  onSave: (ruleId: string) => Promise<void>;
}

export function RulesList({
  rules,
  editMode,
  editedRule,
  onToggle,
  onEdit,
  onSave,
}: RulesListProps) {
  return (
    <div className="rules-list">
      {rules.map((rule) => (
        <div key={rule.id} className="rule-item">
          <div className="rule-info">
            <span>
              {rule.currencyPair.fromCode} → {rule.currencyPair.toCode}
            </span>
            {editMode[rule.id] ? (
              <>
                <input
                  type="number"
                  value={editedRule.percentage ?? rule.percentage}
                  onChange={(e) =>
                    onEdit({ ...editedRule, percentage: Number(e.target.value), id: rule.id, currencyPair: rule.currencyPair, trendDirection: rule.trendDirection, isEnabled: rule.isEnabled })
                  }
                />
                <select
                  value={editedRule.trendDirection ?? rule.trendDirection}
                  onChange={(e) =>
                    onEdit({ ...editedRule, trendDirection: e.target.value as 'increase' | 'decrease', id: rule.id, currencyPair: rule.currencyPair, percentage: rule.percentage, isEnabled: rule.isEnabled })
                  }
                >
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
              </>
            ) : (
              <span>
                {rule.percentage}% {rule.trendDirection}
              </span>
            )}
          </div>
          <div className="rule-actions">
            <button
              className={`toggle-button ${
                rule.isEnabled ? "enabled" : "disabled"
              }`}
              onClick={() => onToggle(rule)}
            >
              {rule.isEnabled ? "Disable" : "Enable"}
            </button>
            {editMode[rule.id] ? (
              <button className="save-button" onClick={() => onSave(rule.id)}>Save</button>
            ) : (
              <button className="edit-button" onClick={() => onEdit(rule)}>Edit</button>
            )}
          </div>
        </div>
      ))}
      {rules.length === 0 && (
        <div className="no-rules">No rules yet</div>
      )}
    </div>
  );
}