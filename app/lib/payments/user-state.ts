import type { ClientSession, Db, ObjectId } from 'mongodb';

export async function setUnconfirmedPaymentSituation(input: {
    db: Db;
    owner: ObjectId;
    situation: 0 | 2;
    mongoSession?: ClientSession;
    errorCode?: string;
}): Promise<void> {
    const result = await input.db.collection('usuarios').updateOne(
        { _id: input.owner },
        [
            {
                $set: {
                    'pagamento.situacao': {
                        $cond: [
                            { $ne: ['$pagamento.situacao', 1] },
                            input.situation,
                            '$pagamento.situacao',
                        ],
                    },
                },
            },
        ],
        { session: input.mongoSession },
    );
    if (result.matchedCount !== 1) {
        throw new Error(input.errorCode || 'PAYMENT_SESSION_OWNER_UPDATE_FAILED');
    }
}

export function assertPaymentOwnerUpdate(
    result: { matchedCount?: number },
    errorCode = 'PAYMENT_SESSION_OWNER_UPDATE_FAILED',
): void {
    if (result.matchedCount !== 1) throw new Error(errorCode);
}
