# 🎨 Diagramas de Arquitetura - Justina AI

## 📊 Comparação: N8N vs Java

### Arquitetura N8N (Atual)

```
┌─────────────────────────────────────────────────────────────────┐
│                         WAHA API (WhatsApp)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP POST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      N8N Workflow Engine                         │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐             │
│  │  Webhook   │→ │   Filtros   │→ │ Processador  │             │
│  │  Receptor  │  │  (If Nodes) │  │  de Mídia    │             │
│  └────────────┘  └─────────────┘  └──────────────┘             │
│                                           │                       │
│                                           ▼                       │
│  ┌────────────────────────────────────────────────────┐         │
│  │           AI Agent (Gemini 2.5 Pro)                │         │
│  │  ┌──────────────────┐  ┌──────────────────┐       │         │
│  │  │ Google Gemini    │  │ Postgres Memory  │       │         │
│  │  │ Chat Model       │  │ (10 last msgs)   │       │         │
│  │  └──────────────────┘  └──────────────────┘       │         │
│  │  ┌──────────────────┐  ┌──────────────────┐       │         │
│  │  │ Google Sheets    │  │ Calculator Tool  │       │         │
│  │  │ Tool             │  │                  │       │         │
│  │  └──────────────────┘  └──────────────────┘       │         │
│  └────────────────────────────────────────────────────┘         │
│                                           │                       │
│                                           ▼                       │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐             │
│  │ Send Seen  │→ │Start Typing │→ │Send Text Msg │             │
│  └────────────┘  └─────────────┘  └──────────────┘             │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP POST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WAHA API → WhatsApp                         │
└─────────────────────────────────────────────────────────────────┘
```

### Arquitetura Java (Proposta)

```
┌─────────────────────────────────────────────────────────────────┐
│                         WAHA API (WhatsApp)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP POST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Spring Boot Application                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              CONTROLLER LAYER                              │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  WebhookController                                   │ │ │
│  │  │  @PostMapping("/webhook/waha")                       │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └──────────────────────┬─────────────────────────────────────┘ │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              SERVICE LAYER                                 │ │
│  │  ┌──────────────────┐  ┌──────────────────┐              │ │
│  │  │ MessageProcessor │  │ MediaProcessor   │              │ │
│  │  │ Service          │→ │ Service          │              │ │
│  │  └──────────────────┘  └──────────────────┘              │ │
│  │           │                     │                          │ │
│  │           ▼                     ▼                          │ │
│  │  ┌──────────────────┐  ┌──────────────────┐              │ │
│  │  │ AIAgentService   │  │ WahaService      │              │ │
│  │  │ (Gemini SDK)     │  │ (RestTemplate)   │              │ │
│  │  └──────────────────┘  └──────────────────┘              │ │
│  └──────────────────────┬─────────────────────────────────────┘ │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              REPOSITORY LAYER (JPA/Hibernate)              │ │
│  │  ┌──────────────────┐  ┌──────────────────┐              │ │
│  │  │ Conversation     │  │ Message          │              │ │
│  │  │ Repository       │  │ Repository       │              │ │
│  │  └──────────────────┘  └──────────────────┘              │ │
│  └──────────────────────┬─────────────────────────────────────┘ │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │ JDBC
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Oracle Database                               │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │ TB_CONVERSATION    │  │ TB_MESSAGE         │                │
│  │ - ID_CONVERSATION  │  │ - ID_MESSAGE       │                │
│  │ - USER_ID          │  │ - ID_CONVERSATION  │                │
│  │ - SESSION_ID       │  │ - CONTENT          │                │
│  │ - USER_NAME        │  │ - DIRECTION        │                │
│  │ - CREATED_AT       │  │ - MESSAGE_TYPE     │                │
│  └────────────────────┘  └────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Mensagem Detalhado

### 1. Recepção da Mensagem

```
Usuario (WhatsApp)
     │
     │ Envia mensagem
     ▼
WAHA API
     │
     │ HTTP POST /webhook/waha
     ▼
WebhookController.handleWahaWebhook()
     │
     │ Converte JSON → WebhookPayloadDTO
     ▼
MessageProcessorService.processWebhookPayload()
```

### 2. Filtragem e Validação

```
MessageProcessorService
     │
     │ Converte para MessageDTO
     ▼
FilterUtil.shouldIgnoreMessage()
     │
     ├─→ [SE source == "api"] → IGNORAR (evita loop)
     │
     ├─→ [SE from.contains("@g.us")] → IGNORAR (grupos)
     │
     └─→ [SE válido] → CONTINUAR
                │
                ▼
     WahaService.sendSeen()
     (Marca mensagem como vista)
