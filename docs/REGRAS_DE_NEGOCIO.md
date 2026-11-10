# Regras de negócio — Mentor-Mentee

Regras do programa de mentoria e de como a plataforma as aplica. Vale para todos os projetos (auth, core, app, gateway, registry).

Como e quando cada regra é construída está em [PLANO.md](PLANO.md). Este arquivo diz **o que** vale; o plano diz **como** e **em que ordem**.

Situação de cada regra:

- **[feito]**: já está no código.
- **[planejado: fase N]**: decidida, ainda não construída.
- **[em aberto]**: depende de decisão da coordenação (seção 15). O texto mostra o padrão adotado até lá.

Fontes: `Mentor-mente Program.docx`, `Mentor Mentee - Agreement.docx` e a planilha `Mentor Mentee 2.0.xlsx`.

---

## 1. O programa

1. Programa gratuito de mentoria em saúde rural, entre um mentor e um mentee (estudante ou profissional em início de carreira).
2. Fluxo, na ordem: cadastro, match pela coordenação, proposta anônima, aceite dos dois, e-mail de apresentação, assinatura do acordo, encontros, check-in, avaliações, encerramento e certificado.
3. Um par dura 1 ano, ou até o fim do ciclo, o que vier antes.
4. No máximo 20 pares por ano.

## 2. Papéis e acesso

1. Há três papéis: `MENTOR`, `MENTEE` e `COORDINATOR`. Cada conta tem um só papel, gravado no token. **[feito]**
2. O cadastro público só oferece `MENTOR` e `MENTEE`. Enviar `COORDINATOR` no cadastro é recusado (400). **[feito]**
3. Contas de coordenador são criadas fora da API, pelo script `mentor-mentee-auth/scripts/create-coordinator.sh`. Em dev, o perfil `local` do auth cria `coordinator@test.com`. Não existe endpoint para criar ou promover coordenador. **[feito]**
4. A conta de coordenador é separada: não deve ter perfil de mentor ou mentee. Coordenador não cria perfil (403). **[feito]**
5. Logins separados **[feito]**:
   - `/users/login` aceita só mentor e mentee.
   - `/users/coordinator/login` aceita só coordenador.
   - Papel errado recebe a mesma resposta de senha errada, para não revelar o papel da conta, e conta como tentativa falha.
6. No app, o coordenador entra por `/coordination/login`. Nenhuma página tem link para ela. Cada papel só vê suas próprias páginas: quem abre a página de outro papel é levado para a sua. **[feito]**
7. A regra que protege os dados é a do servidor: endpoints em `/coordination/**` exigem o papel `COORDINATOR` e respondem 403 (`core.access.denied`) para os outros. **[feito]**
8. Um participante nunca lista nem lê perfis de outras pessoas. Só vê o perfil da outra parte do próprio par, e nos limites da seção 7. **[feito]** para o bloqueio; **[planejado: fase 2]** para a visão do par.
9. Quem não participa de um par e não é coordenador recebe 404 ao tentar acessá-lo, para não revelar que o par existe. **[planejado: fase 2]**
10. Login: no máximo 5 tentativas por e-mail e IP, e 50 por IP, a cada 15 minutos. Login certo devolve a tentativa. Sem Redis, o login falha em vez de rodar sem proteção. **[feito]**
11. E-mail de login é guardado sem espaços e em minúsculas: variações de maiúsculas são a mesma conta. **[feito]**
12. Senha: de 8 a 72 caracteres, e no máximo 72 bytes. **[feito]**

## 3. Cadastro e perfil

