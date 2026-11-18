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
2. Fluxo, na ordem: cadastro, match pela coordenação, proposta anônima, aceite do mentee e depois do mentor, e-mail de apresentação, assinatura do acordo, encontros, check-in, avaliações, encerramento e certificado.
3. Um par dura 1 ano, ou até o fim do ciclo, o que vier antes.
4. No máximo 20 pares por ano.

## 2. Papéis e acesso

1. Há três papéis: `MENTOR`, `MENTEE` e `COORDINATOR`. O token leva um papel ativo por vez. Uma conta de participante pode ter os dois papéis de participante (2.15); a de coordenador tem só esse. **[feito]**
2. O cadastro público só oferece `MENTOR` e `MENTEE`. Enviar `COORDINATOR` no cadastro é recusado (400). **[feito]**
3. Contas de coordenador são criadas fora da API, pelo script `mentor-mentee-auth/scripts/create-coordinator.sh`. Em dev, o perfil `local` do auth cria `coordinator@test.com`. Não existe endpoint para criar ou promover coordenador. **[feito]**
4. A conta de coordenador é separada: não deve ter perfil de mentor ou mentee. Coordenador não cria perfil (403). **[feito]**
5. Logins separados **[feito]**:
   - `/users/login` aceita só mentor e mentee.
   - `/users/coordinator/login` aceita só coordenador.
   - Papel errado recebe a mesma resposta de senha errada, para não revelar o papel da conta, e conta como tentativa falha.
6. No app, o coordenador entra por `/coordination/login`. Nenhuma página tem link para ela. Cada papel só vê suas próprias páginas: quem abre a página de outro papel é levado para a sua. **[feito]**
7. A regra que protege os dados é a do servidor: endpoints em `/coordination/**` exigem o papel `COORDINATOR` e respondem 403 (`core.access.denied`) para os outros. **[feito]**
8. Um participante nunca lista nem lê perfis de outras pessoas. Só vê o perfil da outra parte do próprio par, e nos limites da seção 7. **[feito]**
9. Quem não participa de um par e não é coordenador recebe 404 ao tentar acessá-lo, para não revelar que o par existe. O mesmo vale para o mentor antes de o mentee aceitar (7.3). **[feito]**
10. Login: no máximo 5 tentativas por e-mail e IP, e 50 por IP, a cada 15 minutos. Um endereço IPv6 conta pela rede /64 dele, para não driblar o limite trocando de endereço. Login certo devolve a tentativa. Sem Redis, o login falha em vez de rodar sem proteção. **[feito]**
11. E-mail de login é guardado sem espaços e em minúsculas: variações de maiúsculas são a mesma conta. **[feito]**
12. Senha: de 8 a 72 caracteres, e no máximo 72 bytes. **[feito]**
13. Sessão recusada pelo servidor (token vencido, alterado, ou conta apagada) termina a sessão no app e abre o login com o motivo ("sua sessão expirou"). Senha errada no login continua sendo erro do formulário. **[feito]**
14. Todo erro dos serviços tem um código traduzido nos dois idiomas, inclusive pedido malformado, valor do tipo errado (mostrado junto do campo), caminho ou método inexistente. Nenhum texto técnico em inglês chega à pessoa. **[feito]**
15. Mentor que também é mentee, ou o contrário **[feito]**:
   - A pessoa acrescenta o outro papel de participante pela página de perfil, na mesma conta e com o mesmo e-mail. Coordenador nunca acumula papel de participante: quem coordena e participa usa outra conta (403).
   - Cada papel tem o próprio perfil, o próprio aceite de termos e a própria preferência de aviso. O formulário do papel novo vem preenchido com o que o outro perfil já diz (nome, nascimento, gênero, idiomas, formação, contatos, endereço); nada é salvo antes de a pessoa salvar.
   - Um papel ativo por vez. Trocar de papel pede um token novo e o app inteiro passa a mostrar o outro papel, avisos incluídos. O login começa no último papel usado. Um papel acrescentado só passa a contar como usado quando o perfil dele é salvo: quem acrescenta e sai sem salvar volta a entrar no papel antigo.
   - Ninguém forma par consigo mesmo (6.2 e 7).
   - Ser mentee e mentor no mesmo ciclo é permitido (seção 15, item 9).