```

### 3. Processamento de Conteúdo

```
MessageProcessorService
     │
     ▼
hasMedia?
     │
     ├─→ [NÃO] → Usar body diretamente
     │
     └─→ [SIM] → MediaProcessorService
                      │
                      ├─→ [audio/ogg] → processAudio()
                      │                  │
                      │                  ├─ WahaService.downloadMedia()
                      │                  └─ Gemini: transcrever
                      │
                      └─→ [image/*] → processImage()
                                       │
                                       ├─ WahaService.downloadMedia()
                                       └─ Gemini Vision: analisar
```

### 4. Processamento com IA

```
MessageProcessorService
     │
     │ content processado
     ▼
WahaService.startTyping()
     │
     │ Simula digitação
     ▼
Thread.sleep(2000)
     │
     ▼
AIAgentService.processMessage()
     │
     ├─→ ConversationRepository.findByUserId()
     │   (Buscar ou criar conversa)
     │
     ├─→ MessageRepository.findTop10ByUserId()
     │   (Recuperar histórico de 10 msgs)
     │
     ├─→ buildContextualPrompt()
     │   (Construir contexto com histórico)
     │
     ├─→ callGeminiAPI()
     │   (Chamar Gemini 2.5 Pro com SYSTEM_PROMPT)
     │
     └─→ saveMessage()
         (Salvar pergunta e resposta no banco)
```

### 5. Envio da Resposta

```
AIAgentService
     │
     │ retorna resposta da IA
     ▼
MessageProcessorService
     │
     ▼
WahaService.sendTextMessage()
     │
     │ HTTP POST para WAHA
     ▼
WAHA API
     │
     │ Envia para WhatsApp
     ▼
Usuario (WhatsApp)
```

---

## 📦 Modelo de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────────────────────────┐
│      TB_CONVERSATION            │
├─────────────────────────────────┤
│ PK  ID_CONVERSATION  NUMBER(19) │
│ UK  USER_ID          VARCHAR(100)│
│     SESSION_ID       VARCHAR(50) │
│     USER_NAME        VARCHAR(200)│
│     CREATED_AT       TIMESTAMP   │
│     UPDATED_AT       TIMESTAMP   │
└────────────┬────────────────────┘
             │ 1
             │
             │ possui
             │
             │ N
┌────────────▼────────────────────┐
│         TB_MESSAGE              │
├─────────────────────────────────┤
│ PK  ID_MESSAGE       NUMBER(19) │
│ FK  ID_CONVERSATION  NUMBER(19) │
│     MESSAGE_ID_EXT   VARCHAR(255)│
│     DIRECTION        VARCHAR(20) │
│     CONTENT          CLOB        │
│     MESSAGE_TYPE     VARCHAR(50) │
│     MEDIA_URL        VARCHAR(500)│
│     TIMESTAMP        TIMESTAMP   │
│     PROCESSED        NUMBER(1)   │
└─────────────────────────────────┘

DIRECTION: { INCOMING, OUTGOING }
MESSAGE_TYPE: { TEXT, AUDIO, IMAGE, VIDEO, DOCUMENT }
```

### Exemplo de Dados

**TB_CONVERSATION:**
| ID_CONVERSATION | USER_ID | SESSION_ID | USER_NAME | CREATED_AT |
|-----------------|---------|------------|-----------|------------|
| 1 | 557188904263@c.us | default | Rafael Brito | 2025-10-24 10:30:00 |
| 2 | 557199887766@c.us | default | Maria Silva | 2025-10-24 11:15:00 |

**TB_MESSAGE:**
| ID_MESSAGE | ID_CONVERSATION | DIRECTION | CONTENT | MESSAGE_TYPE | TIMESTAMP |
|------------|-----------------|-----------|---------|--------------|-----------|
| 1 | 1 | INCOMING | Preciso de ajuda com problema de consumo | TEXT | 2025-10-24 10:30:15 |
| 2 | 1 | OUTGOING | Olá! Entendo que você precisa de ajuda... | TEXT | 2025-10-24 10:30:18 |
| 3 | 1 | INCOMING | [áudio transcrito] | AUDIO | 2025-10-24 10:31:00 |

---

## 🔧 Mapeamento de Nós N8N → Componentes Java

### Tabela de Equivalências

| Nó N8N | Tipo | Função | Equivalente Java | Implementação |
|--------|------|--------|------------------|---------------|
| **Webhook** | n8n-nodes-base.webhook | Recebe HTTP POST do WAHA | `@RestController` | `WebhookController.java` |
| **Dados (Set)** | n8n-nodes-base.set | Extrai campos do JSON | DTO Mapping | `WebhookPayloadDTO.java` |
| **Ignorar API** | n8n-nodes-base.if | Filtra mensagens da API | Lógica Java | `FilterUtil.shouldIgnoreMessage()` |
| **Ignorar Grupos** | n8n-nodes-base.if | Filtra grupos WhatsApp | Lógica Java | `FilterUtil.shouldIgnoreMessage()` |
| **Tem Mídia** | n8n-nodes-base.if | Verifica hasMedia | Lógica Java | `MessageProcessorService.processContent()` |
| **Tipo de Mídia** | n8n-nodes-base.switch | Switch por mimetype | switch/case Java | `MediaProcessorService` |
| **Baixar Áudio** | n8n-nodes-base.httpRequest | HTTP GET para baixar | RestTemplate | `WahaService.downloadMedia()` |
| **Transcribe Recording** | @n8n/langchain.googleGemini | Transcrição de áudio | Gemini SDK | `MediaProcessorService.transcribeAudio()` |
| **Baixar Imagem** | n8n-nodes-base.httpRequest | HTTP GET para baixar | RestTemplate | `WahaService.downloadMedia()` |
| **Analyze Image** | @n8n/langchain.googleGemini | Análise visual | Gemini Vision SDK | `MediaProcessorService.analyzeImage()` |
| **AI Agent** | @n8n/langchain.agent | Processamento com IA | Service + Gemini SDK | `AIAgentService.java` |
| **Gemini Chat Model** | @n8n/langchain.lmChatGoogleGemini | Modelo de linguagem | Gemini API Client | `AIAgentService.callGeminiAPI()` |
| **Postgres Memory** | @n8n/langchain.memoryPostgresChat | Memória conversacional | JPA Repository | `MessageRepository.findTop10()` |
| **Send Seen** | n8n-nodes-waha.WAHA | Marca como visto | REST API Call | `WahaService.sendSeen()` |
| **Start Typing** | n8n-nodes-waha.WAHA | Simula digitação | REST API Call | `WahaService.startTyping()` |
| **Wait** | n8n-nodes-base.wait | Aguarda 2 segundos | Thread.sleep() | `MessageProcessorService` |
| **Send Text Message** | n8n-nodes-waha.WAHA | Envia mensagem | REST API Call | `WahaService.sendTextMessage()` |
| **Google Sheets Tool** | n8n-nodes-base.googleSheetsTool | Log em planilha | Google Sheets API | (Opcional - não implementado) |
| **Calculator** | @n8n/langchain.toolCalculator | Calculadora | Math.* | (Opcional - não implementado) |

---

## ⚙️ Configuração de Ambientes

### Desenvolvimento (Dev)

```properties
# application-dev.properties
server.port=8080
spring.profiles.active=dev

# Oracle DB Local
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:ORCL
spring.datasource.username=justina_dev
spring.datasource.password=dev123

# Hibernate - AUTO CREATE
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# WAHA Local
waha.api.url=http://localhost:3000
waha.api.key=dev_key_123

# Gemini (conta de teste)
google.gemini.api.key=AIza...test
```

### Homologação (QA)

```properties
# application-qa.properties
server.port=8080
spring.profiles.active=qa

# Oracle DB QA
spring.datasource.url=jdbc:oracle:thin:@qa-db-server:1521:ORCLQA
spring.datasource.username=justina_qa
spring.datasource.password=${DB_PASSWORD}

# Hibernate - UPDATE
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# WAHA QA
waha.api.url=https://waha-qa.domain.com
waha.api.key=${WAHA_API_KEY}

# Gemini (conta QA)
google.gemini.api.key=${GEMINI_API_KEY}
```

### Produção (Prod)

```properties
# application-prod.properties
server.port=8080
spring.profiles.active=prod

# Oracle DB Prod (RAC)
spring.datasource.url=jdbc:oracle:thin:@//prod-scan:1521/PRODDB
spring.datasource.username=justina_prod
spring.datasource.password=${DB_PASSWORD_ENCRYPTED}

# Hibernate - VALIDATE
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Connection Pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000

# WAHA Prod
waha.api.url=https://waha.domain.com
waha.api.key=${WAHA_API_KEY}

# Gemini (conta Production)
google.gemini.api.key=${GEMINI_API_KEY}

# Logging
logging.level.root=WARN
logging.level.br.gov.ba.justina=INFO
```

---

## 📈 Métricas e Monitoramento

### Endpoints de Métricas (Spring Actuator)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
# application.properties
management.endpoints.web.exposure.include=health,metrics,info
management.endpoint.health.show-details=always
```

**Endpoints disponíveis:**
- `GET /actuator/health` - Status da aplicação
- `GET /actuator/metrics` - Métricas gerais
- `GET /actuator/info` - Informações da aplicação

### Query de Monitoramento Oracle

```sql
-- Mensagens processadas por dia
SELECT 
    TRUNC(TIMESTAMP) as DIA,
    COUNT(*) as TOTAL_MENSAGENS,
    SUM(CASE WHEN DIRECTION = 'INCOMING' THEN 1 ELSE 0 END) as RECEBIDAS,
    SUM(CASE WHEN DIRECTION = 'OUTGOING' THEN 1 ELSE 0 END) as ENVIADAS
FROM TB_MESSAGE
WHERE TIMESTAMP >= TRUNC(SYSDATE) - 7
GROUP BY TRUNC(TIMESTAMP)
ORDER BY DIA DESC;

-- Tempo médio de resposta
SELECT 
    AVG(
        (outgoing.TIMESTAMP - incoming.TIMESTAMP) * 24 * 60 * 60
    ) as TEMPO_MEDIO_SEGUNDOS
FROM TB_MESSAGE incoming
JOIN TB_MESSAGE outgoing 
    ON incoming.ID_CONVERSATION = outgoing.ID_CONVERSATION
    AND outgoing.ID_MESSAGE = incoming.ID_MESSAGE + 1
WHERE incoming.DIRECTION = 'INCOMING'
  AND outgoing.DIRECTION = 'OUTGOING'
  AND incoming.TIMESTAMP >= TRUNC(SYSDATE);
```

---

## 🚀 Deploy

### Docker Compose (Desenvolvimento)

```yaml
version: '3.8'

services:
  oracle-db:
    image: container-registry.oracle.com/database/express:21.3.0-xe
    environment:
      ORACLE_PWD: OraclePass123
    ports:
      - "1521:1521"
    volumes:
      - oracle-data:/opt/oracle/oradata

  justina-ai:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:oracle:thin:@oracle-db:1521:XE
      SPRING_DATASOURCE_USERNAME: system
      SPRING_DATASOURCE_PASSWORD: OraclePass123
      WAHA_API_URL: http://waha:3000
      WAHA_API_KEY: dev_key
      GOOGLE_GEMINI_API_KEY: ${GEMINI_KEY}
    depends_on:
      - oracle-db

  waha:
    image: devlikeapro/waha:2025.9.8
    ports:
      - "3000:3000"
    environment:
      WAHA_API_KEY: dev_key

volumes:
  oracle-data:
```

### Dockerfile

```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/justina-ai-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 📋 Checklist de Migração

### Fase 1: Preparação
- [ ] Provisionar servidor Oracle Database
- [ ] Criar usuário e esquema no Oracle
- [ ] Executar scripts de criação de tabelas
- [ ] Configurar backup do banco de dados
- [ ] Instalar Java 17+ no servidor
- [ ] Configurar variáveis de ambiente

### Fase 2: Desenvolvimento
- [ ] Criar projeto Maven com Spring Boot
- [ ] Implementar entidades JPA (Conversation, Message)
- [ ] Implementar repositories
- [ ] Implementar DTOs
- [ ] Implementar services (WAHA, Media, AI, Message)
- [ ] Implementar controller
- [ ] Configurar Hibernate para Oracle
- [ ] Integrar com Gemini API

### Fase 3: Testes
- [ ] Testes unitários dos services
- [ ] Testes de integração com banco Oracle
- [ ] Testes de integração com WAHA API
- [ ] Testes de integração com Gemini
- [ ] Teste end-to-end do fluxo completo
- [ ] Testes de carga e performance

### Fase 4: Deploy
- [ ] Configurar ambiente de homologação
- [ ] Deploy em homologação
- [ ] Testes de aceitação do usuário
- [ ] Configurar ambiente de produção
- [ ] Migração de dados (se necessário)
- [ ] Deploy em produção
- [ ] Monitoramento pós-deploy

### Fase 5: Pós-Deploy
- [ ] Documentação técnica completa
- [ ] Treinamento da equipe de suporte
- [ ] Configurar alertas de monitoramento
- [ ] Plano de rollback documentado
- [ ] Backup e disaster recovery testados

---

**Autor:** Documentação Técnica Justina AI
**Data:** Outubro 2025
**Versão:** 1.0.0
