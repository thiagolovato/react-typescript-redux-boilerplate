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

Feito: workflow `.github/workflows/ci.yml` em cada repositório; migração V4 corrige 38 nomes em Twi; `/matches` e `GET /customers/{userId}` removidos (`MatchScorer` fica para a Fase 2, já com preferência de gênero no lugar de gênero igual); `systemdesign.md` reescrito. Pendente: o CI do core precisa do segredo `AUTH_REPO_TOKEN` se o repositório auth for privado.

### Fase 1 — Cadastro completo e consentimento (2 a 3 semanas) — feita em 2026-11-10


- Adicionar ao perfil os campos da seção 3.2. Separar campos de mentor e de mentee na validação.
- Data de nascimento no lugar de idade. Ano de formatura no lugar de `isGraduated`/`generation`.
- Aceite de termos de uso, privacidade e (opcional) pesquisa, com versão e data.
- Telas do app para os novos campos, em inglês e português.
- Importar os cadastros existentes da planilha (script único, com consentimento dos participantes).

Feito: migração V5 com os campos dos formulários e a tabela `customer_consent` (histórico de aceites); `GET /interest-groups`; formulário do perfil reescrito por papel, com áreas de interesse e aceite; página `/privacy`. Importação não foi necessária: as abas de inscrição da planilha estão vazias. Pendente: a coordenação revisar o texto de termos e privacidade.

Depois (2026-11-10): consentimentos versionados no banco. Migração V8 com `consent_document` (uma linha por versão, termos ou pesquisa) e `consent_document_text` (texto por idioma, `pt_BR` e `en_US`, com SHA-256), protegidas contra alteração por trigger. `customer_consent` aponta para o documento e o idioma lido, em vez de guardar uma versão em texto. `GET /consents/current?language=` público. O app lê os textos do servidor (página `/privacy` e consentimento de pesquisa); `TERMS_VERSION` e `mentormentee.consent.terms-version` deixaram de existir. O rascunho atual é a versão `2026-11-10`; o texto aprovado pela coordenação entra como versão nova, por migração. O acordo da Fase 3 pode usar a mesma estrutura em vez de `agreement_version`.

### Fase 2 — Coordenação e proposta de par (3 semanas)

Resumo: papel de coordenador, ciclo anual, matching só para o coordenador, proposta anônima com aceite ou recusa dos dois, e-mail de apresentação e painel. Fases 2 e 3 juntas substituem os passos 2 a 6 do fluxo da seção 1.

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

- `PROPOSED`: coordenador cria. Mentor e mentee recebem e-mail ("você tem uma proposta"), sem dados da outra parte.
- `ACCEPTED`: quando a segunda parte aceita. Dispara o e-mail de apresentação.
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
3. Matching com filtros duros e lista de inscritos sem par. Testes unitários dos filtros; integração da consulta de disponibilidade.
4. Migração com `mentorship`. Proposta, aceite, recusa e visão anônima. Testes: limite de 20 com propostas simultâneas, índice único por mentee, 404 para quem não é do par, nenhum campo proibido na visão anônima.
5. Migração com `email_outbox`. Envio e Mailpit. Testes: e-mail gravado na mesma transação; falha de SMTP não desfaz o aceite.
6. App: painel do coordenador, tela de candidatos, tela de proposta.

Critério de pronto: coordenador cria o ciclo, abre um mentee, vê só candidatos com idioma comum e preferência atendida, propõe; mentor e mentee veem o perfil anônimo, aceitam, e os dois recebem o e-mail de apresentação no Mailpit.

### Fase 3 — Acordo e encontros (2 a 3 semanas)

Resumo: acordo revisado (seção 3.4) como texto versionado, assinado pelos três; registro de encontros com avaliação de cada parte; progresso até 5 encontros satisfatórios; encerramento com aviso de 2 semanas.

#### 3.0 Pré-requisitos

- **Fase 2 pronta.** A Fase 3 usa `Mentorship` (já com `version`, `started_at` e `ends_at`), o papel `COORDINATOR`, o ciclo e a `email_outbox`. As migrações da Fase 3 vêm depois das da Fase 2.
- **Texto do acordo revisado pela coordenação** (seção 3.4). Sem isso, publicar só como rascunho em ambiente de teste.
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
| POST | `/mentorships/{id}/signatures` | Assinar (`agreementVersion`, `fullName`) |
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

#### 3.9 Ordem de entrega

1. Migração com `agreement_version` (rascunho do texto em inglês e português) e `mentorship_signature`. Endpoints de acordo e assinatura. Testes de integração: assinatura duplicada, versão desatualizada, terceira assinatura ativa o par.
2. Migração de encontros e avaliações. CRUD e avaliação com as regras de 3.3. Testes: não participante recebe 404, avaliação antes do encontro, edição bloqueada após avaliação da outra parte.
3. Progresso (consulta agregada) e endpoint do coordenador. Teste unitário do cálculo e de integração da consulta.
4. Encerramento e tarefa diária de transições, com e-mails. Testes: pedido duplicado, desistência, transição idempotente em `TERMINATED` e `COMPLETED`.
5. App: página do par e colunas do painel.
6. Revisão do texto do acordo pela coordenação, migração com a versão final, publicação.

Critério de pronto: um par de teste vai de `ACCEPTED` a `ACTIVE` com três assinaturas, registra 5 encontros avaliados pelos dois, e o painel mostra 5 de 5; outro par pede encerramento e vira `TERMINATED` 14 dias depois.

### Fase 4 — Check-ins, avaliações e certificado (2 a 3 semanas)

- Tarefa agendada: check-in em 2 semanas, avaliação em 6 e 12 meses, lembrete de encontro mensal.
- Formulários de avaliação dentro do app, com as perguntas da planilha (escalas fixas para análise).
- Certificado em PDF quando o par termina com 5 ou mais encontros satisfatórios dos dois lados.
- Exportação CSV anonimizada para pesquisa, só de quem consentiu.

### Fase 5 — Produção

- Ambiente de staging e produção, backup do banco, HTTPS, logs centralizados e alertas básicos.
- Avaliar se a malha de microsserviços (registry, gateway, auth, core) é necessária para 20 pares por ano. Um core com auth embutido reduziria custo e operação. Decidir antes de ir para produção.

## 5. Decisões em aberto para a coordenação

1. Um mentor pode ter mais de um mentee por ciclo?
2. Formato e frequência são livres (programa) ou mensais por vídeo, 1 hora (acordo)?
3. Quem avalia "encontro satisfatório": cada parte, ambas, ou o coordenador?
4. Os dados atuais da planilha podem ser importados? Precisa pedir novo consentimento?
5. Qual código de ética vale (GPS-Pean ou ICF)?
6. Em quais idiomas a interface precisa existir além de inglês e português?
