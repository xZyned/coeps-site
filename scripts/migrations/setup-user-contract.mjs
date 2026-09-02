import { createHash } from 'node:crypto';
import { MongoClient } from 'mongodb';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index];
  if (!token.startsWith('--')) continue;
  const [inlineKey, inlineValue] = token.slice(2).split('=', 2);
  if (inlineValue !== undefined) args.set(inlineKey, inlineValue);
  else if (process.argv[index + 1] && !process.argv[index + 1].startsWith('--')) {
    args.set(inlineKey, process.argv[index + 1]);
    index += 1;
  } else args.set(inlineKey, true);
}

const uri = process.env.MONGODB_URI;
const configuredDatabase = process.env.MONGODB_DB;
const requestedDatabase = String(args.get('database') || '');
const apply = args.get('apply') === true;
const confirmation = String(args.get('confirm') || '');
const validatorVersion = 1;
const indexName = 'usuarios_id_api_unique_nonempty';

if (!uri || !configuredDatabase) throw new Error('Defina MONGODB_URI e MONGODB_DB.');
if (!requestedDatabase || requestedDatabase !== configuredDatabase) {
  throw new Error('--database deve coincidir exatamente com MONGODB_DB.');
}

const requiredProfileStrings = [
  'cpf',
  'numero_telefone',
  'nome',
  'email',
  'titulo_honorario',
];

function typeAllowed(path, allowed) {
  return {
    $expr: {
      $eq: [
        { $in: [{ $type: `$${path}` }, allowed] },
        false,
      ],
    },
  };
}

function booleanLikeIncompatible(path) {
  return {
    $expr: {
      $and: [
        { $eq: [{ $in: [{ $type: `$${path}` }, ['bool', 'missing', 'null']] }, false] },
        { $eq: [{ $in: [`$${path}`, [0, 1]] }, false] },
      ],
    },
  };
}

function numericBoolean(path) {
  return {
    $expr: {
      $and: [
        { $in: [{ $type: `$${path}` }, ['int', 'long', 'double', 'decimal']] },
        { $in: [`$${path}`, [0, 1]] },
      ],
    },
  };
}

function blockingChecks() {
  return {
    id_api: typeAllowed('id_api', ['string', 'missing', 'null']),
    isPos_registration: booleanLikeIncompatible('isPos_registration'),
    informacoes_usuario: typeAllowed('informacoes_usuario', ['object', 'missing', 'null']),
    ...Object.fromEntries(requiredProfileStrings.map((field) => [
      `informacoes_usuario.${field}`,
      typeAllowed(`informacoes_usuario.${field}`, ['string', 'missing', 'null']),
    ])),
    'informacoes_usuario.data_criacao': typeAllowed(
      'informacoes_usuario.data_criacao',
      ['date', 'string', 'missing', 'null'],
    ),
    pagamento: typeAllowed('pagamento', ['object', 'missing', 'null']),
    'pagamento.situacao': {
      $expr: {
        $and: [
          { $eq: [{ $in: [{ $type: '$pagamento.situacao' }, ['missing', 'null']] }, false] },
          { $eq: [{ $in: ['$pagamento.situacao', [0, 1, 2]] }, false] },
        ],
      },
    },
    'pagamento.tipo_pagamento': typeAllowed('pagamento.tipo_pagamento', ['string', 'missing', 'null']),
    'pagamento.situacao_animacao': booleanLikeIncompatible('pagamento.situacao_animacao'),
    'pagamento.lista_pagamentos': typeAllowed('pagamento.lista_pagamentos', ['array', 'missing', 'null']),
  };
}

function blockingDocumentsQuery() {
  return { $or: Object.values(blockingChecks()) };
}

async function duplicateCustomerIds(collection) {
  const result = await collection.aggregate([
    { $match: { id_api: { $type: 'string' } } },
    { $project: { id_api: { $trim: { input: '$id_api' } } } },
    { $match: { id_api: { $ne: '' } } },
    { $group: { _id: '$id_api', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: 'total' },
  ]).toArray();
  return Number(result[0]?.total || 0);
}

async function audit(collection) {
  const numericFlagsQuery = numericBoolean('isPos_registration');
  const numericPaymentAnimationQuery = numericBoolean('pagamento.situacao_animacao');
  const missingShellQuery = {
    $or: [
      { id_api: { $exists: false } },
      { informacoes_usuario: { $exists: false } },
      { pagamento: { $exists: false } },
      { isPos_registration: { $exists: false } },
    ],
  };
  const checks = blockingChecks();
  const checkEntries = Object.entries(checks);
  const [total, numericFlags, numericPaymentAnimationFlags, missingShellFields, blockingDocuments, duplicateIds, fieldCounts] =
    await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments(numericFlagsQuery),
      collection.countDocuments(numericPaymentAnimationQuery),
      collection.countDocuments(missingShellQuery),
      collection.countDocuments(blockingDocumentsQuery()),
      duplicateCustomerIds(collection),
      Promise.all(checkEntries.map(([, query]) => collection.countDocuments(query))),
    ]);

  return {
    total,
    numericFlags,
    numericPaymentAnimationFlags,
    missingShellFields,
    blockingDocuments,
    blockingByField: Object.fromEntries(checkEntries.map(([field], index) => [field, fieldCounts[index]])),
    duplicateCustomerIds: duplicateIds,
  };
}

