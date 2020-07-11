import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions
      .filter(transaction => transaction.type === 'income')
      .map(el => el.value);

    const outcome = transactions
      .filter(transaction => transaction.type === 'outcome')
      .map(el => el.value);

    const incomeValue = income.reduce((accum, curr) => accum + curr, 0);
    const outcomeValue = outcome.reduce((accum, curr) => accum + curr, 0);

    const balance = {
      income: incomeValue,
      outcome: outcomeValue,
      total: incomeValue - outcomeValue,
    };

    return balance;
  }
}

export default TransactionsRepository;
