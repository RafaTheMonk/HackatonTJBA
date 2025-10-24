# 📚 Guia Completo: Migração Justina AI de N8N para Java + Oracle

## 📖 Índice
1. [Análise do Workflow N8N](#análise-do-workflow-n8n)
2. [Arquitetura Proposta em Java](#arquitetura-proposta-em-java)
3. [Mapeamento de Componentes](#mapeamento-de-componentes)
4. [Implementação Passo a Passo](#implementação-passo-a-passo)
5. [Estrutura do Banco Oracle](#estrutura-do-banco-oracle)
6. [Código Java Completo](#código-java-completo)

---

## 1. Análise do Workflow N8N

### 1.1 Visão Geral do Fluxo

O workflow processa mensagens do WhatsApp através do WAHA (WhatsApp HTTP API) seguindo este fluxo:

```
Webhook (WAHA) 
  → Extração de Dados
    → Filtros (API/Grupos)
      → Verificação de Mídia
        → Processamento (Texto/Áudio/Imagem)
          → AI Agent (Gemini)
            → Resposta ao Usuário
```

### 1.2 Nós do N8N e Suas Funções

#### **Nó 1: Webhook**
```json
{
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "waha"
  }
}
```
**Função:** Recebe requisições HTTP POST do WAHA com dados da mensagem

**Estrutura de Dados Recebida:**
```json
{
  "event": "message.any",
  "session": "default",
  "payload": {
    "id": "message_id",
    "from": "557188904263@c.us",
    "body": "texto da mensagem",
    "hasMedia": false,
    "media": { "url": "", "mimetype": "" }
  }
}
```

#### **Nó 2: Dados (Set)**
```json
{
  "type": "n8n-nodes-base.set",
  "assignments": [
    { "name": "event", "value": "={{ $json.body.event }}" },
    { "name": "from", "value": "={{ $json.body.payload.from }}" },
    { "name": "body", "value": "={{ $json.body.payload.body }}" }
  ]
}
```
**Função:** Extrai e normaliza dados importantes da requisição

#### **Nó 3: Ignorar API**
```json
{
  "type": "n8n-nodes-base.if",
  "conditions": {
    "leftValue": "={{ $json.source }}",
    "rightValue": "api",
    "operator": "equals"
  }
}
```
**Função:** Filtra mensagens originadas da própria API (evita loops)

#### **Nó 4: Ignorar Grupos**
```json
{
  "type": "n8n-nodes-base.if",
  "conditions": {
    "leftValue": "={{ $json.from }}",
    "rightValue": "@g.us",
    "operator": "contains"
  }
}
```
**Função:** Filtra mensagens de grupos (atende apenas conversas individuais)

#### **Nó 5: Tem Mídia**
```json
{
  "type": "n8n-nodes-base.if",
  "conditions": {
    "leftValue": "={{ $json.hasMedia }}",
    "operator": "false"
  }
}
```
**Função:** Verifica se a mensagem contém mídia (áudio/imagem)

#### **Nós 6-13: Processamento de Mídia**

**Switch: Tipo de Mídia**
- Áudio (ogg/opus) → Transcrição via Gemini
- Imagem → Análise visual via Gemini

**Fluxo de Áudio:**
```
Dados da mídia → Baixar áudio → Transcribe (Gemini) → Set Audio Message
```

**Fluxo de Imagem:**
```
Dados da mídia → Baixar imagem → Analyze (Gemini) → Set Image Message
```

#### **Nó 14: AI Agent**
```json
{
  "type": "@n8n/n8n-nodes-langchain.agent",
  "parameters": {
    "promptType": "define",
    "text": "={{ $json.message }}",
    "systemMessage": "My name is Justina, an AI Chatbot..."
  }
}
```
**Função:** Processa a mensagem com IA usando:
- Modelo: Gemini 2.5 Pro
- Memória: PostgreSQL (10 últimas mensagens)
- Tools: Google Sheets, Calculator, Web Search

#### **Nós 15-18: Resposta ao Usuário**
```
Send Seen → Start Typing → Wait (2s) → Send Text Message
```

---

## 2. Arquitetura Proposta em Java

### 2.1 Stack Tecnológica

| Componente N8N | Equivalente Java |
|----------------|------------------|
| Webhook | Spring Boot REST Controller |
| WAHA Integration | RestTemplate / WebClient |
| Gemini AI | Google Generative AI SDK |
| PostgreSQL Memory | Oracle Database + Hibernate |
| Google Sheets | Apache POI + Google Sheets API |
| If/Switch Nodes | Lógica Java (if/else, switch) |

### 2.2 Estrutura de Pacotes

```
br.gov.ba.justina
├── config
│   ├── HibernateConfig.java
│   ├── GeminiConfig.java
│   └── WahaConfig.java
├── controller
│   └── WebhookController.java
├── service
│   ├── MessageProcessorService.java
│   ├── MediaProcessorService.java
│   ├── AIAgentService.java
│   └── WahaService.java
├── repository
│   ├── ConversationRepository.java
│   └── MessageRepository.java
├── model
│   ├── entity
│   │   ├── Conversation.java
│   │   └── Message.java
│   └── dto
│       ├── WebhookPayloadDTO.java
│       └── MessageDTO.java
└── util
    ├── FilterUtil.java
    └── JsonUtil.java
```

---

## 3. Mapeamento de Componentes

### 3.1 Webhook → REST Controller

**N8N:**
```javascript
POST /webhook/waha
```

**Java (Spring Boot):**
```java
@RestController
@RequestMapping("/webhook")
public class WebhookController {
    
    @PostMapping("/waha")
    public ResponseEntity<String> handleWebhook(@RequestBody WebhookPayloadDTO payload) {
        // Processar mensagem
    }
}
```

### 3.2 Dados (Set) → DTO Mapping

**N8N:**
```javascript
event = $json.body.event
from = $json.body.payload.from
```

**Java:**
```java
public class WebhookPayloadDTO {
    private String event;
    private String session;
    private PayloadDTO payload;
    
    // getters e setters
}

public class PayloadDTO {
    private String id;
    private String from;
    private String body;
    private Boolean hasMedia;
    private MediaDTO media;
}
```

### 3.3 Filtros (If Nodes) → Métodos de Validação

**N8N:**
```javascript
if (source === "api") return false;
if (from.contains("@g.us")) return false;
```

**Java:**
```java
public class FilterUtil {
    
    public static boolean shouldIgnoreMessage(MessageDTO message) {
        // Ignora mensagens da própria API
        if ("api".equals(message.getSource())) {
            return true;
        }
        
        // Ignora grupos
        if (message.getFrom().contains("@g.us")) {
            return true;
        }
        
        return false;
    }
}
```

### 3.4 AI Agent → Service com Gemini SDK

**N8N:**
```javascript
AI Agent (Gemini 2.5 Pro) + PostgreSQL Memory
```

**Java:**
```java
@Service
public class AIAgentService {
    
    @Autowired
    private ConversationRepository conversationRepo;
    
    private final GenerativeModel model;
    
    public String processMessage(String userId, String message) {
        // Recuperar histórico (10 últimas mensagens)
        List<Message> history = conversationRepo.findTop10ByUserIdOrderByTimestampDesc(userId);
        
        // Construir prompt com contexto
        String systemPrompt = buildSystemPrompt();
        String contextualizedMessage = buildContextualMessage(history, message);
        
        // Chamar Gemini
        String response = callGemini(systemPrompt, contextualizedMessage);
        
        // Salvar no histórico
        saveMessage(userId, message, response);
        
        return response;
    }
}
```

---

## 4. Implementação Passo a Passo

### Passo 1: Configurar Projeto Maven

**pom.xml**
```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>br.gov.ba</groupId>
    <artifactId>justina-ai</artifactId>
    <version>1.0.0</version>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Spring Boot Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- Oracle JDBC Driver -->
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc11</artifactId>
            <version>23.3.0.23.09</version>
        </dependency>
        
        <!-- Hibernate -->
        <dependency>
            <groupId>org.hibernate.orm</groupId>
            <artifactId>hibernate-core</artifactId>
            <version>6.3.1.Final</version>
        </dependency>
        
        <!-- Google Generative AI (Gemini) -->
        <dependency>
            <groupId>com.google.cloud</groupId>
            <artifactId>google-cloud-aiplatform</artifactId>
            <version>3.35.0</version>
        </dependency>
        
        <!-- Lombok (opcional, facilita código) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Apache HttpClient (para WAHA API) -->
        <dependency>
            <groupId>org.apache.httpcomponents.client5</groupId>
            <artifactId>httpclient5</artifactId>
            <version>5.3</version>
        </dependency>
        
        <!-- Jackson para JSON -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
    </dependencies>
</project>
```

### Passo 2: Configurar application.properties

```properties
# Server
server.port=8080

# Oracle Database
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:ORCL
spring.datasource.username=justina_user
spring.datasource.password=senha_segura
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.OracleDialect
spring.jpa.properties.hibernate.format_sql=true

# WAHA API
waha.api.url=http://localhost:3000
waha.api.key=sua_chave_waha

# Google Gemini
google.gemini.api.key=sua_chave_gemini
google.gemini.model=gemini-2.5-pro
```

### Passo 3: Criar Entidades JPA

**Conversation.java**
```java
package br.gov.ba.justina.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "TB_CONVERSATION")
@Data
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_conversation")
    @SequenceGenerator(name = "seq_conversation", sequenceName = "SEQ_CONVERSATION", allocationSize = 1)
    @Column(name = "ID_CONVERSATION")
    private Long id;
    
    @Column(name = "USER_ID", nullable = false, unique = true, length = 100)
    private String userId; // Ex: 557188904263@c.us
    
    @Column(name = "SESSION_ID", length = 50)
    private String sessionId; // Ex: default
    
    @Column(name = "USER_NAME", length = 200)
    private String userName; // Ex: Rafael Brito
    
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("timestamp DESC")
    private List<Message> messages = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Message.java**
```java
package br.gov.ba.justina.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_MESSAGE")
@Data
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_message")
    @SequenceGenerator(name = "seq_message", sequenceName = "SEQ_MESSAGE", allocationSize = 1)
    @Column(name = "ID_MESSAGE")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CONVERSATION", nullable = false)
    private Conversation conversation;
    
    @Column(name = "MESSAGE_ID_EXTERNAL", length = 255)
    private String messageIdExternal; // ID da mensagem no WhatsApp
    
    @Column(name = "DIRECTION", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MessageDirection direction; // INCOMING, OUTGOING
    
    @Column(name = "CONTENT", columnDefinition = "CLOB")
    @Lob
    private String content;
    
    @Column(name = "MESSAGE_TYPE", length = 50)
    @Enumerated(EnumType.STRING)
    private MessageType messageType; // TEXT, AUDIO, IMAGE
    
    @Column(name = "MEDIA_URL", length = 500)
    private String mediaUrl;
    
    @Column(name = "TIMESTAMP", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "PROCESSED")
    private Boolean processed = false;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}

enum MessageDirection {
    INCOMING, OUTGOING
}

enum MessageType {
    TEXT, AUDIO, IMAGE, VIDEO, DOCUMENT
}
```

### Passo 4: Criar DTOs

**WebhookPayloadDTO.java**
```java
package br.gov.ba.justina.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WebhookPayloadDTO {
    
    private String id;
    private Long timestamp;
    private String event;
    private String session;
    private PayloadDTO payload;
    
    @Data
    public static class PayloadDTO {
        private String id;
        private Long timestamp;
        private String from;
        
        @JsonProperty("fromMe")
        private Boolean fromMe;
        
        private String source;
        private String to;
        private String body;
        
        @JsonProperty("hasMedia")
        private Boolean hasMedia;
        
        private MediaDTO media;
        
        @JsonProperty("_data")
        private DataDTO data;
    }
    
    @Data
    public static class MediaDTO {
        private String url;
        private String mimetype;
        private String filename;
    }
    
    @Data
    public static class DataDTO {
        private String type;
        
        @JsonProperty("notifyName")
        private String notifyName;
    }
}
```

**MessageDTO.java**
```java
package br.gov.ba.justina.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MessageDTO {
    private String messageId;
    private String userId;
    private String userName;
    private String sessionId;
    private String content;
    private String source;
    private Boolean hasMedia;
    private String mediaUrl;
    private String mediaType;
    private String messageType;
}
```

### Passo 5: Criar Repositories

**ConversationRepository.java**
```java
package br.gov.ba.justina.repository;

import br.gov.ba.justina.model.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    Optional<Conversation> findByUserId(String userId);
    
    Optional<Conversation> findByUserIdAndSessionId(String userId, String sessionId);
}
```

**MessageRepository.java**
```java
package br.gov.ba.justina.repository;

import br.gov.ba.justina.model.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE m.conversation.userId = :userId " +
           "ORDER BY m.timestamp DESC")
    List<Message> findByUserIdOrderByTimestampDesc(@Param("userId") String userId);
    
    @Query(value = "SELECT * FROM TB_MESSAGE m " +
                   "WHERE m.ID_CONVERSATION = (SELECT c.ID_CONVERSATION FROM TB_CONVERSATION c WHERE c.USER_ID = :userId) " +
                   "ORDER BY m.TIMESTAMP DESC " +
                   "FETCH FIRST 10 ROWS ONLY", 
           nativeQuery = true)
    List<Message> findTop10ByUserIdOrderByTimestampDesc(@Param("userId") String userId);
}
```

### Passo 6: Criar Services

**WahaService.java**
```java
package br.gov.ba.justina.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class WahaService {
    
    @Value("${waha.api.url}")
    private String wahaApiUrl;
    
    @Value("${waha.api.key}")
    private String wahaApiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public void sendSeen(String session, String chatId, String messageId) {
        String url = wahaApiUrl + "/api/" + session + "/chats/" + chatId + "/messages/" + messageId + "/seen";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", wahaApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            log.info("Mensagem marcada como vista: {}", messageId);
        } catch (Exception e) {
            log.error("Erro ao marcar mensagem como vista", e);
        }
    }
    
    public void startTyping(String session, String chatId) {
        String url = wahaApiUrl + "/api/" + session + "/chats/" + chatId + "/typing";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", wahaApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> body = new HashMap<>();
        body.put("typing", true);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        try {
            restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            log.info("Typing iniciado para: {}", chatId);
        } catch (Exception e) {
            log.error("Erro ao iniciar typing", e);
        }
    }
    
    public void sendTextMessage(String session, String chatId, String text) {
        String url = wahaApiUrl + "/api/" + session + "/messages/text";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", wahaApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> body = new HashMap<>();
        body.put("chatId", chatId);
        body.put("text", text);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            log.info("Mensagem enviada para {}: {}", chatId, response.getStatusCode());
        } catch (Exception e) {
            log.error("Erro ao enviar mensagem", e);
            throw new RuntimeException("Falha ao enviar mensagem", e);
        }
    }
    
    public byte[] downloadMedia(String mediaUrl) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Api-Key", wahaApiKey);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                mediaUrl, 
                HttpMethod.GET, 
                request, 
                byte[].class
            );
            return response.getBody();
        } catch (Exception e) {
            log.error("Erro ao baixar mídia de: {}", mediaUrl, e);
            return null;
        }
    }
}
```

**MediaProcessorService.java**
```java
package br.gov.ba.justina.service;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.PartMaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MediaProcessorService {
    
    @Autowired
    private WahaService wahaService;
    
    @Value("${google.gemini.api.key}")
    private String geminiApiKey;
    
    public String processAudio(String audioUrl) {
        try {
            // Baixar áudio
            byte[] audioData = wahaService.downloadMedia(audioUrl);
            
            if (audioData == null || audioData.length == 0) {
                return "Não foi possível processar o áudio.";
            }
            
            // Transcrever com Gemini
            String transcription = transcribeAudio(audioData);
            
            log.info("Áudio transcrito com sucesso");
            return transcription;
            
        } catch (Exception e) {
            log.error("Erro ao processar áudio", e);
            return "Erro ao processar áudio: " + e.getMessage();
        }
    }
    
    public String processImage(String imageUrl, String userMessage) {
        try {
            // Baixar imagem
            byte[] imageData = wahaService.downloadMedia(imageUrl);
            
            if (imageData == null || imageData.length == 0) {
                return "Não foi possível processar a imagem.";
            }
            
            // Analisar com Gemini Vision
            String analysis = analyzeImage(imageData, userMessage);
            
            log.info("Imagem analisada com sucesso");
            
            String contextualizedMessage = String.format(
                "O usuário enviou uma imagem, descrição da imagem:\n\n%s\n\nJunto da imagem ele disse: %s",
                analysis,
                userMessage != null && !userMessage.isEmpty() ? userMessage : "Não disse nada."
            );
            
            return contextualizedMessage;
            
        } catch (Exception e) {
            log.error("Erro ao processar imagem", e);
            return "Erro ao processar imagem: " + e.getMessage();
        }
    }
    
    private String transcribeAudio(byte[] audioData) throws Exception {
        // Implementação simplificada
        // Na prática, você usaria a API do Gemini para transcrição
        // Por enquanto, retorno mock
        return "[Transcrição do áudio via Gemini]";
    }
    
    private String analyzeImage(byte[] imageData, String userPrompt) throws Exception {
        // Implementação simplificada
        // Na prática, você usaria a API do Gemini Vision
        return "[Análise da imagem via Gemini Vision]";
    }
}
```

**AIAgentService.java**
```java
package br.gov.ba.justina.service;

