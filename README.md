# ⚖️ Justina AI - Conciliador Judicial via WhatsApp 🤖

## 🎯 Visão Geral do Projeto

**Justina AI** é um assistente judicial automatizado (chatbot) focado em facilitar o acesso à justiça e promover a **desjudicialização** (soluções rápidas e extrajudiciais) para pequenas causas na Bahia. O bot opera 24/7 via WhatsApp, fornecendo orientação concisa, empática e acionável.

### Missão

Atuar como agente auxiliador e guia de resoluções pré-processuais, Nosso objetivo principal é ajudar o cidadão baiano a saber seus direitos e a resolver problemas pequenos de um jeito fácil, auxiliando você a buscar a justiça antes de ir para o processo.

### Stack Tecnológica Principal

| Tecnologia | Finalidade |
| :--- | :--- |
| **n8n** | Orquestração do workflow e automação de processos. |
| **WAHA** | Integração direta com o WhatsApp (WebHook e envio de mensagens). |
| **Gemini 2.5 Pro** | O Modelo de Linguagem (LLM) para raciocínio jurídico, análise de texto/áudio/imagem e manutenção do tom de voz. |
| **PostgreSQL** | Persistência de dados (memória conversacional e histórico de interações). |
| **VPS VKM Online + Easy Panel**| Hospedagem e gerenciamento simplificado da infraestrutura (n8n, WAHA, Postgres). |

---

## 🛠️ Funcionalidades e Arquitetura

O workflow do n8n é o coração do Justina AI, permitindo o processamento de diferentes tipos de entrada e a aplicação de regras jurídicas complexas de forma simplificada.

### 1. Atendimento Multimodal
O bot é capaz de processar e responder a mensagens em diversos formatos:
* **Texto:** Mensagens diretas.
* **Áudio:** Transcrição automática via Gemini Vision para processamento do conteúdo.
* **Imagem:** Análise visual via Gemini Vision para identificar e descrever evidências/cenários.

### 2. Agente de IA com Regras de Sistema
O nó `AI Agent` no n8n está configurado com as seguintes regras operacionais:
* **Role:** Juiz/Conciliador de Pequenas Causas.
* **Foco Principal:** Orientação para canais extrajudiciais (PROCON, consumidor.gov.br, CEJUSC, aplicativos de resolução de conflitos).
* **Foco Jurisprudencial:** Prioridade na busca por precedentes e enunciados do **TJBA** (Tribunal de Justiça da Bahia), recorrendo ao CNJ e DataJUD apenas como *fallback*.
* **Linguagem:** Total adesão ao **Pacto Nacional do Judiciário pela Linguagem Simples**, garantindo respostas em **Português** acessível, empático e direto para o ambiente do WhatsApp.

### 3. Persistência de Dados e Memória
* O nó **Postgres Chat Memory** garante que o bot se lembre do contexto das últimas **10 interações** do usuário, tornando a conversa fluida.
* O nó **Preencher planilha de análise** registra todos os *inputs* dos usuários em uma planilha de Google Sheets para fins de auditoria e melhoria contínua.

### 4. Fluxo de Interação Otimizado
O *workflow* inclui passos para melhorar a experiência do usuário (UX):
* **Filtros:** Ignora automaticamente mensagens de API e grupos.
* **Status de Chat:** Envio de "Visto" (`Send Seen`) e "Digitando..." (`Start Typing`) via WAHA, seguido por uma pequena pausa (`Wait`), para simular um atendimento mais humano e responsivo.

---

## 🚀 Guia de Implantação Rápida

Para implantar o Justina AI na sua infraestrutura:

1.  **Hospedagem:** Instale o **Easy Panel** na sua **VPS VKM Online**.
2.  **Serviços:** Crie e inicie os serviços do **n8n**, **PostgreSQL** e **WAHA API** via Easy Panel.
3.  **Configuração do WAHA:** Obtenha as credenciais do WAHA e defina o *Webhook* para a URL do n8n.
4.  **Configuração de Credenciais no n8n:**
    * `WAHA Account`
    * `Google Gemini (PaLM) Api account` (Chave para o Gemini 2.5 Pro)
    * `Postgres account` (Credenciais do DB para a memória do chat)
    * `Google Service Account account` (Para acesso de leitura/escrita às planilhas de *logging*).
5.  **Importação:** Importe o JSON do *workflow* no n8n e ative-o.


O Justina AI estará pronto para receber mensagens e atuar como seu concierge judicial digital!
