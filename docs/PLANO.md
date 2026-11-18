# Plano do projeto Mentor-Mentee

Fontes: `Mentor-mente Program.docx`, `Mentor Mentee - Agreement.docx`, planilha `Mentor Mentee 2.0.xlsx` (abas: Interested people, Mentor subscription, Mentee subscription, 1st Mentee Evaluation, 1st Mentor evaluation) e o código atual (registry, gateway, auth, core, app).

## 1. O que o programa exige

Fluxo do piloto, na ordem:

1. Mentor e mentee preenchem o cadastro (um formulário para cada papel).
2. Coordenação faz o match.
3. Coordenação propõe o par aos dois, sem expor a identidade antes do aceite.
4. Os dois aceitam. Coordenação envia e-mail de apresentação.
5. Os dois assinam o acordo (mentor, mentee e coordenador).
6. Encontros mensais por vídeo, mínimo 1 hora. Mentor informa data e hora à coordenação.
7. Check-in individual após 2 semanas. Lembrar: certificado exige no mínimo 5 encontros satisfatórios, avaliados por cada um.
8. Avaliação a cada 6 meses (formulário de mentor e de mentee). Dados usados em pesquisa.
9. Duração de 1 ano. Máximo de 20 pares por ano.
10. Qualquer parte pode encerrar com 2 semanas de aviso por escrito.
11. Encerramento: certificado e, se possível, evento final.

Campos dos formulários (planilha):

- Cadastro comum: e-mail, nome, data de nascimento, gênero, país, cidade/vila de residência ou prática, idiomas, profissão, ano de formatura, formação acadêmica, link de rede profissional (LinkedIn), áreas de interesse, preferência de contato, informações adicionais, satisfação com o questionário e sugestões.
- Só mentor: experiência em mentoria, treinamento formal em mentoria, por que quer ser mentor, o que espera do mentee, o que espera fazer, preferências sobre o mentee, nível de formação que se sente confortável em mentorar.
- Só mentee: escolha de carreira, por que quer ser mentee, o que espera do mentor, o que espera fazer, preferência de gênero do mentor, preferências sobre o mentor.
- Avaliação (ambos): eficácia do processo, qualidade da comunicação, meios de contato usados, número de contatos, barreira de idioma, áreas discutidas, problemas com a outra parte, satisfação geral, probabilidade de recomendar (NPS), sugestões. Mentor também faz um resumo dos encontros e pontos fortes.

## 2. O que já está certo no código

- Arquitetura funcional: registry, gateway, auth e core separados, cada um com README, AGENTS.md e stack Docker. Script gera segredos e chaves RSA.
- Auth sólido: tokens RS256 sem estado, bloqueio de login via Redis, papel MENTOR/MENTEE no token.
- Perfil (`/customers/me`): papel e `userId` vêm do token, nunca do request. Validação de entrada com limites. Contatos ocultos na visão pública.
- Dados de referência bons: 610 idiomas e 8 grupos com áreas de interesse da saúde. Códigos de idioma do app existem todos no seed.
- Matching com pontuação explicada (`MatchScorer`): áreas de interesse (Jaccard), idioma, localização, profissão, gênero e experiência do mentor. Pesos configuráveis. Retorna o detalhamento por critério.
- Migrações Flyway versionadas. Testes unitários e de integração com PostgreSQL real em auth e core.
- App React com i18n, rotas protegidas, layout acessível e formulário de perfil.

## 3. Lacunas e problemas

### 3.1 Faltam domínios inteiros

| Exigência do programa | Situação |
|---|---|
| Papel de coordenador (admin) | Não existe. Auth só tem MENTOR e MENTEE. |
| Proposta de par, aceite dos dois, recusa | Não existe. `/matches` só lista sugestões. |
| Par ativo (mentoria) com início, fim e status | Não existe. |
| Acordo com assinatura digital e consentimentos | Não existe. |
| Registro de encontros (data, duração, satisfatório) | Não existe. |
| Check-in de 2 semanas e avaliação de 6 meses | Não existe. Continua no Google Forms. |
| Encerramento com aviso de 2 semanas | Não existe. |
| Ciclo anual e limite de 20 pares | Não existe. |
| Certificado (5 encontros satisfatórios) | Não existe. |
| E-mails (apresentação, lembretes, pesquisas) | Não existe. |
| Exportação anonimizada para pesquisa | Não existe. |

### 3.2 Perfil não cobre os formulários

Faltam no `Customer`: ano de formatura (hoje só `isGraduated` e `generation`, sem sentido claro), formação acadêmica, escolha de carreira, link profissional, motivação ("por que quer ser mentor/mentee"), expectativas separadas (da outra parte e de si), preferência de contato, preferência de gênero da outra parte, nível de formação que o mentor aceita e "informações adicionais". `age` deveria ser data de nascimento, como no formulário.

### 3.3 Problemas no código atual

1. **Privacidade.** Qualquer usuário logado lista todos os perfis do outro papel (`GET /matches`) e lê qualquer perfil (`GET /customers/{userId}`). O programa pede que a coordenação proponha o par respeitando a identidade. Matching deve ser só do coordenador. Perfil público só para o par aceito.
2. **Gênero pontuado errado.** `sameGender` dá pontos a gêneros iguais. O formulário pergunta a *preferência* de gênero do mentee. O critério certo é: preferência atendida, ou sem preferência.
3. **Idioma deveria ser filtro, não peso.** Sem idioma comum não há mentoria. Hoje um par sem idioma comum ainda pode ter nota alta.
4. **Matching ignora disponibilidade.** Não exclui quem já tem par ativo nem respeita o limite de mentees por mentor.
5. **Nomes de idiomas no seed** estão em Twi em parte (`en` = "Borɔfo", `fr` = "Frɛnkye"). O app usa `Intl.DisplayNames`, mas qualquer outro consumidor da tabela verá nomes errados. Corrigir com nova migração.
6. **Sem consentimento LGPD/GDPR** no cadastro. Os dados incluem saúde de carreira, país, gênero e uso em pesquisa. Precisa de aceite explícito, versão do termo e data.
7. **Sem CI.** Nenhum repositório roda testes ou build automaticamente.
8. **`systemdesign.md`** é um checklist genérico, sem decisões do projeto.

### 3.4 Problemas no documento de acordo (para a coordenação revisar)

- Cobra sessão perdida ("will be billed") e limita responsabilidade "ao valor pago". O programa é gratuito. Remover ou reescrever.
- Cita "social work and human services field" e "2018 Conference". Trocar por saúde rural e evento atual.
- Mistura códigos de ética (GPS-Pean e ICF). Escolher um e linkar.
- Mentor se compromete a reunião mensal; o programa diz que formato e frequência são livres. Alinhar os dois textos.
- Consentimento de pesquisa deve ser opcional e separado do acordo de mentoria.

## 4. Plano por fases

Princípio: cada fase entrega algo que a coordenação usa de verdade e substitui uma parte do Google Forms.

