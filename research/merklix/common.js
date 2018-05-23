/*!
 * common.js - merklix tree common functions
 * Copyright (c) 2018, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

/*
 * Constants
 */

const INTERNAL_PREFIX = Buffer.from([0x00]);
const LEAF_PREFIX = Buffer.from([0x01]);
const EMPTY = Buffer.alloc(0);

/*
 * Common
 */

const zeroHashes = [];

for (let i = 0; i < 64; i++)
  zeroHashes.push(null);

function zeroHash(size) {
  if (!zeroHashes[size])
    zeroHashes[size] = Buffer.alloc(size, 0x00);
  return zeroHashes[size];
}

function ensureHash(hash) {
  if (hash.size != null)
    return hash;

  hash.id = hash.name.toLowerCase();
  hash.size = hash.digest(EMPTY).length;
  hash.bits = hash.size * 8;
  hash.zero = zeroHash(hash.size);

  ({ __proto__: hash });

  return hash;
}

function hasBit(key, index) {
  const oct = index >>> 3;
  const bit = index & 7;
  return (key[oct] >>> (7 - bit)) & 1;
}

function setBit(key, index) {
  const oct = index >>> 3;
  const bit = index & 7;
  key[oct] |= 1 << (7 - bit);
}

function hashInternal(ctx, left, right) {
  ctx.init();
  ctx.update(INTERNAL_PREFIX);
  ctx.update(left);
  ctx.update(right);
  return ctx.final();
}

function hashLeaf(ctx, key, value) {
  ctx.init();
  ctx.update(LEAF_PREFIX);
  ctx.update(key);
  ctx.update(value);
  return ctx.final();
}

function parseU32(name) {
  if (name.length !== 10)
    return -1;

  let num = 0;

  for (let i = 0; i < 10; i++) {
    const ch = name.charCodeAt(i);

    if (ch < 0x30 || ch > 0x39)
      return -1;

    num *= 10;
    num += ch - 0x30;

    if (num > 0xffffffff)
      return -1;
  }

  return num;
}

function readPos(data) {
  assert(data.length === 6);
  return [
    data.readUInt16LE(0, true),
    data.readUInt32LE(2, true)
  ];
}

function writePos(index, pos) {
  const buf = Buffer.allocUnsafe(6);
  buf.writeUInt16LE(index, 0, true);
  buf.writeUInt32LE(pos, 2, true);
  return buf;
}

/*
 * Expose
 */

exports.zeroHash = zeroHash;
exports.ensureHash = ensureHash;
exports.hasBit = hasBit;
exports.setBit = setBit;
exports.hashInternal = hashInternal;
exports.hashLeaf = hashLeaf;
exports.parseU32 = parseU32;
exports.readPos = readPos;
exports.writePos = writePos;
