import { useState, useEffect } from 'react';
import { CurrencyPair } from '../../types';
import { createRule } from '../../services/api';
import { toast } from 'react-toastify';
import './styles.css';

interface RuleConfiguratorProps {
  monitoredPairs: CurrencyPair[];
  onRuleAdded: () => void;
}

export function RuleConfigurator({ monitoredPairs, onRuleAdded }: RuleConfiguratorProps) {
  const [selectedPairId, setSelectedPairId] = useState('');
  const [percentage, setPercentage] = useState('');
  const [trendDirection, setTrendDirection] = useState<'increase' | 'decrease'>('increase');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRule({
        percentage: Number(percentage),
        trendDirection,
        fromCurrencyCode: monitoredPairs.find(pair => pair.id === selectedPairId)?.fromCode || '',
        toCurrencyCode: monitoredPairs.find(pair => pair.id === selectedPairId)?.toCode || '',
      });
      setSelectedPairId('');
      setPercentage('');
      setTrendDirection('increase');
      onRuleAdded();
      toast.success('Rule added successfully');
    } catch (err) {
      const error = err as { response: { data: { message: string } } };
      toast.error(error.response.data.message);
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