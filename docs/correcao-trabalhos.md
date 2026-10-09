# Correção de trabalhos

A correção é autorizada pelo status `Necessita de Alteração`, independentemente do prazo de submissão. Apenas o dono pode reenviar. Título, modalidade e autores permanecem preservados; tópicos e novos anexos são enviados para uma nova avaliação.

## Arquivos e compatibilidade

- Os requisitos e o limite de tamanho vêm da configuração da modalidade salva no trabalho. Cada reenvio aceita até um novo arquivo por requisito; não é obrigatório reenviar todos os arquivos.
- `PUT /api/put/academicWork` mantém o corpo `{ academicWork, newFiles }`. O cliente novo envia `_id`, `userId` e `topicos` em `academicWork`, e `{ fileId, slotIndex }` em `newFiles`.
- Metadados enviados pelo navegador são ignorados. Nome, URL, data, tamanho e tipo vêm de `trabalhos_blob`, com validação do proprietário e da finalidade `correction`.
- Clientes antigos sem `slotIndex` continuam aceitos quando os arquivos podem ser distribuídos entre os requisitos por formato e tamanho.
- O vínculo dos uploads e a atualização do trabalho ocorrem na mesma transação. Reenvio duplicado ou mudança de status não acrescentam anexos novamente.
- Arquivos anteriores permanecem na lista; esta alteração não cria um sistema de substituição/versionamento. Registros antigos sem data recebem uma indicação neutra na interface.
- A remoção de uploads pendentes também aceita `purpose: correction`, sempre protegendo arquivos de terceiros ou já vinculados. A interface limpa respostas tardias de uploads removidos e informa falhas de limpeza.

## Verificação sem serviços reais

Os testes em `app/lib/__tests__/academic-work-correction.test.ts`, `correction-upload.test.ts`, `correction-form.test.ts` e `pending-work-file.test.ts` executam as rotas, o formulário e o fluxo de upload com dependências simuladas. A suíte de exclusão também cobre a concorrência com correções. Nenhum deles inicia ou consulta MongoDB.

```sh
npm run test:auth-entry
npm run typecheck
npm run lint
npm run build -- --webpack
```

## Publicação

Publicar primeiro a proteção de datas no admin e depois o site. Não são necessárias migrações, novos índices, ajustes de configuração ou reparos em massa no banco. A infraestrutura de transações já é utilizada pela submissão e exclusão de trabalhos.

Homologação autenticada e upload real no ambiente publicado são verificações separadas dos testes locais. Confirmar um reenvio após o fechamento, a abertura dos anexos no admin e uma segunda rodada de parecer/correção. Qualquer operação direta no banco continua sujeita à autorização específica do responsável.
