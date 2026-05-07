# DockManager - Documentação do Projeto

## Visão Geral e Finalidade

O **DockManager** é um sistema de alta performance focado na **gestão de docas e controle de acesso logístico** (entrada e saída de entregadores e motoboys). O principal objetivo da aplicação é substituir controles manuais ou planilhas por um sistema moderno, rápido e seguro, garantindo um fluxo operacional contínuo em ambientes de alto volume de trocas e carregamentos.

A arquitetura do projeto utiliza um back-end leve e rápido (**Node.js** com **Express** e **SQLite**) integrado a um front-end moderno em **HTML/CSS/Vanilla JS**.

---

## O que já foi desenvolvido (Features Implementadas)

### 1. Autenticação e Gestão de Sessão

- Sistema de Logon (Criação de Perfil, Login).
- Definição da "Doca de Operação" durante o login.
- Controle de Sessão via `localStorage`, mantendo o operador logado e vinculando os registros ao seu usuário e doca.

### 2. Gestão de Entregadores (Motoboys)

- Busca rápida por **CPF**, auto-preenchendo dados ou alertando caso seja primeiro acesso.
- Cadastro de novos entregadores contendo:
  - Foto do rosto (capturada dinamicamente por webcam em base64).
  - Nome completo.
  - Placa do veículo.
  - Empresa Transportadora.
- Tabela para listagem, edição e exclusão de entregadores na aba "Entregadores".

### 3. Registro de Operações (Acesso Rápido)

- Registro e controle de entrada/saída contendo:
  - O motorista (motoboy associado via CPF).
  - A loja de origem ou destino.
  - O tipo da operação (**Coleta** ou **Entrega**).
  - O nome de quem operou a doca (operador logado).
  - O número/nome da doca associada.

### 4. Gestão de Lojas

- Possibilidade de recuperar lojas do banco de dados para abastecer a tela de registros.
- Funcionalidade básica de adicionar nova loja diretamente da interface.

### 5. Histórico e Auditoria

- Tabela de **Histórico de Movimentação** limitando aos últimos 50 registros para não pesar a tela.
- Visualização de data, hora exata, operador que realizou a ação, loja, doca e transportador com layout diferenciado para "Coleta" e "Entrega".

### 6. Dashboard / Analytics

- Abas com métricas de negócio para visualizar:
  - Total de entregas e coletas do sistema.
  - Movimentação dividida por **Loja** (Volume de carga por loja).
  - **Motoboys mais ativos** no sistema (Top 5).
  - **Produtividade do Operador** (quem autorizou mais entradas e saídas).

---

## Tecnologias Empregadas

- **Backend:** Node.js (Servidor), Express (Rotas e API), SQLite3 (Banco de Dados Local e leve).
- **Frontend:** HTML5, CSS3, JS Puro (Vanilla).
- **Recursos Nativos Usados:** API `navigator.mediaDevices.getUserMedia` para habilitar acesso dinâmico à Webcam e Canvas API para registrar foto.
- **Estilização e UX:** Glassmorphism, temas escuros, transições dinâmicas (micro-interações de Hover) e responsividade para adaptabilidade, com fontes do Google (`Outfit`).

---

## O que falta fazer (Roadmap & Melhorias Futuras)

Para levar a aplicação a um nível mais robusto e produtivo para clientes de grande porte, listam-se os seguintes pontos de evolução:

1. **Gestão Visual Completa de Lojas e Transportadoras:**

   - Tela/Aba exclusiva no sistema para **CRUD de Lojas** (ver, editar, adicionar e remover lojas), atualmente a criação ocorre sem muito refinamento visual (prompt).
   - Tela/Aba de Transportadoras em formato de CRUD, e vinculação no cadastro do motorista selecionando num campo pre-definido (List/Select).
2. **Gerenciamento Seguro de Arquivos (Fotos):**

   - Atualmente, as capturas da webcam são convertidas em *Base64* e salvas diretamente no banco de dados SQLite. Isso engole o armazenamento do banco rapidamente.
   - **Solução Futura:** Criar um endpoint de *upload* de imagem (usando algo como `multer`), salvar a foto no disco do servidor e gravar o nome físico do arquivo ou a URL relativa no SQLite.
3. **Filtros e Paginação no Histórico:**

   - Adicionar barra de busca para filtrar registros de acessos por loja, por operador, por datas ou por motorista.
   - Trocar de limitar em "50 registros" (Limit 50) para uma paginação verdadeira para não perder visão de auditorias antigas.
4. **Níveis e Permissões de Usuários:**

   - Perfis distintos de "Acesso", exemplo: Administradores e Operadores de Doca. Somente administradores teriam acesso ao Dashboard, aba de deleção de registros e edição de entregadores.
   - Opção de excluir usuários inativos.
5. **Relatórios e Exportações:**

   - Botão no Dashboard e no Histórico para exportar em tela um `.CSV` ou `.PDF` completo com base no filtro do período selecionado.
6. **Refinamento Mobile (Responsividade):**

   - Melhorar o redimensionamento de certas fontes menores e as tabelas com colunas muito extensas, tornando o fluxo de leitura excelente para dispositivos móveis, como Tablets com leitores (dispositivos móveis industriais de logística).

---

**Autor/Contatos:** Desenvolvido por Caio Alfer.
