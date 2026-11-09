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

### Fase 0 — Base (1 a 2 semanas)

- CI em cada repositório: build, `test`, `integrationTest`, lint do app.
- Corrigir nomes de idiomas (migração nova, sem alterar V1).
- Fechar `/matches` e `GET /customers/{userId}` até existir o papel de coordenador.
- Substituir `systemdesign.md` por decisões reais (ou remover).

### Fase 1 — Cadastro completo e consentimento (2 a 3 semanas)

- Adicionar ao perfil os campos da seção 3.2. Separar campos de mentor e de mentee na validação.
- Data de nascimento no lugar de idade. Ano de formatura no lugar de `isGraduated`/`generation`.
- Aceite de termos de uso, privacidade e (opcional) pesquisa, com versão e data.
- Telas do app para os novos campos, em inglês e português.
- Importar os cadastros existentes da planilha (script único, com consentimento dos participantes).

### Fase 2 — Coordenação e proposta de par (3 semanas)

- Papel `COORDINATOR` no auth.
- Ciclo (`cohort`): ano, datas, limite de 20 pares.
- Matching só para coordenador, com filtros duros: idioma comum, preferência de gênero, sem par ativo, nível de formação aceito.
- Entidade `Mentorship` com estados: `PROPOSED → ACCEPTED_BY_MENTEE / ACCEPTED_BY_MENTOR → ACTIVE → COMPLETED / TERMINATED`, ou `DECLINED`.
- Proposta anônima: cada parte vê o perfil da outra sem nome e contato até os dois aceitarem.
- E-mail de apresentação automático quando o par fica ativo.
- Painel do coordenador: inscritos sem par, propostas pendentes, pares ativos.

### Fase 3 — Acordo e encontros (2 a 3 semanas)

- Acordo revisado (seção 3.4) como texto versionado. Aceite digital pelos três, com data.
- Registro de encontro: data, duração, formato, áreas discutidas, marcado como satisfatório por cada parte.
- Visão do par e do coordenador: encontros feitos, quanto falta para 5 satisfatórios.
- Encerramento antecipado com aviso de 2 semanas e motivo.

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