### Fase 0 — Base (1 a 2 semanas) — feita em 2026-11-10


- CI em cada repositório: build, `test`, `integrationTest`, lint do app.
- Corrigir nomes de idiomas (migração nova, sem alterar V1).
- Fechar `/matches` e `GET /customers/{userId}` até existir o papel de coordenador.
- Substituir `systemdesign.md` por decisões reais (ou remover).

Feito: workflow `.github/workflows/ci.yml` em cada repositório; migração V4 corrige 38 nomes em Twi; `/matches` e `GET /customers/{userId}` removidos (`MatchScorer` fica para a Fase 2, já com preferência de gênero no lugar de gênero igual); `systemdesign.md` reescrito (hoje em [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)). Pendente: o CI do core precisa do segredo `AUTH_REPO_TOKEN` se o repositório auth for privado.

### Fase 1 — Cadastro completo e consentimento (2 a 3 semanas) — feita em 2026-11-10


- Adicionar ao perfil os campos da seção 3.2. Separar campos de mentor e de mentee na validação.
- Data de nascimento no lugar de idade. Ano de formatura no lugar de `isGraduated`/`generation`.
- Aceite de termos de uso, privacidade e (opcional) pesquisa, com versão e data.
- Telas do app para os novos campos, em inglês e português.
- Importar os cadastros existentes da planilha (script único, com consentimento dos participantes).

Feito: migração V5 com os campos dos formulários e a tabela `customer_consent` (histórico de aceites); `GET /interest-groups`; formulário do perfil reescrito por papel, com áreas de interesse e aceite; página `/privacy`. Importação não foi necessária: as abas de inscrição da planilha estão vazias. Pendente: a coordenação revisar o texto de termos e privacidade.

Depois (2026-11-10): consentimentos versionados no banco. Migração V8 com `consent_document` (uma linha por versão, termos ou pesquisa) e `consent_document_text` (texto por idioma, `pt_BR` e `en_US`, com SHA-256), protegidas contra alteração por trigger. `customer_consent` aponta para o documento e o idioma lido, em vez de guardar uma versão em texto. `GET /consents/current?language=` público. O app lê os textos do servidor (página `/privacy` e consentimento de pesquisa); `TERMS_VERSION` e `mentormentee.consent.terms-version` deixaram de existir. O rascunho atual é a versão `2026-11-10`; o texto aprovado pela coordenação entra como versão nova, por migração. O acordo da Fase 3 pode usar a mesma estrutura em vez de `agreement_version`.

### Fase 2 — Coordenação e proposta de par (3 semanas)

Resumo: papel de coordenador, ciclo anual, matching só para o coordenador, proposta anônima com aceite ou recusa do mentee e depois do mentor, e-mail de apresentação e painel. Fases 2 e 3 juntas substituem os passos 2 a 6 do fluxo da seção 1.

#### 2.1 Papel `COORDINATOR` (auth)

- Novo valor em `CustomerType` do auth. O token passa a ter `type = COORDINATOR` e `ROLE_COORDINATOR`.
- **Risco:** hoje `POST /users/register` aceita `customerType` vindo do corpo. Só adicionar o valor ao enum deixaria qualquer pessoa se cadastrar como coordenador. `RegisterResource` deve aceitar só `MENTOR` e `MENTEE` (validação + teste).
- Conta de coordenador: criada por `mentor-mentee-auth/scripts/create-coordinator.sh <email>` (pede a senha, grava o hash BCrypt). Em dev, o seed do perfil `local` cria `coordinator@test.com`. Sem endpoint de criação: são poucas contas, e endpoint novo é superfície de ataque.
- Login separado: `POST /users/coordinator/login` só aceita coordenador; `/users/login` só aceita mentor e mentee. No app, `/coordination/login`, sem link em nenhuma página.
- Coordenador não tem perfil em `customer`. O core já recusa `/customers/me` para tipo diferente de MENTOR/MENTEE (`TOKEN_WITHOUT_USER_TYPE`); manter e testar.
- Endpoints de coordenação no core: `@PreAuthorize("hasRole('COORDINATOR')")` (o `auth-shared` já liga `@EnableMethodSecurity`).

#### 2.2 Ciclo (`cohort`)

- `cohort`: `id`, `name`, `starts_on`, `ends_on`, `max_pairs` (padrão 20), `max_mentees_per_mentor` (padrão 1, decisão 1 em aberto; por ciclo, porque é a coordenação quem decide), `created_at`.
- Um ciclo aberto por vez (o que contém a data de hoje). Propostas só no ciclo aberto.
- Limite de pares: conta pares do ciclo fora de `DECLINED`. Checado com `SELECT ... FOR UPDATE` na linha do ciclo, para duas propostas simultâneas não passarem de 20. O mesmo bloqueio protege o limite por mentor.
- Coordenador cria e edita ciclos (`/coordination/cohorts`). Não apaga ciclo com pares.

#### 2.3 Matching só para coordenador

`GET /coordination/candidates/{customerId}/matches` devolve os candidatos do outro papel, ordenados pelo `MatchScorer` (que já existe), com o detalhamento por critério.

Filtros duros (o candidato nem aparece):

- Termos aceitos na versão vigente, nos dois lados.
- Idioma em comum. Sai do peso e vira filtro (problema 3 da seção 3.3); o peso `languages` é removido de `MatchingWeights`.
- Preferência de gênero do mentee atendida, ou sem preferência. Também sai do peso.
- Mentee sem par aberto (`PROPOSED`, `ACCEPTED` ou `ACTIVE`).
- Mentor abaixo de `max_mentees_per_mentor` no ciclo.

Nível de formação: `academicBackground` e `acceptedBackgrounds` são texto livre hoje, então não dá para filtrar. O painel mostra os dois lado a lado e o coordenador decide. Virar filtro exige transformar os dois em lista fixa de opções (mudança no perfil, fora desta fase).

`GET /coordination/candidates?role=&unmatched=true` lista inscritos sem par aberto.

#### 2.4 Par (`Mentorship`) e proposta

Tabela `mentorship`: `id`, `cohort_id`, `mentor_id`, `mentee_id` (FK para `customer`), `status`, `proposed_by_user_id`, `proposed_at`, `mentor_accepted_at`, `mentee_accepted_at`, `declined_at`, `declined_by_role`, `decline_reason`, `started_at`, `ends_at`, `version`.

Estados: `PROPOSED → ACCEPTED → ACTIVE → COMPLETED / TERMINATED`, ou `PROPOSED → DECLINED`.

- `PROPOSED`: coordenador cria. O mentee responde primeiro; o mentor só vê a proposta depois que o mentee aceita (decidido em 2026-11-14). E-mail "você tem uma proposta", sem dados da outra parte: para o mentee na criação, para o mentor no aceite do mentee.
- `ACCEPTED`: quando o mentor aceita, depois do mentee. Dispara o e-mail de apresentação.
- `DECLINED`: qualquer parte recusa (motivo opcional, só o coordenador vê), ou o coordenador retira a proposta.
- `ACTIVE`, `COMPLETED`, `TERMINATED`: Fase 3 (acordo assinado e encerramento).
- Índice único parcial: um par aberto por mentee (`status IN ('PROPOSED','ACCEPTED','ACTIVE')`). O banco garante mesmo se a checagem do serviço falhar.
- `@Version` contra aceite e recusa simultâneos.

