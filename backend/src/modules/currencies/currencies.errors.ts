export class CurrencyNotFoundError extends Error {
  constructor(code: string) {
    super(`Currency ${code} not found`);
  }
}

export class PairNotFoundError extends Error {
  constructor(pairId: string) {
    super(`Pair ${pairId} not found`);
  }
}

export class SameCurrencyError extends Error {
  constructor(fromCode: string, toCode: string) {
    super(`Cannot monitor the same currency: ${fromCode} and ${toCode}`);
  }
}

export class DuplicatePairError extends Error {
  constructor(fromCode: string, toCode: string) {
    super(`Pair ${fromCode}/${toCode} already exists`);
  }
}

export class InvalidCurrencyDataError extends Error {
  constructor() {
    super('Invalid currency data received from API');
  }
}