16. Auditoria de autenticação: o auth guarda cada cadastro (também o recusado por e-mail já cadastrado), tentativa de login (certa ou errada), papel acrescentado e troca de papel, com conta, e-mail digitado, IP, navegador e hora. Login errado guarda o motivo (e-mail sem conta, senha errada, página de login do outro papel) só na auditoria: a resposta continua a mesma. Se o e-mail digitado não tem conta e nem parece e-mail, guarda só um marcador, porque pode ser a senha digitada no campo errado. Tentativas recusadas pelo limite de 2.10 não são guardadas: o limite já impede que um só endereço encha a tabela. As linhas nunca mudam. Ainda sem tela nem prazo de retenção: IP é dado pessoal (LGPD), então a coordenação precisa decidir por quanto tempo guardar antes de produção. **[feito]**
   - Remover um papel não existe no app: quem desiste pede à coordenação.

## 3. Cadastro e perfil

1. Cada usuário tem no máximo um perfil. Papel e usuário vêm do token, nunca do corpo da requisição. **[feito]**
2. Campos comuns obrigatórios: nome, data de nascimento, gênero, idiomas (pelo menos 1), profissão (para o mentee, a escolha de carreira), ano de formatura, formação acadêmica, endereço com país, motivação, expectativas, objetivos, preferência de contato e áreas de interesse (pelo menos 1). **[feito]**
3. Idade entre 16 e 120 anos, calculada pela data de nascimento. **[feito]**
4. Ano de formatura entre 1940 e 2100. **[feito]**
5. Link profissional, se informado, começa com `http://` ou `https://`. **[feito]**
6. Idiomas e áreas de interesse precisam existir nas tabelas de referência. Itens repetidos contam uma vez. **[feito]**
7. As áreas de interesse têm nome em cada idioma da interface (inglês quando falta tradução) e mudam com o tempo. Uma área retirada sai do formulário e não pode ser escolhida de novo, mas continua no perfil de quem já a tinha e continua contando no matching. **[feito]**
7. Campos só de mentor (experiência e treinamento em mentoria, formação que aceita mentorar) e só de mentee (gêneros de mentor aceitos) são ignorados quando enviados pelo outro papel. **[feito]**
8. O e-mail de login fica guardado no perfil a cada salvamento, tirado do token. Ele é usado para enviar e-mails, não aparece na resposta e não pode ser enviado pelo usuário. **[feito]**
9. Contatos (telefone, e-mail) e nome nunca aparecem para a outra parte antes do aceite do par (seção 7). **[feito]**
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
3. O ciclo aberto é o que contém a data de hoje (UTC). Propostas só acontecem no ciclo aberto: sem ciclo aberto, a proposta é recusada (409, `core.cohort.noneOpen`). **[feito]**
4. Cada ciclo tem um limite de pares: padrão 20, entre 1 e 20. **[feito]**
5. Cada ciclo tem um limite de mentees por mentor: padrão 1. **[feito]** — **[em aberto]**, decisão 1.
6. Só o coordenador cria, edita e consulta ciclos. Ciclos não são apagados: são editados. **[feito]**
7. O limite de pares conta os mentees do ciclo com par ou proposta não recusada; as opções de um mentee ocupam uma vaga só (409, `core.cohort.pairLimitReached`). Duas propostas simultâneas não passam do limite: a proposta trava a linha do ciclo até o fim da transação. O limite de mentees por mentor conta só os pares em que o mentee escolheu o mentor: uma opção não reserva vaga. Por isso o limite é checado de novo quando o mentee escolhe, com a mesma trava; se o mentor lotou nesse meio-tempo, a escolha é recusada (409, `core.mentorship.mentorUnavailable`) e o mentee escolhe outra opção ou recusa todas. **[feito]**
8. Reduzir os limites abaixo do que o ciclo já tem é recusado (409, `core.cohort.limitBelowPairs`). **[feito]**