API:

| Método | Caminho | Quem |
|---|---|---|
| POST | `/coordination/mentorships` | Coordenador propõe (`mentorId`, `menteeId`) |
| DELETE | `/coordination/mentorships/{id}` | Coordenador retira proposta (`PROPOSED` só) |
| GET | `/mentorships/mine` | Mentor ou mentee: propostas e par atual |
| POST | `/mentorships/{id}/accept` | Mentor ou mentee do par |
| POST | `/mentorships/{id}/decline` | Mentor ou mentee do par (`reason` opcional) |

Fora do par e sem papel de coordenador: 404.

#### 2.5 Proposta anônima

Enquanto o par está `PROPOSED`, cada parte vê da outra só:

- papel, país e região (sem cidade: em vila pequena a cidade identifica), profissão, ano de formatura, formação acadêmica, idiomas, áreas de interesse, motivação, objetivos, experiência e treinamento em mentoria.

Nunca: nome, data de nascimento, contatos, link profissional, cidade, informações adicionais.

Campos de texto livre podem conter o nome. A visão anônima vale só entre as partes: o coordenador vê o perfil completo, com nome, confere o texto livre antes de propor e pode desistir. Depois de `ACCEPTED`, cada parte vê o perfil completo da outra, com contatos.

Uma classe de resposta própria (`AnonymousProfileResponse`), não `CustomerResponse` com campos nulos: assim um campo novo no perfil não vaza por engano.

#### 2.6 E-mail

- E-mail do participante: coluna `customer.email`, preenchida com o `username` do token (o e-mail do login, já normalizado no auth) a cada `POST`/`PUT` do perfil. Perfis antigos ganham o e-mail no próximo salvamento, que a V5 já exige (e o matching só considera quem aceitou os termos vigentes, ou seja, quem salvou).
- E-mail da coordenação: `mentormentee.coordination.email` (caixa compartilhada, muda por ambiente).
- Envio com `spring-boot-starter-mail` (SMTP). Em dev, Mailpit no `docker-compose.yml` para ver os e-mails sem enviar de verdade.
- Tabela `email_outbox` (`id`, `to`, `subject`, `body`, `created_at`, `sent_at`, `attempts`, `last_error`), gravada na mesma transação da mudança de estado. Tarefa `@Scheduled` envia e tenta de novo em caso de falha. Assim um SMTP fora do ar não desfaz o aceite nem perde o e-mail. Com várias réplicas: `SELECT ... FOR UPDATE SKIP LOCKED`.
- Texto em inglês e português no mesmo e-mail (o perfil não guarda o idioma da interface). Modelos em arquivos de recurso do core.
- E-mails desta fase: proposta recebida (para cada parte), proposta recusada (para a coordenação), apresentação (para os dois e cópia para a coordenação, com nome e e-mail de cada um).

#### 2.7 App

- Cadastro continua oferecendo só mentor e mentee.
- Coordenador: menu próprio, sem página de perfil. Painel com três listas: inscritos sem par, propostas pendentes (quem já aceitou), pares em andamento. A Fase 3 acrescenta assinaturas e progresso.
- Tela de candidatos: perfil anônimo do inscrito, lista de candidatos com nota e detalhamento, botão "propor".
- Mentor e mentee: aviso no dashboard quando há proposta; tela com o perfil anônimo e botões aceitar e recusar. Depois do aceite, perfil completo da outra parte.
- Textos em inglês e português.

#### 2.8 Ordem de entrega

1. Auth: `COORDINATOR`, bloqueio no cadastro, criação de conta. Testes: cadastro com `COORDINATOR` recusado, token do coordenador com `ROLE_COORDINATOR`. **Feito em 2026-11-10:** `RegisterResource.SignUpType` só aceita MENTOR e MENTEE; teste no core de que coordenador não cria perfil. Também feito: `POST /users/coordinator/login` só aceita coordenador, e `/users/login` recusa coordenador; contas criadas por `mentor-mentee-auth/scripts/create-coordinator.sh` e, em dev, pelo seed `coordinator@test.com`; app com página `/coordination/login` sem link, rotas por papel (`AuthLayout roles`) e página `/coordination` provisória.
2. Core: migração com `cohort` e `customer.email`. Endpoints de ciclo. Testes: só coordenador acessa `/coordination/**`. **Feito em 2026-11-10:** V7 com `cohort` (sem sobreposição de datas garantida por restrição de exclusão no banco, limite de 20 pares por `CHECK`) e `customer.email`; `/coordination/cohorts` (listar, ver, criar, editar; sem apagar); 403 com `core.access.denied` para mentor e mentee. As tabelas `mentorship` e `email_outbox` passaram para os passos 4 e 5, junto com o código que as usa. Tradução dos novos códigos de erro no app fica para o passo 6.
3. Matching com filtros duros e lista de inscritos sem par. Testes unitários dos filtros; integração da consulta de disponibilidade. **Feito em 2026-11-14:** `GET /coordination/mentees/unmatched` (paginado, quem espera há mais tempo primeiro) e `GET /coordination/mentees/{userId}/candidates` (perfil completo do mentee e mentores que passam nos filtros de termos, idioma e gênero, em JPQL, ordenados pela nota do `MatchScorer`). No app, lista com rolagem infinita e botão de atualizar, e página de matching com nome do mentor escondido até o coordenador pedir. Os filtros de par aberto e limite de mentees por mentor entram com a tabela `mentorship` no passo 4.
4. Migração com `mentorship`. Proposta, aceite, recusa e visão anônima. Testes: limite de 20 com propostas simultâneas, índice único por mentee, 404 para quem não é do par, nenhum campo proibido na visão anônima. **Feito em 2026-11-14**, com o mentee respondendo primeiro: V12 com `mentorship` (audit no lugar de `proposed_by_user_id`/`proposed_at`; `declined_by` aceita `COORDINATOR` para proposta retirada; índice único parcial por mentee). `POST`/`GET /coordination/mentorships`, `DELETE /coordination/mentorships/{id}`, `GET /mentorships/mine`, `POST /mentorships/{id}/accept` e `/decline`. A proposta trava a linha do ciclo (`SELECT ... FOR UPDATE`) e checa par aberto, limite de pares e os filtros do matching, agora com par aberto e limite de mentees por mentor. Editar o ciclo abaixo do que ele já tem é recusado. Visão anônima em `AnonymousProfileResponse`; nome e contatos em `IntroductionResponse`, só depois do aceite. Também feito aqui, do passo 6: botão "Propor par" no matching, propostas e pares do ciclo aberto na página da coordenação (com retirar e motivo da recusa), página "Minha mentoria" para mentor e mentee e aviso no dashboard. Testes de API no e2e (`e2e/api/mentorship.spec.ts`). Em 2026-11-15, várias opções por proposta: o coordenador escolhe até 3 mentores (`Mentorship.MAX_MENTOR_OPTIONS`), o mentee escolhe um ou recusa todos, as outras opções fecham como `SYSTEM`. V13 troca o índice único por mentee (vale só depois da escolha) e cria `uk_mentorship_open_option`. Opções não reservam vaga do mentor; o limite é checado na escolha, com a trava do ciclo.
5. Migração com `email_outbox`. Envio e Mailpit. Testes: e-mail gravado na mesma transação; falha de SMTP não desfaz o aceite. **Feito em 2026-11-16**, junto com os avisos no app (seção 2.9): V14 com `email_outbox`, `notification` e `customer.notification_channel`. `NotificationService` grava o aviso e, quando o tipo vai por e-mail e a pessoa não escolheu "só no app", a linha do outbox, na transação da mudança. `EmailSender` (`@Scheduled`, a cada 30 s) envia em lotes com `FOR UPDATE SKIP LOCKED` e espera mais a cada falha (1 min, dobrando até 6 h, 10 tentativas). Modelos bilíngues em `src/main/resources/email/`. Mailpit no compose do core (`http://localhost:8025`). Testes: H2 (fluxo, só no app, falha de SMTP), PostgreSQL (`SKIP LOCKED`, regra da caixa) e e2e (`e2e/api/notification.spec.ts`, lê o Mailpit). Custo: Mailpit é local e gratuito; produção usa qualquer SMTP (seção 2.10).
6. App: painel do coordenador, tela de candidatos, tela de proposta. **Feito em 2026-11-17:** página da coordenação com ciclos (listar, criar, editar; o aberto hoje em destaque), inscritos sem par, propostas pendentes e pares em andamento, em listas separadas; propostas recusadas ou retiradas ficam recolhidas no fim (as opções que o mentee não escolheu, fechadas como `SYSTEM`, não aparecem). A tela de candidatos e a de proposta já tinham entrado no passo 4. As traduções dos códigos de erro já estavam completas (`e2e/contract/errorTranslations.spec.ts`). Critério de pronto conferido em `e2e/ui/coordination.spec.ts`: o coordenador cria um ciclo, propõe pela página do mentee, mentee e mentor aceitam nas suas páginas, o par aparece em andamento e os dois recebem o e-mail de apresentação no Mailpit.