1. Cada usuário tem no máximo um perfil. Papel e usuário vêm do token, nunca do corpo da requisição. **[feito]**
2. Campos comuns obrigatórios: nome, data de nascimento, gênero, idiomas (pelo menos 1), profissão (para o mentee, a escolha de carreira), ano de formatura, formação acadêmica, endereço com país, motivação, expectativas, objetivos, preferência de contato e áreas de interesse (pelo menos 1). **[feito]**
3. Idade entre 16 e 120 anos, calculada pela data de nascimento. **[feito]**
4. Ano de formatura entre 1940 e 2100. **[feito]**
5. Link profissional, se informado, começa com `http://` ou `https://`. **[feito]**
6. Idiomas e áreas de interesse precisam existir nas tabelas de referência. Itens repetidos contam uma vez. **[feito]**
7. Campos só de mentor (experiência e treinamento em mentoria, formação que aceita mentorar) e só de mentee (gêneros de mentor aceitos) são ignorados quando enviados pelo outro papel. **[feito]**
8. O e-mail de login fica guardado no perfil a cada salvamento, tirado do token. Ele é usado para enviar e-mails, não aparece na resposta e não pode ser enviado pelo usuário. **[feito]**
9. Contatos (telefone, e-mail) e nome nunca aparecem para a outra parte antes do aceite do par (seção 7). **[feito]** para o perfil próprio; **[planejado: fase 2]** para a visão do par.
10. O mentee pode aceitar vários gêneros de mentor. Nenhum marcado significa sem preferência. Itens repetidos contam uma vez. **[feito]**

## 4. Consentimento

1. Para salvar o perfil, a pessoa aceita o documento de termos de uso e privacidade em vigor. Quando entra uma versão nova, o próximo salvamento exige novo aceite. Aceitar um documento que não está mais em vigor é recusado (409, `core.consent.outdated`): a pessoa lê a versão nova e aceita de novo. **[feito]**
2. Os textos são versionados no banco do core. Cada versão (termos ou pesquisa) é um documento, com o texto em cada idioma: por enquanto `pt_BR` e `en_US`, da tabela de idiomas. Vale a versão mais recente já publicada. Texto publicado nunca muda (o banco recusa): texto novo é versão nova, criada por migração. O app mostra o texto vindo do servidor; a página de termos é pública. **[feito]**
3. O uso dos dados em pesquisa é opcional e separado dos termos, com documento próprio. Não informado, mantém a escolha anterior; num perfil novo, vale "não". **[feito]**
4. Cada decisão (termos ou pesquisa) vira uma linha nova, que aponta para o documento aceito e o idioma em que a pessoa leu, com a data. O texto fica guardado uma vez só, no documento. Linhas nunca são alteradas: o histórico mostra cada decisão uma vez. **[feito]**
5. O consentimento de pesquisa não faz parte do acordo de mentoria. **[feito]**

## 5. Ciclo (cohort)

1. Um ciclo tem nome, data de início e data de fim. As duas datas contam. O fim é depois do início. **[feito]**
2. Dois ciclos nunca têm um dia em comum, mesmo com duas gravações ao mesmo tempo. O banco garante isso. **[feito]**
3. O ciclo aberto é o que contém a data de hoje (UTC). Propostas só acontecem no ciclo aberto. **[feito]** para "aberto"; **[planejado: fase 2]** para propostas.
4. Cada ciclo tem um limite de pares: padrão 20, entre 1 e 20. **[feito]**
5. Cada ciclo tem um limite de mentees por mentor: padrão 1. **[feito]** — **[em aberto]**, decisão 1.
6. Só o coordenador cria, edita e consulta ciclos. Ciclos não são apagados: são editados. **[feito]**
7. O limite de pares conta os pares do ciclo que não foram recusados. Duas propostas simultâneas não passam do limite. **[planejado: fase 2]**
8. Reduzir os limites abaixo do que o ciclo já tem é recusado. **[planejado: fase 2]**

## 6. Matching

1. Só o coordenador vê sugestões de par. **[planejado: fase 2]**
2. Um candidato só aparece se **[planejado: fase 2]**:
   - os dois aceitaram a versão vigente dos termos;
   - os dois têm pelo menos um idioma em comum;
   - o gênero do mentor está entre os que o mentee aceita, ou o mentee não tem preferência;
   - o mentee não tem par aberto (proposto, aceito ou ativo);
   - o mentor está abaixo do limite de mentees do ciclo.
