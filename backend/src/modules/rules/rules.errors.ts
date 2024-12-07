export class RuleNotFoundError extends Error {
  constructor(ruleId: string) {
    super(`Rule ${ruleId} not found`);
  }
}

export class MaxRulesReachedError extends Error {
  constructor(userId: string, trendDirection: string) {
    super(
      `User ${userId} has reached maximum rules limit (5) for ${trendDirection} direction`,
    );
  }
}

export class InvalidRuleDataError extends Error {
  constructor() {
    super('Invalid rule data provided');
  }
}

export class RuleSubscriptionError extends Error {
  constructor(userId: string, ruleId: string) {
    super(`Failed to subscribe user ${userId} to rule ${ruleId}`);
  }
}

export class SameCurrencyRuleError extends Error {
  constructor(currencyCode: string) {
    super(`Cannot create rule for same currency ${currencyCode}`);
  }
}

export class RuleNotEnabledError extends Error {
  constructor(ruleId: string) {
    super(`Rule ${ruleId} is not enabled`);
  }
}

export class PairNotFoundError extends Error {
  constructor(pairId: string) {
    super(`Pair ${pairId} not found`);
  }
}

export class RuleAlreadySubscribedError extends Error {
  constructor() {
    // userId: string, ruleId: string
    super(`User is already subscribed to this rule`);
  }
}
