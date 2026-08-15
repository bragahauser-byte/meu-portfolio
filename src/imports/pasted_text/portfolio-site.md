Crie um site portfólio desktop, com foco em design de interação e fidelidade máxima ao layout de referência anexado. Este site tem 3 telas principais e uma navegação baseada em "camadas" que se abrem sobre a home.

1. Especificações técnicas do grid (respeitar rigorosamente em todas as telas)
Canvas: 1920 x 1080px
Grid: 8 colunas
Margem lateral: 40px
Gutter (espaço entre colunas): 20px
Rows: 4 linhas
Margem de rows: 40px
Gutter de rows: 20px
Todo o posicionamento de textos, imagens e blocos deve se alinhar a esse grid. Nada deve "flutuar" fora dele.
2. Estrutura de telas
2.1 Home
Tela inicial do site.
Canto superior esquerdo: "Hi, I'm [Nome], a digital designer from [Cidade]. I like turning ideas into clear, functional interfaces :)" — "Hi, I'm [Nome]" em destaque (peso maior/cor mais escura), restante do texto em cinza mais claro.
Canto inferior esquerdo: links de contato — LINKEDIN, MEDIUM, EMAIL, em caixa alta, pequenos, alinhados horizontalmente.
Lado direito da tela: um card grande (aprox. metade da largura da tela, alinhado ao grid) exibindo a imagem/preview de um projeto (ex.: interface de um app ou site).
Animação do card de projetos: as imagens dos projetos trocam automaticamente em um ciclo, com uma transição suave da esquerda para a direita, como um carrossel/catálogo. Vou fornecer as imagens dos projetos que devem entrar nesse ciclo (inicialmente 3, com espaço para adicionar mais depois).
Clicar na imagem do projeto ativo leva para a página daquele projeto (ver seção 2.3).
Clicar no nome "[Nome]" no texto de apresentação leva para a página "About Me" (easter egg — não deve parecer um link óbvio até o hover).
2.2 About Me (easter egg)
Acessada ao clicar no nome na home.
Topo da tela (duas colunas dentro do grid): à esquerda "Experience" (empresa — cargo, anos), à direita "Education" (curso — instituição, anos). Títulos em preto, subtítulo em cinza.
Abaixo, um bloco de texto centralizado (aprox. na metade direita/central da tela), maior que o texto padrão, contendo um texto pessoal/manifesto sobre a visão de design do usuário, dividido em parágrafos.
Comportamento de scroll (crítico):
Ao rolar a página, o texto central se reposiciona/ajusta automaticamente de forma suave (auto-scroll assistido), sempre mantendo boa legibilidade — sem saltos bruscos.
Conforme o usuário rola para baixo, o cabeçalho superior (Experience / Education) desaparece gradualmente (fade out), abrindo espaço para a leitura do texto.
Os links LINKEDIN, MEDIUM, EMAIL no canto inferior esquerdo permanecem fixos na tela durante todo o scroll (não desaparecem, não se movem).
Cursor nesta página: ver seção 3 (vira um "X" e fecha ao clicar em qualquer lugar).
2.3 Página de Projeto
Acessada ao clicar em uma imagem de projeto na home.
Layout em duas colunas dentro do grid:
Coluna esquerda: título do projeto (ex. "Decolar — Design study") + texto corrido explicando o processo/case do projeto, dividido em parágrafos.
Coluna direita: catálogo vertical de imagens do projeto (telas do app, fotos, mockups), empilhadas com espaçamento consistente.
Espaçamentos obrigatórios:
Texto da coluna esquerda: 40px de distância da margem da tela E 40px de distância da coluna de imagens.
Quando o texto terminar (for mais curto que o catálogo de imagens, o que é o caso mais comum), ele deve travar (position: sticky) mantendo exatos 40px de distância da borda inferior da viewport enquanto o usuário continua a rolar as imagens à direita.
A última imagem do catálogo deve terminar com exatos 40px de distância da borda inferior do conteúdo.
Comportamento de scroll (crítico):
Um único scroll vertical controla a rolagem das imagens à direita.
O texto à esquerda rola normalmente até acabar; a partir daí, fica fixo (sticky) na posição de 40px do rodapé, enquanto as imagens continuam a rolar por baixo/ao lado dele.
Cursor nesta página: ver seção 3.
3. Navegação e cursor customizado (regra global)

