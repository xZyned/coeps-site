'use client'
import { useUser } from "@/lib/auth0-client"
import { useRouter } from 'next/navigation';
import { useState } from "react";
import TelaLoading from "@/app/components/TelaLoading";

const PAISES = [
    "Afeganistão", "África do Sul", "Albânia", "Alemanha", "Andorra", "Angola", "Antígua e Barbuda", "Arábia Saudita", "Argélia", "Argentina", "Armênia", "Austrália", "Áustria", "Azerbaijão", "Bahamas", "Bangladesh", "Barbados", "Bahrein", "Bélgica", "Belize", "Benim", "Bielorrússia", "Bolívia", "Bósnia e Herzegovina", "Botsuana", "Brasil", "Brunei", "Bulgária", "Burquina Faso", "Burundi", "Butão", "Cabo Verde", "Camarões", "Camboja", "Canadá", "Catar", "Cazaquistão", "Chade", "Chile", "China", "Chipre", "Colômbia", "Comores", "Congo-Brazzaville", "Coreia do Norte", "Coreia do Sul", "Costa do Marfim", "Costa Rica", "Croácia", "Cuba", "Dinamarca", "Djibuti", "Dominica", "Egito", "El Salvador", "Emirados Árabes Unidos", "Equador", "Eritreia", "Eslováquia", "Eslovênia", "Espanha", "Essuatíni", "Estados Unidos", "Estônia", "Etiópia", "Fiji", "Filipinas", "Finlândia", "França", "Gabão", "Gâmbia", "Gana", "Geórgia", "Granada", "Grécia", "Guatemala", "Guiana", "Guiné", "Guiné Equatorial", "Guiné-Bissau", "Haiti", "Honduras", "Hungria", "Iêmen", "Ilhas Marshall", "Índia", "Indonésia", "Irã", "Iraque", "Irlanda", "Islândia", "Israel", "Itália", "Jamaica", "Japão", "Jordânia", "Kiribati", "Kuwait", "Laos", "Lesoto", "Letônia", "Líbano", "Libéria", "Líbia", "Liechtenstein", "Lituânia", "Luxemburgo", "Macedônia do Norte", "Madagascar", "Malásia", "Malaui", "Maldivas", "Mali", "Malta", "Marrocos", "Maurício", "Mauritânia", "México", "Mianmar", "Micronésia", "Moçambique", "Moldávia", "Mônaco", "Mongólia", "Montenegro", "Namíbia", "Nauru", "Nepal", "Nicarágua", "Níger", "Nigéria", "Noruega", "Nova Zelândia", "Omã", "Países Baixos", "Palau", "Panamá", "Papua Nova Guiné", "Paquistão", "Paraguai", "Peru", "Polônia", "Portugal", "Quênia", "Quirguistão", "Reino Unido", "República Centro-Africana", "República Checa", "República Democrática do Congo", "República Dominicana", "Romênia", "Ruanda", "Rússia", "Samoa", "San Marino", "Santa Lúcia", "São Cristóvão e Neves", "São Tomé e Príncipe", "São Vicente e Granadinas", "Seicheles", "Senegal", "Serra Leoa", "Sérvia", "Singapura", "Síria", "Somália", "Sri Lanka", "Sudão", "Sudão do Sul", "Suécia", "Suíça", "Suriname", "Tailândia", "Tajiquistão", "Tanzânia", "Timor-Leste", "Togo", "Tonga", "Trinidad e Tobago", "Tunísia", "Turcomenistão", "Turquia", "Tuvalu", "Ucrânia", "Uganda", "Uruguai", "Uzbequistão", "Vanuatu", "Vaticano", "Venezuela", "Vietnã", "Zâmbia", "Zimbábue"
];

