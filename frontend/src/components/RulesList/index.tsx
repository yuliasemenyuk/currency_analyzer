import { Rule } from "../../types";
import "./styles.css";

interface RulesListProps {
  rules: Rule[];
  editMode: { [key: string]: boolean };
  editedRule: Partial<Rule>;
  onToggle: (rule: Rule) => Promise<void>;
  onEdit: (rule: Partial<Rule>) => void;
  onSave: (ruleId: string) => Promise<void>;
  onDelete: (ruleId: string) => Promise<void>;
  onCancel: (ruleId: string) => void;
}

export function RulesList({
  rules,
  editMode,
  editedRule,
  onToggle,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: RulesListProps) {
  return (
    <ul className="rules-list">
      {rules.map((rule) => (
        <li key={rule.id} className="rule-item">
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
                    onEdit({
                      ...editedRule,
                      percentage: Number(e.target.value),
                      id: rule.id,
                      currencyPair: rule.currencyPair,
                      trendDirection: rule.trendDirection,
                      isEnabled: rule.isEnabled,
                    })
                  }
                />
                <select
                  value={editedRule.trendDirection ?? rule.trendDirection}
                  onChange={(e) =>
                    onEdit({
                      ...editedRule,
                      trendDirection: e.target.value as 'increase' | 'decrease',
                      id: rule.id,
                      currencyPair: rule.currencyPair,
                      percentage: rule.percentage,
                      isEnabled: rule.isEnabled,
                    })
                  }
                >
                  <option value="increase">Increase</option>
                  <option value="decrease">Decrease</option>
                </select>
                <div className="rule-actions">
                  <button
                    className="save-button"
                    onClick={() => onSave(rule.id)}
                  >
                    Save
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => onCancel(rule.id)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{rule.percentage}%</span>
                <span>{rule.trendDirection}</span>
                <span
                  className={`rule-status ${
                    rule.isEnabled ? 'active' : 'inactive'
                  }`}
                >
                  {rule.isEnabled ? 'Active' : 'Disabled'}
                </span>
                <div className="rule-actions">
                  <button
                    className={
                      rule.isEnabled ? 'disable-button' : 'enable-button'
                    }
                    onClick={() => onToggle(rule)}
                  >
                    {rule.isEnabled ? 'Disable' : 'Enable'}
                  </button>
                  <button className="edit-button" onClick={() => onEdit(rule)}>
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => onDelete(rule.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}