function migrationPipeline(now) {
  const profileDefaults = Object.fromEntries(requiredProfileStrings.map((field) => [field, '']));
  profileDefaults.data_criacao = now;
  const paymentDefaults = {
    situacao: 0,
    tipo_pagamento: '',
    situacao_animacao: false,
    lista_pagamentos: [],
  };
  const nullableString = (path) => ({
    $cond: [
      { $in: [{ $type: `$${path}` }, ['missing', 'null']] },
      '',
      `$${path}`,
    ],
  });

  return [
    {
      $set: {
        id_api: {
          $cond: [
            { $in: [{ $type: '$id_api' }, ['missing', 'null']] },
            '',
            { $trim: { input: '$id_api' } },
          ],
        },
        isPos_registration: {
          $cond: [
            { $in: [{ $type: '$isPos_registration' }, ['missing', 'null']] },
            false,
            {
              $cond: [
                { $in: ['$isPos_registration', [0, 1]] },
                { $eq: ['$isPos_registration', 1] },
                '$isPos_registration',
              ],
            },
          ],
        },
        informacoes_usuario: {
          $mergeObjects: [
            profileDefaults,
            {
              $cond: [
                { $eq: [{ $type: '$informacoes_usuario' }, 'object'] },
                '$informacoes_usuario',
                {},
              ],
            },
          ],
        },
        pagamento: {
          $mergeObjects: [
            paymentDefaults,
            {
              $cond: [
                { $eq: [{ $type: '$pagamento' }, 'object'] },
                '$pagamento',
                {},
              ],
            },
          ],
        },
      },
    },
    {
      $set: {
        ...Object.fromEntries(requiredProfileStrings.map((field) => [
          `informacoes_usuario.${field}`,
          nullableString(`informacoes_usuario.${field}`),
        ])),
        'informacoes_usuario.data_criacao': {
          $cond: [
            { $in: [{ $type: '$informacoes_usuario.data_criacao' }, ['missing', 'null']] },
            now,
            '$informacoes_usuario.data_criacao',
          ],
        },
        'pagamento.situacao': {
          $cond: [
            { $in: [{ $type: '$pagamento.situacao' }, ['missing', 'null']] },
            0,
            '$pagamento.situacao',
          ],
        },
        'pagamento.tipo_pagamento': nullableString('pagamento.tipo_pagamento'),
        'pagamento.situacao_animacao': {
          $cond: [
            { $in: [{ $type: '$pagamento.situacao_animacao' }, ['missing', 'null']] },
            false,
            {
              $cond: [
                { $in: ['$pagamento.situacao_animacao', [0, 1]] },
                { $eq: ['$pagamento.situacao_animacao', 1] },
                '$pagamento.situacao_animacao',
              ],
            },
          ],
        },
        'pagamento.lista_pagamentos': {
          $cond: [
            { $in: [{ $type: '$pagamento.lista_pagamentos' }, ['missing', 'null']] },
            [],
            '$pagamento.lista_pagamentos',
          ],
        },
      },
    },
  ];
}

const validator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['_id', 'id_api', 'isPos_registration', 'informacoes_usuario', 'pagamento'],
    properties: {
      _id: { bsonType: 'objectId' },
      id_api: { bsonType: 'string' },
      isPos_registration: { bsonType: 'bool' },
      informacoes_usuario: {
        bsonType: 'object',
        required: [...requiredProfileStrings, 'data_criacao'],
        properties: {
          ...Object.fromEntries(requiredProfileStrings.map((field) => [field, { bsonType: 'string' }])),
          data_criacao: { bsonType: ['date', 'string'] },
        },
      },
      pagamento: {
        bsonType: 'object',
        required: ['situacao', 'tipo_pagamento', 'situacao_animacao', 'lista_pagamentos'],
        properties: {
          situacao: { enum: [0, 1, 2] },
          tipo_pagamento: { bsonType: 'string' },
          situacao_animacao: { bsonType: 'bool' },
          lista_pagamentos: { bsonType: 'array' },
        },
      },
    },
  },
};

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(configuredDatabase);
  const collection = db.collection('usuarios');
  const before = await audit(collection);
  const digest = createHash('sha256').update(JSON.stringify({
    database: configuredDatabase,
    validatorVersion,
    indexName,
    before,
  })).digest('hex');

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'check',
    database: configuredDatabase,
    validatorVersion,
    audit: before,
    digest,
  }, null, 2));

  if (!apply) {
    process.exitCode = before.blockingDocuments || before.duplicateCustomerIds ||
      before.numericFlags || before.numericPaymentAnimationFlags || before.missingShellFields ? 2 : 0;
  }
  else {
    if (confirmation !== digest) {
      throw new Error(`Confirmação inválida. Execute novamente com --apply --confirm ${digest}.`);
    }
    if (before.blockingDocuments > 0 || before.duplicateCustomerIds > 0) {
      throw new Error('Apply bloqueado: existem valores incompatíveis ou id_api duplicados para revisão manual.');
    }

    await collection.updateMany({}, migrationPipeline(new Date()));
    const after = await audit(collection);
    if (after.blockingDocuments > 0 || after.numericFlags > 0 || after.numericPaymentAnimationFlags > 0 || after.missingShellFields > 0 || after.duplicateCustomerIds > 0) {
      throw new Error(`Migração não zerou as violações: ${JSON.stringify(after)}.`);
    }

    await collection.createIndex(
      { id_api: 1 },
      {
        name: indexName,
        unique: true,
        partialFilterExpression: { id_api: { $type: 'string', $gt: '' } },
      },
    );
    await db.command({
      collMod: 'usuarios',
      validator,
      validationLevel: 'strict',
      validationAction: 'error',
    });

    console.log(JSON.stringify({ applied: true, after, indexName, validatorVersion }, null, 2));
  }
} finally {
  await client.close();
}