Critério de pronto: coordenador cria o ciclo, abre um mentee, vê só candidatos com idioma comum e preferência atendida, propõe; mentor e mentee veem o perfil anônimo, aceitam, e os dois recebem o e-mail de apresentação no Mailpit.

#### 2.9 Avisos no app e preferência de canal

- Todo evento de proposta ou par vira uma linha em `notification`: tipo, papel e usuário de destino, par (sem chave estrangeira: é um registro de eventos, separado das tabelas do domínio) e data de leitura. Sem nomes: o app escreve o texto pelo tipo, então a proposta continua anônima.
- Coordenadores dividem uma caixa (`recipient_user_id` nulo, garantido por `CHECK`).
- `customer.notification_channel`: `EMAIL_AND_APP` (padrão) ou `APP_ONLY`. Escolhido no perfil. Clientes antigos que não mandam o campo não mudam a escolha.
- API: `GET /notifications?page=`, `GET /notifications/unread-count`, `POST /notifications/{id}/read`, `POST /notifications/read-all`. Aviso de outra pessoa responde 404.
- App: item "Avisos" no menu de todos os papéis, com contador de não lidos (consulta ao trocar de página e a cada minuto) e página de avisos.
- Avisos de novo perfil guardam de quem é o perfil (`subject_user_id`, V16, sem chave estrangeira, como `mentorship_id`). O aviso de novo mentee abre a página de matching dele; o de novo mentor abre a página da coordenação, porque ainda não há página de mentor. O e2e apaga esses avisos junto com os usuários de teste. Os avisos gravados antes da V16 ficam sem a pessoa e levam à página da coordenação. **Feito em 2026-11-17.**

#### 2.10 Conversa assíncrona: caminho sem Kafka por enquanto

Pedido: preparar a conversa assíncrona entre mentor e mentee, com Kafka. Decisão: preparar o terreno sem Kafka.

- Volume: até 20 pares por ano, algumas mensagens por semana. Um broker Kafka (ou um serviço gerenciado) custaria mais que todo o resto da plataforma e acrescentaria operação, contra o objetivo de não gastar no início (ver também Fase 5).
- O terreno já fica pronto: eventos de domínio gravados em tabela na transação da mudança (`notification` e `email_outbox`, padrão outbox). Se um dia o volume pedir um broker, um relay lê essas tabelas e publica no Kafka sem mudar o código que gera os eventos.
- Conversa, quando entrar: tabelas `conversation` (uma por par aceito) e `message` (`conversation_id`, `sender_user_id`, `body`, `created_at`, `read_at`), só para as duas partes do par (404 para os outros, como 2.9 das regras). Cada mensagem gera um aviso `NEW_MESSAGE` e, para quem quer e-mail, um e-mail agrupado (não um por mensagem). Entrega no app por consulta periódica, como o contador de avisos; Server-Sent Events se a espera incomodar. Moderação e retenção das mensagens precisam de decisão da coordenação antes.
- E-mail em produção: qualquer SMTP. Para o volume do programa, os planos gratuitos de serviços de envio ou a conta da coordenação bastam; conferir limites ao escolher.

### Mentor que também é mentee (papéis por conta)

Pedido: uma pessoa que é mentor quer também ser mentee (ou o contrário). Hoje cada conta tem um papel só (`users.customer_type` no auth, `customer` único por `user_id` no core), então ela precisava de outro e-mail. **Feito em 2026-11-17** (ver "O que foi entregue" no fim desta seção).

#### Abordagem escolhida

Uma conta, até dois papéis de participante, um perfil por papel, e um papel ativo por vez na sessão.

- **Um perfil por papel.** O core passa a ter até duas linhas de `customer` por `user_id`, uma `MENTOR` e uma `MENTEE`. Pares, matching, limites e avisos já trabalham sobre a linha de `customer` e o papel, então quase nada muda: `mentorship.mentor_id`/`mentee_id` continuam apontando para linhas de `customer`, e a caixa de avisos já é por `(recipient_role, recipient_user_id)`.
- **Papel ativo no token.** O token continua com um `type` só (o papel ativo) e `authorities` só desse papel. Todo serviço segue checando um papel por pedido, sem mudança no `auth-shared` nem nas regras de acesso. Uma nova claim `roles` lista os papéis da conta, só para o app mostrar a troca.
- **Trocar de papel é pedir outro token.** Nada de "modo duplo" na mesma tela: a pessoa troca, e o app inteiro passa a mostrar o outro papel. Assim a proposta anônima e as permissões continuam simples.

Alternativas descartadas:

