import { useEffect, useState } from "react";
import { Rule, RuleSchema } from "../../types";
import { getUsersRules, createRule, unsubscribeRule } from "../../services/api";
import { z } from "zod";
import { RulesList } from "../RulesList";
import { RuleConfigurator } from "../RuleConfigurator";
import "./styles.css";

export function RulesManager() {
  const userId = '040dff52-8aa1-41a6-bc2f-d578170df96c';
  const [rules, setRules] = useState<Rule[]>([]);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editedRule, setEditedRule] = useState<Partial<Rule>>({});

  const fetchRules = async () => {
    const { data } = await getUsersRules(userId);
    const validatedRules = z.array(RuleSchema).parse(data);
    setRules(validatedRules);
  };

  useEffect(() => {
    fetchRules();
  }, [userId]);

  const handleToggle = async (rule: Rule) => {
    if (rule.isEnabled) {
      await unsubscribeRule(rule.id, { isEnabled: false });
    } else {
      await createRule({
        userId,
        fromCurrencyCode: rule.currencyPair.fromCode,
        toCurrencyCode: rule.currencyPair.toCode,
        percentage: rule.percentage,
        trendDirection: rule.trendDirection,
      });
    }
    await fetchRules();
  };

  const handleEdit = (rule: Partial<Rule>) => {
    setEditMode({ ...editMode, [rule.id!]: true });
    setEditedRule(rule);
  };

  const handleSave = async (ruleId: string) => {
    if (editedRule && editedRule.percentage && editedRule.trendDirection && editedRule.currencyPair) {
      await createRule({
        userId,
        fromCurrencyCode: editedRule.currencyPair.fromCode,
        toCurrencyCode: editedRule.currencyPair.toCode,
        percentage: editedRule.percentage,
        trendDirection: editedRule.trendDirection,
      });
      await fetchRules();
      setEditMode({ ...editMode, [ruleId]: false });
    }
  };

  return (
    <div className="rules-manager">
      <RuleConfigurator onRuleAdded={fetchRules} />
      <RulesList
        rules={rules}
        editMode={editMode}
        editedRule={editedRule}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onSave={handleSave}
      />
    </div>
  );
}