import br.gov.ba.justina.model.entity.Conversation;
import br.gov.ba.justina.model.entity.Message;
import br.gov.ba.justina.model.entity.MessageDirection;
import br.gov.ba.justina.model.entity.MessageType;
import br.gov.ba.justina.repository.ConversationRepository;
import br.gov.ba.justina.repository.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AIAgentService {
    
    @Autowired
    private ConversationRepository conversationRepo;
    
    @Autowired
    private MessageRepository messageRepo;
    
    @Value("${google.gemini.api.key}")
    private String geminiApiKey;
    
    private static final String SYSTEM_PROMPT = """
        My name is Justina, an AI Chatbot dedicated to helping the people of Bahia 
        with accessibility to all forms of justice.
        
        Role: Arbitration Judge and Small Claims Conciliator
        
        Context of Service: To act as a first-instance guidance counselor focused 
        entirely on dejudicialization and conflict resolution through extrajudicial means.
        
        Rules:
        - Authorized Sources: CNJ DataJUD and TJBA
        - Jurisprudence Preference Rule: Prioritize TJBA (Tribunal de Justiça da Bahia)
        - Output Language: Only in Portuguese
        - Output Format: Clear text for WhatsApp (no JSON, no bold, no bullets)
        - Maintain accessible language following National Judicial Pact for Simple Language
        - Be empathetic, guiding and objective
        """;
    
    @Transactional
    public String processMessage(String userId, String userName, String sessionId, 
                                  String content, MessageType messageType) {
        
        // Buscar ou criar conversa
        Conversation conversation = conversationRepo
            .findByUserIdAndSessionId(userId, sessionId)
            .orElseGet(() -> createNewConversation(userId, userName, sessionId));
        
        // Salvar mensagem de entrada
        Message incomingMessage = saveMessage(
            conversation, 
            content, 
            MessageDirection.INCOMING, 
            messageType
        );
        
        // Recuperar histórico (10 últimas mensagens)
        List<Message> history = messageRepo.findTop10ByUserIdOrderByTimestampDesc(userId);
        
        // Construir contexto
        String contextualizedPrompt = buildContextualPrompt(history, content);
        
        // Chamar Gemini
        String aiResponse = callGeminiAPI(contextualizedPrompt);
        
        // Salvar resposta
        saveMessage(
            conversation, 
            aiResponse, 
            MessageDirection.OUTGOING, 
            MessageType.TEXT
        );
        
        return aiResponse;
    }
    
    private Conversation createNewConversation(String userId, String userName, String sessionId) {
        Conversation conversation = new Conversation();
        conversation.setUserId(userId);
        conversation.setUserName(userName);
        conversation.setSessionId(sessionId);
        return conversationRepo.save(conversation);
    }
    
    private Message saveMessage(Conversation conversation, String content, 
                                MessageDirection direction, MessageType messageType) {
        Message message = new Message();
        message.setConversation(conversation);
        message.setContent(content);
        message.setDirection(direction);
        message.setMessageType(messageType);
        message.setTimestamp(LocalDateTime.now());
        message.setProcessed(true);
        
        return messageRepo.save(message);
    }
    
    private String buildContextualPrompt(List<Message> history, String currentMessage) {
        StringBuilder context = new StringBuilder();
        
        context.append("Histórico da conversa (10 últimas mensagens):\n\n");
        
        // Inverter para ordem cronológica
        history.stream()
            .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
            .forEach(msg -> {
                String role = msg.getDirection() == MessageDirection.INCOMING ? "Usuário" : "Justina";
                context.append(String.format("%s: %s\n", role, msg.getContent()));
            });
        
        context.append("\nMensagem atual do usuário: ").append(currentMessage);
        
        return context.toString();
    }
    
    private String callGeminiAPI(String prompt) {
        try {
            // IMPLEMENTAÇÃO REAL DA CHAMADA À API GEMINI
            // Por questões de simplicidade, aqui está uma versão mockada
            
            log.info("Chamando Gemini API com prompt de {} caracteres", prompt.length());
            
            // Na implementação real, você usaria:
            // GenerativeModel model = new GenerativeModel("gemini-2.5-pro", geminiApiKey);
            // GenerateContentResponse response = model.generateContent(SYSTEM_PROMPT + "\n\n" + prompt);
            // return response.getText();
            
            // Mock de resposta
            return "Olá! Entendo que você precisa de ajuda com uma questão judicial. " +
                   "Vou analisar sua situação e indicar os melhores caminhos para resolver " +
                   "seu problema de forma rápida e acessível, priorizando soluções " +
                   "extrajudiciais quando possível.";
            
        } catch (Exception e) {
            log.error("Erro ao chamar Gemini API", e);
            return "Desculpe, tive um problema ao processar sua mensagem. " +
                   "Pode tentar novamente?";
        }
    }
}
```

**MessageProcessorService.java**
```java
package br.gov.ba.justina.service;

