///////
'use client'
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { useUser } from "@/lib/auth0-client"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import Link from "next/link";
import HeaderPainel from "@/components/HeaderPainel";
import Cards from 'react-credit-cards-2';
import { ILecture } from '@/lib/types/events/event.t';
import { IUser } from "@/app/lib/types/user/user.t"
import { ILoteAutomatico, IPaymentConfig } from '@/lib/types/payments/payment.t';
import TermModal, { ModalProps } from '@/components/TermModal';
import {
    Loader2,
    CreditCard,
    CheckCircle,
    AlertCircle,
    ShoppingCart,
    ArrowRight,
    Landmark,
    FileText,
    Sparkles,
    BarChart3,
    Clock
} from 'lucide-react';
import './style.css';
import PaymentTicketProps from '@/lib/types/payments/paymentTicket.t';

const Pagamentos = () => {
    const { user, isLoading } = useUser();
    const route = useRouter();
    const [isLoadingFetch, setIsLoadingFetch] = useState<boolean>(false);
    const [isLoadingPaymentData, setIsLoadingPaymentData] = useState<boolean>(true);
    const [dataPaymentConfig, setDataPaymentConfig] = useState<IPaymentConfig & { sessaoPagamentoAutomáticoAtiva: PaymentTicketProps | false } | undefined>(undefined);
    const [isModalError, setIsModalError] = useState<string | false>(false);
    const [data, setData] = useState<{ pagamento: IUser["pagamento"] }>(undefined);
    const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
    const [isModalPayment, setModalPayment] = useState<boolean>(false);

    const handleData = (event: any) => {
        setData(event);
    };

    const handleIsFetchingData = (event: boolean) => {
        setIsFetchingData(event);
    };

    const handleIsModalError = (event: string | false) => {
        setIsModalError(event);
    };

    const handleIsLoadingFetch = (event: boolean) => {
        setIsLoadingFetch(event);
    };

    const handlePostClick = async (paymentType: string) => {
        setDataModalProps((prev) => ({
            ...prev,
            isOpen: true,
            onConfirm: async () => {
                handleIsLoadingFetch(true);
                setDataModalProps((prev) => ({ ...prev, isOpen: false }))
                try {
                    const data = {
                        typePayment: paymentType
                    };
                    const response = await fetch('/api/payment/create_payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    if (!response.ok) {
                        throw new Error('Falha ao enviar a requisição POST');
                    }

                    const responseData: { link: string } = await response.json();
                    route.push(responseData.link);
                } catch (error) {
                    console.error('Erro ao enviar a requisição POST:', error);
                    handleIsLoadingFetch(false);
                    handleIsModalError("Ocorreu algum erro. Tente novamente mais tarde.");
                }
            }
        }))

    };

    const handlePostClick2 = async () => {
        handleIsLoadingFetch(true);
        try {
            if (!data || !data.pagamento.lista_pagamentos || data?.pagamento?.lista_pagamentos?.length === 0) {
                console.log("ERROR: !Data || !data.lista_pagamentos");
            }
            const statusFiltro = ["PENDING"];
            const filtroLinks = data.pagamento.lista_pagamentos.filter(item => statusFiltro.includes(item.status)).map(item => item.invoiceUrl)[0];
            console.log(data.pagamento)
            return
            handleIsLoadingFetch(false);
            route.push(filtroLinks);
        } catch (error) {
            console.log("ERROR: CATCH HANDLEPOSTCLICK2");
            console.log(error);
            handleIsLoadingFetch(false);
        }
    };

    const [dataModalProps, setDataModalProps] = useState<ModalProps>({
        isOpen: false,
        onClose: () => {
            setDataModalProps((prev) => ({ ...prev, isOpen: false }))
        },
        onConfirm: () => { }
    })

    useEffect(() => {
        const enviarRequisicaoGet = async () => {
            try {
                const response = await fetch("/api/get/usuariosPagamentos", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.log(response);
                    throw new Error('Falha ao enviar a requisição GET');
                }

                const responseData: { data: { pagamento: IUser["pagamento"] } } = await response.json();
                console.log('Resposta da requisição GET:', responseData);

                handleIsFetchingData(false);
                handleData(responseData.data);
            } catch (error) {
                console.error('Erro ao enviar a requisição GET:', error);
            }
        };

        if (!isLoading) {
            enviarRequisicaoGet();
        }
    }, [isLoading, user]);

    useEffect(() => {
        const enviarRequisicaoGet = async () => {
            try {
                const response = await fetch("/api/payment/paymentConfigs", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.log(response);
                    throw new Error('Falha ao enviar a requisição GET');
                }

                const responseData: IPaymentConfig = await response.json();
                setDataPaymentConfig(responseData);
            } catch (error) {
                console.error('Erro ao enviar a requisição GET:', error);
            } finally {
                setIsLoadingPaymentData(false);
            }
        };
        enviarRequisicaoGet();
    }, []);
    const hidratarPágina = async () => { // faz a mesma hidratacão do useEffect.
        const enviarRequisicaoGet = async () => {
            try {
                const response = await fetch("/api/payment/paymentConfigs", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    console.log(response);
                    throw new Error('Falha ao enviar a requisição GET');
                }

                const responseData: IPaymentConfig = await response.json();
                setDataPaymentConfig(responseData);
            } catch (error) {
                console.error('Erro ao enviar a requisição GET:', error);
            } finally {
                setIsLoadingPaymentData(false);
            }
        };
        enviarRequisicaoGet();
        try {
            const response = await fetch("/api/payment/paymentConfigs", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.log(response);
                throw new Error('Falha ao enviar a requisição GET');
            }

            const responseData: IPaymentConfig = await response.json();
            setDataPaymentConfig(responseData);
        } catch (error) {
            console.error('Erro ao enviar a requisição GET:', error);
        } finally {
            setIsLoadingPaymentData(false);
        }
    };

    if (isFetchingData || isLoadingPaymentData) {
        return <LoadingScreen />;
    }

    return (
        <div>
            {/* ---> ESSA TELA É EXCLUSIVAMENTE PARA OS PAGAMENTOS AUTOMATICOS <--- */}
            {
                dataPaymentConfig.modo == "automatico" &&
                (
                    dataPaymentConfig.sessaoPagamentoAutomáticoAtiva !== false ? (
                        <PaymentSessionActive dataPaymentConfig={dataPaymentConfig} hydratePage={hidratarPágina} />
                    ) :
                        <NotPayedYet dataPaymentConfig={dataPaymentConfig} hydratePage={hidratarPágina} />
                )
            }
        </div >
    );
};
//
function PaymentSessionActive({
    dataPaymentConfig,
    hydratePage
}: {
    dataPaymentConfig: IPaymentConfig & { sessaoPagamentoAutomáticoAtiva: PaymentTicketProps },
    hydratePage: () => void
}) {
    const [tempoRestante, setTempoRestante] = useState<string>("Calculando...");
    const [textError, setTextError] = useState<string | false>(false);
    const [paymentType, setpaymentType] = useState<"PIX" | "CREDIT_CARD" | "NONE">("NONE");

    const lote = dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.paymentConfig;

    useEffect(() => {
        const dataExpiracao = new Date(dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.expiresAt).getTime();

        const timer = setInterval(() => {
            const agora = new Date().getTime();
            const diferenca = dataExpiracao - agora;

            if (diferenca <= 0) {
                clearInterval(timer);
                setTempoRestante("00:00");
                setTextError("O tempo para realizar o pagamento expirou!  Mas não se preocupe, você pode tentar pagar novamente, com o valor atualizado.");
            } else {
                const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

                const minutosFormatados = String(minutos).padStart(2, '0');
                const segundosFormatados = String(segundos).padStart(2, '0');

                setTempoRestante(`${minutosFormatados}:${segundosFormatados}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.expiresAt, hydratePage]);

    return (
        <div className='pagamentos-main max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200'>

            {/* MODAL DE ERRO */}
            {textError && (
                <ModalError
                    texto={textError}
                    handleIsModalError={(value: string | false) => {
                        setTextError(false)
                        window.location.reload() // Recarrega a página para atualizar o lote vigente e permitir que o usuário tente pagar novamente
                    }
                    }
                />
            )}

            <div className='flex flex-col gap-6'>

                {/* CABEÇALHO DE SUCESSO E CRONÔMETRO */}
                <div className='flex items-center gap-2 text-emerald-600 font-bold w-full text-center'>
                    <h1 className='w-full text-center text-2xl font-bold text-slate-800'>{lote.nome}</h1>
                </div>
                <div className='flex flex-col sm:flex-row gap-4 justify-between items-center bg-emerald-50 p-4 rounded-lg border border-emerald-200'>
                    <div className='text-emerald-800 font-medium'>
                        🎉 Parabéns! Sua vaga está reservada.
                    </div>
                    <div className='bg-white px-4 py-2 rounded-md shadow-sm border border-red-200 text-red-600 font-bold flex items-center gap-2'>
                        <span className='text-sm uppercase tracking-wider text-red-400'>Tempo Restante:</span>
                        <span className='text-xl'>{tempoRestante}</span>
                    </div>
                </div>

                {/* RESUMO DO LOTE */}
                <div className='bg-slate-50 p-5 rounded-lg border border-slate-100 flex flex-col gap-3'>
                    <h2 className='text-lg font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2'>
                        Resumo do Pagamento - {lote.nome}
                    </h2>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                        <div className='flex flex-col gap-2'>
                            <p className='text-slate-700'><span className='font-semibold text-emerald-600'>PIX:</span> R$ {lote.precos.valorPix}</p>
                            <p className='text-slate-700'><span className='font-semibold'>Boleto:</span> R$ {lote.precos.valorBoleto}</p>
                            <p className='text-slate-700'><span className='font-semibold'>Débito:</span> R$ {lote.precos.valorDebito}</p>
                            <p className='text-slate-700'><span className='font-semibold'>Crédito à vista:</span> R$ {lote.precos.valorAVista}</p>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <span className='font-semibold text-indigo-600'>Opções de Parcelamento (Crédito):</span>
                            {lote.precos.parcelamentos.map((props, index) => (
                                <div key={index} className='text-slate-600 pl-2 border-l-2 border-indigo-200'>
                                    {props.totalParcelas}x de R$ {props.valorCadaParcela}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ESCOLHA DO MÉTODO DE PAGAMENTO */}
                <div className='flex flex-col gap-3 mt-2'>
                    <h3 className='font-semibold text-slate-700'>Como deseja pagar?</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <button
                            onClick={() => setpaymentType("PIX")}
                            className={`p-4 rounded-xl border-2 font-bold transition-all text-center ${paymentType === "PIX" ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300'}`}
                        >
                            Pagar com PIX
                        </button>
                        <button
                            onClick={() => setpaymentType("CREDIT_CARD")}
                            className={`p-4 rounded-xl border-2 font-bold transition-all text-center ${paymentType === "CREDIT_CARD" ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}
                        >
                            Cartão de Crédito
                        </button>
                    </div>
                </div>

                {/* RENDERIZAÇÃO CONDICIONAL DOS MÉTODOS */}
                <div className='mt-2'>
                    {paymentType === "PIX" && (
                        <div className='flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl gap-4'>
                            <p className='text-slate-600 font-medium text-center'>Escaneie o QR Code ou copie o código PIX</p>
                            <div className='w-48 h-48 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 font-bold'>
                                FOTO DO QR CODE
                            </div>
                            <button className='mt-2 px-6 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors'>
                                Copiar Código PIX
                            </button>
                        </div>
                    )}

                    <PaymentForm
                        isModalOpen={paymentType === "CREDIT_CARD"}
                        onClose={() => setpaymentType("NONE")}
                        dataPaymentConfig={dataPaymentConfig}
                        hydratePage={hydratePage}
                    />
                </div>

            </div>
        </div>
    );
}
//
function NotPayedYet({ dataPaymentConfig, hydratePage }: { dataPaymentConfig: any; hydratePage: () => void }) {
    const [step, setStep] = useState(0);
    const [textoModal, setTextoModal] = useState<string | false>(false);
    const [loadingModal, setLoadingModal] = useState<boolean>(false);
    const loteAtual = dataPaymentConfig.loteAutomaticoAtual;

    // Estado para guardar os dados do formulário
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        telefone: '',
        email: '',
    });

    // Estado para guardar mensagens de erro
    const [erros, setErros] = useState<{ [key: string]: string }>({});

    // --- NOVA FUNÇÃO DE VALIDAÇÃO DE E-MAIL ---
    const validarEmail = (email: string) => {
        // Expressão regular simples para validar formato nome@dominio.com
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validarCPF = (cpf: string) => {
        // Rejeita imediatamente se houver pontuação, letras ou se não tiver exatamente 11 números
        if (!/^\d{11}$/.test(cpf)) return false;

        // Rejeita CPFs com todos os números iguais (ex: 11111111111, 00000000000)
        if (!!cpf.match(/(\d)\1{10}/)) return false;

        let t = 9;
        for (let d = 0, c = 0; t < 11; t++) {
            for (d = 0, c = 0; c < t; c++) d += parseInt(cpf[c]) * ((t + 1) - c);
            d = ((10 * d) % 11) % 10;
            if (cpf[c] !== d.toString()) return false;
        }

        return true;
    };

    // Validação do Passo 1
    const handleAvancarParaPasso2 = () => {
        const novosErros: { [key: string]: string } = {};

        if (!formData.nome.trim()) novosErros.nome = 'O nome completo é obrigatório.';

        if (!formData.cpf.trim()) {
            novosErros.cpf = 'O CPF é obrigatório.';
        } else if (!validarCPF(formData.cpf)) {
            novosErros.cpf = 'CPF inválido. Verifique os números.';
        }

        // Validação de Telefone (adicionado para não deixar passar em branco)
        if (!formData.telefone.trim()) novosErros.telefone = 'O telefone é obrigatório.';

        // --- NOVA VALIDAÇÃO DE E-MAIL AQUI ---
        if (!formData.email.trim()) {
            novosErros.email = 'O e-mail é obrigatório.';
        } else if (!validarEmail(formData.email)) {
            novosErros.email = 'E-mail inválido. Verifique o formato.';
        }

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
        } else {
            setErros({});
            setStep(2);
        }
    };

    // Validação do Passo 2 (Finalizar)
    const handleGerarTicket = async () => {
        setLoadingModal(true);
        const novosErros: { [key: string]: string } = {};

        if (!formData.cep.trim()) novosErros.cep = 'O CEP é obrigatório.';
        if (!formData.rua.trim()) novosErros.rua = 'A rua é obrigatória.';
        if (!formData.numero.trim()) novosErros.numero = 'O número é obrigatório.';
        if (!formData.bairro.trim()) novosErros.bairro = 'O bairro é obrigatório.';

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            setLoadingModal(false); // Adicionado para tirar o loading se der erro de validação
            return;
        } else {
            setErros({});
            console.log('Ticket Gerado com sucesso!', formData);
        }

        const paymentPostResponse = await fetch(`/api/v1/payment/session/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, loteAtualFrontEnd: loteAtual }),
        });

        if (!paymentPostResponse.ok) {
            const errorData: any = await paymentPostResponse.json();
            setLoadingModal(false);
            hydratePage();
            setTextoModal(errorData.message || "Ocorreu um erro ao processar seu pagamento.");
            return;
        }

        // se Deu tudo certo, recarregar a página
        window.location.reload();
    };

    return (
        <div className='pagamentos-main'>
            {loadingModal && <LoadingModal />}
            {textoModal && <ModalError texto={textoModal} handleIsModalError={(value) => setTextoModal(value)} />}

            {/* ETAPA 0: INFORMAÇÕES E VALORES INICIAIS */}
            {step === 0 && (
                <div className='pagamentos-main max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200'>
                    <div className='flex flex-col gap-6'>
                        <div className='bg-amber-50 text-amber-800 p-4 rounded-lg border-l-4 border-amber-400 font-medium'>
                            Seu Pagamento ainda não foi confirmado.
                        </div>
                        <div className='flex flex-col gap-4'>
                            <h1 className='w-full text-2xl font-bold text-slate-800 text-center'>
                                {loteAtual?.nome ? `${loteAtual.nome}` : "Não foi possível identificar o lote atual."}
                            </h1>
                            <div className='text-slate-700 text-lg'>
                                <h1 className='inline font-bold text-indigo-600'>Atenção! Para os primeiros {loteAtual?.limiteVagas} participantes</h1> os valores são:
                            </div>
                            <div className='bg-slate-50 p-5 rounded-lg border border-slate-100 flex flex-col gap-3'>
                                {
                                    dataPaymentConfig.pagamentosAceitos.map((tipoPagamento: string, index: number) => {
                                        return (
                                            <div key={index} className='text-slate-800'>
                                                {tipoPagamento === "PIX" && <p className='font-semibold text-emerald-600'>- PIX: R$ {loteAtual?.precos.valorPix}</p>}
                                                {tipoPagamento === "BOLETO" && <p className='font-medium'>- BOLETO: R$ {loteAtual?.precos.valorBoleto}</p>}
                                                {tipoPagamento === "CREDIT_CARD" && <p className='font-medium text-indigo-600'>- CRÉDITO: <br /> {loteAtual?.precos.parcelamentos.map((parcela: any, idx: number) => <span key={idx} className='text-slate-600 font-normal ml-4 block mt-1'>► {idx + 1}. vez. {parcela.totalParcelas} parcelas de R$ {parcela.valorCadaParcela}</span>)}</p>}
                                                {tipoPagamento === "DEBIT_CARD" && <p className='font-medium'>- DÉBITO: R$ {loteAtual?.precos.valorDebito}</p>}
                                            </div>
                                        )
                                    })
                                }
                                <div className='mt-4 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-center font-medium text-sm'>
                                    Preencha suas informações e você terá 15 minutos para realizar seu pagamento no valor prometido.
                                </div>

                                <button
                                    onClick={() => setStep(1)}
                                    className='w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors'
                                >
                                    Preencher Informações de Pagamento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ETAPAS 1 e 2: FORMULÁRIOS COM CABEÇALHO FIXO COM TODOS OS VALORES */}
            {step > 0 && (
                <div className='max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200'>

                    {/* CABEÇALHO FIXO */}
                    <div className='mb-6 border-b border-slate-200 pb-6'>
                        <h2 className='text-xl font-bold text-slate-800 mb-4'>Finalizar Pagamento</h2>

                        <div className='bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-2 mb-4 text-sm'>
                            <p className='font-bold text-slate-700 mb-1'>Valores do Lote Atual:</p>
                            {
                                dataPaymentConfig.pagamentosAceitos.map((tipoPagamento: string, index: number) => {
                                    return (
                                        <div key={index} className='text-slate-800'>
                                            {tipoPagamento === "PIX" && <p className='font-semibold text-emerald-600'>- PIX: R$ {loteAtual?.precos.valorPix}</p>}
                                            {tipoPagamento === "BOLETO" && <p className='font-medium'>- BOLETO: R$ {loteAtual?.precos.valorBoleto}</p>}
                                            {tipoPagamento === "CREDIT_CARD" && <p className='font-medium text-indigo-600'>- CRÉDITO: <br /> {loteAtual?.precos.parcelamentos.map((parcela: any, idx: number) => <span key={idx} className='text-slate-600 font-normal ml-4 block mt-1'>► {idx + 1}. vez. {parcela.totalParcelas} parcelas de R$ {parcela.valorCadaParcela}</span>)}</p>}
                                            {tipoPagamento === "DEBIT_CARD" && <p className='font-medium'>- DÉBITO: R$ {loteAtual?.precos.valorDebito}</p>}
                                        </div>
                                    )
                                })
                            }
                        </div>

                        <div className='bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 font-medium text-sm text-center'>
                            Após concluir este formulário, você terá 15 minutos para pagar e garantir sua vaga no valor acima.
                        </div>
                    </div>

                    {/* ETAPA 1: DADOS PESSOAIS */}
                    {step === 1 && (
                        <div className='flex flex-col gap-4'>
                            <h3 className='font-semibold text-slate-700 mb-2'>Passo 1: Dados Pessoais</h3>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Nome Completo do Pagador</label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: João da Silva"
                                    className={`w-full border rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 ${erros.nome ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                />
                                {erros.nome && <span className="text-red-500 text-xs mt-1 block">{erros.nome}</span>}
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>CPF - Sem pontuação</label>
                                <input
                                    type="text"
                                    value={formData.cpf}
                                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                    placeholder="00000000000"
                                    maxLength={14}
                                    className={`w-full border rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 ${erros.cpf ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                />
                                {erros.cpf && <span className="text-red-500 text-xs mt-1 block">{erros.cpf}</span>}
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Telefone</label>
                                <input
                                    type="text"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                    className={`w-full border rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 ${erros.telefone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                />
                                {erros.telefone && <span className="text-red-500 text-xs mt-1 block">{erros.telefone}</span>}
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>e-mail</label>
                                <input
                                    type="text"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="exemplo@email.com"
                                    className={`w-full border rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 ${erros.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                />
                                {erros.email && <span className="text-red-500 text-xs mt-1 block">{erros.email}</span>}
                            </div>

                            <div className='flex justify-between mt-4'>
                                <button onClick={() => setStep(0)} className='text-slate-500 hover:text-slate-700 font-medium px-4 py-2'>
                                    Voltar
                                </button>
                                <button onClick={handleAvancarParaPasso2} className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors'>
                                    Próximo Passo
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ETAPA 2: ENDEREÇO */}
                    {step === 2 && (
                        <div className='flex flex-col gap-4'>
                            <h3 className='font-semibold text-slate-700 mb-2'>Passo 2: Endereço</h3>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>CEP - Sem pontuação</label>
                                <input
                                    type="text"
                                    value={formData.cep}
                                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                                    placeholder="00000000"
                                    className={`w-full border rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 ${erros.cep ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                />
                                {erros.cep && <span className="text-red-500 text-xs mt-1 block">{erros.cep}</span>}
                            </div>

                            <div className='grid grid-cols-4 gap-4'>
                                <div className='col-span-3'>
                                    <label className='block text-sm font-medium text-slate-700 mb-1'>Rua / Logradouro</label>
                                    <input
                                        type="text"
                                        value={formData.rua}
                                        onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                                        className={`w-full border rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 ${erros.rua ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                    />
                                    {erros.rua && <span className="text-red-500 text-xs mt-1 block">{erros.rua}</span>}
                                </div>
                                <div className='col-span-1'>
                                    <label className='block text-sm font-medium text-slate-700 mb-1'>Número</label>
                                    <input
                                        type="text"
                                        value={formData.numero}
                                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                        className={`w-full border rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 ${erros.numero ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                    />
                                    {erros.numero && <span className="text-red-500 text-xs mt-1 block">{erros.numero}</span>}
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Complemento (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.complemento}
                                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                    placeholder="Apto, Bloco, Casa 2..."
                                    className='w-full border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-slate-700 mb-1'>Bairro</label>
                                <input
                                    type="text"
                                    value={formData.bairro}
                                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                    className={`w-full border rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 ${erros.bairro ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                />
                                {erros.bairro && <span className="text-red-500 text-xs mt-1 block">{erros.bairro}</span>}
                            </div>
                            <div className='flex justify-between mt-4'>
                                <button onClick={() => setStep(1)} className='text-slate-500 hover:text-slate-700 font-medium px-4 py-2'>
                                    Voltar
                                </button>
                                <button onClick={handleGerarTicket} className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors'>
                                    Gerar Ticket de Pagamento
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

//
// Tela de carregamento com imagem
const LoadingScreen = () => {
    return (
        <div className="pagamentos-main">
            <div className="status-section">
                <div className="status-container glass-container">
                    <div className="loading-container">
                        <div className="loading-image"></div>
                        <div className="loading-spinner">
                            <Loader2 className="spinner-icon" />
                        </div>
                        <h2 className="loading-text">CARREGANDO PAGAMENTOS</h2>
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal de carregamento
const LoadingModal = () => {
    return (
        <div className="loading-modal">
            <div className="loading-modal-content">
                <Loader2 className="loading-modal-spinner" />
                <p className="loading-modal-text">Processando pagamento...</p>
            </div>
        </div>
    );
};

// Componente de erro (mantido do código original)
const ModalError = ({ texto, handleIsModalError }: { texto: string; handleIsModalError: (value: string | false) => void }) => {
    return (
        <div className="loading-modal">
            <div className="loading-modal-content">
                <div className="form-content">
                    <div className="form-header">
                        <div className="form-icon">
                            <AlertCircle size={20} />
                        </div>
                        <h3 className="form-title">Erro</h3>
                    </div>
                    <p className="intro-text">{texto}</p>
                    <button
                        className="form-button"
                        onClick={() => handleIsModalError(false)}
                    >
                        <CheckCircle size={18} style={{ marginRight: '8px' }} />
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente de formulário de pagamento (mantido do código original)
const PaymentForm = ({ isModalOpen, onClose, dataPaymentConfig, hydratePage }: { isModalOpen: boolean; onClose: () => void, dataPaymentConfig: IPaymentConfig & { sessaoPagamentoAutomáticoAtiva: PaymentTicketProps }; hydratePage: () => void }) => {
    const [step, setStep] = useState(1); // 1 para informações pessoais, 2 para informações do cartão
    const [messageModalWarning2, setMessageModalWarning2] = useState("")
    const [messageModalWarning, setMessageModalWarning] = useState("")
    const [textoPagamentoEscolhido, setTextoPagametoEscolhido] = useState("")
    const [personalInfo, setPersonalInfo] = useState({
        name: dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.userProps.name || '',
        email: dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.userProps.email || '',
        cpfCnpj: dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.userProps.cpf || '',
        postalCode: dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.userProps.zipCode || '',
        addressNumber: dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.userProps.number || '',
        phone: dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.userProps.phone || '',
    });
    const [cardInfo, setCardInfo] = useState<{
        number: string,
        expiry: string,
        cvc: string,
        name: string,
        focus: "name" | "number" | "expiry" | "cvc" | ""
    }>({
        number: '',
        expiry: '',
        cvc: '',
        name: '',
        focus: '',
    });
    const [isConfirmationOpen, setConfirmationOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [idPagamento, setIdPagamento] = useState(undefined)
    const [dataModalProps, setDataModalProps] = useState<ModalProps>({
        isOpen: false,
        onClose: () => {
            setDataModalProps((prev) => ({ ...prev, isOpen: false }))
        },
        onConfirm: () => { }
    })
    //

    useEffect(() => {/*
        const fetchData = async () => {
            try {
                const response = await fetch('/api/payment/paymentConfigs', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar dados');
                }

                const data: IPaymentConfig = await response.json();
                setData(data)
                setLoading(false)
                // console.log('Dados recebidos:', data);

                // Faça algo com os dados aqui

            } catch (error) {
                setLoading(false)
                setMessageModalWarning("Erro ao buscar dados. Por favor recarregue a página e tente novamente. Caso o problema persista, entre em contato com a equipe CIEPS.")
                console.error('Erro ao buscar dados:', error);
            }
        };
        fetchData();
    */}, []);

    const handleIdPagamento = (id) => {
        setIdPagamento(id)
    }

    const handlePersonalInfoChange = (evt) => {
        const { name, value } = evt.target;
        setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleCardInfoChange = (evt) => {
        const { name, value } = evt.target;

        if (name === 'expiry') {
            const cleanedValue = value.replace(/\D/g, '');
            let formattedValue = cleanedValue.slice(0, 4);
            if (formattedValue.length > 2) {
                formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
            }
            setCardInfo((prev) => ({ ...prev, [name]: formattedValue }));
        } else if (name === 'cvc' && value.length > 4) {
            return;
        }
        else if (name == 'number' && value.length > 19) {
            return;
        }
        else {
            setCardInfo((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCardInfoFocus = (evt) => {
        setCardInfo((prev) => ({ ...prev, focus: evt.target.name }));
    };

    const handleSubmitPersonalInfo = (evt) => {
        evt.preventDefault();
        if (isPersonalInfoValid()) {
            setStep(2);
        }
    };

    const handleSubmitCardInfo = (evt) => {
        evt.preventDefault();
        setConfirmationOpen(true);
    };

    const handleConfirm = async () => {
        // …………
        setDataModalProps((prev) => ({
            ...prev,
            isOpen: true,
            onConfirm: async () => {
                setConfirmationOpen(false);
                setLoading(true);
                setDataModalProps((prev) => ({ ...prev, isOpen: false }))
                try {
                    // Crie o payload com as informações pessoais e de pagamento
                    const payload = {
                        personalInfo,
                        cardInfo,
                        idPagamento,
                        _id: dataPaymentConfig._id,
                        sessionId: dataPaymentConfig.sessaoPagamentoAutomáticoAtiva._id,
                    };

                    // Envie o POST request com o JSON
                    const response = await fetch('/api/v1/payment/session/creditCard/', { //
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });
                    const result: { message: string } = await response.json();
                    if (!response.ok) {
                        //console.log(result)
                        if (response.status === 409) {
                            setMessageModalWarning(result.message)
                        }
                        throw new Error(result.message || "Aconteceu algum erro desconhecido");
                    }

                    setLoading(false);

                    setMessageModalWarning(result.message)
                    setCardInfo({
                        number: '',
                        expiry: '',
                        cvc: '',
                        name: '',
                        focus: '',
                    });
                    // Feche o modal e faça o que for necessário após o sucesso
                } catch (error) {
                    // AQUI
                    setLoading(false);
                    // Verificando se o erro é o CEP
                    if ("Informe o endereço do titular do cartão.".includes(error.message)) {
                        error.message = "Informe um CEP válido."
                    }

                    setMessageModalWarning2(`${error.message}`)
                    // Lide com erros de forma apropriada

                }

            }
        }))

    };

    const handleCancel = () => {
        setConfirmationOpen(false);
    };

    const isPersonalInfoValid = () => {
        return validateName(personalInfo.name) &&
            validateEmail(personalInfo.email) &&
            validateCpfCnpj(personalInfo.cpfCnpj) &&
            personalInfo.postalCode &&
            personalInfo.addressNumber &&
            personalInfo.phone;
    };

    const validateName = (name) => name.length > 5;

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validateCpfCnpj = (cpfCnpj) => cpfCnpj.length >= 11; // Adapte conforme necessário

    const isCardInfoValid = () => {
        return cardInfo.number.length > 0 &&
            idPagamento &&
            cardInfo.expiry.length === 5 &&
            cardInfo.cvc.length > 0 &&
            cardInfo.name.length > 0;
    };


    if (!isModalOpen) return null;

    return (
        <>
            <TermModal {...dataModalProps} />
            <ResponseModal message={messageModalWarning} />
            <ResponseModal2 message={messageModalWarning2} handleModalClose={() => {
                setMessageModalWarning2("")
                window.location.reload()
            }} />
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                <div className='relative bg-white p-6 rounded-lg shadow-lg w-full max-w-lg overflow-auto h-[90%]'>
                    <button
                        onClick={() => {
                            setCardInfo({
                                number: '',
                                expiry: '',
                                cvc: '',
                                name: '',
                                focus: '',
                            })
                            setStep(1)

                            onClose()
                        }}
                        className='flex justify-center font-bold text-center rounded-full absolute top-2 right-2 w-7 h-7 text-white bg-red-500'
                    >
                        <span>x</span>
                    </button>
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className='flex justify-center font-bold text-center absolute top-2 left-2 px-1 py-[0.5px] text-white bg-red-500 rounded-xl'
                        >
                            <span>VOLTAR</span>
                        </button>
                    )}
                    {step === 1 && (
                        <form onSubmit={handleSubmitPersonalInfo} className=''>
                            <div className='text-center font-bold text-[#3e4095] text-[20px] mb-5'>
                                <h1>Informações Pessoais</h1>
                            </div>
                            <div className='flex flex-col space-y-3'>
                                <input
                                    className='text-black mb-2 p-2 border rounded'
                                    type="text"
                                    name="name"
                                    placeholder="Nome Completo"
                                    value={personalInfo.name}
                                    onChange={handlePersonalInfoChange}
                                />
                                <input
                                    className='text-black mb-2 p-2 border rounded'
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={personalInfo.email}
                                    onChange={handlePersonalInfoChange}
                                />
                                <input
                                    className='text-black mb-2 p-2 border rounded'
                                    type="tel"
                                    name="cpfCnpj"
                                    placeholder="CPF"
                                    value={personalInfo.cpfCnpj}
                                    onChange={handlePersonalInfoChange}
                                />
                                <input
                                    className='text-black mb-2 p-2 border rounded'
                                    type="tel"
                                    name="postalCode"
                                    placeholder="CEP"
                                    value={personalInfo.postalCode}
                                    onChange={handlePersonalInfoChange}
                                />
                                <input
                                    className='text-black mb-2 p-2 border rounded'
                                    type="tel"
                                    name="addressNumber"
                                    placeholder="Número da Residência"
                                    value={personalInfo.addressNumber}
                                    onChange={handlePersonalInfoChange}
                                />
                                <input
                                    className='text-black mb-2 p-2 border rounded'
                                    type="tel"
                                    name="phone"
                                    placeholder="DDD + Telefone"
                                    value={personalInfo.phone}
                                    onChange={handlePersonalInfoChange}
                                />
                                <button
                                    type="submit"
                                    className={`bg-blue-500 text-white py-2 px-4 rounded font-bold text-[20px] ${isPersonalInfoValid() ? '' : 'opacity-50 cursor-not-allowed'}`}
                                    disabled={!isPersonalInfoValid()}
                                >
                                    Continuar
                                </button>
                            </div>
                        </form>
                    )}
                    {step === 2 && (
                        <div className=''>
                            <div className='text-center font-bold text-[#3e4095] text-[20px] mb-5'>
                                <h1>{dataPaymentConfig.nome || "PAGAMENTOS"}</h1>
                            </div>
                            <Cards
                                locale={{ valid: 'Validade', }}
                                placeholders={{ name: "SEU NOME AQUI" }}
                                number={cardInfo.number}
                                expiry={cardInfo.expiry}
                                cvc={cardInfo.cvc}
                                name={cardInfo.name}
                                focused={cardInfo.focus}
                            />
                            <form onSubmit={handleSubmitCardInfo} className='pt-3'>
                                <div className='flex flex-col text-black space-y-3'>
                                    <input
                                        className='text-black mb-2 p-2 border rounded'
                                        type="number"
                                        name="number"
                                        placeholder="Número do Cartão"
                                        value={cardInfo.number}
                                        onChange={handleCardInfoChange}
                                        onFocus={handleCardInfoFocus}
                                    />
                                    <input
                                        className='text-black mb-2 p-2 border rounded'
                                        type="text"
                                        name="name"
                                        placeholder="Nome no Cartão"
                                        value={cardInfo.name}
                                        onChange={handleCardInfoChange}
                                        onFocus={handleCardInfoFocus}
                                    />
                                    <input
                                        className='text-black mb-2 p-2 border rounded'
                                        type="text"
                                        name="expiry"
                                        placeholder="Data Vencimento"
                                        value={cardInfo.expiry}
                                        onChange={handleCardInfoChange}
                                        onFocus={handleCardInfoFocus}
                                    />
                                    <input
                                        className='text-black mb-2 p-2 border rounded'
                                        type="number"
                                        name="cvc"
                                        placeholder="Número CVC"
                                        value={cardInfo.cvc}
                                        onChange={handleCardInfoChange}
                                        onFocus={handleCardInfoFocus}
                                    />
                                    <div className='pt-2'>
                                        <div className='text-center'>
                                            <div>
                                                <p className='font-bold text-[#3e4095]'>
                                                    OPÇÕES DE PARCELAMENTO
                                                </p>
                                            </div>
                                            <div className='font-bold pb-8 text-[#3e4095]'>
                                                <p>
                                                    Escolha uma das {dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.paymentConfig.precos.parcelamentos.length} opções de parcelamento disponíveis:
                                                </p>
                                            </div>
                                        </div>
                                        <div className='space-y-3'>
                                            {

                                                dataPaymentConfig.sessaoPagamentoAutomáticoAtiva.paymentConfig.precos.parcelamentos?.map((value) => {
                                                    return (
                                                        <div key={value.codigo} className={`p-5 cursor-pointer ${value.codigo == idPagamento ? 'bg-red-600' : "bg-yellow-100"}`} onClick={() => {
                                                            handleIdPagamento(value.codigo)
                                                            setTextoPagametoEscolhido(
                                                                `Você escolheu realizar o pagamento em ${value.totalParcelas} parcelas de R$ ${value.valorCadaParcela.toFixed(2)}, totalizando R$${(value.valorCadaParcela * value.totalParcelas).toFixed(2)}`
                                                            )

                                                        }}
                                                        >
                                                            <div>
                                                                <p className='text-white font-bold'>
                                                                    {value.codigo == idPagamento ? "SELECIONADO" : ""}
                                                                </p>
                                                            </div>
                                                            <h1>
                                                                Quero realizar o pagamento em <span className='font-bold'>{value.totalParcelas} parcelas de R${value.valorCadaParcela.toFixed(2)}</span>, totalizando <span className='font-bold'>R${(value.valorCadaParcela * value.totalParcelas).toFixed(2)}</span>.
                                                            </h1>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className={`bg-red-600 text-white py-2 px-4 rounded font-bold text-[20px] ${isCardInfoValid() ? '' : 'opacity-50 cursor-not-allowed'}`}
                                        disabled={!isCardInfoValid()}
                                    >
                                        PAGAR
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Confirmação */}
            {isConfirmationOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-2'>
                    <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-lg'>
                        <h2 className='text-center font-bold text-[#3e4095] text-[20px] mb-5'>Confirmar Pagamento</h2>
                        <p className='text-black'>{textoPagamentoEscolhido}.</p>
                        <div className='flex justify-center space-x-4'>
                            <button
                                onClick={handleConfirm}
                                className='bg-blue-500 text-white py-2 px-4 rounded font-bold'
                            >
                                Sim
                            </button>
                            <button
                                onClick={handleCancel}
                                className='bg-red-500 text-white py-2 px-4 rounded font-bold'
                            >
                                Não
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Spinner */}
            {isLoading && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
                    <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-lg'>
                        <h2 className='text-center font-bold text-[#3e4095] text-[20px] mb-5'>Processando...</h2>
                        <div className='flex justify-center'>
                            <div className='spinner-border animate-spin' role='status'>
                                <span className='sr-only'>Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const ResponseModal = ({ message }: { message: string }) => {
    if (!message) {
        return;
    }
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-lg'>
                <p className='text-center mb-5 text-black'>{message}</p>
                <div className='flex justify-center space-x-4'>
                    <button
                        onClick={() => { window.location.reload(); }}
                        className='bg-gray-500 text-white py-2 px-4 rounded font-bold'
                    >
                        Recarregar Página
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResponseModal2 = ({ handleModalClose, message }: { handleModalClose, message: string }) => {
    if (!message) {
        return;
    }
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-lg'>
                <p className='text-center mb-5 text-black'>{message}</p>
                <div className='flex justify-center space-x-4'>
                    <button
                        onClick={handleModalClose}
                        className='bg-gray-500 text-white py-2 px-4 rounded font-bold'
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

const CardPagamentos = ({ eventId, type, data_formatada, invoiceNumber, status, description, valor, invoiceUrl }: {
    eventId: string, type: string, data_formatada: any, invoiceNumber: string, status: string, description: string, valor: number, invoiceUrl: string
}) => {
    // Arrumando a DATA
    //
    //
    const [typeText, setTypeText] = useState<ILecture["name"]>("CARREGANDO ATIVIDADE")

    useEffect(() => {
        // Defina a função assíncrona dentro do `useEffect`
        async function fetchData() {
            try {
                if (type == "activity" && typeText == "CARREGANDO ATIVIDADE") {
                    // Execute operações assíncronas aqui
                    const response = await fetch(`/api/get/atividadeNomePeloId/${eventId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    if (!response.ok) {
                        setTypeText("ERRO AO CARREGAR NOME")
                        return;
                    }
                    const responseJson: { data: ILecture["name"] | null | undefined } = await response.json()
                    if (!responseJson.data || Object.keys(responseJson.data).length === 0) {
                        // Se o dado for null, undefined ou um objeto vazio, saia.
                        setTypeText("Minicurso não encontrado")
                        return;
                    }

                    setTypeText(responseJson.data)
                }
            } catch (error) {
                setTypeText("ERRO AO CARREGAR NOME")
                console.error('Erro ao buscar dados:', error);
            }
        }

        // Chame a função assíncrona
        fetchData();
    }, [typeText, eventId, type]);
    //
    /*
        Dicionário
        ACTIVE => Aguardando
    
    */
    switch (true) { // "Traduz o que está escrito no status."
        case status == "PAYMENT_CONFIRMED" || status == "CONFIRMED" || status == "PAYMENT_RECEIVED":
            status = "PAGO"
            break
        case status == "PAYMENT_OVERDUE":
            status = "CANCELADO"
            break
        case status == "PENDING":
            status = "PAGAMENTO PENDENTE"
            break

        case status == "PAYMENT_REFUNDED":
            status = "COBRANÇA ESTORNADA"
            break
        case status == "PAYMENT_REFUND_DENIED":
            status = "ESTORNO NEGADO"
            break
        case status == "PAYMENT_PARTIALLY_REFUNDED":
            status = "PARCIALMENTE ESTORNADO"
            break
        case status == "PAYMENT_REFUND_IN_PROGRESS":
            status = "PROCESSANDO ESTORNO"
            break
    }

    return (
        <div className="history-card">
            <div className="card-header">
                <div className="card-value-badge">
                    <span className="currency">R$</span>
                    <span className="amount">{valor}</span>
                </div>
                <div className="card-status">
                    <span className={`status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {status}
                    </span>
                </div>
            </div>

            <div className="card-content">
                {type === "activity" && (
                    <div className="activity-name">
                        <h4 className="activity-title">{typeText}</h4>
                    </div>
                )}

                <div className="card-details">
                    <div className="detail-row">
                        <div className="detail-item">
                            <span className="detail-label">Data:</span>
                            <span className="detail-value">{data_formatada}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Descrição:</span>
                            <span className="detail-value">{description}</span>
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-item">
                            <span className="detail-label">Número:</span>
                            <span className="detail-value">#{invoiceNumber}</span>
                        </div>
                    </div>
                </div>

                {status !== "CANCELADO" && (
                    <div className="card-actions">
                        <Link
                            target="_blank"
                            prefetch={false}
                            href={invoiceUrl}
                            className="invoice-link"
                        >
                            <span className="link-text">Ver comprovante</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}


export default Pagamentos;