- Separar `customer` em pessoa (nome, contatos, endereço, idiomas, aceite) e perfis de papel. É o modelo mais limpo, mas mexe em todo o perfil, no mapper e nas migrações, para resolver só a duplicação dos campos comuns. Fica para depois, se os campos comuns divergirem e isso incomodar.
- Continuar com dois e-mails. Funciona hoje, mas a pessoa tem duas senhas, e a coordenação não sabe que é a mesma pessoa, então não consegue impedir que ela seja mentora de si mesma.

#### Regras novas (entram em REGRAS_DE_NEGOCIO.md ao implementar)

1. Uma conta de participante pode ter os papéis mentor e mentee. Coordenador nunca acumula papel de participante; quem coordena e participa usa outra conta.
2. Cada papel tem o próprio perfil, o próprio aceite de termos e a própria preferência de aviso. Ao acrescentar um papel, o formulário vem preenchido com os campos comuns do outro perfil, e a pessoa aceita os termos de novo para esse perfil.
3. Ninguém forma par consigo mesmo: o matching tira dos candidatos o mentor com o mesmo `user_id` do mentee, e a proposta recusa esse caso.
4. Ser mentee e mentor no mesmo ciclo é permitido (decisão em aberto para a coordenação, item 7 da seção 5).
5. Remover um papel fica fora desta entrega; quem desiste segue o caminho atual (pedido à coordenação).

#### Auth

- Migração: tabela `user_role` (`user_id`, `role`, chave primária nos dois, `CHECK` com `MENTOR`/`MENTEE`/`COORDINATOR`), preenchida a partir de `users.customer_type`. `CHECK` (ou trigger) impede coordenador com outro papel. `users.customer_type` fica como papel padrão do login, para a versão anterior rodar ao lado durante o deploy; sai numa versão seguinte.
- `POST /users/roles` com `{ role }`: acrescenta MENTOR ou MENTEE à conta do token. Só participante; papel repetido responde `409` (`auth.role.alreadyAdded`); coordenador `403`.
- `POST /users/role-switch` com `{ role }`: devolve um token novo com aquele papel ativo, se a conta o tiver (`403` com `auth.role.notGranted` se não). Sem senha de novo: o token atual já prova a sessão.
- Login: entra no último papel usado (coluna `users.last_role`) ou no papel padrão. A resposta de login e do token traz `roles`.
- Testes: acrescentar papel, repetir (409), coordenador recusado, troca para papel que não tem (403), claims `type`, `authorities` e `roles` do token novo.

#### Core

- Migração: troca `uk_customer_user_id` por `uk_customer_user_type` (`user_id`, `type`). `Customer.USER_ID_KEY` passa a nomear a nova restrição, para `RestExceptionHandler` seguir respondendo `core.profile.alreadyExists`.
- `CustomerRepository.findByUserId` vira `findByUserIdAndType`. São 5 chamadas: `CustomerService` (2, com o papel do token), `MentorshipService` (2: a do token usa o papel do token; a da proposta busca o mentee como `MENTEE` e cada mentor como `MENTOR`) e `MatchingService` (1, como `MENTEE`).
- Matching e proposta: filtro `mentor.userId <> mentee.userId` na consulta de candidatos e checagem na proposta (`core.mentorship.selfPair`, `409`).
- Endpoint para preencher o segundo perfil: `GET /customers/me/shared` devolve os campos comuns do outro perfil da conta (nome, nascimento, gênero, endereço, idiomas, contatos, link profissional, formação), ou `404` se não houver. O app usa no formulário; nada é copiado sem a pessoa salvar.
- Deploy: a versão com `findByUserIdAndType` sobe antes da migração que troca a restrição. Com a restrição antiga ainda valendo, nada muda; a migração entra na versão seguinte.
- Coordenação: listas e e-mails já mostram a linha de `customer`; a mesma pessoa pode aparecer como mentor e como mentee. A lista de inscritos sem par marca quem também é mentor (campo `alsoMentor`), para a coordenação saber.
- Testes: dois perfis da mesma conta (H2), restrição nova e corrida de criação (PostgreSQL), par consigo mesmo recusado, matching sem o próprio usuário, avisos de cada papel na caixa certa.

#### App

- Sessão: `user.roles` além de `customerType` (papel ativo), lidos da resposta de login e do token.
- Menu lateral: com dois papéis, "Ver como mentor / mentee" chama `role-switch`, troca o token e vai para a página inicial do papel. Com um papel, item "Quero ser mentee também" (ou mentor) na página de perfil, que chama `POST /users/roles`, troca de papel e abre o formulário de perfil já preenchido por `GET /customers/me/shared`.
- O contador de avisos segue o papel ativo. Avisos do outro papel aparecem ao trocar; um contador somado fica para depois, se fizer falta.
- Textos em inglês e português; códigos novos de erro nas duas línguas (o teste de contrato cobra).
- e2e: mentor acrescenta o papel mentee, salva o perfil preenchido, aparece entre os inscritos sem par, não se vê como candidato de si mesmo, troca de volta para mentor e encontra o painel de mentor como antes.

#### Ordem de entrega

1. Auth: `user_role`, `POST /users/roles`, `role-switch`, claim `roles`. Sem efeito visível: cada conta ainda tem um papel.
2. Core: `findByUserIdAndType`, filtro de par consigo mesmo, `GET /customers/me/shared`, `alsoMentor`. Restrição antiga ainda valendo.
3. Core: migração com `uk_customer_user_type`.
4. App: troca de papel, "quero ser mentee/mentor também", formulário preenchido, e2e.

Critério de pronto: uma conta de mentor vira também mentee sem novo e-mail, o coordenador a vê entre os inscritos sem par (marcada como mentora), nunca como candidata dela mesma, e ela troca entre os dois papéis sem sair da sessão.

#### O que foi entregue

Critério de pronto conferido em `e2e/api/roles.spec.ts` e `e2e/ui/roles.spec.ts`. Diferenças em relação ao plano acima:

