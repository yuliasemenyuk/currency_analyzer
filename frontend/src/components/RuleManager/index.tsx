import { useState, useEffect } from "react";
import { Currency, CurrencyPair, Rule, RuleSchema } from "../../types";
import {
  getCurrencies,
  getMonitoredPairs,
  startMonitoringPair,
  disableMonitoredPair,
  enableMonitoredPair,
  stopMonitoringPair,
} from "../../services/api";
import { CurrencyPairsConfigurator } from "../CurrencyPairsConfigurator";
import { MonitoredPairsList } from "../MonitoredPairsList";
import { RulesList } from "../RulesList";
import { RuleConfigurator } from "../RuleConfigurator";
import { ArchivedRulesList } from "../ArchivedRulesList";
import {
  createRule,
  getUsersRules,
  toggleRuleSubscription,
  removeRule,
  getArchivedRules,
  restoreRule,
} from "../../services/api";
import { toast } from "react-toastify";
import { z } from "zod";
import "./styles.css";

export function RulesManager() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [monitoredPairs, setMonitoredPairs] = useState<CurrencyPair[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [archivedRules, setArchivedRules] = useState<Rule[]>([]);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editedRule, setEditedRule] = useState<Partial<Rule>>({});
  const [showArchived, setShowArchived] = useState(false);

  const fetchCurrencies = async () => {
    try {
      const { data } = await getCurrencies();
      setCurrencies(data);
    } catch (err) {
      toast.error("Failed to fetch currencies");
    }
  };

  const fetchMonitoredPairs = async () => {
    try {
      const { data } = await getMonitoredPairs();
      setMonitoredPairs(data);
    } catch (err) {
      toast.error("Failed to fetch monitored pairs");
    }
  };

  const fetchRules = async () => {
    try {
      const { data } = await getUsersRules();
      const validatedRules = z.array(RuleSchema).parse(data);
      setRules(validatedRules);
    } catch (err) {
      toast.error("Failed to fetch rules");
    }
  };

  const fetchArchivedRules = async () => {
    try {
      const { data } = await getArchivedRules();
      const validatedRules = z.array(RuleSchema).parse(data);
      setArchivedRules(validatedRules);
    } catch (err) {
      toast.error("Failed to fetch archived rules");
    }
  };

  useEffect(() => {
    fetchCurrencies();
    fetchMonitoredPairs();
    fetchRules();
    fetchArchivedRules();
  }, []);

  const addMonitoredPair = async (from: string, to: string) => {
    try {
      await startMonitoringPair({ fromCode: from, toCode: to });
      await fetchMonitoredPairs();
      toast.success("Monitored pair added successfully");
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message || "Failed to add monitored pair");
    }
  };

  const toggleMonitoredPair = async (pairId: string, isEnabled: boolean) => {
    try {
      if (isEnabled) {
        await disableMonitoredPair({ pairId });
      } else {
        await enableMonitoredPair({ pairId });
      }
      await fetchMonitoredPairs();
    } catch (err) {
      toast.error("Failed to update monitored pair status");
    }
  };

  const handleRuleToggle = async (rule: Rule) => {
    try {
      await toggleRuleSubscription(rule.id, { isEnabled: !rule.isEnabled });
      await fetchRules();
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message || "Failed to update rule subscription status");
    }
  };

  const handleEdit = (rule: Partial<Rule>) => {
    setEditMode({ ...editMode, [rule.id!]: true });
    setEditedRule(rule);
  };

  const handleSave = async (ruleId: string) => {
    if (
      editedRule &&
      editedRule.percentage &&
      editedRule.trendDirection &&
      editedRule.currencyPair
    ) {
      try {
        await createRule({
          fromCurrencyCode: editedRule.currencyPair.fromCode,
          toCurrencyCode: editedRule.currencyPair.toCode,
          percentage: editedRule.percentage,
          trendDirection: editedRule.trendDirection,
        });
        await removeRule(ruleId);
        await fetchRules();
        setEditMode({ ...editMode, [ruleId]: false });
        toast.success("Rule updated successfully");
      } catch (err) {
        const error = err as { response: { data: { message: string } } };
        toast.error(error.response.data.message || "Failed to add rule");
      }
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await removeRule(ruleId);
      await fetchRules();
      await fetchArchivedRules();
      toast.success("Rule deleted successfully");
    } catch (err) {
      toast.error("Failed to delete rule");
    }
  };

  const handleRestoreRule = async (ruleId: string) => {
    try {
      await restoreRule(ruleId);
      await fetchRules();
      await fetchArchivedRules();
      toast.success("Rule restored successfully");
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message || "Failed to restore rule");
    }
  };

  const deleteMonitoredPair = async (pairId: string) => {
    try {
      await stopMonitoringPair(pairId);
      await fetchMonitoredPairs();
      await fetchRules();
      await fetchArchivedRules();
    } catch (err) {
      toast.error("Failed to delete monitored pair");
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
            deleteMonitoredPair={deleteMonitoredPair}
          />
          <RuleConfigurator
            monitoredPairs={monitoredPairs}
            onRuleAdded={() => {fetchRules(); fetchArchivedRules();}}
          />
          <RulesList
            rules={rules}
            editMode={editMode}
            editedRule={editedRule}
            onToggle={handleRuleToggle}
            onEdit={handleEdit}
            onSave={handleSave}
            onDelete={handleDeleteRule}
            onCancel={(ruleId) => setEditMode({ ...editMode, [ruleId]: false })}
          />
          <div
            className="toggle-archived"
            onClick={() => setShowArchived(!showArchived)}
          >
            <span>Archived Rules</span>
            <span>{showArchived ? "▲" : "▼"}</span>
          </div>
          {showArchived && (
            <ArchivedRulesList
              archivedRules={archivedRules}
              onRestore={handleRestoreRule}
            />
          )}
          {showArchived && archivedRules.length === 0 && (
            <div className="no-archived-rules">No archived rules</div>
          )}
    </div>
  );
}
