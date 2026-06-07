'use client'
import { useUser } from "@/lib/auth0-client"
import { useRouter } from 'next/navigation';
// import Image from "next/image"; // Omitido pois não estava em uso, mas pode manter se for usar depois
import { useState, useEffect } from "react";
import TelaLoading from "@/app/components/TelaLoading";

export default function UpdateData() {
    const { user, error, isLoading } = useUser();
    const router = useRouter()

    // Estados antigos
    const [value_name, setValueName] = useState('');
    const [value_telefone, setValueTelefone] = useState('');
    const [value_cpf, setValueCpf] = useState('');

    // Novos estados
    const [value_cidade, setValueCidade] = useState('');
    const [value_data_nascimento, setValueDataNascimento] = useState('');
    const [value_situacao, setValueSituacao] = useState(''); // 'formado' ou 'estudante'
    const [value_curso, setValueCurso] = useState('');
    const [value_ano, setValueAno] = useState('');
    const [value_semestre, setValueSemestre] = useState('');

    const [avisoErro, setAvisoErro] = useState('')
    const [isLoadingForms, setIsLoadingForms] = useState(0)

    const handleChangeAvisoErro = (event) => setAvisoErro(event);
    const handleChangeSetIsLoadingForms = (bool) => setIsLoadingForms(bool);

    // Handlers
    const handleChangeName = (event) => setValueName(event.target.value);
    const handleChangeTelefone = (event) => setValueTelefone(event.target.value);
    const handleChangeCpf = (event) => setValueCpf(event.target.value);
    const handleChangeCidade = (event) => setValueCidade(event.target.value);
    const handleChangeDataNascimento = (event) => setValueDataNascimento(event.target.value);
    const handleChangeSituacao = (event) => setValueSituacao(event.target.value);
    const handleChangeCurso = (event) => setValueCurso(event.target.value);
    const handleChangeAno = (event) => setValueAno(event.target.value);
    const handleChangeSemestre = (event) => setValueSemestre(event.target.value);

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

            switch (true) { // NAME
                case (value_name.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Nome Completo"`)
                    return 0
                case (value_name.trim().length <= 4):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Nome Completo" com mais de 4 caracteres`)
                    return 0
            }
            switch (true) { // Número de Telefone
                case (!/^\d+$/.test(value_telefone.trim())):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Número de telefone" com apenas números`)
                    return 0
                case (value_telefone.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Número de telefone"`)
                    return 0
                case (value_telefone.trim().length <= 4):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Número de telefone" com mais de 4 caracteres`)
                    return 0
            }
            switch (true) { // Cpf
                case (!/^\d+$/.test(value_cpf.trim())):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Cpf" com apenas números`)
                    return 0
                case (value_cpf.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Cpf"`)
                    return 0
                case (value_cpf.trim().length <= 4):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Cpf" com mais de 4 caracteres`)
                    return 0
            }
            switch (true) { // Novos campos comuns
                case (value_cidade.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Cidade onde reside"`)
                    return 0
                case (value_data_nascimento.trim() == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Preencha o campo "Data de Nascimento"`)
                    return 0
                case (value_situacao == ""):
                    handleChangeSetIsLoadingForms(0)
                    handleChangeAvisoErro(`Selecione se você é "Formado" ou "Estudante"`)
                    return 0
            }
            switch (true) { // Campos acadêmicos condicionais
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

            // Agora que ele sobreviveu aos switch's, ele pode fazer o fetch.
            const response = await fetch('/api/post/updateData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "nome": value_name,
                    "numero_telefone": value_telefone,
                    "cpf": value_cpf,
                    "cidade": value_cidade,
                    "data_nascimento": value_data_nascimento,
                    "situacao_academica": value_situacao,
                    "curso": value_curso,
                    "ano_conclusao": value_ano,
                    "semestre_conclusao": value_semestre
                })
            })

            if (!response.ok) {
                const responseJson = await response.json()
                console.log(responseJson)
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
        <div className={`flex flex-col justify-center content-center items-center align-top lg:align-middle min-h-dvh py-10 space-y-6 lg:space-y-12`} >
            <AvisoModal texto={avisoErro} handler={handleChangeAvisoErro} />
            {
                isLoadingForms ? (
                    <div className={`z-50 text-black absolute text-[30px] lg:text-[40px] font-extralight blur-none animate-pulse`}>
                        <h1>CARREGANDO</h1>
                    </div>
                ) : null
            }
            <div className={`${avisoErro || isLoadingForms ? "cursor-not-allowed blur-sm" : ""} w-[90%] lg:w-[35%]`}>
                <div className="flex flex-col shadow-2xl rounded-2xl p-5 lg:p-10 bg-white">
                    <div className="text-center">
                        <h1 className="font-semibold text-black text-[30px] lg:text-[30px] font-coeps">PRIMEIROS PASSOS</h1>
                    </div>
                    <div>
                        <p className="text-slate-950 text-center">Antes de continuar, precisamos de algumas informações para concluir seu cadastro. Não se preocupe, vai ser rapidinho!</p>
                    </div>
                    <div className="flex flex-col space-y-6 pt-4">

                        {/* Dados Pessoais */}
                        <div className="flex flex-col space-y-1">
                            <h1 className="text-slate-950">Nome completo</h1>
                            <InputComponent placeholder="Digite seu nome" value={value_name} onChange={handleChangeName} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1">
                                <h1 className="text-slate-950">Número de telefone</h1>
                                <InputComponent type_text="number" placeholder="Apenas números" value={value_telefone} onChange={handleChangeTelefone} />
                            </div>
                            <div className="flex flex-col space-y-1">
                                <h1 className="text-slate-950">CPF</h1>
                                <InputComponent type_text="number" placeholder="Apenas números" value={value_cpf} onChange={handleChangeCpf} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1">
                                <h1 className="text-slate-950">Cidade onde reside</h1>
                                <InputComponent placeholder="Sua cidade" value={value_cidade} onChange={handleChangeCidade} />
                            </div>
                            <div className="flex flex-col space-y-1">
                                <h1 className="text-slate-950">Data de nascimento</h1>
                                <InputComponent type_text="date" value={value_data_nascimento} onChange={handleChangeDataNascimento} />
                            </div>
                        </div>

                        {/* Situação Acadêmica */}
                        <div className="flex flex-col space-y-2 border-t pt-4">
                            <h1 className="text-slate-950 font-semibold">Situação Acadêmica</h1>
                            <div className="flex space-x-4 text-black">
                                <label className="flex items-center space-x-2">
                                    <input type="radio" name="situacao" value="estudante" onChange={handleChangeSituacao} checked={value_situacao === 'estudante'} />
                                    <span>Sou Estudante</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="radio" name="situacao" value="formado" onChange={handleChangeSituacao} checked={value_situacao === 'formado'} />
                                    <span>Já sou Formado</span>
                                </label>
                            </div>
                        </div>

                        {/* Campos Dinâmicos (Renderizados apenas se escolher uma situação) */}
                        {value_situacao && (
                            <div className="flex flex-col space-y-4 bg-gray-50 p-4 rounded-lg border">
                                <div className="flex flex-col space-y-1">
                                    <h1 className="text-slate-950">Qual é o seu curso?</h1>
                                    <InputComponent placeholder="Ex: Medicina / Fisioterapia / Enfermagem" value={value_curso} onChange={handleChangeCurso} />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="flex flex-col space-y-1">
                                        <h1 className="text-slate-950">
                                            {value_situacao === 'formado' ? "Ano de formação" : "Ano de conclusão"}
                                        </h1>
                                        <InputComponent type_text="number" placeholder="Ex: 2024" value={value_ano} onChange={handleChangeAno} />
                                    </div>
                                    <div className="flex flex-col space-y-1 text-black">
                                        <h1 className="text-slate-950">
                                            Semestre
                                        </h1>
                                        <select
                                            className="px-4 py-2 border rounded-lg focus:outline-none bg-white h-full"
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

                        {/* Botão Concluir */}
                        <div className="pt-5">
                            <button
                                disabled={isLoadingForms || avisoErro}
                                className={`${avisoErro || isLoadingForms ? "cursor-not-allowed opacity-50" : ""} w-full p-3 rounded text-white bg-[#3E4095] font-semibold transition-all`}
                                onClick={fetchData}
                            >
                                CONCLUIR
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
        return <></>
    }
    return (
        <div className="flex flex-col justify-center items-center content-center z-50 absolute bg-white text-black p-10 space-y-10 shadow-2xl mx-3 rounded-xl border">
            <h1 className="text-lg text-center font-medium">{texto}</h1>
            <button className="bg-[#3E4095] rounded text-white px-8 py-2 font-semibold"
                onClick={() => { handler("") }}
            >FECHAR</button>
        </div>
    )
}

const InputComponent = ({ type_text = "text", placeholder, value, onChange }) => {
    return (
        <div className="flex flex-col text-black">
            <input
                type={type_text}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-[#3E4095] bg-white transition-colors"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};