- **Auth, V5.** `users.customer_type` fica para sempre como papel do cadastro (ou `COORDINATOR`), e `user_role` guarda só os papéis acrescentados depois. Os papéis da conta são os dois juntos. Assim nada precisou ser copiado, e o script de coordenador, o seed e o cadastro continuam como estavam. Um trigger recusa papel de participante em conta de coordenador e o papel do cadastro repetido. `users.last_role` guarda o último papel usado, onde o login começa. Só `role-switch` grava `last_role`: acrescentar um papel não grava, porque o perfil dele ainda não existe. O app chama `role-switch` depois de salvar o primeiro perfil do papel novo, e só então o login passa a começar nele.
- **`POST /users/roles` já devolve o token ativo no papel novo.** O app não precisa chamar `role-switch` em seguida. `role-switch` e as duas rotas leem o token elas mesmas, como `/users/authenticate`. `/users/authenticate` devolve o papel ativo do token, não o do cadastro, e as três rotas acham a conta pelo `uid` do token (token sem `uid` ou sem `type` responde 401 `auth.token.invalid`). O app relê os papéis da conta em cada validação do token, então sessões salvas antes desta entrega também os recebem.
- **Core: passos 2 e 3 numa entrega só (V17).** Ainda não há produção, então não há versão anterior rodando ao lado. A V17 cria `uk_customer_user_type` e apaga `uk_customer_user_id`.
- `GET /customers/me/shared` devolve nome, nascimento, gênero, idiomas, ano de formatura, formação, link profissional, contatos, endereço, formação rural e preferência de contato. Profissão (ou escolha de carreira), motivação, expectativas e áreas de interesse ficam de fora, porque mudam de sentido em cada papel.
- **App.** "Ver como mentor / estudante" no menu lateral para quem tem os dois papéis. No perfil, um bloco "Quero ser estudante também" (ou mentor). O formulário do papel novo vem preenchido e avisa isso. As páginas recarregam ao trocar de papel (`Outlet` com `key` do papel), e o contador de avisos também. Na coordenação, a etiqueta "Também é mentor" aparece na lista de inscritos sem par.

### Fase 3 — Acordo e encontros (2 a 3 semanas)

Resumo: acordo revisado (seção 3.4) como texto versionado, assinado pelos três; registro de encontros com avaliação de cada parte; progresso até 5 encontros satisfatórios; encerramento com aviso de 2 semanas.

#### 3.0 Pré-requisitos

- **Fase 2 pronta.** A Fase 3 usa `Mentorship` (já com `version`, `started_at` e `ends_at`), o papel `COORDINATOR`, o ciclo e a `email_outbox`. As migrações da Fase 3 vêm depois das da Fase 2.
- **Texto do acordo: provisório, revisão sem data.** Decidido em 2026-11-17: a revisão pela coordenação (seção 3.4) não vai acontecer tão cedo e não bloqueia a Fase 3. Publicar um texto provisório já com conteúdo (o acordo atual com os problemas da seção 3.4 corrigidos), marcado como "não revisado". Ver 3.2, "Texto provisório".
- **Decisões 2, 3 e 5 da seção 5.** O plano abaixo assume os padrões marcados em 3.7; mudar depois é barato.

#### 3.1 Ciclo de vida do par

```
ACCEPTED ──(3ª assinatura)──▶ ACTIVE ──(fim do ciclo de 1 ano)──▶ COMPLETED
                                │
                                └─(pedido de encerramento + 14 dias)──▶ TERMINATED
```

- `ACTIVE` começa na terceira assinatura. `startedAt` = data dessa assinatura; `endsAt` = `startedAt` + 1 ano (ou fim do ciclo, o que vier antes).
- Encontros só podem ser registrados em `ACTIVE`.
- Durante o aviso de 2 semanas o par continua `ACTIVE`: os encontros seguem valendo.
- Transições por data (`ACTIVE → TERMINATED` e `ACTIVE → COMPLETED`) rodam em tarefa diária `@Scheduled` no core. O `UPDATE ... WHERE status = 'ACTIVE' AND <data> <= now()` é idempotente, então várias réplicas não causam problema. A Fase 4 reaproveita essa tarefa.
- O `@Version` de `Mentorship` (Fase 2) protege assinaturas simultâneas.
- `endsAt` usa `cohort.ends_on` quando o ciclo acaba antes de 1 ano.

#### 3.2 Acordo versionado e assinatura

Modelo:

- `agreement_version`: `id`, `version`, `locale`, `body` (markdown), `sha256` do texto, `published_at`. Linhas nunca mudam. Texto novo = migração nova, igual ao seed de idiomas.
- `mentorship_signature`: `mentorship_id`, `role` (`MENTOR`/`MENTEE`/`COORDINATOR`), `user_id`, `agreement_version_id`, `full_name` digitado, `signed_at`. `UNIQUE (mentorship_id, role)`.

Regras:

- Assinatura = aceite eletrônico simples: a pessoa lê o texto, digita o nome completo e confirma. Guarda usuário do token, versão, hash e data. Não é assinatura com certificado digital (ICP-Brasil); para um programa gratuito isso basta, mas a coordenação deve confirmar.
- Os três assinam a mesma `version`, cada um no idioma que escolher. Se sair versão nova antes da terceira assinatura, as assinaturas antigas continuam válidas (o par assina a versão vigente no momento da primeira assinatura).
- Mentor e mentee só assinam o próprio par. Coordenador assina qualquer par do ciclo.
- Consentimento de pesquisa fica fora do acordo: já existe separado em `customer_consent` (Fase 1).

Texto provisório e troca do texto:

- Mesmo formato dos textos de consentimento (`consent_document` e `consent_document_text`, V8): uma versão por linha, um texto por idioma com `sha256`, triggers que recusam mudança. Vale a versão publicada mais recente. **Trocar o texto é publicar uma versão nova numa migração**, sem mudar código. Pares que já assinaram continuam com a versão que assinaram.
- `agreement_version.reviewed` (boolean). A primeira versão sai com `false`. Enquanto a versão em vigor não estiver revisada, o app mostra um aviso fixo acima do texto, nos dois idiomas: "Texto provisório, ainda não revisado pela coordenação. Pode mudar antes da versão final." O próprio texto também começa com esse aviso, para valer em cópias e e-mails.
- O texto provisório parte do acordo atual com as correções da seção 3.4: sem cobrança nem limite de responsabilidade, saúde rural no lugar de serviço social, um só código de ética (ICF, até a decisão 5), formato e frequência como no programa, pesquisa fora do acordo.
- Quando a coordenação revisar, a versão aprovada entra como versão nova, com `reviewed = true`, e o aviso some. Ninguém precisa assinar de novo, a menos que a coordenação peça. Se pedir, é uma regra nova na Fase 3.
- O AGENTS.md do core ganha um "Como trocar o texto do acordo" (uma migração com a versão nova nos dois idiomas), junto com a primeira versão.

#### 3.3 Encontros

Modelo:

- `meeting`: `id`, `mentorship_id`, `held_at` (timestamptz), `duration_minutes`, `format` (`VIDEO`, `PHONE`, `IN_PERSON`, `OTHER`), `notes` (opcional), `created_by_user_id`, `created_at`, `version`.
- `meeting_interest_area`: áreas discutidas, reaproveitando `interest_area` (mesma lista do perfil e da avaliação).
- `meeting_rating`: `meeting_id`, `role` (`MENTOR`/`MENTEE`), `satisfactory` (boolean), `comment` (opcional), `rated_at`. `UNIQUE (meeting_id, role)`.

Regras:

- Mentor ou mentee registra o encontro. `held_at` no futuro = encontro agendado; isso cobre "mentor informa data e hora à coordenação" e serve aos lembretes da Fase 4.
- Avaliar só depois de `held_at`. Cada parte avalia uma vez e pode corrigir enquanto o par está `ACTIVE`.
- Quem criou pode editar ou apagar o encontro até a outra parte avaliar. Depois disso, só o coordenador corrige.
- Comentário da avaliação: visível para o coordenador, não para a outra parte (incentiva resposta sincera).
- Duração mínima de 1 hora não bloqueia o registro (decisão 2 em aberto). O app avisa quando for menor.

