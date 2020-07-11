import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(
        'You not have enough balance to do this transaction',
        400,
      );
    }

    let categoryToCreate = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryToCreate) {
      categoryToCreate = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryToCreate);
    }

    const transactionToCreate = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryToCreate.id,
    });

    await transactionsRepository.save(transactionToCreate);

    return transactionToCreate;
  }
}

export default CreateTransactionService;
