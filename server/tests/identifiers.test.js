import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizePhone, parseIdentifier, phoneToAuthEmail } from '../utils/identifiers.js';
import { containsPattern, todayInIndia } from '../utils/text.js';

describe('normalizePhone', () => {
  it('accepts the common ways of typing an Indian mobile number', () => {
    for (const input of ['9876543210', '+91 98765 43210', '098765-43210', '919876543210']) {
      assert.equal(normalizePhone(input), '9876543210', input);
    }
  });

  it('rejects numbers that are not Indian mobiles', () => {
    for (const input of ['12345', '1234567890', 'ramesh99', '98765abc210', '', undefined]) {
      assert.equal(normalizePhone(input), null, String(input));
    }
  });

  it('keeps a 10-digit number that happens to start with 91', () => {
    assert.equal(normalizePhone('9123456789'), '9123456789');
  });
});

describe('parseIdentifier', () => {
  it('detects an email', () => {
    assert.deepEqual(parseIdentifier(' Priya@Example.com '), {
      column: 'email',
      value: 'priya@example.com',
    });
  });

  it('detects a phone number', () => {
    assert.deepEqual(parseIdentifier('+91 98765 43210'), { column: 'phone', value: '9876543210' });
  });

  it('treats anything else as a username', () => {
    assert.deepEqual(parseIdentifier('Ramesh_99'), { column: 'username', value: 'ramesh_99' });
  });
});

describe('helpers', () => {
  it('builds the internal email for phone-only accounts', () => {
    assert.equal(phoneToAuthEmail('9876543210'), '919876543210@phone.extask.app');
  });

  it('neutralises pattern characters typed into search', () => {
    assert.equal(containsPattern('50%_off*'), '%50\\%\\_off %');
  });

  it('uses the Indian date, not the server date', () => {
    // 20:00 UTC on 31 Dec is already 1 Jan in India.
    assert.equal(todayInIndia(new Date('2026-12-31T20:00:00Z')), '2027-01-01');
  });
});