#### 3.4 Progresso

- Encontro satisfatório = avaliado como satisfatório pelos dois.
- Meta fixa de 5 (regra do programa, constante no código, não configuração).
- Resposta do par inclui: encontros feitos, agendados, satisfatórios, aguardando minha avaliação, aguardando a outra parte, e quanto falta para 5.
- Cálculo em uma consulta agregada por par; o painel do coordenador usa a mesma consulta para todos os pares do ciclo.

#### 3.5 Encerramento antecipado

- `mentorship_termination` (ou colunas em `mentorship`): `requested_by_user_id`, `requested_role`, `reason` (obrigatório), `requested_at`, `effective_at` = `requested_at` + 14 dias, `withdrawn_at`.
- Mentor, mentee ou coordenador podem pedir. O pedido é o "aviso por escrito": e-mail (pela `email_outbox`) para a outra parte e para a coordenação.
- Quem pediu pode desistir antes de `effective_at`.
- Um pedido aberto por par.

#### 3.6 API (core)

Todas exigem participante do par (comparando `userId` do token) ou `COORDINATOR`. Fora disso: 404, para não revelar que o par existe.

| Método | Caminho | Uso |
|---|---|---|
| GET | `/agreements/current?locale=` | Texto vigente para assinar |
| GET | `/mentorships/mine` | Par do usuário com assinaturas e progresso |
| GET | `/mentorships/{id}` | Detalhe (participante ou coordenador) |
| POST | `/mentorships/{id}/signatures` | Mentor ou mentee assina (`agreementVersionId`, `language`, `fullName`) |
| POST | `/coordination/mentorships/{id}/signatures` | Coordenador assina |
| GET | `/agreements/{id}?language=` | Versão que o par já assina |
| GET/POST | `/mentorships/{id}/meetings` | Listar e registrar encontros |
| PUT/DELETE | `/mentorships/{id}/meetings/{meetingId}` | Editar ou apagar (regras de 3.3) |
| PUT | `/mentorships/{id}/meetings/{meetingId}/rating` | Minha avaliação |
| POST/DELETE | `/mentorships/{id}/termination` | Pedir ou desistir do encerramento |
| GET | `/coordination/mentorships?status=` | Painel: assinaturas pendentes e progresso |

Erros novos em `ErrorCodes`: estado inválido para a ação, já assinado, versão do acordo desatualizada, avaliação antes do encontro, encontro já avaliado pela outra parte, pedido de encerramento já aberto.

#### 3.7 Padrões assumidos para as decisões em aberto

- Decisão 2 (frequência): registro livre; lembrete mensal fica na Fase 4. Duração menor que 1 hora só gera aviso.
- Decisão 3 (quem avalia): cada parte avalia; conta como satisfatório quando os dois marcam.
- Decisão 5 (código de ética): o texto do acordo linka um só; a escolha entra na revisão do texto, sem impacto no código.

#### 3.8 App

- Página "Minha mentoria": etapa de assinatura (texto, nome completo, confirmar) até `ACTIVE`; depois lista de encontros, formulário de registro, avaliação pendente em destaque, barra de progresso "X de 5", botão de encerramento com motivo e data efetiva.
- Painel do coordenador (da Fase 2): colunas de assinaturas pendentes e progresso; detalhe com comentários das avaliações; assinatura do coordenador.
- Textos em inglês e português, como o resto do app.

Pendências da revisão do front-end (2026-11-17), para fazer junto com as telas desta fase:

- [ ] Dashboard do participante mostra o caminho do par (proposta, assinatura do acordo, encontros "X de 5") no lugar das saudações genéricas e dos três cartões "Ações Rápidas", que repetem o menu. Tirar o cartão "Sessões de Mentoria" com o botão "Ver Conversas" desativado.
- [ ] Matching: com 0 mentores escolhidos, o botão diz "Propor 1 mentor" em português (no pt-BR o plural `one` inclui 0). Acrescentar `propose_zero` nos dois idiomas, ou usar `{{count}}` no texto do singular.
- [ ] Um termo por papel em português: hoje a mesma tela diz "Estudante" e "Mentees sem mentor". Traduzir também "Dashboard" no menu.
- [ ] Letra maiúscula só no começo, como no resto do app: "Ações Rápidas", "Meu Perfil", "Ver Perfil", "Sessões de Mentoria", "Ver Conversas".
- [ ] Rótulos em maiúsculas espaçadas (`MenteeProfilePanel.tsx`, cartão da mentoria) viram rótulos normais em cinza secundário. Tirar o rótulo acima de "Mentor sugerido", que repete o título.
- [ ] Seletores de idioma e tema cortam o texto ("Tema do siste…" no menu, quase nada no topo de `/design-system`): nomes mais curtos ou botões com ícone.
- [ ] Login e cadastro dizem o que é o programa (mentoria gratuita em saúde rural, com coordenação) no lugar de "Conectando pessoas para crescimento mútuo…" e "Bem-vindo de volta! Faça login para continuar".
- [ ] Hierarquia na página da coordenação: ciclo, listas e propostas usam o mesmo cartão arredondado e nada se destaca. Decidir o que é principal antes de acrescentar as colunas de assinatura e progresso.
- [ ] Avisos da coordenação dizem quem se inscreveu (o aviso já guarda `subject_user_id`). Para mentor e mentee os avisos continuam sem nome.
- [ ] Conferir com o painel do navegador visível se o passarinho da página 404 aparece; na revisão ele não apareceu com o painel em segundo plano, provavelmente porque as animações não rodaram.

#### 3.9 Ordem de entrega

