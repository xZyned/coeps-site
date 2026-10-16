'use client';

// Textos da Política de Privacidade (LGPD) e dos Termos de Uso, exibidos no
// cadastro e no pedido de reaceite. Ao alterar qualquer texto, troque
// LGPD_CONSENT_VERSION em app/lib/registration-consent.ts.

const sectionTitle = 'font-bold text-base text-[var(--cieps-ink)]';
const sectionBody = 'mt-1 text-[var(--cieps-muted)]';

function PrivacyPolicyText() {
    return (
        <>
            <h2 className="cieps-display text-lg font-semibold text-[var(--cieps-ink)]">Política de Privacidade (LGPD)</h2>
            <p>
                Em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong>, solicitamos o seu consentimento para a coleta e tratamento dos seus dados pessoais.
            </p>

            <div>
                <h3 className={sectionTitle}>1. Finalidade do Tratamento</h3>
                <div className={`${sectionBody} space-y-2`}>
                    <p>Os dados fornecidos neste formulário (incluindo Nome, CPF, contato, endereço e dados acadêmicos) serão utilizados exclusivamente para:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Viabilizar sua inscrição e participação no evento;</li>
                        <li>Emissão de credenciais, certificados e documentos fiscais legais;</li>
                        <li>Envio de comunicações importantes referentes ao evento, logística e pagamentos;</li>
                        <li>Geração de dados estatísticos anonimizados para a organização.</li>
                    </ul>
                </div>
            </div>

            <div>
                <h3 className={sectionTitle}>2. Compartilhamento de Dados</h3>
                <p className={sectionBody}>
                    Garantimos que suas informações não serão comercializadas ou cedidas a terceiros sem relação direta com o evento. O compartilhamento ocorrerá estritamente com plataformas parceiras operacionais (como gateways de pagamento e sistemas de credenciamento) que também cumprem com as normas de segurança da LGPD.
                </p>
            </div>

            <div>
                <h3 className={sectionTitle}>3. Segurança da Informação</h3>
                <p className={sectionBody}>
                    Seus dados serão armazenados em ambiente seguro, protegido contra acessos não autorizados, perdas ou alterações, pelo tempo necessário para o cumprimento das finalidades descritas ou obrigações legais (como guarda de notas fiscais).
                </p>
            </div>

            <div>
                <h3 className={sectionTitle}>4. Direitos do Titular</h3>
                <p className={sectionBody}>
                    Você tem o direito de solicitar, a qualquer momento, o acesso, a correção, a anonimização ou a exclusão dos seus dados de nossa base, ressalvadas as obrigações legais de retenção.
                </p>
            </div>
        </>
    );
}

function TermsOfUseText() {
    return (
        <>
            <h2 className="cieps-display text-lg font-semibold text-[var(--cieps-ink)]">Termos de Uso</h2>
            <p>
                Estes Termos regulam o uso da plataforma e a inscrição no <strong>CIEPS — Congresso Internacional de Estudantes e Profissionais da Saúde</strong>. Ao utilizar a plataforma, você declara que leu e concorda com eles.
            </p>

            <div>
                <h3 className={sectionTitle}>1. Conta de Acesso</h3>
                <p className={sectionBody}>
                    A conta é pessoal. Você é responsável por manter seus dados de acesso em sigilo, por todas as ações realizadas com a sua conta e pela veracidade das informações cadastradas, inclusive o nome que constará nos certificados.
                </p>
            </div>

            <div>
                <h3 className={sectionTitle}>2. Inscrição Pessoal e Intransferível</h3>
                <p className={sectionBody}>
                    A inscrição é vinculada exclusivamente à pessoa que a adquiriu, identificada pelo CPF e pela conta cadastrados. Ela não pode ser revendida, cedida, transferida ou compartilhada com outra pessoa, seja de forma gratuita ou paga, o que inclui a credencial de acesso e o QR Code do evento. No credenciamento poderá ser solicitado documento oficial com foto, e inscrições utilizadas por terceiros ou em desacordo com esta regra poderão ser canceladas pela organização.
                </p>
            </div>

            <div>
                <h3 className={sectionTitle}>3. Pagamentos</h3>
                <p className={sectionBody}>
                    Os pagamentos são processados por plataforma parceira. A inscrição é confirmada somente após a confirmação do pagamento, e os valores seguem o lote vigente no momento da compra. Pedidos de cancelamento e reembolso seguem o Código de Defesa do Consumidor e o edital do evento.
                </p>
            </div>

            <div>
                <h3 className={sectionTitle}>4. Trabalhos Científicos</h3>
                <p className={sectionBody}>
                    Ao submeter um trabalho, você declara ser autor ou estar autorizado pelos demais autores, responde pelo seu conteúdo e concorda com as regras do edital, incluindo a publicação nos anais do evento quando o trabalho for aprovado.
                </p>
            </div>

            <div>
                <h3 className={sectionTitle}>5. Uso Adequado da Plataforma</h3>
                <p className={sectionBody}>
                    É proibido usar a plataforma para fins ilícitos, tentar acessar contas ou dados de outras pessoas, ou interferir no seu funcionamento. O descumprimento destes Termos pode levar à suspensão da conta e ao cancelamento da inscrição.
                </p>
            </div>

            <div>
                <h3 className={sectionTitle}>6. Alterações e Contato</h3>
                <p className={sectionBody}>
                    Estes Termos e a Política de Privacidade podem ser atualizados, e um novo aceite será solicitado quando isso acontecer. Dúvidas podem ser enviadas para <a className="underline" href="mailto:dadg.imepac@gmail.com">dadg.imepac@gmail.com</a>.
                </p>
            </div>
        </>
    );
}

function ConsentCheckbox({ checked, onChange, children }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children: React.ReactNode;
}) {
    return (
        <label className="flex items-start space-x-3 cursor-pointer rounded-lg border border-[var(--cieps-line)] p-3 sm:p-4 transition-colors hover:bg-[var(--cieps-paper)]">
            <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-[var(--cieps-red)] focus:ring-[var(--cieps-red)]"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="text-sm font-medium leading-snug">{children}</span>
        </label>
    );
}

export default function ConsentTerms({ lgpdAccepted, termsAccepted, onLgpdChange, onTermsChange }: {
    lgpdAccepted: boolean;
    termsAccepted: boolean;
    onLgpdChange: (checked: boolean) => void;
    onTermsChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex flex-col space-y-4 text-[0.95rem] text-[var(--cieps-ink)]">
            <div className="max-h-[50vh] md:max-h-[40vh] overflow-y-auto rounded-md border border-[var(--cieps-line)] bg-[var(--cieps-paper)] p-3 sm:p-5 shadow-inner text-sm space-y-4">
                <PrivacyPolicyText />
                <hr className="border-[var(--cieps-line)]" />
                <TermsOfUseText />
            </div>

            <ConsentCheckbox checked={lgpdAccepted} onChange={onLgpdChange}>
                Li e concordo com o tratamento dos meus dados pessoais para as finalidades descritas na Política de Privacidade, nos termos da Lei nº 13.709/2018 (LGPD).
            </ConsentCheckbox>
            <ConsentCheckbox checked={termsAccepted} onChange={onTermsChange}>
                Li e aceito os Termos de Uso, incluindo que minha inscrição é pessoal e intransferível.
            </ConsentCheckbox>
        </div>
    );
}
