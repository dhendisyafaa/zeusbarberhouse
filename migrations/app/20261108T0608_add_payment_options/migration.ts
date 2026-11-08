#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0d4f032bbac2279e0713649424c67be93a08b3a09ddd6eb6390e44d1bf92cec4/contract';
import endContract from '../../snapshots/0d4f032bbac2279e0713649424c67be93a08b3a09ddd6eb6390e44d1bf92cec4/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/975997d88ff83bc029ed550c7f7d39828ad62783bec7f8de371d77e0e0132b6b/contract';
import startContract from '../../snapshots/975997d88ff83bc029ed550c7f7d39828ad62783bec7f8de371d77e0e0132b6b/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'PaymentOption',
        columns: [
          col('accountHolder', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('accountNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('bankName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('instructions', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('label', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('method', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('qrImagePath', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'PaymentOption_method_check_b1cc116a',
            sql`"method" IN ('CASH', 'BANK_TRANSFER', 'QRIS')`,
          ),
        ],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Payment',
        column: col('destinationSnapshot', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Payment',
        column: col('methodLabelSnapshot', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Payment',
        column: col('paymentOptionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'Payment',
        index: 'Payment_paymentOptionId_idx_21a18585',
        columns: ['paymentOptionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PaymentOption',
        index: 'PaymentOption_isActive_sortOrder_idx_43c1fe34',
        columns: ['isActive', 'sortOrder'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Payment',
        foreignKey: {
          name: 'Payment_paymentOptionId_fkey',
          columns: ['paymentOptionId'],
          references: { schema: 'public', table: 'PaymentOption', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
