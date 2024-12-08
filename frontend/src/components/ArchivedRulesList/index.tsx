import React from 'react';
import { Rule } from '../../types';
import './styles.css';

interface ArchivedRulesListProps {
  archivedRules: Rule[];
  onRestore: (ruleId: string) => void;
}

export function ArchivedRulesList({ archivedRules, onRestore }: ArchivedRulesListProps) {
  return (
    <div className="archived-rules-list">
      {archivedRules.map((rule) => (
        <div key={rule.id} className="rule-item">
          <span>{rule.currencyPair.fromCode}/{rule.currencyPair.toCode}</span>
          <span>{rule.percentage}%</span>
          <span>{rule.trendDirection}</span>
          <button className='restore-button' onClick={() => onRestore(rule.id)}>Restore</button>
        </div>
      ))}
    </div>
  );
}