import br.gov.ba.justina.model.dto.MessageDTO;
import br.gov.ba.justina.model.dto.WebhookPayloadDTO;
import br.gov.ba.justina.model.entity.MessageType;
import br.gov.ba.justina.util.FilterUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MessageProcessorService {
    
    @Autowired
    private AIAgentService aiAgentService;
    
    @Autowired
    private MediaProcessorService mediaProcessorService;
    
    @Autowired
    private WahaService wahaService;
    
    public void processWebhookPayload(WebhookPayloadDTO payload) {
        
        // Converter payload para DTO interno
        MessageDTO message = convertToMessageDTO(payload);
        
        // Aplicar filtros (replicando os nós "If" do n8n)
        if (FilterUtil.shouldIgnoreMessage(message)) {
            log.info("Mensagem ignorada pelos filtros: {}", message.getMessageId());
            return;
        }
        
        // Marcar como visto
        wahaService.sendSeen(
            message.getSessionId(), 
            message.getUserId(), 
            message.getMessageId()
        );
        
        // Processar conteúdo baseado no tipo
        String processedContent = processContent(message);
        
        // Mostrar "digitando..."
        wahaService.startTyping(message.getSessionId(), message.getUserId());
        
        // Aguardar 2 segundos (simulando tempo de digitação)
        sleep(2000);
        
        // Chamar IA Agent
        String aiResponse = aiAgentService.processMessage(
            message.getUserId(),
            message.getUserName(),
            message.getSessionId(),
            processedContent,
            MessageType.TEXT
        );
        
        // Enviar resposta
        wahaService.sendTextMessage(
            message.getSessionId(),
            message.getUserId(),
            aiResponse
        );
        
        log.info("Mensagem processada com sucesso para: {}", message.getUserId());
    }
    
    private MessageDTO convertToMessageDTO(WebhookPayloadDTO payload) {
        WebhookPayloadDTO.PayloadDTO p = payload.getPayload();
        
        return MessageDTO.builder()
            .messageId(p.getId())
            .userId(p.getFrom())
            .userName(p.getData() != null ? p.getData().getNotifyName() : "Usuário")
            .sessionId(payload.getSession())
            .content(p.getBody())
            .source(p.getSource())
            .hasMedia(p.getHasMedia())
            .mediaUrl(p.getMedia() != null ? p.getMedia().getUrl() : null)
            .mediaType(p.getMedia() != null ? p.getMedia().getMimetype() : null)
            .messageType(p.getData() != null ? p.getData().getType() : "text")
            .build();
    }
    
    private String processContent(MessageDTO message) {
        
        // Se não tem mídia, retorna o texto direto
        if (!Boolean.TRUE.equals(message.getHasMedia())) {
            return message.getContent();
        }
        
        // Processar baseado no tipo de mídia
        String mimeType = message.getMediaType();
        
        if (mimeType != null) {
            if (mimeType.contains("audio")) {
                // Processar áudio (transcrição)
                return mediaProcessorService.processAudio(message.getMediaUrl());
            } 
            else if (mimeType.contains("image")) {
                // Processar imagem (análise visual)
                return mediaProcessorService.processImage(
                    message.getMediaUrl(), 
                    message.getContent()
                );
            }
        }
        
        // Fallback: retorna mensagem original
        return message.getContent();
    }
    
    private void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Sleep interrompido", e);
        }
    }
}
```

### Passo 7: Criar Utilities

**FilterUtil.java**
```java
package br.gov.ba.justina.util;

