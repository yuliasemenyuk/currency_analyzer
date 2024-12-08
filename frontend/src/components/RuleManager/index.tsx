import { useState, useEffect } from "react";
import { Currency, CurrencyPair, Rule, RuleSchema } from "../../types";
import { getCurrencies, getMonitoredPairs, startMonitoringPair, disableMonitoredPair, enableMonitoredPair } from "../../services/api";
import { CurrencyPairsConfigurator } from "../CurrencyPairsConfigurator";
import { MonitoredPairsList } from "../MonitoredPairsList";
import { RulesList } from "../RulesList";
import { RuleConfigurator } from "../RuleConfigurator";
import { createRule, getUsersRules, toggleRuleSubscription, removeRule } from "../../services/api";
import { toast } from 'react-toastify';
import {z} from 'zod';
import "./styles.css";

export function RulesManager() {
  const userId = '040dff52-8aa1-41a6-bc2f-d578170df96c';
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [monitoredPairs, setMonitoredPairs] = useState<CurrencyPair[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editedRule, setEditedRule] = useState<Partial<Rule>>({});

  const fetchCurrencies = async () => {
    try {
      const { data } = await getCurrencies();
      setCurrencies(data);
    } catch (err) {
      toast.error('Failed to fetch currencies');
      console.error(err);
    }
  };

  const fetchMonitoredPairs = async () => {
    try {
      const { data } = await getMonitoredPairs(userId);
      setMonitoredPairs(data);
    } catch (err) {
      toast.error('Failed to fetch monitored pairs');
      console.error(err);
    }
  };

  const fetchRules = async () => {
    try {
      const { data } = await getUsersRules(userId);
      const validatedRules = z.array(RuleSchema).parse(data);
      setRules(validatedRules);
    } catch (err) {
      toast.error('Failed to fetch rules');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCurrencies();
    fetchMonitoredPairs();
    fetchRules();
  }, [userId]);

  const addMonitoredPair = async (from: string, to: string) => {
    try {
      await startMonitoringPair({ userId, fromCode: from, toCode: to });
      await fetchMonitoredPairs();
      toast.success('Monitored pair added successfully');
    } catch (err) {
      toast.error('Failed to add monitored pair');
      console.error(err);
    }
  };

  const toggleMonitoredPair = async (pairId: string, isEnabled: boolean) => {
    try {
      if (isEnabled) {
        await disableMonitoredPair({ userId, pairId });
      } else {
        await enableMonitoredPair({ userId, pairId });
      }
      await fetchMonitoredPairs();
    } catch (err) {
      toast.error('Failed to update monitored pair status');
      console.error(err);
    }
  };

  const handleToggle = async (rule: Rule) => {
    try {
      await toggleRuleSubscription(rule.id, { isEnabled: !rule.isEnabled });
      await fetchRules();
    } catch (err) {
      toast.error('Failed to update rule subscription status');
      console.error(err);
    }
  };

  const handleEdit = (rule: Partial<Rule>) => {
    setEditMode({ ...editMode, [rule.id!]: true });
    setEditedRule(rule);
  };

  const handleSave = async (ruleId: string) => {
    if (editedRule && editedRule.percentage && editedRule.trendDirection && editedRule.currencyPair) {
      try {
        await createRule({
          userId,
          fromCurrencyCode: editedRule.currencyPair.fromCode,
          toCurrencyCode: editedRule.currencyPair.toCode,
          percentage: editedRule.percentage,
          trendDirection: editedRule.trendDirection,
        });
        await removeRule(ruleId, userId);
        await fetchRules();
        setEditMode({ ...editMode, [ruleId]: false });
        toast.success('Rule updated successfully');
      } catch (err) {
        const error = err as { response: { data: { message: string } } };
        toast.error(error.response.data.message || "Failed to add rule");
        console.error(err);
      }
    }
  };

  return (
    <div className="rules-manager">
      <CurrencyPairsConfigurator
        currencies={currencies}
        monitoredPairs={monitoredPairs}
        addMonitoredPair={addMonitoredPair}
      />
      <MonitoredPairsList
        monitoredPairs={monitoredPairs}
        toggleMonitoredPair={toggleMonitoredPair}
      />
      <RuleConfigurator
        monitoredPairs={monitoredPairs}
        onRuleAdded={fetchRules}
      />
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