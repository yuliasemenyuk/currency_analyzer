import { useState, useEffect } from 'react';
import { CurrencyPair } from '../../types';
import { getMonitoredPairs, createRule } from '../../services/api';
import './styles.css';

interface RuleConfiguratorProps {
  onRuleAdded: () => void;
}

export function RuleConfigurator({ onRuleAdded }: RuleConfiguratorProps) {
  const [monitoredPairs, setMonitoredPairs] = useState<CurrencyPair[]>([]);
  const [selectedPairId, setSelectedPairId] = useState('');
  const [percentage, setPercentage] = useState('');
  const [trendDirection, setTrendDirection] = useState<'increase' | 'decrease'>('increase');
  const userId = '040dff52-8aa1-41a6-bc2f-d578170df96c';

  useEffect(() => {
    getMonitoredPairs(userId).then(({data}) => setMonitoredPairs(data));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRule({
        percentage: Number(percentage),
        trendDirection,
        fromCurrencyCode: monitoredPairs.find(pair => pair.id === selectedPairId)?.fromCode || '',
        toCurrencyCode: monitoredPairs.find(pair => pair.id === selectedPairId)?.toCode || '',
        userId: userId,
      });
      setSelectedPairId('');
      setPercentage('');
      setTrendDirection('increase');
      onRuleAdded();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form className="rule-configurator" onSubmit={handleSubmit}>
      <h3>Set Notification Rule</h3>
      <div className="rule-form">
        <select
          className="pair-select"
          value={selectedPairId}
          onChange={e => setSelectedPairId(e.target.value)}
          required
        >
          <option value="">Select monitored pair</option>
          {monitoredPairs.map(pair => (
            <option key={pair.id} value={pair.id}>
              {pair.fromCode}/{pair.toCode}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="percentage-input"
          placeholder="Change %"
          min="0"
          max="100"
          value={percentage}
          onChange={e => {
            const value = e.target.value;
            if (Number(value) >= 0 && Number(value) <= 100) {
              setPercentage(value);
            }
          }}
          required
        />
        <select
          className="trend-select"
          value={trendDirection}
          onChange={e => setTrendDirection(e.target.value as 'increase' | 'decrease')}
        >
          <option value="increase">Increase</option>
          <option value="decrease">Decrease</option>
        </select>
        <button 
          type="submit"
          className="add-rule-button"
          disabled={!selectedPairId || !percentage}
        >
          Add Rule
        </button>
      </div>
    </form>
  );
}