# 🔬 Comparação Prática: Mesmo Código em 3 Linguagens

## 📝 Objetivo

Este documento mostra o **mesmo fluxo do Justina AI** implementado em **Java**, **Node.js** e **Python** para você comparar diretamente.

**Fluxo a ser implementado:**
1. Receber webhook do WAHA (POST /webhook)
2. Extrair dados da mensagem
3. Buscar ou criar conversa no banco de dados
4. Recuperar histórico (10 últimas mensagens)
5. Chamar Gemini para gerar resposta
6. Salvar mensagem no banco
7. Enviar resposta via WAHA

---

## 🟦 Implementação JAVA (Spring Boot)

### Estrutura de Arquivos
```
src/main/java/br/gov/ba/justina/
├── controller/
│   └── WebhookController.java
├── service/
│   ├── MessageService.java
│   ├── GeminiService.java
│   └── WahaService.java
├── repository/
│   ├── ConversationRepository.java
│   └── MessageRepository.java
├── model/
│   ├── entity/
│   │   ├── Conversation.java
│   │   └── Message.java
│   └── dto/
│       └── WebhookPayloadDTO.java
└── JustinaApplication.java
```

### 1. Modelo de Dados (Entities)

**Conversation.java**
```java
package br.gov.ba.justina.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "TB_CONVERSATION")
public class Conversation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_conv")
    @SequenceGenerator(name = "seq_conv", sequenceName = "SEQ_CONVERSATION", allocationSize = 1)
    private Long id;
    
    @Column(name = "USER_ID", nullable = false, unique = true)
    private String userId;
    
    @Column(name = "USER_NAME")
    private String userName;
    
    @Column(name = "SESSION_ID")
    private String sessionId;
    
    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL)
    private List<Message> messages = new ArrayList<>();
    
    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

**Message.java**
```java
package br.gov.ba.justina.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_MESSAGE")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_msg")
    @SequenceGenerator(name = "seq_msg", sequenceName = "SEQ_MESSAGE", allocationSize = 1)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CONVERSATION", nullable = false)
    private Conversation conversation;
    
    @Column(name = "CONTENT", columnDefinition = "CLOB")
    @Lob
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "DIRECTION", nullable = false)
    private MessageDirection direction;
    
    @Column(name = "TIMESTAMP", nullable = false)
    private LocalDateTime timestamp;
    
    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public MessageDirection getDirection() { return direction; }
    public void setDirection(MessageDirection direction) { this.direction = direction; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}

enum MessageDirection {
    INCOMING, OUTGOING
}
```

### 2. DTOs

**WebhookPayloadDTO.java**
```java
package br.gov.ba.justina.model.dto;

public class WebhookPayloadDTO {
    
    private String event;
    private String session;
    private PayloadDTO payload;
    
    public static class PayloadDTO {
        private String id;
        private String from;
        private String body;
        private Boolean hasMedia;
        private DataDTO _data;
        
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getFrom() { return from; }
        public void setFrom(String from) { this.from = from; }
        
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        
        public Boolean getHasMedia() { return hasMedia; }
        public void setHasMedia(Boolean hasMedia) { this.hasMedia = hasMedia; }
        
        public DataDTO getData() { return _data; }
        public void setData(DataDTO data) { this._data = data; }
    }
    
    public static class DataDTO {
        private String notifyName;
        
        public String getNotifyName() { return notifyName; }
        public void setNotifyName(String notifyName) { this.notifyName = notifyName; }
    }
    
    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }
    
    public String getSession() { return session; }
    public void setSession(String session) { this.session = session; }
    
    public PayloadDTO getPayload() { return payload; }
    public void setPayload(PayloadDTO payload) { this.payload = payload; }
}
```

### 3. Repositories

```java
package br.gov.ba.justina.repository;

import br.gov.ba.justina.model.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByUserId(String userId);
}