1. Migração com `agreement_version` (rascunho do texto em inglês e português) e `mentorship_signature`. Endpoints de acordo e assinatura. Testes de integração: assinatura duplicada, versão desatualizada, terceira assinatura ativa o par. **Feito em 2026-11-17:** V18 com `agreement_version` (com `reviewed`), `agreement_version_text` e `mentorship_signature`, no formato da V8; a assinatura aponta para o texto lido (versão, idioma e hash) e um trigger recusa mudá-la. Primeira versão `2026-11-17`, provisória, nos dois idiomas, com as correções da seção 3.4 e o aviso no começo do texto. `mentorship` ganhou `started_at` e `ends_on` (último dia, inclusive; `CHECK` exige os dois em `ACTIVE`, `COMPLETED` e `TERMINATED`). Diferenças em relação a 3.2 e 3.6: o coordenador assina por `POST /coordination/mentorships/{id}/signatures` (mentor e mentee por `/mentorships/{id}/signatures`), cada um com a sua resposta; `GET /agreements/{id}?language=` devolve a versão que o par já assina (`agreementVersionId` na resposta do par), além de `/agreements/current?language=`; as assinaturas de um par rodam sob trava da linha (`SELECT ... FOR UPDATE`), não com `@Version`, para a terceira sempre ver as outras duas. As respostas do par (mentor, mentee e coordenador) trazem `agreementVersionId`, `signatures`, `startedAt` e `endsOn`. Assinar trava também a linha do ciclo e é recusado se o ciclo já terminou (`core.cohort.ended`); editar o ciclo pega a mesma trava e recusa um fim antes do último dia de um par ativo (`core.cohort.endsBeforePairs`). Ainda sem aviso nem e-mail de assinatura ou de par ativo: entram com a tela (passo 5). Testes: `AgreementControllerIntegrationTest` (H2) e `AgreementPostgresIntegrationTest` (migração, triggers, restrições e as duas últimas assinaturas ao mesmo tempo). No app, só as traduções dos códigos novos e a limpeza das assinaturas no e2e.
2. Migração de encontros e avaliações. CRUD e avaliação com as regras de 3.3. Testes: não participante recebe 404, avaliação antes do encontro, edição bloqueada após avaliação da outra parte. **Feito em 2026-11-17:** V19 com `meeting`, `meeting_interest_area` e `meeting_rating` (uma por parte e encontro, `uk_meeting_rating_role`; corrigida no lugar, e cada versão vai para a tabela genérica `change_history` (tipo, id e JSONB com o que aconteceu), que qualquer processo pode usar por `ChangeHistoryService`, na mesma transação; um trigger só recusa mudar o histórico). Encontros também gravam ali cada criação, correção e exclusão, com a ação e o papel de quem fez. Apagar encontro é lógico (`deleted_at`, `@SQLRestriction`), e a data fica dentro do período do par (REGRAS_DE_NEGOCIO.md 9.10 e 9.11). As assinaturas já não mudam (V18), então a própria linha é o histórico. `GET`/`POST /mentorships/{id}/meetings`, `PUT`/`DELETE /mentorships/{id}/meetings/{meetingId}` e `PUT .../rating` para mentor e mentee; `GET /coordination/mentorships/{id}/meetings` (as duas avaliações com comentários) e `PUT`/`DELETE /coordination/mentorships/{id}/meetings/{meetingId}`. Acrescentado: o coordenador corrige qualquer encontro de um par ativo, avaliado ou não, inclusive adiantando a data quando o par se encontrou antes (REGRAS_DE_NEGOCIO.md 9.8); nenhum encontro avaliado vai para o futuro (9.9). Edição, exclusão e avaliação travam a linha do encontro (`SELECT ... FOR UPDATE`), então a edição de quem registrou nunca passa depois da avaliação da outra parte. A outra parte vê só se você avaliou, nunca a nota nem o comentário. Sem aviso nem e-mail de encontro: lembretes ficam na Fase 4. Testes: `MeetingControllerIntegrationTest` (H2) e `MeetingPostgresIntegrationTest` (restrições, histórico das avaliações, exclusão lógica, edição e avaliação ao mesmo tempo). No app, só as traduções dos códigos novos e a limpeza dos encontros no e2e.
3. Progresso (consulta agregada) e endpoint do coordenador. Teste unitário do cálculo e de integração da consulta. **Feito em 2026-11-18:** `MeetingRepository.countFor` conta os encontros de vários pares numa consulta só (agrupada por par, com as duas avaliações de cada encontro em `left join`): feitos, agendados, satisfatórios (os dois marcaram satisfatório) e avaliados por mentee e por mentor. Encontros apagados não contam. A meta é `Mentorship.SATISFACTORY_MEETINGS_GOAL = 5`. As respostas do par ganharam `progress`, nulo antes do par começar: mentor e mentee veem `held`, `scheduled`, `satisfactory`, `awaitingMyRating`, `awaitingPartnerRating`, `goal` e `remaining`; o coordenador vê `awaitingMenteeRating` e `awaitingMentorRating` no lugar dos dois do meio. Diferença em relação a 3.6: sem `?status=` em `GET /coordination/mentorships`; a lista já traz o progresso de todos os pares do ciclo aberto numa consulta só, e o app separa as colunas por status, como já faz. Testes: `MeetingCountsTest` (cálculo), `MeetingControllerIntegrationTest` (as três visões, encontro apagado, par sem encontros, meta passada, par não começado) e `MeetingPostgresIntegrationTest` (a consulta no PostgreSQL, com encontro no instante exato contado como feito). No app, nada ainda: entra com a página do par (passo 5).
4. Encerramento e tarefa diária de transições, com e-mails. Testes: pedido duplicado, desistência, transição idempotente em `TERMINATED` e `COMPLETED`.
5. App: página do par e colunas do painel, com as pendências da revisão do front-end (3.8).
6. Texto provisório publicado no passo 1, com o aviso de 3.2. A revisão pela coordenação não bloqueia o critério de pronto. Quando vier, entra como versão nova, sem mudança de código.

Critério de pronto: um par de teste vai de `ACCEPTED` a `ACTIVE` com três assinaturas, registra 5 encontros avaliados pelos dois, e o painel mostra 5 de 5; outro par pede encerramento e vira `TERMINATED` 14 dias depois.

### Fase 4 — Check-ins, avaliações e certificado (2 a 3 semanas)

- Tarefa agendada: check-in em 2 semanas, avaliação em 6 e 12 meses, lembrete de encontro mensal.
- Formulários de avaliação dentro do app, com as perguntas da planilha (escalas fixas para análise).
- Certificado em PDF quando o par termina com 5 ou mais encontros satisfatórios dos dois lados.
- Exportação CSV anonimizada para pesquisa, só de quem consentiu.

### Fase 5 — Produção

- Ambiente de staging e produção, backup do banco, HTTPS, logs centralizados e alertas básicos.
- Avaliar se a malha de microsserviços (registry, gateway, auth, core) é necessária para 20 pares por ano. Um core com auth embutido reduziria custo e operação. Decidir antes de ir para produção.
- Escolher o SMTP de produção (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SMTP_AUTH`, `MAIL_STARTTLS`, `MAIL_FROM`, `COORDINATION_EMAIL`, `APP_URL`) e configurar SPF e DKIM do domínio remetente.
- Kafka só se o volume justificar (seção 2.10).

## 5. Decisões em aberto para a coordenação

1. Um mentor pode ter mais de um mentee por ciclo?
2. Formato e frequência são livres (programa) ou mensais por vídeo, 1 hora (acordo)?
3. Quem avalia "encontro satisfatório": cada parte, ambas, ou o coordenador?
4. Os dados atuais da planilha podem ser importados? Precisa pedir novo consentimento?
5. Qual código de ética vale (GPS-Pean ou ICF)?
6. Em quais idiomas a interface precisa existir além de inglês e português?
7. A mesma pessoa pode ser mentee e mentora no mesmo ciclo? (Padrão, já em vigor: sim, nunca no mesmo par.)
8. Revisão do texto do acordo (seção 3.4). Sem data. Até lá vale o texto provisório marcado "não revisado" (3.2).
