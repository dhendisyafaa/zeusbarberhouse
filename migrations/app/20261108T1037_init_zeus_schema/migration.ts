#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/0d4f032bbac2279e0713649424c67be93a08b3a09ddd6eb6390e44d1bf92cec4/contract';
import endContract from '../../snapshots/0d4f032bbac2279e0713649424c67be93a08b3a09ddd6eb6390e44d1bf92cec4/contract.json' with { type: 'json' };
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

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'ApplicationDocument',
        columns: [
          col('applicationId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('mimeType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('originalFileName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sizeBytes', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('storagePath', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Barber',
        columns: [
          col('bio', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('branchId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('photoPath', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BarberSchedule',
        columns: [
          col('barberId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('breakEndMinute', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('breakStartMinute', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('dayOfWeek', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('endMinute', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startMinute', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BarberTimeOff',
        columns: [
          col('barberId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('endsAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('startsAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Booking',
        columns: [
          col('barberId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('branchId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('bufferMinutesSnapshot', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('customerId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('endsAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('guestName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('guestPhone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('holdExpiresAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('startsAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING_PAYMENT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Booking_status_check_a6154fa7',
            sql`"status" IN ('PENDING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'BookingItem',
        columns: [
          col('bookingId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('durationMinutesSnapshot', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('serviceId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('serviceNameSnapshot', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('unitPriceRupiahSnapshot', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BookingPolicy',
        columns: [
          col('bufferMinutes', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', {
            notNull: true,
            default: lit('default'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('softLockMinutes', 'int4', {
            notNull: true,
            default: lit(15),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BookingStatusEvent',
        columns: [
          col('actorProfileId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('bookingId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('fromStatus', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('toStatus', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'BookingStatusEvent_fromStatus_check_156ecb23',
            sql`"fromStatus" IN ('PENDING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED')`,
          ),
          checkExpression(
            'BookingStatusEvent_toStatus_check_296f828b',
            sql`"toStatus" IN ('PENDING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Branch',
        columns: [
          col('address', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('city', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('mapsUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'BranchSchedule',
        columns: [
          col('branchId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('closeMinute', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('dayOfWeek', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('openMinute', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'CareerVacancy',
        columns: [
          col('closesAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isPublished', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('publishedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Customer',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('profileId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'HaircutModel',
        columns: [
          col('branchId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('imagePath', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isPublished', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'JobApplication',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('message', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('SUBMITTED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('vacancyId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'JobApplication_status_check_e216b530',
            sql`"status" IN ('SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'JobApplicationStatusEvent',
        columns: [
          col('actorProfileId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('applicationId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('fromStatus', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('toStatus', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'JobApplicationStatusEvent_fromStatus_check_82eb3ad6',
            sql`"fromStatus" IN ('SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED')`,
          ),
          checkExpression(
            'JobApplicationStatusEvent_toStatus_check_7b2fde3e',
            sql`"toStatus" IN ('SUBMITTED', 'REVIEWING', 'ACCEPTED', 'REJECTED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Membership',
        columns: [
          col('activatedAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('customerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('expiresAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Membership_status_check_65b312e3',
            sql`"status" IN ('ACTIVE', 'INACTIVE', 'EXPIRED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'MembershipPointPolicy',
        columns: [
          col('id', 'text', {
            notNull: true,
            default: lit('default'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('pointsPerCompletedBooking', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('updatedByProfileId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'MembershipPointTransaction',
        columns: [
          col('actorProfileId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('bookingId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('deltaPoints', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('expiresAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('idempotencyKey', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('membershipId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reason', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('transactionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Payment',
        columns: [
          col('amountRupiah', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('destinationSnapshot', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('method', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('methodLabelSnapshot', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('paymentOptionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('proofStoragePath', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('proofUploadedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('reference', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('transactionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('verifiedAt', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Payment_method_check_b1cc116a',
            sql`"method" IN ('CASH', 'BANK_TRANSFER', 'QRIS')`,
          ),
          checkExpression(
            'Payment_status_check_d7f062a0',
            sql`"status" IN ('PENDING', 'PROOF_SUBMITTED', 'VERIFIED', 'REJECTED')`,
          ),
        ],
      }),
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
      this.createTable({
        schema: 'public',
        table: 'PaymentStatusEvent',
        columns: [
          col('actorProfileId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('fromStatus', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('paymentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('toStatus', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'PaymentStatusEvent_fromStatus_check_b97c720e',
            sql`"fromStatus" IN ('PENDING', 'PROOF_SUBMITTED', 'VERIFIED', 'REJECTED')`,
          ),
          checkExpression(
            'PaymentStatusEvent_toStatus_check_9744f94a',
            sql`"toStatus" IN ('PENDING', 'PROOF_SUBMITTED', 'VERIFIED', 'REJECTED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Profile',
        columns: [
          col('authUserId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('CUSTOMER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('Profile_role_check_3cc42c46', sql`"role" IN ('CUSTOMER', 'ADMIN')`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Service',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('durationMinutes', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('imagePath', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('priceRupiah', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
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
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'SiteContent',
        columns: [
          col('body', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isPublished', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Transaction',
        columns: [
          col('bookingId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('branchId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('createdByProfileId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('customerId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('totalAmountRupiah', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Transaction_status_check_76918069',
            sql`"status" IN ('PENDING', 'PARTIALLY_PAID', 'PAID', 'VOIDED', 'REFUNDED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'TransactionItem',
        columns: [
          col('createdAt', 'timestamptz(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-date@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('nameSnapshot', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('quantity', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('serviceId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('transactionId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('unitPriceRupiahSnapshot', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'BarberSchedule',
        constraint: 'BarberSchedule_barberId_dayOfWeek_key',
        columns: ['barberId', 'dayOfWeek'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Branch',
        constraint: 'Branch_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'BranchSchedule',
        constraint: 'BranchSchedule_branchId_dayOfWeek_key',
        columns: ['branchId', 'dayOfWeek'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Customer',
        constraint: 'Customer_profileId_key',
        columns: ['profileId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Membership',
        constraint: 'Membership_customerId_key',
        columns: ['customerId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'MembershipPointTransaction',
        constraint: 'MembershipPointTransaction_idempotencyKey_key',
        columns: ['idempotencyKey'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Profile',
        constraint: 'Profile_authUserId_key',
        columns: ['authUserId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'SiteContent',
        constraint: 'SiteContent_key_key',
        columns: ['key'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Transaction',
        constraint: 'Transaction_bookingId_key',
        columns: ['bookingId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ApplicationDocument',
        index: 'ApplicationDocument_applicationId_idx_8158f91a',
        columns: ['applicationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Barber',
        index: 'Barber_branchId_idx_d04da5bb',
        columns: ['branchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Barber',
        index: 'Barber_branchId_isActive_idx_814cccd6',
        columns: ['branchId', 'isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BarberSchedule',
        index: 'BarberSchedule_barberId_idx_e2910164',
        columns: ['barberId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BarberTimeOff',
        index: 'BarberTimeOff_barberId_idx_e2910164',
        columns: ['barberId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BarberTimeOff',
        index: 'BarberTimeOff_barberId_startsAt_endsAt_idx_96459b28',
        columns: ['barberId', 'startsAt', 'endsAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Booking',
        index: 'Booking_barberId_idx_e2910164',
        columns: ['barberId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Booking',
        index: 'Booking_barberId_startsAt_endsAt_idx_96459b28',
        columns: ['barberId', 'startsAt', 'endsAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Booking',
        index: 'Booking_branchId_idx_d04da5bb',
        columns: ['branchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Booking',
        index: 'Booking_branchId_startsAt_idx_329294aa',
        columns: ['branchId', 'startsAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Booking',
        index: 'Booking_customerId_createdAt_idx_f10a1fb1',
        columns: ['customerId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Booking',
        index: 'Booking_customerId_idx_b2a8a46c',
        columns: ['customerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Booking',
        index: 'Booking_status_holdExpiresAt_idx_b5009e9f',
        columns: ['status', 'holdExpiresAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookingItem',
        index: 'BookingItem_bookingId_idx_17848f4a',
        columns: ['bookingId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookingItem',
        index: 'BookingItem_bookingId_sortOrder_idx_423bd4a1',
        columns: ['bookingId', 'sortOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookingItem',
        index: 'BookingItem_serviceId_idx_b5d9acbf',
        columns: ['serviceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookingStatusEvent',
        index: 'BookingStatusEvent_actorProfileId_idx_a9d0ffa5',
        columns: ['actorProfileId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookingStatusEvent',
        index: 'BookingStatusEvent_bookingId_createdAt_idx_b0a32e18',
        columns: ['bookingId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BookingStatusEvent',
        index: 'BookingStatusEvent_bookingId_idx_17848f4a',
        columns: ['bookingId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Branch',
        index: 'Branch_isActive_idx_77fe3ba1',
        columns: ['isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'BranchSchedule',
        index: 'BranchSchedule_branchId_idx_d04da5bb',
        columns: ['branchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'CareerVacancy',
        index: 'CareerVacancy_isPublished_publishedAt_idx_c144ee7e',
        columns: ['isPublished', 'publishedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Customer',
        index: 'Customer_phone_idx_8db23f45',
        columns: ['phone'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'HaircutModel',
        index: 'HaircutModel_branchId_idx_d04da5bb',
        columns: ['branchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'HaircutModel',
        index: 'HaircutModel_isPublished_sortOrder_idx_654fec3c',
        columns: ['isPublished', 'sortOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JobApplication',
        index: 'JobApplication_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JobApplication',
        index: 'JobApplication_vacancyId_idx_826eb071',
        columns: ['vacancyId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JobApplication',
        index: 'JobApplication_vacancyId_status_idx_64d96965',
        columns: ['vacancyId', 'status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JobApplicationStatusEvent',
        index: 'JobApplicationStatusEvent_actorProfileId_idx_a9d0ffa5',
        columns: ['actorProfileId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JobApplicationStatusEvent',
        index: 'JobApplicationStatusEvent_applicationId_createdAt_idx_9384a092',
        columns: ['applicationId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'JobApplicationStatusEvent',
        index: 'JobApplicationStatusEvent_applicationId_idx_8158f91a',
        columns: ['applicationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MembershipPointPolicy',
        index: 'MembershipPointPolicy_updatedByProfileId_idx_1de4b6c9',
        columns: ['updatedByProfileId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MembershipPointTransaction',
        index: 'MembershipPointTransaction_actorProfileId_idx_a9d0ffa5',
        columns: ['actorProfileId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MembershipPointTransaction',
        index: 'MembershipPointTransaction_bookingId_idx_17848f4a',
        columns: ['bookingId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MembershipPointTransaction',
        index: 'MembershipPointTransaction_membershipId_createdAt_idx_dda62662',
        columns: ['membershipId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MembershipPointTransaction',
        index: 'MembershipPointTransaction_membershipId_idx_fdcfb7b5',
        columns: ['membershipId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'MembershipPointTransaction',
        index: 'MembershipPointTransaction_transactionId_idx_d3180832',
        columns: ['transactionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Payment',
        index: 'Payment_paymentOptionId_idx_21a18585',
        columns: ['paymentOptionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Payment',
        index: 'Payment_status_createdAt_idx_58610442',
        columns: ['status', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Payment',
        index: 'Payment_transactionId_createdAt_idx_2b3553d5',
        columns: ['transactionId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Payment',
        index: 'Payment_transactionId_idx_d3180832',
        columns: ['transactionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PaymentOption',
        index: 'PaymentOption_isActive_sortOrder_idx_43c1fe34',
        columns: ['isActive', 'sortOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PaymentStatusEvent',
        index: 'PaymentStatusEvent_actorProfileId_idx_a9d0ffa5',
        columns: ['actorProfileId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PaymentStatusEvent',
        index: 'PaymentStatusEvent_paymentId_createdAt_idx_e1836a1e',
        columns: ['paymentId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'PaymentStatusEvent',
        index: 'PaymentStatusEvent_paymentId_idx_b2fe9a10',
        columns: ['paymentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Service',
        index: 'Service_isActive_sortOrder_idx_43c1fe34',
        columns: ['isActive', 'sortOrder'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'SiteContent',
        index: 'SiteContent_isPublished_idx_d7ee5985',
        columns: ['isPublished'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_branchId_createdAt_idx_f74bd262',
        columns: ['branchId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_branchId_idx_d04da5bb',
        columns: ['branchId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_createdByProfileId_idx_fd64db0a',
        columns: ['createdByProfileId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_customerId_createdAt_idx_f10a1fb1',
        columns: ['customerId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_customerId_idx_b2a8a46c',
        columns: ['customerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Transaction',
        index: 'Transaction_status_createdAt_idx_58610442',
        columns: ['status', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TransactionItem',
        index: 'TransactionItem_serviceId_idx_b5d9acbf',
        columns: ['serviceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'TransactionItem',
        index: 'TransactionItem_transactionId_idx_d3180832',
        columns: ['transactionId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ApplicationDocument',
        foreignKey: {
          name: 'ApplicationDocument_applicationId_fkey',
          columns: ['applicationId'],
          references: { schema: 'public', table: 'JobApplication', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Barber',
        foreignKey: {
          name: 'Barber_branchId_fkey',
          columns: ['branchId'],
          references: { schema: 'public', table: 'Branch', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BarberSchedule',
        foreignKey: {
          name: 'BarberSchedule_barberId_fkey',
          columns: ['barberId'],
          references: { schema: 'public', table: 'Barber', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BarberTimeOff',
        foreignKey: {
          name: 'BarberTimeOff_barberId_fkey',
          columns: ['barberId'],
          references: { schema: 'public', table: 'Barber', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Booking',
        foreignKey: {
          name: 'Booking_customerId_fkey',
          columns: ['customerId'],
          references: { schema: 'public', table: 'Customer', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Booking',
        foreignKey: {
          name: 'Booking_branchId_fkey',
          columns: ['branchId'],
          references: { schema: 'public', table: 'Branch', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Booking',
        foreignKey: {
          name: 'Booking_barberId_fkey',
          columns: ['barberId'],
          references: { schema: 'public', table: 'Barber', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookingItem',
        foreignKey: {
          name: 'BookingItem_bookingId_fkey',
          columns: ['bookingId'],
          references: { schema: 'public', table: 'Booking', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookingItem',
        foreignKey: {
          name: 'BookingItem_serviceId_fkey',
          columns: ['serviceId'],
          references: { schema: 'public', table: 'Service', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookingStatusEvent',
        foreignKey: {
          name: 'BookingStatusEvent_bookingId_fkey',
          columns: ['bookingId'],
          references: { schema: 'public', table: 'Booking', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BookingStatusEvent',
        foreignKey: {
          name: 'BookingStatusEvent_actorProfileId_fkey',
          columns: ['actorProfileId'],
          references: { schema: 'public', table: 'Profile', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'BranchSchedule',
        foreignKey: {
          name: 'BranchSchedule_branchId_fkey',
          columns: ['branchId'],
          references: { schema: 'public', table: 'Branch', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Customer',
        foreignKey: {
          name: 'Customer_profileId_fkey',
          columns: ['profileId'],
          references: { schema: 'public', table: 'Profile', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'HaircutModel',
        foreignKey: {
          name: 'HaircutModel_branchId_fkey',
          columns: ['branchId'],
          references: { schema: 'public', table: 'Branch', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'JobApplication',
        foreignKey: {
          name: 'JobApplication_vacancyId_fkey',
          columns: ['vacancyId'],
          references: { schema: 'public', table: 'CareerVacancy', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'JobApplicationStatusEvent',
        foreignKey: {
          name: 'JobApplicationStatusEvent_applicationId_fkey',
          columns: ['applicationId'],
          references: { schema: 'public', table: 'JobApplication', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'JobApplicationStatusEvent',
        foreignKey: {
          name: 'JobApplicationStatusEvent_actorProfileId_fkey',
          columns: ['actorProfileId'],
          references: { schema: 'public', table: 'Profile', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Membership',
        foreignKey: {
          name: 'Membership_customerId_fkey',
          columns: ['customerId'],
          references: { schema: 'public', table: 'Customer', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'MembershipPointPolicy',
        foreignKey: {
          name: 'MembershipPointPolicy_updatedByProfileId_fkey',
          columns: ['updatedByProfileId'],
          references: { schema: 'public', table: 'Profile', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'MembershipPointTransaction',
        foreignKey: {
          name: 'MembershipPointTransaction_membershipId_fkey',
          columns: ['membershipId'],
          references: { schema: 'public', table: 'Membership', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'MembershipPointTransaction',
        foreignKey: {
          name: 'MembershipPointTransaction_bookingId_fkey',
          columns: ['bookingId'],
          references: { schema: 'public', table: 'Booking', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'MembershipPointTransaction',
        foreignKey: {
          name: 'MembershipPointTransaction_transactionId_fkey',
          columns: ['transactionId'],
          references: { schema: 'public', table: 'Transaction', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'MembershipPointTransaction',
        foreignKey: {
          name: 'MembershipPointTransaction_actorProfileId_fkey',
          columns: ['actorProfileId'],
          references: { schema: 'public', table: 'Profile', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Payment',
        foreignKey: {
          name: 'Payment_transactionId_fkey',
          columns: ['transactionId'],
          references: { schema: 'public', table: 'Transaction', columns: ['id'] },
        },
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
      this.addForeignKey({
        schema: 'public',
        table: 'PaymentStatusEvent',
        foreignKey: {
          name: 'PaymentStatusEvent_paymentId_fkey',
          columns: ['paymentId'],
          references: { schema: 'public', table: 'Payment', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'PaymentStatusEvent',
        foreignKey: {
          name: 'PaymentStatusEvent_actorProfileId_fkey',
          columns: ['actorProfileId'],
          references: { schema: 'public', table: 'Profile', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_bookingId_fkey',
          columns: ['bookingId'],
          references: { schema: 'public', table: 'Booking', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_customerId_fkey',
          columns: ['customerId'],
          references: { schema: 'public', table: 'Customer', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_branchId_fkey',
          columns: ['branchId'],
          references: { schema: 'public', table: 'Branch', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Transaction',
        foreignKey: {
          name: 'Transaction_createdByProfileId_fkey',
          columns: ['createdByProfileId'],
          references: { schema: 'public', table: 'Profile', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TransactionItem',
        foreignKey: {
          name: 'TransactionItem_transactionId_fkey',
          columns: ['transactionId'],
          references: { schema: 'public', table: 'Transaction', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TransactionItem',
        foreignKey: {
          name: 'TransactionItem_serviceId_fkey',
          columns: ['serviceId'],
          references: { schema: 'public', table: 'Service', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
