import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { normalizeUserDocument } from '../users/user-contract.ts';

test('normaliza ID-only e e-mail-only como cadastro pendente', () => {
    const idOnly = normalizeUserDocument({ _id: new ObjectId() });
    assert.equal(idOnly.cadastroPendente, true);
    assert.equal(idOnly.informacoes_usuario.nome, '');
    assert.equal(idOnly.pagamento.situacao, 0);

    const emailOnly = normalizeUserDocument({
        _id: new ObjectId(),
        informacoes_usuario: { email: 'maria@example.com' },
    });
    assert.equal(emailOnly.informacoes_usuario.email, 'maria@example.com');
    assert.equal(emailOnly.cadastroPendente, true);
});

test('normaliza flags numéricas sem liberar perfil incompleto', () => {
    const incomplete = normalizeUserDocument({
        isPos_registration: 1,
        informacoes_usuario: { nome: '', cpf: '', numero_telefone: '' },
        pagamento: { situacao: 1 },
    });
    assert.equal(incomplete.isPos_registration, true);
    assert.equal(incomplete.pagamento.situacao, 1);
    assert.equal(incomplete.cadastroPendente, true);

    const complete = normalizeUserDocument({
        isPos_registration: true,
        informacoes_usuario: {
            nome: 'Maria da Silva',
            cpf: '529.982.247-25',
            numero_telefone: '(34) 99999-9999',
        },
        pagamento: { situacao: 1 },
    });
    assert.equal(complete.cadastroPendente, false);
});
