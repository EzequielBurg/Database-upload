import path from 'path';
import fs from 'fs';

import uploadConfig, { loadCSV } from '../config/upload';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  CSVfileName: string;
}

class ImportTransactionsService {
  async execute({ CSVfileName }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, CSVfileName);
    const csvFileExists = await fs.promises.stat(csvFilePath);

    if (!csvFileExists) {
      throw new AppError('File not found');
    }

    const csvDatainArray = await loadCSV(csvFilePath);

    const createTransaction = new CreateTransactionService();

    const transactionsCreated: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const element of csvDatainArray) {
      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransaction.execute({
        title: element[0],
        type: element[1],
        value: +element[2],
        category: element[3],
      });

      transactionsCreated.push(transaction);
    }

    return transactionsCreated;
  }
}

export default ImportTransactionsService;