3. Entre os candidatos, a ordem vem de uma nota de 0 a 100, com o detalhe de cada critério: áreas de interesse em comum, localização, profissão e experiência do mentor em mentoria. Os pesos são configuráveis. **[feito]** para a nota; **[planejado: fase 2]** para o endpoint.
4. Nível de formação não filtra: os campos são texto livre. O coordenador vê a formação do mentee e o que o mentor aceita, lado a lado, e decide. **[planejado: fase 2]**

## 7. Proposta e par

1. O coordenador propõe um par (um mentor e um mentee) no ciclo aberto. **[planejado: fase 2]**
2. Estados do par **[planejado: fases 2 e 3]**:
   - `PROPOSED`: proposto pela coordenação;
   - `ACCEPTED`: os dois aceitaram;
   - `ACTIVE`: os três assinaram o acordo;
   - `COMPLETED`: chegou ao fim do período;
   - `TERMINATED`: encerrado antes do fim;
   - `DECLINED`: recusado ou retirado antes do aceite.
3. Cada parte aceita ou recusa a proposta. O motivo da recusa é opcional e só o coordenador vê. O coordenador pode retirar uma proposta ainda não aceita. **[planejado: fase 2]**
4. Um mentee tem no máximo um par aberto. O banco garante isso. **[planejado: fase 2]**
5. Proposta anônima. Enquanto o par está `PROPOSED`, cada parte vê da outra **[planejado: fase 2]**:
   - **pode ver:** papel, país, região, profissão, ano de formatura, formação acadêmica, idiomas, áreas de interesse, motivação, objetivos, experiência e treinamento em mentoria;
   - **nunca vê:** nome, data de nascimento, contatos, link profissional, cidade, informações adicionais.
6. A cidade fica escondida porque, numa vila pequena, ela identifica a pessoa. **[planejado: fase 2]**
7. Texto livre pode conter o nome. O coordenador vê a mesma visão anônima antes de propor. **[planejado: fase 2]**
8. Depois que os dois aceitam, cada um vê o perfil completo do outro, com contatos. **[planejado: fase 2]**

## 8. Acordo

1. O texto do acordo é versionado. Uma versão publicada nunca muda: texto novo é versão nova. **[planejado: fase 3]**
2. O par só fica `ACTIVE` depois que mentor, mentee e coordenador assinam a mesma versão. Cada um pode ler no seu idioma. **[planejado: fase 3]**
3. Assinatura é um aceite eletrônico simples: a pessoa lê o texto, digita o nome completo e confirma. Ficam gravados usuário, versão, hash do texto e data. Não é assinatura com certificado digital. **[planejado: fase 3]** — a coordenação precisa confirmar que basta.
4. Cada papel assina uma vez por par. **[planejado: fase 3]**
5. Se sair versão nova no meio, vale a versão vigente na primeira assinatura do par. **[planejado: fase 3]**
6. O par começa (`startedAt`) na terceira assinatura. Termina 1 ano depois, ou no fim do ciclo, o que vier antes. **[planejado: fase 3]**
7. O texto do acordo precisa de revisão antes de publicar **[planejado: fase 3]**:
   - tirar a cobrança por sessão perdida e o limite de responsabilidade "ao valor pago", porque o programa é gratuito;
   - trocar as referências a serviço social e à conferência de 2018;
   - escolher um só código de ética.

## 9. Encontros

1. Só pares `ACTIVE` registram encontros. **[planejado: fase 3]**
2. Mentor ou mentee registra o encontro: data e hora, duração, formato (vídeo, telefone, presencial, outro), áreas discutidas e notas opcionais. **[planejado: fase 3]**
3. Encontro com data futura é um encontro agendado. Isso cobre o "mentor informa data e hora à coordenação". **[planejado: fase 3]**
4. Cada parte avalia o encontro uma vez, como satisfatório ou não, com comentário opcional. A avaliação só é possível depois da data do encontro. Ela pode ser corrigida enquanto o par está ativo. **[planejado: fase 3]**
5. O comentário da avaliação só o coordenador vê, não a outra parte. **[planejado: fase 3]**
6. Quem registrou pode editar ou apagar o encontro até a outra parte avaliar. Depois, só o coordenador corrige. **[planejado: fase 3]**
7. Duração menor que 1 hora não bloqueia o registro; o app só avisa. **[planejado: fase 3]** — **[em aberto]**, decisão 2.

