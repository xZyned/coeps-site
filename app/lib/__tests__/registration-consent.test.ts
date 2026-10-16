import test from 'node:test';
import assert from 'node:assert/strict';
import { buildConsentUpdate, hasCurrentConsent, LGPD_CONSENT_VERSION } from '../registration-consent.ts';

const now = new Date('2026-10-16T12:00:00Z');
const earlier = new Date('2026-10-01T12:00:00Z');
const current = { aceito: true, aceitoEm: earlier, versao: LGPD_CONSENT_VERSION };
const previousLgpd = { aceito: true, aceitoEm: earlier, versao: 'cieps-lgpd-2026-08-27' };

test('exige aceite de quem não tem consentimento algum', () => {
    assert.equal(hasCurrentConsent(undefined), false);
    assert.equal(hasCurrentConsent({}), false);
});

test('exige reaceite de quem só aceitou a LGPD anterior', () => {
    assert.equal(hasCurrentConsent({ lgpd: previousLgpd }), false);
});

test('exige os dois aceites na versão atual', () => {
    assert.equal(hasCurrentConsent({ lgpd: current }), false);
    assert.equal(hasCurrentConsent({ lgpd: current, termosUso: { ...current, aceito: false } }), false);
    assert.equal(hasCurrentConsent({ lgpd: current, termosUso: current }), true);
});

test('registra os dois aceites e arquiva a LGPD anterior no histórico', () => {
    const update = buildConsentUpdate({ lgpd: previousLgpd }, now);
    assert.deepEqual(update.$set, {
        'consentimentos.lgpd': { aceito: true, aceitoEm: now, versao: LGPD_CONSENT_VERSION },
        'consentimentos.termosUso': { aceito: true, aceitoEm: now, versao: LGPD_CONSENT_VERSION },
    });
    assert.deepEqual(update.$push, {
        'consentimentos.historico': { $each: [{ ...previousLgpd, tipo: 'lgpd' }] },
    });
});

test('não arquiva nem altera a data de aceites já atuais', () => {
    const update = buildConsentUpdate({ lgpd: current, termosUso: current }, now);
    assert.equal(update.$set['consentimentos.lgpd'].aceitoEm, earlier);
    assert.equal(update.$set['consentimentos.termosUso'].aceitoEm, earlier);
    assert.equal('$push' in update, false);
});

test('primeiro aceite não cria histórico', () => {
    const update = buildConsentUpdate(undefined, now);
    assert.equal(update.$set['consentimentos.lgpd'].aceitoEm, now);
    assert.equal('$push' in update, false);
});