## 6. Matching

1. Só o coordenador vê sugestões de par. **[feito]**
2. Um candidato só aparece se **[feito]**:
   - os dois aceitaram a versão vigente dos termos;
   - os dois têm pelo menos um idioma em comum;
   - o gênero do mentor está entre os que o mentee aceita, ou o mentee não tem preferência;
   - o mentee não tem par aberto (proposto, aceito ou ativo);
   - o mentor está abaixo do limite de mentees do ciclo aberto;
   - o mentor não é a mesma conta do mentee (2.15). A proposta também recusa esse caso (409, `core.mentorship.selfPair`).

   Na lista de mentees sem mentor, quem também tem perfil de mentor aparece marcado. **[feito]**

   Um mentee com par aberto sai da lista de mentees sem mentor; na página de matching, o par aberto aparece no lugar dos candidatos. **[feito]**
3. Entre os candidatos, a ordem vem de uma nota de 0 a 100, com o detalhe de cada critério: áreas de interesse em comum, localização, profissão e experiência do mentor em mentoria. Os pesos são configuráveis. **[feito]**
4. Nível de formação não filtra: os campos são texto livre. O coordenador vê a formação do mentee e o que o mentor aceita, lado a lado, e decide. **[feito]**
5. Na página de matching, o nome de cada mentor começa escondido, para a escolha partir do perfil. O coordenador pode mostrá-lo a qualquer momento. **[feito]**

## 7. Proposta e par

1. O coordenador propõe ao mentee de 1 a 3 mentores de uma vez (opções), no ciclo aberto, a partir dos candidatos da página de matching. O máximo fica em `Mentorship.MAX_MENTOR_OPTIONS` no core; o app lê dali. Mentor repetido é recusado (400, `core.mentorship.duplicateMentor`). Se um dos mentores não passa nos filtros da seção 6.2, a proposta inteira é recusada (409, `core.mentorship.notCandidate`). Para mudar as opções, o coordenador retira a proposta e propõe de novo; não dá para acrescentar mentores a uma proposta aberta. **[feito]**
2. Estados do par **[feito]** para `PROPOSED`, `ACCEPTED`, `ACTIVE` e `DECLINED`; **[planejado: fase 3]** para os outros:
   - `PROPOSED`: proposto pela coordenação; primeiro aguarda o mentee escolher, depois o mentor;
   - `ACCEPTED`: o mentee e depois o mentor aceitaram;
   - `ACTIVE`: os três assinaram o acordo;
   - `COMPLETED`: chegou ao fim do período;
   - `TERMINATED`: encerrado antes do fim;
   - `DECLINED`: recusado, retirado ou não escolhido antes do aceite.
3. O mentee responde primeiro: compara as opções e escolhe uma. As outras fecham como recusadas pelo sistema (`declined_by = SYSTEM`, "não escolhido"), e os mentores delas nunca ficam sabendo. O mentor só vê a proposta depois que o mentee o escolhe; antes disso, para ele, a proposta não existe (404). Se o mentor também aceita, o par fica `ACCEPTED`. Responde só quem está sendo aguardado (409, `core.mentorship.notAwaitingYou` para os outros). **[feito]**
4. Qualquer parte recusa quando é a sua vez. O mentee recusa todas as opções de uma vez. O motivo da recusa é opcional, tem até 500 caracteres e só o coordenador vê. A proposta recusada some para as duas partes, e o mentee volta para a lista de mentees sem mentor; a coordenação propõe de novo. O coordenador pode retirar uma proposta ainda não aceita pelos dois, com todas as opções (409, `core.mentorship.notProposed` depois disso); fica registrada como recusada pela coordenação. **[feito]** Avisar mentor, mentee e coordenador da recusa: **[planejado]** (TODO em `MentorshipService.decline`).
5. Um mentee tem no máximo uma proposta aberta (409, `core.mentorship.menteeAlreadyPaired`): as opções enquanto escolhe, depois a escolhida. O banco garante uma escolhida por mentee e cada mentor uma vez por proposta. **[feito]**
6. Proposta anônima. Enquanto o par está `PROPOSED`, cada parte vê da outra **[feito]**:
   - **pode ver:** papel, país, região, profissão, ano de formatura, formação acadêmica, idiomas, áreas de interesse, motivação, objetivos, experiência e treinamento em mentoria;
   - **nunca vê:** nome, data de nascimento, contatos, link profissional, cidade, informações adicionais.