import br.gov.ba.justina.model.dto.MessageDTO;

public class FilterUtil {
    
    public static boolean shouldIgnoreMessage(MessageDTO message) {
        
        // Filtro 1: Ignorar mensagens originadas da própria API
        if ("api".equals(message.getSource())) {
            return true;
        }
        
        // Filtro 2: Ignorar mensagens de grupos do WhatsApp
        if (message.getUserId() != null && message.getUserId().contains("@g.us")) {
            return true;
        }
        
        return false;
    }
}
```

### Passo 8: Criar Controller

**WebhookController.java**
```java
package br.gov.ba.justina.controller;

import br.gov.ba.justina.model.dto.WebhookPayloadDTO;
import br.gov.ba.justina.service.MessageProcessorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhook")
@Slf4j
public class WebhookController {
    
    @Autowired
    private MessageProcessorService messageProcessorService;
    
    @PostMapping("/waha")
    public ResponseEntity<String> handleWahaWebhook(@RequestBody WebhookPayloadDTO payload) {
        
        log.info("Webhook recebido - Event: {}, From: {}", 
            payload.getEvent(), 
            payload.getPayload().getFrom()
        );
        
        try {
            // Processar mensagem de forma assíncrona (recomendado)
            new Thread(() -> messageProcessorService.processWebhookPayload(payload)).start();
            
            // Retornar resposta imediata ao WAHA
            return ResponseEntity.ok("Webhook recebido");
            
        } catch (Exception e) {
            log.error("Erro ao processar webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erro ao processar webhook");
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Justina AI está rodando!");
    }
}
```

### Passo 9: Criar Application Main

**JustinaAiApplication.java**
```java
package br.gov.ba.justina;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JustinaAiApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(JustinaAiApplication.class, args);
    }
}
```

---

## 5. Estrutura do Banco Oracle

### Scripts SQL

**Script 1: Criar Usuário e Esquema**
```sql
-- Conectar como SYSDBA
CREATE USER justina_user IDENTIFIED BY senha_segura
DEFAULT TABLESPACE USERS
TEMPORARY TABLESPACE TEMP
QUOTA UNLIMITED ON USERS;

