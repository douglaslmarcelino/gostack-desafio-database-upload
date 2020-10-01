import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  transactionCategory: string;
}

const ACCEPT_TYPES_MAP = ['income', 'outcome'];

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    transactionCategory,
  }: Request): Promise<Transaction> {
    if (!ACCEPT_TYPES_MAP.includes(type)) {
      throw new AppError('Transaction type not accepted');
    }

    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    let categoryId = '';

    const checkCategoryExists = await categoryRepository.findOne({
      where: {
        title: transactionCategory,
      },
    });

    if (checkCategoryExists) {
      categoryId = checkCategoryExists.id;
    } else {
      const category = categoryRepository.create({
        title: transactionCategory,
      });

      await categoryRepository.save(category);

      categoryId = category.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