7. A cidade fica escondida porque, numa vila pequena, ela identifica a pessoa. **[feito]**
8. A visão anônima vale só entre mentor e mentee. O coordenador vê o perfil completo, com nome, para saber quem é cada pessoa. Texto livre pode conter o nome: o coordenador confere antes de propor. **[feito]**
9. Depois que os dois aceitam, cada um vê da outra parte o nome, o e-mail, a cidade, o link profissional e os contatos. **[feito]**
10. No app, mentor e mentee têm a página "Minha mentoria"; o dashboard avisa quando uma proposta espera a resposta da pessoa. Sem e-mail ainda (seção 13): quem não abre o app não fica sabendo. **[feito]**

## 8. Acordo

1. O texto do acordo é versionado. Uma versão publicada nunca muda: texto novo é versão nova. **[feito]**
2. O par só fica `ACTIVE` depois que mentor, mentee e coordenador assinam a mesma versão. Cada um pode ler no seu idioma. **[feito]**
3. Assinatura é um aceite eletrônico simples: a pessoa lê o texto, digita o nome completo e confirma. Ficam gravados usuário, versão, hash do texto e data. Não é assinatura com certificado digital. **[feito]** — a coordenação precisa confirmar que basta.
4. Cada papel assina uma vez por par. **[feito]**
5. Se sair versão nova no meio, vale a versão vigente na primeira assinatura do par. **[feito]**
6. O par começa (`startedAt`) na terceira assinatura. Termina 1 ano depois, ou no fim do ciclo, o que vier antes. **[feito]**
7. O texto do acordo sai primeiro como versão provisória, já com conteúdo e marcada "não revisado": o app mostra um aviso acima do texto, e o texto começa com o mesmo aviso. A revisão da coordenação não tem data e não bloqueia o uso. A versão revisada entra como versão nova, sem mudar código, e o aviso some. **[feito]** no core (versão `2026-11-17`); o aviso no app entra com a tela, **[planejado: fase 3]**. O provisório já corrige o que a revisão apontou:
   - tirar a cobrança por sessão perdida e o limite de responsabilidade "ao valor pago", porque o programa é gratuito;
   - trocar as referências a serviço social e à conferência de 2018;
   - escolher um só código de ética.

## 9. Encontros