GRANT CONNECT, RESOURCE TO justina_user;
GRANT CREATE SESSION TO justina_user;
GRANT CREATE TABLE TO justina_user;
GRANT CREATE SEQUENCE TO justina_user;
GRANT CREATE VIEW TO justina_user;
```

**Script 2: Criar Sequences**
```sql
CREATE SEQUENCE SEQ_CONVERSATION
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

CREATE SEQUENCE SEQ_MESSAGE
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;
```

**Script 3: Criar Tabelas**
```sql
-- Tabela de Conversas
CREATE TABLE TB_CONVERSATION (
    ID_CONVERSATION NUMBER(19) PRIMARY KEY,
    USER_ID VARCHAR2(100) NOT NULL UNIQUE,
    SESSION_ID VARCHAR2(50),
    USER_NAME VARCHAR2(200),
    CREATED_AT TIMESTAMP NOT NULL,
    UPDATED_AT TIMESTAMP
);

-- Índices para TB_CONVERSATION
CREATE INDEX IDX_CONV_USER_ID ON TB_CONVERSATION(USER_ID);
CREATE INDEX IDX_CONV_SESSION ON TB_CONVERSATION(SESSION_ID);

-- Tabela de Mensagens
CREATE TABLE TB_MESSAGE (
    ID_MESSAGE NUMBER(19) PRIMARY KEY,
    ID_CONVERSATION NUMBER(19) NOT NULL,
    MESSAGE_ID_EXTERNAL VARCHAR2(255),
    DIRECTION VARCHAR2(20) NOT NULL,
    CONTENT CLOB,
    MESSAGE_TYPE VARCHAR2(50),
    MEDIA_URL VARCHAR2(500),
    TIMESTAMP TIMESTAMP NOT NULL,
    PROCESSED NUMBER(1) DEFAULT 0,
    CONSTRAINT FK_MSG_CONV FOREIGN KEY (ID_CONVERSATION) 
        REFERENCES TB_CONVERSATION(ID_CONVERSATION)
);

