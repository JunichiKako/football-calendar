// reconcile() のテスト。node --test scripts/ で実行する。
//
// SEQUENCE の採番はICS配信の正しさを直接左右する。番号を上げ忘れると
// 購読者に日程変更が届かず、逆に上げすぎると毎日更新通知が飛ぶ。
// 実APIを叩かずに検証できるよう、reconcile だけを切り出してテストしている。

import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile } from './fetch-snapshot.mjs';

const iso = (offsetDays) =>
  new Date(Date.now() + offsetDays * 864e5).toISOString().replace(/\.\d+Z$/, 'Z');

const future = iso(30);
const past = iso(-30);

/** テスト用の試合レコード */
const match = (overrides = {}) => ({
  id: 1,
  utcDate: future,
  status: 'TIMED',
  home: 'A',
  away: 'B',
  ...overrides,
});

const find = (result, id = 1) => result.find((m) => m.id === id);

test('新規の試合は seq=0 から始まる', () => {
  assert.equal(find(reconcile([match()], [])).seq, 0);
});

test('ICSに影響しない変更では seq を維持する', () => {
  assert.equal(find(reconcile([match()], [match({ seq: 3 })])).seq, 3);
});

test('キックオフ時刻が変わったら seq を上げる', () => {
  const result = reconcile([match({ utcDate: '2027-01-01T12:00:00Z' })], [match({ seq: 3 })]);
  assert.equal(find(result).seq, 4);
});

test('時刻未定から確定に変わったら seq を上げる', () => {
  const result = reconcile([match({ status: 'TIMED' })], [match({ status: 'SCHEDULED', seq: 0 })]);
  assert.equal(find(result).seq, 1);
});

test('試合中や終了への遷移では seq を上げない', () => {
  // ここで上げると毎日 SEQUENCE が進み、購読側に無意味な更新通知が飛ぶ
  assert.equal(find(reconcile([match({ status: 'IN_PLAY' })], [match({ seq: 2 })])).seq, 2);
  assert.equal(find(reconcile([match({ status: 'FINISHED' })], [match({ seq: 2 })])).seq, 2);
});

test('延期になったら seq を上げる', () => {
  assert.equal(find(reconcile([match({ status: 'POSTPONED' })], [match({ seq: 1 })])).seq, 2);
});

test('APIから消えた試合は CANCELLED として残す', () => {
  // 黙って消すと購読者のカレンダーに古い予定が残り続ける
  const result = reconcile([], [match({ seq: 1 })]);
  assert.equal(result.length, 1);
  assert.equal(find(result).status, 'CANCELLED');
  assert.equal(find(result).seq, 2);
});

test('中止として配信済みなら seq を上げ続けない', () => {
  const result = reconcile([], [match({ status: 'CANCELLED', seq: 2 })]);
  assert.equal(find(result).seq, 2);
});

test('予定日から7日以上過ぎた消えた試合は配信を終える', () => {
  assert.equal(reconcile([], [match({ utcDate: past, seq: 1 })]).length, 0);
});

test('日時順、同着ならID順に並ぶ', () => {
  const result = reconcile(
    [
      match({ id: 9, utcDate: '2027-03-01T00:00:00Z' }),
      match({ id: 2, utcDate: '2027-01-01T00:00:00Z' }),
    ],
    []
  );
  assert.deepEqual(
    result.map((m) => m.id),
    [2, 9]
  );
});