public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query(value = "SELECT * FROM TB_MESSAGE m " +
                   "WHERE m.ID_CONVERSATION = :convId " +
                   "ORDER BY m.TIMESTAMP DESC " +
                   "FETCH FIRST 10 ROWS ONLY",
           nativeQuery = true)
    List<Message> findTop10ByConversation(@Param("convId") Long conversationId);
}
```

### 4. Services

**MessageService.java**
```java
package br.gov.ba.justina.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MessageService {
    
    @Autowired
    private ConversationRepository conversationRepo;
    
    @Autowired
    private MessageRepository messageRepo;
    
    @Autowired
    private GeminiService geminiService;
    
    @Autowired
    private WahaService wahaService;
    
    @Transactional
    public void processarMensagem(String userId, String userName, String sessionId, String content) {
        
        // 1. Buscar ou criar conversa
        Conversation conversa = conversationRepo.findByUserId(userId)
            .orElseGet(() -> {
                Conversation nova = new Conversation();
                nova.setUserId(userId);
                nova.setUserName(userName);
                nova.setSessionId(sessionId);
                return conversationRepo.save(nova);
            });
        
        // 2. Salvar mensagem de entrada
        Message msgEntrada = new Message();
        msgEntrada.setConversation(conversa);
        msgEntrada.setContent(content);
        msgEntrada.setDirection(MessageDirection.INCOMING);
        messageRepo.save(msgEntrada);
        
        // 3. Recuperar histórico
        List<Message> historico = messageRepo.findTop10ByConversation(conversa.getId());
        
        // 4. Construir contexto
        StringBuilder contexto = new StringBuilder();
        historico.forEach(msg -> {
            String role = msg.getDirection() == MessageDirection.INCOMING ? "Usuário" : "Justina";
            contexto.append(role).append(": ").append(msg.getContent()).append("\n");
        });
        
        // 5. Chamar Gemini
        String resposta = geminiService.gerarResposta(contexto.toString() + "\nUsuário: " + content);
        
        // 6. Salvar resposta
        Message msgSaida = new Message();
        msgSaida.setConversation(conversa);
        msgSaida.setContent(resposta);
        msgSaida.setDirection(MessageDirection.OUTGOING);
        messageRepo.save(msgSaida);
        
        // 7. Enviar via WAHA
        wahaService.enviarMensagem(sessionId, userId, resposta);
    }
}
```

**GeminiService.java**
```java
package br.gov.ba.justina.service;

import com.google.ai.client.generativeai.GenerativeModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {
    
    private final GenerativeModel model;
    
    public GeminiService(@Value("${gemini.api.key}") String apiKey) {
        this.model = new GenerativeModel("gemini-2.5-pro", apiKey);
    }
    
    public String gerarResposta(String prompt) {
        try {
            return model.generateContent(prompt).getText();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao chamar Gemini", e);
        }
    }
}
```

**WahaService.java**
```java
package br.gov.ba.justina.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class WahaService {
    
    @Value("${waha.api.url}")
    private String wahaUrl;
    
    @Value("${waha.api.key}")
    private String wahaApiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public void enviarMensagem(String session, String chatId, String texto) {
        
        String url = wahaUrl + "/api/" + session + "/messages/text";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Api-Key", wahaApiKey);
        
        Map<String, Object> body = new HashMap<>();
        body.put("chatId", chatId);
        body.put("text", texto);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        restTemplate.postForEntity(url, request, String.class);
    }
}
```

### 5. Controller

**WebhookController.java**
```java
package br.gov.ba.justina.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhook")
public class WebhookController {
    
    @Autowired
    private MessageService messageService;
    
    @PostMapping("/waha")
    public ResponseEntity<String> handleWebhook(@RequestBody WebhookPayloadDTO payload) {
        
        // Processar assincronamente
        new Thread(() -> {
            String userId = payload.getPayload().getFrom();
            String userName = payload.getPayload().getData().getNotifyName();
            String sessionId = payload.getSession();
            String content = payload.getPayload().getBody();
            
            messageService.processarMensagem(userId, userName, sessionId, content);
        }).start();
        
        return ResponseEntity.ok("OK");
    }
}
```

### 6. Configuração

**application.properties**
```properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:ORCL
spring.datasource.username=justina
spring.datasource.password=senha
spring.jpa.hibernate.ddl-auto=update