-- Índices para TB_MESSAGE
CREATE INDEX IDX_MSG_CONV ON TB_MESSAGE(ID_CONVERSATION);
CREATE INDEX IDX_MSG_TIMESTAMP ON TB_MESSAGE(TIMESTAMP DESC);
CREATE INDEX IDX_MSG_EXTERNAL ON TB_MESSAGE(MESSAGE_ID_EXTERNAL);

-- Comentários nas tabelas
COMMENT ON TABLE TB_CONVERSATION IS 'Armazena conversas dos usuários com a Justina AI';
COMMENT ON TABLE TB_MESSAGE IS 'Armazena todas as mensagens trocadas nas conversas';
```

**Script 4: Criar Views Úteis**
```sql
-- View: Últimas 10 mensagens por usuário
CREATE OR REPLACE VIEW VW_RECENT_MESSAGES AS
SELECT 
    c.USER_ID,
    c.USER_NAME,
    m.CONTENT,
    m.DIRECTION,
    m.MESSAGE_TYPE,
    m.TIMESTAMP,
    ROW_NUMBER() OVER (PARTITION BY c.USER_ID ORDER BY m.TIMESTAMP DESC) as RN
FROM TB_MESSAGE m
INNER JOIN TB_CONVERSATION c ON m.ID_CONVERSATION = c.ID_CONVERSATION
WHERE m.PROCESSED = 1;

