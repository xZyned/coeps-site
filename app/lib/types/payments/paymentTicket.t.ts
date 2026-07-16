import { ObjectId } from 'bson';
import { ILoteAutomatico } from './payment.t';
//
//
export default interface PaymentTicketProps {
    _id: ObjectId;
    orderId: string;
    owner: ObjectId;
    pixCode: string | null;
    userProps: {
        name: string,
        cpf: number,
        zipCode: number,
        street: string,
        number: number,
        neighborhood: string,
        complement: string,
        phone: string,
        email: string
    },
    paymentConfig: ILoteAutomatico;
    type: "ticket" | "course";
    status: "PENDING" | "PAID" | "UNPAID";
    paymentUrl: string;
    expiresAt: Date;
}