waha.api.url=http://localhost:3000
waha.api.key=sua_chave
gemini.api.key=sua_chave_gemini
```

**Total de linhas Java: ~450 linhas**

---

## 🟩 Implementação NODE.JS (Express + TypeScript)

### Estrutura de Arquivos
```
src/
├── controllers/
│   └── webhookController.ts
├── services/
│   ├── messageService.ts
│   ├── geminiService.ts
│   └── wahaService.ts
├── models/
│   ├── Conversation.ts
│   └── Message.ts
├── database/
│   └── connection.ts
└── index.ts
```

### 1. Modelos (Sequelize ORM)

**models/Conversation.ts**
```typescript
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';

class Conversation extends Model {
  public id!: number;
  public userId!: string;
  public userName!: string;
  public sessionId!: string;
  public createdAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'USER_ID',
    },
    userName: {
      type: DataTypes.STRING(200),
      field: 'USER_NAME',
    },
    sessionId: {
      type: DataTypes.STRING(50),
      field: 'SESSION_ID',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'CREATED_AT',
    },
  },
  {
    sequelize,
    tableName: 'TB_CONVERSATION',
    timestamps: false,
  }
);

export default Conversation;
```

**models/Message.ts**
```typescript
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/connection';
import Conversation from './Conversation';

enum MessageDirection {
  INCOMING = 'INCOMING',
  OUTGOING = 'OUTGOING',
}

class Message extends Model {
  public id!: number;
  public conversationId!: number;
  public content!: string;
  public direction!: MessageDirection;
  public timestamp!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'ID_CONVERSATION',
    },
    content: {
      type: DataTypes.TEXT,
      field: 'CONTENT',
    },
    direction: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'DIRECTION',
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'TIMESTAMP',
    },
  },
  {
    sequelize,
    tableName: 'TB_MESSAGE',
    timestamps: false,
  }
);

// Relacionamento
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });
Conversation.hasMany(Message, { foreignKey: 'conversationId' });

export default Message;
export { MessageDirection };
```

### 2. Conexão com Oracle

**database/connection.ts**
```typescript
import { Sequelize } from 'sequelize';
import oracledb from 'oracledb';

// Configurar Oracle Instant Client
oracledb.initOracleClient({
  libDir: '/opt/oracle/instantclient_19_8',
});