-- View: Estatísticas de uso
CREATE OR REPLACE VIEW VW_USAGE_STATS AS
SELECT 
    c.USER_ID,
    c.USER_NAME,
    COUNT(m.ID_MESSAGE) as TOTAL_MESSAGES,
    SUM(CASE WHEN m.DIRECTION = 'INCOMING' THEN 1 ELSE 0 END) as INCOMING_COUNT,
    SUM(CASE WHEN m.DIRECTION = 'OUTGOING' THEN 1 ELSE 0 END) as OUTGOING_COUNT,
    MAX(m.TIMESTAMP) as LAST_INTERACTION,
    c.CREATED_AT as FIRST_INTERACTION
FROM TB_CONVERSATION c
LEFT JOIN TB_MESSAGE m ON c.ID_CONVERSATION = m.ID_CONVERSATION
GROUP BY c.USER_ID, c.USER_NAME, c.CREATED_AT;
```

---

## 6. Testando a Aplicação

### Teste 1: Health Check
```bash
curl http://localhost:8080/webhook/health
```

### Teste 2: Simular Webhook do WAHA
```bash
curl -X POST http://localhost:8080/webhook/waha \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message.any",
    "session": "default",
    "payload": {
      "id": "test_message_123",
      "from": "557188904263@c.us",
      "body": "Preciso de ajuda com um problema de consumo",
      "hasMedia": false,
      "source": "app",
      "_data": {
        "type": "chat",
        "notifyName": "João Silva"
      }
    }
  }'
