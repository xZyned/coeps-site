import { ObjectId } from 'bson';
import { ILoteAutomatico } from './payment.t';
//
//
export default interface PaymentTicketProps {
    _id: ObjectId;
    orderId: ObjectId;
    owner: ObjectId;
    pixCode: string;
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
    paymentUrl: string;
    expiresAt: Date;
}