Dois estados de cursor customizado substituem a seta padrão do mouse, conforme referência anexada:

3.1 Cursor "ver projeto" (somente na Home, ao passar sobre uma imagem de projeto)
Um círculo branco preenchido, com uma seta preta apontando para a direita (→) no centro, acompanhando o mouse.
Aparece somente quando o cursor está sobre a área de uma imagem/card de projeto na Home, sinalizando que aquele elemento é clicável e leva à página do projeto.
Some (volta ao cursor padrão) quando o mouse sai da área da imagem.
3.2 Cursor "fechar" (X — em qualquer página que não seja a Home)
Em qualquer página que não seja a Home (About Me ou Página de Projeto), o cursor do mouse deixa de ser a seta padrão e vira um ícone de fechar: um "X" preto, acompanhando o mouse por toda a extensão da tela.
Vale para a página inteira — não importa sobre qual elemento o mouse esteja, o cursor permanece como X enquanto o usuário estiver em About Me ou em uma Página de Projeto.
Clicar em qualquer ponto da tela nessas páginas fecha a camada atual e retorna para a Home (não precisa de botão de fechar visível — é o próprio cursor que comunica a ação).
Essa navegação deve funcionar de forma consistente nas duas páginas secundárias.
3.3 Transição entre telas
Toda vez que uma nova tela é aberta a partir da Home (About Me ou Página de Projeto) — e também ao fechar e retornar à Home — a transição deve ser animada, entrando/saindo da direita para a esquerda (slide horizontal), de forma suave e bem executada (ease-in-out, duração aprox. 300–500ms).
Esse comportamento de transição da direita para a esquerda deve ser consistente e aplicado sempre, independentemente de qual página está sendo aberta ou fechada.
4. Estados de hover (regra global)

Aplicar a todos os elementos interativos de texto (nome "[Nome]" na home, "LINKEDIN", "MEDIUM", "EMAIL" em todas as páginas):

Ao passar o mouse (hover), o texto muda de cor para 
#DB224D.
Simultaneamente, surge um sublinhado (underline) logo abaixo do texto, indicando que é clicável/navegável.
Transição suave (ex. 150–200ms ease) tanto na cor quanto no underline.
5. Estilo visual geral
Fundo predominantemente branco/off-white, tipografia limpa em preto e cinza (sans-serif, estilo neutro tipo Inter/Helvetica), seguindo a referência anexada.
Hierarquia tipográfica: texto de destaque (nome, títulos de seção) maior e mais escuro; texto de apoio menor e em cinza médio.
Uso de cor limitado ao acento 
#DB224D para estados de interação (hover), mantendo o restante do site minimalista em preto, branco e cinza.
Imagens de projeto com cantos levemente arredondados, ocupando blocos bem definidos do grid.
6. Responsividade
Prioridade total é a fidelidade ao layout desktop (1920x1080) conforme as referências anexadas — não simplificar nem improvisar o desktop.
Criar também uma versão mobile funcional e coerente com a mesma identidade visual, adaptando:
Empilhamento vertical do conteúdo que hoje é lado a lado (ex. About Me: Experience/Education empilhados; Projeto: texto acima, imagens abaixo).
Cursor customizado (X) não se aplica em mobile — usar um botão de fechar (X) visível no canto superior, com a mesma lógica de "toque em qualquer lugar fecha e volta à home" adaptada para toque no botão.
Manter hover→ (nesse caso, estado ativo/tap) com a cor 
#DB224D.
7. Anexos a considerar

Vou anexar no Figma Make:

Print da tela Home (com o texto de apresentação, links e o card de projeto — referência de PlayStation/game hub).
Print da tela About Me (Experience, Education, texto central).
Print da página de projeto "Decolar" (texto à esquerda, catálogo de imagens à direita, incluindo variações de layout dentro da página de projeto).

Recrie essas três telas com fidelidade máxima às proporções, espaçamentos e grid especificados acima — o design já está definido, o objetivo é dar vida a ele com as interações e animações descritas (troca de imagens no catálogo da home, scroll comportado no About e na página de Projeto, cursor customizado, e hover states).