## 10. Progresso e certificado

1. Um encontro conta como satisfatório quando os dois o avaliam como satisfatório. **[planejado: fase 3]** — **[em aberto]**, decisão 3.
2. A meta é de 5 encontros satisfatórios. **[planejado: fase 3]**
3. O par e o coordenador veem: encontros feitos, agendados, satisfatórios, pendentes de avaliação e quanto falta para 5. **[planejado: fase 3]**
4. Ao fim do par, quem tem 5 ou mais encontros satisfatórios recebe certificado em PDF. **[planejado: fase 4]**

## 11. Encerramento

1. Mentor, mentee ou coordenador pode pedir o encerramento antecipado, com motivo obrigatório. **[planejado: fase 3]**
2. O pedido é o aviso por escrito. A outra parte e a coordenação recebem e-mail. **[planejado: fase 3]**
3. O encerramento vale 14 dias depois do pedido. Até lá o par continua ativo, e os encontros contam. **[planejado: fase 3]**
4. Quem pediu pode desistir antes dos 14 dias. Só um pedido aberto por par. **[planejado: fase 3]**
5. Ao fim do período, o par passa para `COMPLETED` automaticamente. **[planejado: fase 3]**

## 12. Check-ins e avaliações

1. Check-in individual 2 semanas depois do início do par, lembrando a regra dos 5 encontros. **[planejado: fase 4]**
2. Avaliação de mentor e de mentee aos 6 e aos 12 meses, dentro do app, com as perguntas da planilha e escalas fixas. **[planejado: fase 4]**
3. Lembrete mensal de encontro. **[planejado: fase 4]**

## 13. E-mails

1. Todo e-mail é gravado na mesma transação da mudança que o gerou e enviado depois, com novas tentativas em caso de falha. Uma falha de envio não desfaz a mudança nem perde o e-mail. **[planejado: fase 2]**
2. Os textos vão em inglês e português no mesmo e-mail. **[planejado: fase 2]**
3. E-mails previstos:
   - proposta recebida, para cada parte, sem dados da outra **[planejado: fase 2]**;
   - proposta recusada, para a coordenação **[planejado: fase 2]**;
   - apresentação, para os dois, com cópia para a coordenação, com nome e e-mail de cada um **[planejado: fase 2]**;
   - pedido de encerramento, para a outra parte e para a coordenação **[planejado: fase 3]**;
   - check-ins, avaliações e lembretes **[planejado: fase 4]**.
4. A coordenação recebe numa caixa compartilhada, configurada por ambiente. **[planejado: fase 2]**

## 14. Pesquisa e dados

1. Exportação para pesquisa só inclui quem deu consentimento de pesquisa, e sem dados que identifiquem a pessoa. **[planejado: fase 4]**

## 15. Decisões em aberto da coordenação

| # | Pergunta | Padrão até a decisão |
|---|---|---|
| 1 | Um mentor pode ter mais de um mentee por ciclo? | 1, ajustável por ciclo |
| 2 | Encontros livres (programa) ou mensais por vídeo, de 1 hora (acordo)? | Registro livre; aviso abaixo de 1 hora; lembrete mensal |
| 3 | Quem avalia "encontro satisfatório"? | Cada parte; conta quando os dois marcam |
| 4 | Os dados da planilha podem ser importados? | Não há o que importar: as abas de inscrição estão vazias |
| 5 | Qual código de ética vale (GPS-Pean ou ICF)? | Definir na revisão do acordo |
| 6 | Em quais idiomas a interface precisa existir? | Inglês e português |
| 7 | O aceite eletrônico simples basta como assinatura do acordo? | Sim |
| 8 | Os textos de termos e privacidade estão aprovados? | Rascunho publicado como versão `2026-11-10`; a versão aprovada entra como versão nova |
