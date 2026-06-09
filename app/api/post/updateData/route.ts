import { connectToDatabase } from '../../../lib/mongodb'
import { ObjectId } from 'bson';
import { getSession, withApiAuthRequired } from '@/lib/auth0-compat';
import { IUser } from '@/lib/types/user/user.t';

//
//
// Aqui ele sempre pega os mesmos parametros para realizar o update.
// assim, SEMPRE ENNVIE NESSE FORMATO: {cpf, numero_telefone, nome}
/** @type {any} */
export const POST = withApiAuthRequired(async function POST(request) {
    try {
        // Puxando informações
        const { user } = await getSession();
        const userId = user.sub.replace("auth0|", ""); // Retirando o auth0|  

        if (!userId) {
            return Response.json({ "erro": "!userId" })
        }

        const ASAAS_API_KEY = process.env.ASAAS_API_KEY //process.env.ASAAS_API_KEY
        const ASAAS_API_URL = process.env.ASAAS_API_URL + "/customers"

        const data = await request.json()

        const { db } = await connectToDatabase();

        const userDb: IUser | null = await db.collection('usuarios').findOne({ "_id": new ObjectId(userId) })
        if (!userDb) {
            const b = new ObjectId(userId)
            //
            // Para não ficar criando um Customer novo sempre, vou verificar se já existe. Caso exista, 
            // vamos apenas atualiza-lo. Caso contrário, será criado normalmente.
            const options = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    access_token: ASAAS_API_KEY
                },
                body: JSON.stringify({
                    'name': data.nome,
                    'email': user.email,
                    'cpfCnpj': data.cpf,
                    'mobilePhone': data.numero_telefone,
                    'observations': userId,
                    'notificationDisabled': true,
                    "externalReference": userId,
                })
            }
            //
            var id_api = ""
            const response = await fetch(ASAAS_API_URL, options)
            // console.log(responseJson)
            if (!response.ok) {
                const errorText = await response.json()
                throw ({ "message": errorText.errors[0].description })
            }
            var responseJson = await response.json()
            id_api = responseJson.id
            //
            //
            //
            const userInsert: IUser = {
                _id: b,
                id_api: id_api,
                isPos_registration: true,
                informacoes_usuario: {
                    cpf: data.cpf,
                    numero_telefone: data.numero_telefone,
                    nome: data.nome,
                    email: data.email,
                    data_criacao: '',
                    titulo_honorario: ''
                },
                pagamento: {
                    _id: b,
                    situacao: 0,
                    lista_pagamentos: [],
                    situacao_animacao: false,
                    tipo_pagamento: ''
                }
            }
            await db.collection('usuarios').insertOne(userInsert)
            return Response.json({ "sucesso": "Ocorreu Tudo Certo!" })
        }
        // Se o userDb existir, vamos apenas atualizar os dados
        //
        // Para não ficar criando um Customer novo sempre, vou verificar se já existe. Caso exista, 
        // vamos apenas atualiza-lo. Caso contrário, será criado normalmente.
        const options = {
            method: 'PUT',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                access_token: ASAAS_API_KEY
            },
            body: JSON.stringify({
                'name': data.nome,
                'email': user.email,
                'cpfCnpj': data.cpf,
                'mobilePhone': data.numero_telefone,
                'observations': userId,
                'notificationDisabled': true,
                "externalReference": userId,
            })
        }
        //
        const response = await fetch(ASAAS_API_URL+`${userDb.id_api}`, options)
        if (!response.ok) {
            const errorText = await response.json()
            throw ({ "message": errorText.errors[0].description })
        }
        var responseJson = await response.json()
        await db.collection('usuarios').findOneAndUpdate({ "_id": userId }, {
            "$set": {
                'isPos_registration': true,
                'informacoes_usuario.nome': data.nome,
                'informacoes_usuario.cpf': data.cpf,
                'informacoes_usuario.numero_telefone': data.numero_telefone,
            }
        })
        return Response.json({ "sucesso": "Ocorreu Tudo Certo!" })
        /**
         'isPos_registration':1, // Sempre colocar 1 para ele nao voltar ai de novo
            'nome': data.nome,
            'numero_telefone': data.numero_telefone,
            'cpf': data.cpf
            
            */
    }
    catch (error) {
        return Response.json({ "message": error.message || "Ocorreu um erro desconhecido. Recarregue a página e tente novamente. Caso o erro persista, entre em contato com a equipe CIEPS." }, { status: 500 })
    }


})