export default function UpdateData() {
    const { user, isLoading } = useUser();
    const router = useRouter()

    // Estados Pessoais
    const [value_name, setValueName] = useState('');
    const [value_email, setValueEmail] = useState('');
    const [value_telefone, setValueTelefone] = useState('');
    const [value_cpf, setValueCpf] = useState('');
    const [value_data_nascimento, setValueDataNascimento] = useState('');

    // Estados de Endereço (Novos)
    const [value_pais, setValuePais] = useState('Brasil');
    const [value_postalCode, setValuePostalCode] = useState('');
    const [value_address, setValueAddress] = useState('');
    const [value_addressNumber, setValueAddressNumber] = useState('');
    const [value_complement, setValueComplement] = useState('');
    const [value_province, setValueProvince] = useState(''); // Bairro/Província
    const [value_city, setValueCity] = useState(''); // Código da cidade (int32)
    const [value_cidade_nome, setValueCidadeNome] = useState(''); // Apenas visual/complementar se precisar

    // Estados Acadêmicos / Outros
    const [value_situacao, setValueSituacao] = useState(''); // 'formado' ou 'estudante'
    const [value_curso, setValueCurso] = useState('');
    const [value_ano, setValueAno] = useState('');
    const [value_semestre, setValueSemestre] = useState('');
    const [value_onde_conheceu, setValueOndeConheceu] = useState('');

    const [avisoErro, setAvisoErro] = useState('')
    const [isLoadingForms, setIsLoadingForms] = useState(0)

    const handleChangeAvisoErro = (event) => setAvisoErro(event);
    const handleChangeSetIsLoadingForms = (bool) => setIsLoadingForms(bool);

    // Handlers
    const handleChangeName = (event) => setValueName(event.target.value);
    const handleChangeTelefone = (event) => setValueTelefone(event.target.value);
    const handleChangeCpf = (event) => setValueCpf(event.target.value);
    const handleChangeDataNascimento = (event) => setValueDataNascimento(event.target.value);

    const handleChangePais = (event) => setValuePais(event.target.value);
    const handleChangePostalCode = (event) => setValuePostalCode(event.target.value);
    const handleChangeAddress = (event) => setValueAddress(event.target.value);
    const handleChangeAddressNumber = (event) => setValueAddressNumber(event.target.value);
    const handleChangeComplement = (event) => setValueComplement(event.target.value);
    const handleChangeProvince = (event) => setValueProvince(event.target.value);
    const handleChangeCity = (event) => setValueCity(event.target.value);
    const handleChangeCidadeNome = (event) => setValueCidadeNome(event.target.value);

    const handleChangeSituacao = (event) => setValueSituacao(event.target.value);
    const handleChangeCurso = (event) => setValueCurso(event.target.value);
    const handleChangeAno = (event) => setValueAno(event.target.value);
    const handleChangeSemestre = (event) => setValueSemestre(event.target.value);
    const handleChangeOndeConheceu = (event) => setValueOndeConheceu(event.target.value);

    if (isLoading) {
        return <TelaLoading />
    }

    if (!user) {
        router.push('/')
        return <></>
    }

    const fetchData = async () => {
        if (isLoadingForms) {
            return 0
        }
        try {
            handleChangeSetIsLoadingForms(1)

            switch (true) { // NOME & EMAIL
                case (value_name.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Nome Completo"`)
                    return 0
                case (value_name.trim().length <= 4):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Nome Completo" com mais de 4 caracteres`)
                    return 0
                case (value_email.trim() == "" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value_email)):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha um "E-mail" válido`)
                    return 0
            }
            switch (true) { // TELEFONE
                case (!/^\d+$/.test(value_telefone.trim())):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Número de telefone" com apenas números`)
                    return 0
                case (value_telefone.trim().length <= 4):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Número de telefone" corretamente`)
                    return 0
            }
            switch (true) { // CPF/CNPJ
                case (!/^\d+$/.test(value_cpf.trim())):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "CPF" com apenas números`)
                    return 0
                case (value_cpf.trim().length < 11):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`O "CPF/CNPJ" deve ter no mínimo 11 caracteres`)
                    return 0
            }
            switch (true) { // ENDEREÇO & OUTROS
                case (value_postalCode.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "CEP"`)
                    return 0
                case (value_address.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Rua/Logradouro"`)
                    return 0
                case (value_addressNumber.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o "Número" do endereço`)
                    return 0
                case (value_province.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha a "Província/Bairro"`)
                    return 0
                case (value_city.trim() == "" || !/^\d+$/.test(value_city.trim())):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o "Código da Cidade" apenas com números`)
                    return 0
                case (value_data_nascimento.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Data de Nascimento"`)
                    return 0
                case (value_onde_conheceu.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Onde conheceu o evento"`)
                    return 0
                case (value_situacao == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Selecione se você é "Formado" ou "Estudante"`)
                    return 0
            }
            switch (true) { // ACADÊMICOS
                case (value_curso.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o seu "Curso"`)
                    return 0
                case (!/^\d+$/.test(value_ano.trim()) || value_ano.trim().length !== 4):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o "Ano" com 4 números válidos (ex: 2024)`)
                    return 0
                case (value_semestre == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Selecione o "Semestre"`)
                    return 0
            }

            // Payload rigorosamente tipado para evitar crashes no Banco
            const response = await fetch('/api/post/updateData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "name": value_name,
                    "cpfCnpj": value_cpf,
                    "email": value_email,
                    "phone": value_telefone,
                    "address": value_address,
                    "addressNumber": parseInt(value_addressNumber, 10), // Garantindo tipagem int32
                    "complement": value_complement.substring(0, 255), // Limite de 255 caracteres
                    "province": value_province,
                    "postalCode": value_postalCode,
                    "city": parseInt(value_city, 10), // Garantindo tipagem int32
                    
                    // Campos legados ou extras do formulário
                    "pais": value_pais,
                    "cidade_nome": value_cidade_nome,
                    "data_nascimento": value_data_nascimento,
                    "onde_conheceu": value_onde_conheceu,
                    "situacao_academica": value_situacao,
                    "curso": value_curso,
                    "ano_conclusao": value_ano,
                    "semestre_conclusao": value_semestre
                })
            })

            if (!response.ok) {
                const responseJson = await response.json()
                handleChangeAvisoErro(responseJson.message)
                handleChangeSetIsLoadingForms(0)
                throw new Error('Erro ao carregar os dados');
            }
            router.push('/pagamentos')
        } catch (error) {
            console.error('Erro na requisição:', error);
        } finally {
            handleChangeSetIsLoadingForms(0)
        }
    };

    return (
        <div className={`flex flex-col justify-center content-center items-center align-top lg:align-middle min-h-dvh py-10 space-y-6 lg:space-y-12 bg-gray-50`} >
            <AvisoModal texto={avisoErro} handler={handleChangeAvisoErro} />
            {
                isLoadingForms ? (
                    <div className={`z-50 text-black absolute text-[30px] lg:text-[40px] font-extralight blur-none animate-pulse`}>
                        <h1>CARREGANDO</h1>
                    </div>
                ) : null
            }
            <div className={`${avisoErro || isLoadingForms ? "cursor-not-allowed blur-sm" : ""} w-[90%] lg:w-[40%] max-w-3xl`}>
                <div className="flex flex-col shadow-xl rounded-2xl p-5 lg:p-10 bg-white border border-slate-100">
                    <div className="text-center mb-6">
                        <h1 className="font-semibold text-slate-900 text-[26px] lg:text-[30px]">PRIMEIROS PASSOS</h1>
                        <p className="text-slate-600 mt-2">Antes de continuar, precisamos de algumas informações para concluir seu cadastro.</p>
                    </div>

                    <div className="flex flex-col space-y-8">
                        
                        {/* SEÇÃO 1: Dados Pessoais */}
                        <div className="flex flex-col space-y-4">
                            <h2 className="text-lg font-bold text-[#3E4095] border-b pb-2">Dados Pessoais</h2>
                            
                            <div className="flex flex-col space-y-1">
                                <h1 className="text-sm font-semibold text-slate-700">Nome completo</h1>
                                <InputComponent placeholder="Digite seu nome" value={value_name} onChange={handleChangeName} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-sm font-semibold text-slate-700">CPF / CNPJ</h1>
                                    <InputComponent type_text="number" placeholder="Apenas números" value={value_cpf} onChange={handleChangeCpf} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-sm font-semibold text-slate-700">Número de telefone</h1>
                                    <InputComponent type_text="number" placeholder="DDD + Número" value={value_telefone} onChange={handleChangeTelefone} />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-sm font-semibold text-slate-700">Data de nascimento</h1>
                                    <InputComponent type_text="date" value={value_data_nascimento} onChange={handleChangeDataNascimento} />
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO 2: Endereço */}
                        <div className="flex flex-col space-y-4">
                            <h2 className="text-lg font-bold text-[#3E4095] border-b pb-2">Endereço</h2>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-sm font-semibold text-slate-700">CEP</h1>
                                    <InputComponent type_text="number" placeholder="Apenas números" value={value_postalCode} onChange={handleChangePostalCode} />
                                </div>
                                <div className="flex flex-col space-y-1 text-black">
                                    <h1 className="text-sm font-semibold text-slate-700">País</h1>
                                    <select
                                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#3E4095] bg-white h-full"
                                        value={value_pais}
                                        onChange={handleChangePais}
                                    >
                                        <option value="" disabled>Selecione seu país</option>
                                        {PAISES.map((pais) => (
                                            <option key={pais} value={pais}>{pais}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col space-y-1 col-span-2">
                                    <h1 className="text-sm font-semibold text-slate-700">Rua / Logradouro</h1>
                                    <InputComponent placeholder="Ex: Av. Paulista" value={value_address} onChange={handleChangeAddress} />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-sm font-semibold text-slate-700">Número</h1>
                                    <InputComponent type_text="number" placeholder="Ex: 1000" value={value_addressNumber} onChange={handleChangeAddressNumber} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-sm font-semibold text-slate-700">Complemento (Opcional)</h1>
                                    <InputComponent placeholder="Apto, Bloco..." value={value_complement} onChange={handleChangeComplement} />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-sm font-semibold text-slate-700">Bairro / Província</h1>
                                    <InputComponent placeholder="Seu bairro" value={value_province} onChange={handleChangeProvince} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-sm font-semibold text-slate-700">CEP</h1>
                                    <InputComponent type_text="number" placeholder="Ex: 3550308" value={value_city} onChange={handleChangeCity} />
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-sm font-semibold text-slate-700">Nome da Cidade</h1>
                                    <InputComponent placeholder="Ex: São Paulo" value={value_cidade_nome} onChange={handleChangeCidadeNome} />
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO 3: Situação Acadêmica */}
                        <div className="flex flex-col space-y-4">
                            <h2 className="text-lg font-bold text-[#3E4095] border-b pb-2">Acadêmico & Outros</h2>

                            <div className="flex flex-col space-y-1 mb-2">
                                <h1 className="text-sm font-semibold text-slate-700">Onde conheceu o evento?</h1>
                                <InputComponent placeholder="Ex: Instagram, Amigos..." value={value_onde_conheceu} onChange={handleChangeOndeConheceu} />
                            </div>

                            <h1 className="text-sm font-semibold text-slate-700">Situação Acadêmica atual</h1>
                            <div className="flex space-x-6 text-slate-800">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="situacao" value="estudante" onChange={handleChangeSituacao} checked={value_situacao === 'estudante'} className="w-4 h-4 text-[#3E4095] focus:ring-[#3E4095]" />
                                    <span>Sou Estudante</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="situacao" value="formado" onChange={handleChangeSituacao} checked={value_situacao === 'formado'} className="w-4 h-4 text-[#3E4095] focus:ring-[#3E4095]" />
                                    <span>Já sou Formado</span>
                                </label>
                            </div>

                            {value_situacao && (
                                <div className="flex flex-col space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 mt-2">
                                    <div className="flex flex-col space-y-1">
                                        <h1 className="text-sm font-semibold text-slate-700">Qual é o seu curso?</h1>
                                        <InputComponent placeholder="Ex: Medicina / Enfermagem" value={value_curso} onChange={handleChangeCurso} />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="flex flex-col space-y-1">
                                            <h1 className="text-sm font-semibold text-slate-700">
                                                {value_situacao === 'formado' ? "Ano de formação" : "Ano de conclusão"}
                                            </h1>
                                            <InputComponent type_text="number" placeholder="Ex: 2024" value={value_ano} onChange={handleChangeAno} />
                                        </div>
                                        <div className="flex flex-col space-y-1 text-black">
                                            <h1 className="text-sm font-semibold text-slate-700">Semestre</h1>
                                            <select
                                                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#3E4095] bg-white h-full"
                                                value={value_semestre}
                                                onChange={handleChangeSemestre}
                                            >
                                                <option value="" disabled>Selecione</option>
                                                <option value="1">1º Semestre</option>
                                                <option value="2">2º Semestre</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botão Concluir */}
                        <div className="pt-2">
                            <button
                                disabled={isLoadingForms || avisoErro}
                                className={`${avisoErro || isLoadingForms ? "cursor-not-allowed opacity-50" : "hover:bg-[#2c2e73] shadow-md hover:shadow-lg"} w-full p-4 rounded-xl text-white bg-[#3E4095] font-bold text-lg transition-all`}
                                onClick={fetchData}
                            >
                                SALVAR E CONTINUAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AvisoModal({ texto, handler }) {
    if (!texto) {
        return null
    }
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[100] p-4 backdrop-blur-sm transition-all">
            <div className="flex flex-col justify-center items-center bg-white text-slate-900 p-8 space-y-6 shadow-2xl rounded-2xl border max-w-sm w-full animate-in zoom-in-95">
                <h1 className="text-lg text-center font-medium">{texto}</h1>
                <button className="bg-[#3E4095] hover:bg-[#2c2e73] rounded-lg text-white px-8 py-3 font-semibold transition-colors w-full"
                    onClick={() => { handler("") }}
                >
                    ENTENDI
                </button>
            </div>
        </div>
    )
}

const InputComponent = ({ type_text = "text", placeholder, value, onChange }) => {
    return (
        <div className="flex flex-col text-black">
            <input
                type={type_text}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E4095]/20 focus:border-[#3E4095] bg-white transition-all w-full placeholder:text-slate-400"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};