export const sequelize = new Sequelize({
  dialect: 'oracle',
  host: 'localhost',
  port: 1521,
  database: 'ORCL',
  username: 'justina',
  password: 'senha',
  dialectOptions: {
    connectString: 'localhost:1521/ORCL',
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});
```

### 3. Services

**services/messageService.ts**
```typescript
import Conversation from '../models/Conversation';
import Message, { MessageDirection } from '../models/Message';
import { geminiService } from './geminiService';
import { wahaService } from './wahaService';
import { Op } from 'sequelize';

class MessageService {
  
  async processarMensagem(
    userId: string,
    userName: string,
    sessionId: string,
    content: string
  ): Promise<void> {
    
    // 1. Buscar ou criar conversa
    let conversa = await Conversation.findOne({ where: { userId } });
    
    if (!conversa) {
      conversa = await Conversation.create({
        userId,
        userName,
        sessionId,
        createdAt: new Date(),
      });
    }
    
    // 2. Salvar mensagem de entrada
    await Message.create({
      conversationId: conversa.id,
      content,
      direction: MessageDirection.INCOMING,
      timestamp: new Date(),
    });
    
    // 3. Recuperar histórico (10 últimas)
    const historico = await Message.findAll({
      where: { conversationId: conversa.id },
      order: [['timestamp', 'DESC']],
      limit: 10,
    });
    
    // 4. Construir contexto
    let contexto = '';
    historico.reverse().forEach((msg) => {
      const role = msg.direction === MessageDirection.INCOMING ? 'Usuário' : 'Justina';
      contexto += `${role}: ${msg.content}\n`;
    });
    
    // 5. Chamar Gemini
    const resposta = await geminiService.gerarResposta(
      contexto + `\nUsuário: ${content}`
    );
    
    // 6. Salvar resposta
    await Message.create({
      conversationId: conversa.id,
      content: resposta,
      direction: MessageDirection.OUTGOING,
      timestamp: new Date(),
    });
    
    // 7. Enviar via WAHA
    await wahaService.enviarMensagem(sessionId, userId, resposta);
  }
}

export const messageService = new MessageService();
```

**services/geminiService.ts**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  
  private genAI: GoogleGenerativeAI;
  private model: any;
  
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  }
  
  async gerarResposta(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new Error(`Erro ao chamar Gemini: ${error}`);
    }
  }
}

export const geminiService = new GeminiService();
```

**services/wahaService.ts**
```typescript
import axios from 'axios';

class WahaService {
  
  private wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
  private wahaApiKey = process.env.WAHA_API_KEY || '';
  
  async enviarMensagem(
    session: string,
    chatId: string,
    texto: string
  ): Promise<void> {
    
    const url = `${this.wahaUrl}/api/${session}/messages/text`;
    
    try {
      await axios.post(
        url,
        {
          chatId,
          text: texto,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': this.wahaApiKey,
          },
        }
      );
    } catch (error) {
      console.error('Erro ao enviar mensagem WAHA:', error);
    }
  }
}

export const wahaService = new WahaService();
```

### 4. Controller

**controllers/webhookController.ts**
```typescript
import { Request, Response } from 'express';
import { messageService } from '../services/messageService';

interface WebhookPayload {
  event: string;
  session: string;
  payload: {
    id: string;
    from: string;
    body: string;
    hasMedia: boolean;
    _data: {
      notifyName: string;
    };
  };
}

export const handleWebhook = async (req: Request, res: Response) => {
  
  const payload: WebhookPayload = req.body;
  
  // Responder imediatamente
  res.status(200).send('OK');
  
  // Processar assincronamente
  setImmediate(async () => {
    try {
      await messageService.processarMensagem(
        payload.payload.from,
        payload.payload._data.notifyName,
        payload.session,
        payload.payload.body
      );
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });
};
```

### 5. Server Principal

**index.ts**
```typescript
import express from 'express';
import { sequelize } from './database/connection';
import { handleWebhook } from './controllers/webhookController';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Rotas
app.post('/webhook/waha', handleWebhook);

// Iniciar servidor
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao Oracle!');
    
    await sequelize.sync();
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar:', error);
  }
};

start();
```

### 6. Configuração

**package.json**
```json
{
  "name": "justina-nodejs",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.0",
    "oracledb": "^6.0.0",
    "@google/generative-ai": "^0.1.3",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "ts-node": "^10.9.2"
  }
}
```

**.env**
```
DATABASE_URL=localhost:1521/ORCL
DB_USER=justina
DB_PASSWORD=senha
WAHA_URL=http://localhost:3000
WAHA_API_KEY=sua_chave
GEMINI_API_KEY=sua_chave_gemini
```

**Total de linhas Node.js: ~350 linhas**

---

## 🟨 Implementação PYTHON (FastAPI + SQLAlchemy)

### Estrutura de Arquivos
```
app/
├── controllers/
│   └── webhook_controller.py
├── services/
│   ├── message_service.py
│   ├── gemini_service.py
│   └── waha_service.py
├── models/
│   ├── conversation.py
│   └── message.py
├── database/
│   └── connection.py
└── main.py
```

### 1. Modelos (SQLAlchemy)

**models/conversation.py**
```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class Conversation(Base):
    __tablename__ = 'TB_CONVERSATION'
    
    id = Column('ID_CONVERSATION', Integer, primary_key=True, autoincrement=True)
    user_id = Column('USER_ID', String(100), nullable=False, unique=True)
    user_name = Column('USER_NAME', String(200))
    session_id = Column('SESSION_ID', String(50))
    created_at = Column('CREATED_AT', DateTime, nullable=False, default=datetime.now)
    
    messages = relationship('Message', back_populates='conversation')
```

**models/message.py**
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base
import enum

class MessageDirection(enum.Enum):
    INCOMING = 'INCOMING'
    OUTGOING = 'OUTGOING'

class Message(Base):
    __tablename__ = 'TB_MESSAGE'
    
    id = Column('ID_MESSAGE', Integer, primary_key=True, autoincrement=True)
    conversation_id = Column('ID_CONVERSATION', Integer, ForeignKey('TB_CONVERSATION.ID_CONVERSATION'), nullable=False)
    content = Column('CONTENT', Text)
    direction = Column('DIRECTION', Enum(MessageDirection), nullable=False)
    timestamp = Column('TIMESTAMP', DateTime, nullable=False, default=datetime.now)
    
    conversation = relationship('Conversation', back_populates='messages')
```

### 2. Conexão com Oracle

**database/connection.py**
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# String de conexão Oracle
DATABASE_URL = f"oracle+cx_oracle://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@localhost:1521/ORCL"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3. Services

**services/message_service.py**
```python
from sqlalchemy.orm import Session
from models.conversation import Conversation
from models.message import Message, MessageDirection
from services.gemini_service import GeminiService
from services.waha_service import WahaService
from datetime import datetime

class MessageService:
    
    def __init__(self):
        self.gemini_service = GeminiService()
        self.waha_service = WahaService()
    
    async def processar_mensagem(
        self,
        db: Session,
        user_id: str,
        user_name: str,
        session_id: str,
        content: str
    ):
        
        # 1. Buscar ou criar conversa
        conversa = db.query(Conversation).filter(Conversation.user_id == user_id).first()
        
        if not conversa:
            conversa = Conversation(
                user_id=user_id,
                user_name=user_name,
                session_id=session_id,
                created_at=datetime.now()
            )
            db.add(conversa)
            db.commit()
            db.refresh(conversa)
        
        # 2. Salvar mensagem de entrada
        msg_entrada = Message(
            conversation_id=conversa.id,
            content=content,
            direction=MessageDirection.INCOMING,
            timestamp=datetime.now()
        )
        db.add(msg_entrada)
        db.commit()
        
        # 3. Recuperar histórico (10 últimas)
        historico = db.query(Message)\
            .filter(Message.conversation_id == conversa.id)\
            .order_by(Message.timestamp.desc())\
            .limit(10)\
            .all()
        
        # 4. Construir contexto
        contexto = ''
        for msg in reversed(historico):
            role = 'Usuário' if msg.direction == MessageDirection.INCOMING else 'Justina'
            contexto += f'{role}: {msg.content}\n'
        
        # 5. Chamar Gemini
        resposta = await self.gemini_service.gerar_resposta(
            contexto + f'\nUsuário: {content}'
        )
        
        # 6. Salvar resposta
        msg_saida = Message(
            conversation_id=conversa.id,
            content=resposta,
            direction=MessageDirection.OUTGOING,
            timestamp=datetime.now()
        )
        db.add(msg_saida)
        db.commit()
        
        # 7. Enviar via WAHA
        await self.waha_service.enviar_mensagem(session_id, user_id, resposta)

message_service = MessageService()
```

**services/gemini_service.py**
```python
import google.generativeai as genai
import os

class GeminiService:
    
    def __init__(self):
        genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        self.model = genai.GenerativeModel('gemini-2.5-pro')
    
    async def gerar_resposta(self, prompt: str) -> str:
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise Exception(f'Erro ao chamar Gemini: {str(e)}')
```

**services/waha_service.py**
```python
import httpx
import os

class WahaService:
    
    def __init__(self):
        self.waha_url = os.getenv('WAHA_URL', 'http://localhost:3000')
        self.waha_api_key = os.getenv('WAHA_API_KEY', '')
    
    async def enviar_mensagem(self, session: str, chat_id: str, texto: str):
        
        url = f'{self.waha_url}/api/{session}/messages/text'
        
        headers = {
            'Content-Type': 'application/json',
            'X-Api-Key': self.waha_api_key
        }
        
        body = {
            'chatId': chat_id,
            'text': texto
        }
        
        try:
            async with httpx.AsyncClient() as client:
                await client.post(url, json=body, headers=headers)
        except Exception as e:
            print(f'Erro ao enviar mensagem WAHA: {str(e)}')
```

### 4. Controller

**controllers/webhook_controller.py**
```python
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.connection import get_db
from services.message_service import message_service

router = APIRouter()

class WebhookPayload(BaseModel):
    event: str
    session: str
    payload: dict

@router.post('/webhook/waha')
async def handle_webhook(
    payload: WebhookPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    
    # Adicionar tarefa em background
    background_tasks.add_task(
        message_service.processar_mensagem,
        db,
        payload.payload['from'],
        payload.payload['_data']['notifyName'],
        payload.session,
        payload.payload['body']
    )
    
    return {'status': 'ok'}
```

### 5. Server Principal

**main.py**
```python
from fastapi import FastAPI
from controllers.webhook_controller import router
from database.connection import engine, Base
import uvicorn

# Criar tabelas
Base.metadata.create_all(bind=engine)

# Inicializar FastAPI
app = FastAPI(title='Justina AI')

# Registrar rotas
app.include_router(router)

@app.get('/')
def read_root():
    return {'message': 'Justina AI está rodando!'}

if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
```

### 6. Configuração

**requirements.txt**
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
cx-oracle==8.3.0
google-generativeai==0.3.2
httpx==0.26.0
python-dotenv==1.0.0
```

**.env**
```
DB_USER=justina
DB_PASSWORD=senha
WAHA_URL=http://localhost:3000
WAHA_API_KEY=sua_chave
GEMINI_API_KEY=sua_chave_gemini
```

**Total de linhas Python: ~280 linhas**

---

## 📊 Comparação Final

### Linhas de Código
| Linguagem | Linhas Totais | Diferença |
|-----------|---------------|-----------|
| Python | ~280 | Baseline |
| Node.js | ~350 | +25% |
| Java | ~450 | +60% |

### Complexidade de Setup

#### Python ⭐⭐⭐⭐⭐
```bash
# Instalar dependências
pip install -r requirements.txt

# Instalar Oracle Instant Client
# (complexo, mas uma vez só)

# Rodar
python main.py
```

#### Node.js ⭐⭐⭐⭐
```bash
# Instalar dependências
npm install

# Instalar Oracle Instant Client
# (complexo, mas uma vez só)

# Rodar
npm run dev
```

#### Java ⭐⭐
```bash
# Instalar JDK 17
# Instalar Maven
# Configurar IDE (IntelliJ/Eclipse)

# Compilar
mvn clean package

# Rodar
java -jar target/justina-1.0.0.jar
```

### Performance Estimada (1000 requisições/segundo)

| Linguagem | CPU Usage | Memory | Latência Média |
|-----------|-----------|--------|----------------|
| Java | 40% | 512MB | 15ms |
| Node.js | 60% | 150MB | 25ms |
| Python | 80% | 120MB | 35ms |

### Produtividade (tempo para implementar)

| Linguagem | Tempo Estimado | Curva de Aprendizado |
|-----------|----------------|----------------------|
| Python | 2-3 dias | ⭐⭐⭐⭐⭐ Fácil |
| Node.js | 3-4 dias | ⭐⭐⭐⭐ Médio |
| Java | 5-7 dias | ⭐⭐ Difícil |

---

## 🎯 Conclusão Prática

**Para Justina AI especificamente:**

1. **Java é a escolha correta** porque:
   - Oracle Database já está definido (melhor integração)
   - Sistema governamental (precisa de estabilidade)
   - Você precisa aprender Java (objetivo educacional)

2. **Mas não se assuste:**
   - Sim, Java tem mais código
   - Sim, é mais complexo no início
   - MAS: após setup, é mais fácil manter e escalar

3. **Dica prática:**
   - Comece com Python/Node.js para prototipar
   - Valide a lógica de negócio
   - Migre para Java para produção

4. **WAHA e Gemini:**
   - ✅ Funcionam perfeitamente nas 3 linguagens
   - São APIs REST/HTTP (agnósticas de linguagem)
   - SDKs oficiais disponíveis para todas

**Boa sorte no projeto! 🚀**