1. Só pares `ACTIVE` registram encontros. **[feito]**
2. Mentor ou mentee registra o encontro: data e hora, duração, formato (vídeo, telefone, presencial, outro), áreas discutidas e notas opcionais. **[feito]**
3. Encontro com data futura é um encontro agendado. Isso cobre o "mentor informa data e hora à coordenação". **[feito]**
4. Cada parte avalia o encontro uma vez, como satisfatório ou não, com comentário opcional. A avaliação só é possível depois da data do encontro. Ela pode ser corrigida enquanto o par está ativo; cada versão fica num histórico que nunca muda. **[feito]**
5. A avaliação (satisfatório ou não, e o comentário) só o coordenador vê. A outra parte vê só que o encontro já foi avaliado. **[feito]**
6. Quem registrou pode editar ou apagar o encontro até a outra parte avaliar. Depois, só o coordenador corrige. **[feito]**
7. Duração menor que 1 hora não bloqueia o registro; o app só avisa. **[feito]** no core; o aviso entra com a tela (**[planejado: fase 3]**). — **[em aberto]**, decisão 2.
8. O coordenador corrige qualquer encontro de um par ativo, avaliado ou não: data, duração, formato, notas e áreas, e pode apagá-lo. Isso cobre o par que se encontrou antes da data registrada: o coordenador adianta o encontro, e as partes podem avaliá-lo. As avaliações ficam. **[feito]**
9. Encontro já avaliado não pode ir para uma data futura, nem pelo coordenador: a avaliação diz que ele aconteceu. **[feito]**
10. Apagar um encontro é lógico: ele some das listas, mas a linha e as avaliações ficam como registro. Cada criação, correção e exclusão de encontro fica no histórico, com quem fez. **[feito]**
11. A data do encontro fica dentro do período do par: do dia em que ele começou (terceira assinatura) até o último dia, em UTC. Vale também para o coordenador. **[feito]**

## 10. Progresso e certificado

1. Um encontro conta como satisfatório quando os dois o avaliam como satisfatório. **[feito]** — **[em aberto]**, decisão 3.
2. A meta é de 5 encontros satisfatórios. **[feito]**
3. O par e o coordenador veem: encontros feitos, agendados, satisfatórios, pendentes de avaliação e quanto falta para 5. **[feito]** no core; a tela entra no passo 5 da fase 3.
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

## 13. Notificações e e-mails

1. Todo e-mail é gravado na mesma transação da mudança que o gerou e enviado depois, com novas tentativas em caso de falha. Uma falha de envio não desfaz a mudança nem perde o e-mail. **[feito]**
2. Os textos vão em inglês e português no mesmo e-mail. **[feito]**
3. E-mails previstos:
   - proposta recebida, sem dados da outra parte: para o mentee quando a coordenação propõe, para o mentor quando o mentee aceita **[feito]**;
   - proposta recusada, para a coordenação, com o motivo **[feito]**;
   - recusa do mentor, para o mentee, sem o motivo; proposta retirada, para o mentee e para o mentor que ele já tinha escolhido **[feito]**;
   - apresentação, para os dois, com cópia para a coordenação, com nome e e-mail de cada um **[feito]**;
   - pedido de encerramento, para a outra parte e para a coordenação **[planejado: fase 3]**;
   - check-ins, avaliações e lembretes **[planejado: fase 4]**.
4. A coordenação recebe numa caixa compartilhada, configurada por ambiente (`COORDINATION_EMAIL`). Sem caixa configurada, a coordenação não recebe e-mail, só os avisos no app. **[feito]**
5. Notificações gerais, para cada perfil a quem o evento interessa (mentee, mentor, coordenação): novo mentee, novo mentor, mentee escolheu um mentor, mentor aceitou o mentee, recusas, proposta retirada. Todo evento vira um aviso no app; os eventos do item 3 também vão por e-mail. **[feito]**
6. Mentor e mentee escolhem no perfil como querem ser avisados: no app e por e-mail (padrão) ou só no app. Só no app, nenhum e-mail é gravado para a pessoa; os avisos no app continuam. A coordenação não tem essa escolha. **[feito]**
7. Os avisos no app não levam nomes: o app escreve o texto pelo tipo do aviso. Assim a proposta continua anônima (7.5). Cada pessoa vê só os próprios avisos; os coordenadores dividem uma caixa, e quem lê um aviso marca como lido para todos. **[feito]**
8. Conversa assíncrona entre mentor e mentee pelo app, depois do aceite. Cada mensagem nova gera um aviso (item 5) e, para quem não escolheu "só no app", um e-mail. **[planejado]**

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
| 9 | A mesma pessoa pode ser mentee e mentora no mesmo ciclo? | Sim, nunca no mesmo par |
| 10 | Quando o texto do acordo será revisado? | Sem data; vale o texto provisório marcado "não revisado" (8.7) |