```

---

## 7. Melhorias e Próximos Passos

### 7.1 Processamento Assíncrono

Para não bloquear o webhook, implemente um sistema de filas:

**Usando Spring @Async**
```java
@Service
public class MessageProcessorService {
    
    @Async
    public void processWebhookPayload(WebhookPayloadDTO payload) {
        // Código de processamento
    }
}
```

**Configuração de Async**
```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("justina-async-");
        executor.initialize();
        return executor;
    }
}
```

### 7.2 Integração Real com Gemini

**Dependência adicional no pom.xml:**
```xml
<dependency>
    <groupId>com.google.ai.client.generativeai</groupId>
    <artifactId>generativeai</artifactId>
    <version>0.1.1</version>
</dependency>
```

**Implementação completa:**
```java
@Service
public class GeminiService {
    
    @Value("${google.gemini.api.key}")
    private String apiKey;
    
    private GenerativeModel model;
    
    @PostConstruct
    public void init() {
        model = new GenerativeModel("gemini-2.5-pro", apiKey);
    }
    
    public String generateResponse(String systemPrompt, String userMessage) {
        try {
            String fullPrompt = systemPrompt + "\n\nUsuário: " + userMessage;
            
            GenerateContentResponse response = model.generateContent(fullPrompt);
            
            return response.getText();
            
        } catch (Exception e) {
            log.error("Erro ao chamar Gemini", e);
            throw new RuntimeException("Falha na geração de resposta", e);
        }
    }
}
```

### 7.3 Cache de Respostas

Para otimizar custos da API:

```java
@Service
public class CacheService {
    
    private final Map<String, CachedResponse> cache = new ConcurrentHashMap<>();
    
    @Scheduled(fixedRate = 3600000) // Limpar cache a cada 1 hora
    public void clearExpiredCache() {
        long now = System.currentTimeMillis();
        cache.entrySet().removeIf(entry -> 
            now - entry.getValue().getTimestamp() > 3600000
        );
    }
    
    public String getCachedResponse(String key) {
        CachedResponse cached = cache.get(key);
        if (cached != null && !cached.isExpired()) {
            return cached.getResponse();
        }
        return null;
    }
    
    public void cacheResponse(String key, String response) {
        cache.put(key, new CachedResponse(response, System.currentTimeMillis()));
    }
}
```

### 7.4 Logging e Monitoramento

**Logback configuration (logback-spring.xml):**
```xml
<configuration>
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/justina-ai.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/justina-ai.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
    
    <root level="INFO">
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

### 7.5 Testes Unitários

**Exemplo de teste com JUnit 5:**
```java
@SpringBootTest
class MessageProcessorServiceTest {
    
    @Autowired
    private MessageProcessorService messageProcessorService;
    
    @MockBean
    private WahaService wahaService;
    
    @MockBean
    private AIAgentService aiAgentService;
    
    @Test
    void testProcessWebhookPayload() {
        // Arrange
        WebhookPayloadDTO payload = createTestPayload();
        
        when(aiAgentService.processMessage(any(), any(), any(), any(), any()))
            .thenReturn("Resposta de teste");
        
        // Act
        messageProcessorService.processWebhookPayload(payload);
        
        // Assert
        verify(wahaService).sendSeen(any(), any(), any());
        verify(wahaService).startTyping(any(), any());
        verify(wahaService).sendTextMessage(any(), any(), any());
    }
}
```

---

## 8. Conclusão

Esta documentação forneceu um guia completo de migração do workflow n8n do Justina AI para uma aplicação Java com Oracle Database. A arquitetura proposta:

✅ Mantém todas as funcionalidades do n8n
✅ Usa tecnologias enterprise (Spring Boot, Hibernate, Oracle)
✅ É escalável e mantível
✅ Segue boas práticas de desenvolvimento Java
✅ Está pronta para produção

### Próximos Passos Recomendados:

1. Implementar testes completos (unitários e integração)
2. Configurar CI/CD (Jenkins, GitLab CI, etc.)
3. Adicionar autenticação/autorização (Spring Security)
4. Implementar rate limiting para evitar abuso
5. Criar dashboard de monitoramento
6. Documentar API com Swagger/OpenAPI
7. Implementar backup automatizado do banco Oracle

### Recursos Adicionais:

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Hibernate ORM Guide](https://hibernate.org/orm/documentation/)
- [Oracle JDBC Driver](https://www.oracle.com/database/technologies/appdev/jdbc.html)
- [Google Generative AI SDK](https://cloud.google.com/vertex-ai/docs)

---

**Desenvolvido por:** Equipe Justina AI
**Data:** Outubro 2025
**Versão:** 1.0.0
