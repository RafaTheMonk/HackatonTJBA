# 💻 Exemplos Práticos de Código - Justina AI

## 📚 Guia de Estudos Java + Hibernate + Oracle

Este documento contém exemplos práticos e comentados para ajudar no aprendizado de Java puro, Hibernate e integração com Oracle.

---

## 1. Fundamentos Java Aplicados ao Projeto

### 1.1 Classes e Objetos

```java
package br.gov.ba.justina.model.entity;

/**
 * Esta é uma classe Java que representa uma entidade do mundo real: uma Conversa
 * 
 * Conceitos importantes:
 * - Classe: molde/template para criar objetos
 * - Atributos: características da classe (campos)
 * - Métodos: comportamentos/ações da classe
 * - Encapsulamento: atributos privados + getters/setters públicos
 */
public class Conversation {
    
    // Atributos privados (Encapsulamento)
    private Long id;
    private String userId;
    private String sessionId;
    private String userName;
    
    // Construtor padrão (sem parâmetros)
    // Necessário para o Hibernate criar instâncias
    public Conversation() {
    }
    
    // Construtor com parâmetros
    // Facilita a criação de objetos já com dados
    public Conversation(String userId, String userName, String sessionId) {
        this.userId = userId;
        this.userName = userName;
        this.sessionId = sessionId;
    }
    
    // Getters e Setters (Encapsulamento)
    // Permitem acesso controlado aos atributos privados
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    // ... outros getters e setters
    
    // Método toString() - útil para debug
    @Override
    public String toString() {
        return "Conversation{" +
                "id=" + id +
                ", userId='" + userId + '\'' +
                ", userName='" + userName + '\'' +
                '}';
    }
    
    // Método equals() - compara objetos
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Conversation that = (Conversation) o;
        return id != null && id.equals(that.id);
    }
    
    // Método hashCode() - usado em coleções (HashMap, HashSet)
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
```

**Como usar esta classe:**

```java
// Criar uma nova conversa
Conversation conversa = new Conversation();
conversa.setUserId("557188904263@c.us");
conversa.setUserName("Rafael Brito");
conversa.setSessionId("default");

// Ou usando o construtor com parâmetros
Conversation conversa2 = new Conversation(
    "557188904263@c.us",
    "Rafael Brito",
    "default"
);

// Acessar dados
System.out.println("ID do usuário: " + conversa.getUserId());
System.out.println(conversa.toString());
```

### 1.2 Herança e Interfaces

```java
package br.gov.ba.justina.service;

/**
 * Interface define um contrato (métodos que devem ser implementados)
 * 
 * Conceitos:
 * - Interface: define APENAS assinaturas de métodos (sem implementação)
 * - Uma classe pode implementar múltiplas interfaces
 * - Facilita polimorfismo e desacoplamento
 */
public interface ProcessadorDeMensagem {
    
    /**
     * Processa uma mensagem e retorna a resposta
     * @param mensagem Texto da mensagem a processar
     * @return Resposta processada
     */
    String processar(String mensagem);
    
    /**
     * Valida se a mensagem é válida
     * @param mensagem Mensagem a validar
     * @return true se válida, false caso contrário
     */
    boolean validar(String mensagem);
}

/**
 * Classe abstrata: pode ter métodos com e sem implementação
 * Não pode ser instanciada diretamente
 */
public abstract class ProcessadorBase implements ProcessadorDeMensagem {
    
    // Atributo protegido (acessível por subclasses)
    protected String nome;
    
    public ProcessadorBase(String nome) {
        this.nome = nome;
    }
    
    // Método implementado (todas as subclasses herdam)
    @Override
    public boolean validar(String mensagem) {
        // Validação básica: mensagem não pode ser nula ou vazia
        return mensagem != null && !mensagem.trim().isEmpty();
    }
    
    // Método abstrato (DEVE ser implementado pelas subclasses)
    @Override
    public abstract String processar(String mensagem);
    
    // Método auxiliar protegido
    protected void log(String mensagem) {
        System.out.println("[" + nome + "] " + mensagem);
    }
}

/**
 * Classe concreta que herda de ProcessadorBase
 */
public class ProcessadorDeTexto extends ProcessadorBase {
    
    public ProcessadorDeTexto() {
        super("ProcessadorDeTexto");
    }
    
    // Implementação do método abstrato
    @Override
    public String processar(String mensagem) {
        log("Processando mensagem de texto: " + mensagem);
        
        // Lógica de processamento
        String resposta = "Você disse: " + mensagem;
        
        return resposta;
    }
    
    // Pode sobrescrever métodos da classe pai
    @Override
    public boolean validar(String mensagem) {
        // Validação adicional específica para texto
        boolean validacaoBase = super.validar(mensagem);
        
        if (!validacaoBase) {
            return false;
        }
        
        // Texto não pode ter mais de 1000 caracteres
        return mensagem.length() <= 1000;
    }
}

/**
 * Outro processador que herda a mesma base
 */
public class ProcessadorDeAudio extends ProcessadorBase {
    
    public ProcessadorDeAudio() {
        super("ProcessadorDeAudio");
    }
    
    @Override
    public String processar(String mensagem) {
        log("Processando áudio...");
        
        // Simula transcrição
        String transcricao = "[Áudio transcrito]: " + mensagem;
        
        return transcricao;
    }
}
```

**Polimorfismo em ação:**

```java
// Podemos tratar diferentes processadores de forma uniforme
ProcessadorDeMensagem processador1 = new ProcessadorDeTexto();
ProcessadorDeMensagem processador2 = new ProcessadorDeAudio();

// Ambos têm o método processar(), mas implementações diferentes
String resposta1 = processador1.processar("Olá");
String resposta2 = processador2.processar("Conteúdo do áudio");

// Lista polimórfica
List<ProcessadorDeMensagem> processadores = new ArrayList<>();
processadores.add(new ProcessadorDeTexto());
processadores.add(new ProcessadorDeAudio());

// Processar com qualquer processador
for (ProcessadorDeMensagem proc : processadores) {
    String resultado = proc.processar("teste");
    System.out.println(resultado);
}
```

### 1.3 Generics e Collections

```java
package br.gov.ba.justina.util;

import java.util.*;

/**
 * Demonstração de Generics (Tipos Genéricos)
 * 
 * Generics permitem criar classes/métodos que trabalham com qualquer tipo
 * sem perder a segurança de tipos em tempo de compilação
 */
public class CacheGenerico<K, V> {
    
    // Map genérico: K = tipo da chave, V = tipo do valor
    private Map<K, V> cache = new HashMap<>();
    private int tamanhoMaximo;
    
    public CacheGenerico(int tamanhoMaximo) {
        this.tamanhoMaximo = tamanhoMaximo;
    }
    
    /**
     * Adiciona item ao cache
     */
    public void adicionar(K chave, V valor) {
        if (cache.size() >= tamanhoMaximo) {
            // Remove item mais antigo (implementação simplificada)
            K primeiraChave = cache.keySet().iterator().next();
            cache.remove(primeiraChave);
        }
        cache.put(chave, valor);
    }
    
    /**
     * Busca item no cache
     */
    public Optional<V> buscar(K chave) {
        V valor = cache.get(chave);
        return Optional.ofNullable(valor);
    }
    
    /**
     * Remove item do cache
     */
    public void remover(K chave) {
        cache.remove(chave);
    }
    
    /**
     * Verifica se chave existe
     */
    public boolean contem(K chave) {
        return cache.containsKey(chave);
    }
    
    /**
     * Retorna tamanho atual do cache
     */
    public int tamanho() {
        return cache.size();
    }
}

/**
 * Exemplo de uso do Cache Genérico
 */
public class ExemploCollections {
    
    public static void main(String[] args) {
        
        // Cache de String para String
        CacheGenerico<String, String> cacheRespostas = new CacheGenerico<>(100);
        cacheRespostas.adicionar("user123", "Olá! Como posso ajudar?");
        
        Optional<String> resposta = cacheRespostas.buscar("user123");
        resposta.ifPresent(r -> System.out.println("Resposta: " + r));
        
        // Cache de Long para Objeto
        CacheGenerico<Long, Conversation> cacheConversas = new CacheGenerico<>(50);
        Conversation conv = new Conversation("user@c.us", "João", "default");
        cacheConversas.adicionar(1L, conv);
        
        // ===== COLEÇÕES JAVA =====
        
        // 1. List (Lista ordenada, permite duplicatas)
        List<String> mensagens = new ArrayList<>();
        mensagens.add("Primeira mensagem");
        mensagens.add("Segunda mensagem");
        mensagens.add("Primeira mensagem"); // Permite duplicata
        
        System.out.println("Total de mensagens: " + mensagens.size());
        System.out.println("Primeira: " + mensagens.get(0));
        
        // Iterar com for-each
        for (String msg : mensagens) {
            System.out.println(msg);
        }
        
        // Iterar com forEach e lambda (Java 8+)
        mensagens.forEach(msg -> System.out.println(msg));
        
        // 2. Set (Conjunto sem ordem, NÃO permite duplicatas)
        Set<String> usuariosUnicos = new HashSet<>();
        usuariosUnicos.add("user1@c.us");
        usuariosUnicos.add("user2@c.us");
        usuariosUnicos.add("user1@c.us"); // Ignorado (duplicata)
        
        System.out.println("Usuários únicos: " + usuariosUnicos.size()); // 2
        
        // 3. Map (Mapa chave-valor)
        Map<String, Integer> contagemMensagens = new HashMap<>();
        contagemMensagens.put("user1@c.us", 10);
        contagemMensagens.put("user2@c.us", 5);
        
        // Buscar valor
        Integer count = contagemMensagens.get("user1@c.us");
        System.out.println("User1 enviou " + count + " mensagens");
        
        // Iterar sobre Map
        for (Map.Entry<String, Integer> entry : contagemMensagens.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // 4. Queue (Fila - FIFO)
        Queue<String> filaMensagens = new LinkedList<>();
        filaMensagens.offer("Msg 1"); // Adiciona ao final
        filaMensagens.offer("Msg 2");
        filaMensagens.offer("Msg 3");
        
        String primeira = filaMensagens.poll(); // Remove e retorna primeira
        System.out.println("Processando: " + primeira); // Msg 1
        
        // 5. Stack (Pilha - LIFO)
        Stack<String> historico = new Stack<>();
        historico.push("Página 1");
        historico.push("Página 2");
        historico.push("Página 3");
        
        String ultima = historico.pop(); // Remove e retorna última
        System.out.println("Voltando para: " + ultima); // Página 3
    }
}

/**
 * Stream API (Java 8+) - Operações funcionais em coleções
 */
public class ExemploStreams {
    
    public static void main(String[] args) {
        
        List<Message> mensagens = Arrays.asList(
            createMessage("user1", "Olá"),
            createMessage("user2", "Oi"),
            createMessage("user1", "Como está?"),
            createMessage("user3", "Tudo bem")
        );
        
        // Filtrar mensagens de um usuário específico
        List<Message> mensagensUser1 = mensagens.stream()
            .filter(m -> m.getUserId().equals("user1"))
            .collect(Collectors.toList());
        
        System.out.println("User1 enviou " + mensagensUser1.size() + " mensagens");
        
        // Mapear para extrair apenas o conteúdo
        List<String> conteudos = mensagens.stream()
            .map(Message::getContent)
            .collect(Collectors.toList());
        
        // Contar mensagens por usuário
        Map<String, Long> contagemPorUsuario = mensagens.stream()
            .collect(Collectors.groupingBy(
                Message::getUserId,
                Collectors.counting()
            ));
        
        contagemPorUsuario.forEach((userId, count) -> 
            System.out.println(userId + ": " + count)
        );
        
        // Verificar se alguma mensagem contém palavra
        boolean temOla = mensagens.stream()
            .anyMatch(m -> m.getContent().contains("Olá"));
        
        System.out.println("Tem 'Olá'? " + temOla);
        
        // Ordenar mensagens por timestamp
        List<Message> ordenadas = mensagens.stream()
            .sorted(Comparator.comparing(Message::getTimestamp))
            .collect(Collectors.toList());
    }
    
    private static Message createMessage(String userId, String content) {
        Message msg = new Message();
        msg.setUserId(userId);
        msg.setContent(content);
        msg.setTimestamp(LocalDateTime.now());
        return msg;
    }
}
```

---

## 2. Hibernate e JPA - Mapeamento Objeto-Relacional

### 2.1 Anotações JPA Explicadas

```java
package br.gov.ba.justina.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Exemplo completo de entidade JPA com todas as anotações explicadas
 * 
 * JPA (Java Persistence API): especificação para ORM (Object-Relational Mapping)
 * Hibernate: implementação mais popular do JPA
 */

// @Entity: Marca a classe como uma entidade JPA (será mapeada para tabela)
@Entity

// @Table: Define nome e características da tabela no banco
@Table(
    name = "TB_CONVERSATION",              // Nome da tabela
    schema = "JUSTINA_USER",               // Schema do Oracle (opcional)
    indexes = {                             // Índices para performance
        @Index(name = "IDX_USER_ID", columnList = "USER_ID"),
        @Index(name = "IDX_SESSION", columnList = "SESSION_ID")
    },
    uniqueConstraints = {                   // Constraints de unicidade
        @UniqueConstraint(
            name = "UK_USER_SESSION", 
            columnNames = {"USER_ID", "SESSION_ID"}
        )
    }
)

// @NamedQueries: Define queries JPQL pré-compiladas (opcional mas recomendado)
@NamedQueries({
    @NamedQuery(
        name = "Conversation.findByUserId",
        query = "SELECT c FROM Conversation c WHERE c.userId = :userId"
    ),
    @NamedQuery(
        name = "Conversation.findActive",
        query = "SELECT c FROM Conversation c WHERE c.updatedAt >= :since"
    )
})

// @EntityListeners: Registra listeners para eventos do ciclo de vida
@EntityListeners(AuditingEntityListener.class)
public class Conversation {
    
    // ========== CHAVE PRIMÁRIA ==========
    
    /**
     * @Id: Marca o campo como chave primária
     * @GeneratedValue: Define estratégia de geração automática do ID
     * 
     * Estratégias:
     * - IDENTITY: Auto-increment do banco (não funciona bem com Oracle)
     * - SEQUENCE: Usa sequence do banco (RECOMENDADO para Oracle)
     * - TABLE: Usa tabela auxiliar para gerar IDs
     * - AUTO: JPA escolhe a melhor estratégia
     */
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,  // Usa SEQUENCE do Oracle
        generator = "seq_conversation"       // Referência ao @SequenceGenerator
    )
    @SequenceGenerator(
        name = "seq_conversation",           // Nome do gerador (referenciado acima)
        sequenceName = "SEQ_CONVERSATION",   // Nome da sequence no Oracle
        allocationSize = 1,                  // Incremento (usar 1 evita problemas)
        initialValue = 1                     // Valor inicial
    )
    @Column(name = "ID_CONVERSATION", nullable = false)
    private Long id;
    
    // ========== CAMPOS SIMPLES ==========
    
    /**
     * @Column: Define mapeamento para coluna do banco
     */
    @Column(
        name = "USER_ID",                    // Nome da coluna no banco
        nullable = false,                    // NOT NULL
        unique = true,                       // UNIQUE constraint
        length = 100,                        // VARCHAR(100)
        updatable = true,                    // Permite UPDATE (padrão = true)
        insertable = true                    // Permite INSERT (padrão = true)
    )
    private String userId;
    
    @Column(name = "SESSION_ID", length = 50)
    private String sessionId;
    
    @Column(name = "USER_NAME", length = 200)
    private String userName;
    
    // ========== CAMPOS TEMPORAIS ==========
    
    /**
     * Para LocalDateTime, LocalDate, LocalTime não precisa @Temporal
     * Apenas para java.util.Date / java.util.Calendar
     */
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
    
    // ========== RELACIONAMENTOS ==========
    
    /**
     * @OneToMany: Um-para-Muitos (uma conversa tem várias mensagens)
     * 
     * Parâmetros importantes:
     * - mappedBy: Campo na entidade filha que mapeia o relacionamento
     * - cascade: Operações que se propagam (ALL, PERSIST, MERGE, REMOVE)
     * - fetch: EAGER (carrega junto) ou LAZY (carrega sob demanda)
     * - orphanRemoval: Remove filhos órfãos automaticamente
     */
    @OneToMany(
        mappedBy = "conversation",           // Campo em Message que mapeia este relacionamento
        cascade = CascadeType.ALL,           // Propaga todas as operações
        fetch = FetchType.LAZY,              // Carrega mensagens apenas quando acessadas
        orphanRemoval = true                 // Remove mensagens órfãs
    )
    @OrderBy("timestamp DESC")               // Ordena mensagens por timestamp
    private List<Message> messages = new ArrayList<>();
    
    // ========== CAMPOS CALCULADOS ==========
    
    /**
     * @Transient: Campo não é persistido no banco
     * Útil para campos calculados ou temporários
     */
    @Transient
    private int totalMessages;
    
    /**
     * @Formula: Define SQL para calcular valor (somente leitura)
     */
    @Formula("(SELECT COUNT(*) FROM TB_MESSAGE m WHERE m.ID_CONVERSATION = ID_CONVERSATION)")
    private int messageCount;
    
    // ========== ENUMS ==========
    
    /**
     * @Enumerated: Define como enum é armazenado
     * - STRING: Armazena o nome do enum (RECOMENDADO)
     * - ORDINAL: Armazena o índice numérico (NÃO RECOMENDADO)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", length = 20)
    private ConversationStatus status;
    
    // ========== CALLBACKS DO CICLO DE VIDA ==========
    
    /**
     * @PrePersist: Executado antes de INSERT
     */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        
        if (status == null) {
            status = ConversationStatus.ACTIVE;
        }
    }
    
    /**
     * @PreUpdate: Executado antes de UPDATE
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * @PostLoad: Executado após carregar do banco
     */
    @PostLoad
    protected void afterLoad() {
        // Calcular campos transientes
        totalMessages = messages != null ? messages.size() : 0;
    }
    
    /**
     * @PreRemove: Executado antes de DELETE
     */
    @PreRemove
    protected void beforeRemove() {
        // Lógica antes de deletar (ex: limpar referências)
        messages.clear();
    }
    
    // ========== CONSTRUTORES ==========
    
    /**
     * Construtor padrão (obrigatório para JPA)
     */
    public Conversation() {
    }
    
    /**
     * Construtor com parâmetros (facilita criação)
     */
    public Conversation(String userId, String userName, String sessionId) {
        this.userId = userId;
        this.userName = userName;
        this.sessionId = sessionId;
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
    /**
     * Método helper para adicionar mensagem
     * Mantém consistência bidirecional
     */
    public void addMessage(Message message) {
        messages.add(message);
        message.setConversation(this);  // Sincroniza relacionamento
    }
    
    /**
     * Método helper para remover mensagem
     */
    public void removeMessage(Message message) {
        messages.remove(message);
        message.setConversation(null);
    }
    
    // ========== GETTERS E SETTERS ==========
    // (omitidos para brevidade)
    
    // ========== EQUALS E HASHCODE ==========
    
    /**
     * Implementação correta para entidades JPA
     * Baseado em ID de negócio (userId) ao invés do ID técnico
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Conversation)) return false;
        
        Conversation that = (Conversation) o;
        
        // Compara por userId (chave de negócio)
        return userId != null && userId.equals(that.userId);
    }
    
    @Override
    public int hashCode() {
        // Baseado em userId (constante durante toda a vida do objeto)
        return userId != null ? userId.hashCode() : 0;
    }
}

/**
 * Enum para status da conversa
 */
enum ConversationStatus {
    ACTIVE,
    ARCHIVED,
    BLOCKED
}
```

### 2.2 Relacionamento Bidirecional Completo

```java
package br.gov.ba.justina.model.entity;

/**
 * Lado "muitos" do relacionamento Um-para-Muitos
 */
@Entity
@Table(name = "TB_MESSAGE")
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_message")
    @SequenceGenerator(name = "seq_message", sequenceName = "SEQ_MESSAGE", allocationSize = 1)
    @Column(name = "ID_MESSAGE")
    private Long id;
    
    /**
     * @ManyToOne: Muitos-para-Um (muitas mensagens pertencem a uma conversa)
     * 
     * Lado proprietário do relacionamento (tem a FK)
     */
    @ManyToOne(
        fetch = FetchType.LAZY,              // Carrega conversa apenas quando necessário
        optional = false                     // Mensagem DEVE ter uma conversa (NOT NULL)
    )
    @JoinColumn(
        name = "ID_CONVERSATION",            // Nome da coluna FK no banco
        nullable = false,                    // FK não pode ser nula
        foreignKey = @ForeignKey(            // Define nome da constraint FK
            name = "FK_MSG_CONV"
        )
    )
    private Conversation conversation;
    
    @Column(name = "MESSAGE_ID_EXTERNAL", length = 255)
    private String messageIdExternal;
    
    /**
     * Enum para direção da mensagem
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "DIRECTION", nullable = false, length = 20)
    private MessageDirection direction;
    
    /**
     * @Lob: Large Object - para textos grandes
     * No Oracle, mapeia para CLOB
     */
    @Lob
    @Column(name = "CONTENT", columnDefinition = "CLOB")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "MESSAGE_TYPE", length = 50)
    private MessageType messageType;
    
    @Column(name = "MEDIA_URL", length = 500)
    private String mediaUrl;
    
    @Column(name = "TIMESTAMP", nullable = false)
    private LocalDateTime timestamp;
    
    /**
     * Boolean no Oracle pode ser:
     * - NUMBER(1) com @Column(columnDefinition = "NUMBER(1)")
     * - CHAR(1) com converter Y/N
     */
    @Column(name = "PROCESSED", columnDefinition = "NUMBER(1) DEFAULT 0")
    private Boolean processed = false;
    
    // Construtores, getters, setters...
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}

/**
 * Enums para Message
 */
enum MessageDirection {
    INCOMING,    // Mensagem recebida do usuário
    OUTGOING     // Resposta enviada pela IA
}

enum MessageType {
    TEXT,
    AUDIO,
    IMAGE,
    VIDEO,
    DOCUMENT
}
```

---

## 3. Repository Pattern com Spring Data JPA

### 3.1 Repository Básico

```java
package br.gov.ba.justina.repository;

import br.gov.ba.justina.model.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository usando Spring Data JPA
 * 
 * JpaRepository<T, ID>:
 * - T: Tipo da entidade (Conversation)
 * - ID: Tipo da chave primária (Long)
 * 
 * Herda métodos CRUD prontos:
 * - save(entity): INSERT ou UPDATE
 * - findById(id): SELECT por ID
 * - findAll(): SELECT *
 * - deleteById(id): DELETE
 * - count(): COUNT(*)
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    // ========== QUERY METHODS ==========
    
    /**
     * Métodos com nomenclatura específica são traduzidos automaticamente para SQL
     * 
     * Palavras-chave:
     * - find...By: SELECT
     * - count...By: COUNT
     * - delete...By: DELETE
     * - exists...By: EXISTS
     * 
     * Operadores:
     * - Equals: findByUserId → WHERE user_id = ?
     * - And: findByUserIdAndSessionId → WHERE user_id = ? AND session_id = ?
     * - Or: findByUserIdOrUserName → WHERE user_id = ? OR user_name = ?
     * - Like: findByUserNameLike → WHERE user_name LIKE ?
     * - Contains: findByUserNameContaining → WHERE user_name LIKE %?%
     * - StartsWith: findByUserNameStartingWith → WHERE user_name LIKE ?%
     * - GreaterThan: findByCreatedAtGreaterThan → WHERE created_at > ?
     * - LessThan: findByCreatedAtLessThan → WHERE created_at < ?
     * - Between: findByCreatedAtBetween → WHERE created_at BETWEEN ? AND ?
     * - IsNull: findByUserNameIsNull → WHERE user_name IS NULL
     * - OrderBy: ...OrderByCreatedAtDesc → ORDER BY created_at DESC
     */
    
    // SELECT * FROM TB_CONVERSATION WHERE USER_ID = ?
    Optional<Conversation> findByUserId(String userId);
    
    // SELECT * FROM TB_CONVERSATION WHERE USER_ID = ? AND SESSION_ID = ?
    Optional<Conversation> findByUserIdAndSessionId(String userId, String sessionId);
    
    // SELECT * FROM TB_CONVERSATION WHERE USER_NAME LIKE %?%
    List<Conversation> findByUserNameContaining(String userName);
    
    // SELECT * FROM TB_CONVERSATION WHERE CREATED_AT > ? ORDER BY CREATED_AT DESC
    List<Conversation> findByCreatedAtGreaterThanOrderByCreatedAtDesc(LocalDateTime since);
    
    // SELECT * FROM TB_CONVERSATION WHERE UPDATED_AT BETWEEN ? AND ?
    List<Conversation> findByUpdatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // SELECT COUNT(*) FROM TB_CONVERSATION WHERE USER_ID = ?
    long countByUserId(String userId);
    
    // SELECT EXISTS(SELECT 1 FROM TB_CONVERSATION WHERE USER_ID = ?)
    boolean existsByUserId(String userId);
    
    // DELETE FROM TB_CONVERSATION WHERE SESSION_ID = ?
    void deleteBySessionId(String sessionId);
    
    // ========== JPQL QUERIES ==========
    
    /**
     * JPQL (Java Persistence Query Language): SQL orientado a objetos
     * 
     * Diferenças do SQL:
     * - SELECT usa nome da ENTIDADE (Conversation) não da tabela (TB_CONVERSATION)
     * - Campos usam nomes dos ATRIBUTOS (userId) não colunas (USER_ID)
     * - Suporta navegação por relacionamentos (c.messages.size)
     */
    
    @Query("SELECT c FROM Conversation c WHERE c.userId = :userId")
    Optional<Conversation> buscarPorUserId(@Param("userId") String userId);
    
    /**
     * JOIN com relacionamentos
     */
    @Query("SELECT c FROM Conversation c " +
           "LEFT JOIN FETCH c.messages m " +  // FETCH evita N+1 queries
           "WHERE c.userId = :userId")
    Optional<Conversation> buscarComMensagens(@Param("userId") String userId);
    
    /**
     * Agregações
     */
    @Query("SELECT c.userId, COUNT(m) FROM Conversation c " +
           "LEFT JOIN c.messages m " +
           "GROUP BY c.userId " +
           "HAVING COUNT(m) > :minMessages")
    List<Object[]> buscarUsuariosAtivos(@Param("minMessages") long minMessages);
    
    /**
     * Subquery
     */
    @Query("SELECT c FROM Conversation c " +
           "WHERE c.id IN (" +
           "  SELECT m.conversation.id FROM Message m " +
           "  WHERE m.timestamp > :since" +
           ")")
    List<Conversation> buscarComMensagensRecentes(@Param("since") LocalDateTime since);
    
    // ========== NATIVE QUERIES (SQL PURO) ==========
    
    /**
     * @Query nativo: SQL específico do banco (Oracle)
     * 
     * Use quando:
     * - Precisa de recursos específicos do Oracle
     * - Query JPQL fica muito complexa
     * - Performance é crítica
     * 
     * Desvantagem: perde portabilidade entre bancos
     */
    
    @Query(
        value = "SELECT * FROM TB_CONVERSATION c " +
                "WHERE c.USER_ID = :userId " +
                "AND ROWNUM <= 1",
        nativeQuery = true
    )
    Conversation buscarUmaConversa(@Param("userId") String userId);
    
    /**
     * Paginação no Oracle (antes do Oracle 12c use ROWNUM)
     */
    @Query(
        value = "SELECT * FROM (" +
                "  SELECT c.*, ROW_NUMBER() OVER (ORDER BY c.CREATED_AT DESC) as RN " +
                "  FROM TB_CONVERSATION c " +
                "  WHERE c.SESSION_ID = :sessionId" +
                ") WHERE RN BETWEEN :inicio AND :fim",
        nativeQuery = true
    )
    List<Conversation> buscarPaginado(
        @Param("sessionId") String sessionId,
        @Param("inicio") int inicio,
        @Param("fim") int fim
    );
    
    /**
     * Oracle 12c+ tem sintaxe mais simples
     */
    @Query(
        value = "SELECT * FROM TB_CONVERSATION " +
                "ORDER BY CREATED_AT DESC " +
                "OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY",
        nativeQuery = true
    )
    List<Conversation> buscarComOffset(
        @Param("offset") int offset,
        @Param("limit") int limit
    );
    
    /**
     * Função agregada do Oracle
     */
    @Query(
        value = "SELECT " +
                "  c.USER_ID, " +
                "  COUNT(*) as TOTAL, " +
                "  TO_CHAR(MAX(c.UPDATED_AT), 'DD/MM/YYYY HH24:MI:SS') as ULTIMA_ATUALIZACAO " +
                "FROM TB_CONVERSATION c " +
                "GROUP BY c.USER_ID " +
                "ORDER BY TOTAL DESC",
        nativeQuery = true
    )
    List<Object[]> estatisticasPorUsuario();
    
    // ========== MODIFYING QUERIES ==========
    
    /**
     * @Modifying: Para UPDATE/DELETE em massa
     * @Transactional: Obrigatório para queries modificadoras
     */
    
    @Modifying
    @Query("UPDATE Conversation c SET c.updatedAt = :now WHERE c.userId = :userId")
    int atualizarTimestamp(@Param("userId") String userId, @Param("now") LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM Conversation c WHERE c.updatedAt < :dataLimite")
    int deletarAntigas(@Param("dataLimite") LocalDateTime dataLimite);
}
```

### 3.2 Repository Customizado

```java
package br.gov.ba.justina.repository;

/**
 * Interface customizada para lógica mais complexa
 */
public interface ConversationRepositoryCustom {
    List<Conversation> buscarComFiltrosComplexos(FiltroConversacao filtro);
    Map<String, Long> estatisticasDetalhadas();
}

/**
 * Implementação da interface customizada
 * IMPORTANTE: Nome deve ser <NomeDoRepository>Impl
 */
@Repository
public class ConversationRepositoryImpl implements ConversationRepositoryCustom {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Override
    public List<Conversation> buscarComFiltrosComplexos(FiltroConversacao filtro) {
        
        // Criteria API: construção programática de queries
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Conversation> cq = cb.createQuery(Conversation.class);
        Root<Conversation> root = cq.from(Conversation.class);
        
        // Lista de predicados (condições WHERE)
        List<Predicate> predicates = new ArrayList<>();
        
        // Adicionar condições dinamicamente
        if (filtro.getUserId() != null) {
            predicates.add(cb.equal(root.get("userId"), filtro.getUserId()));
        }
        
        if (filtro.getUserName() != null) {
            predicates.add(cb.like(root.get("userName"), "%" + filtro.getUserName() + "%"));
        }
        
        if (filtro.getDataInicio() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filtro.getDataInicio()));
        }
        
        if (filtro.getDataFim() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filtro.getDataFim()));
        }
        
        // Aplicar predicados
        cq.where(predicates.toArray(new Predicate[0]));
        
        // Ordenação
        cq.orderBy(cb.desc(root.get("createdAt")));
        
        // Executar query
        TypedQuery<Conversation> query = entityManager.createQuery(cq);
        
        // Paginação (opcional)
        if (filtro.getLimit() > 0) {
            query.setMaxResults(filtro.getLimit());
        }
        
        return query.getResultList();
    }
    
    @Override
    public Map<String, Long> estatisticasDetalhadas() {
        
        // Query nativa complexa
        String sql = 
            "SELECT " +
            "  'total_conversas' as METRICA, " +
            "  COUNT(*) as VALOR " +
            "FROM TB_CONVERSATION " +
            "UNION ALL " +
            "SELECT " +
            "  'conversas_ativas', " +
            "  COUNT(*) " +
            "FROM TB_CONVERSATION " +
            "WHERE UPDATED_AT >= TRUNC(SYSDATE) " +
            "UNION ALL " +
            "SELECT " +
            "  'total_mensagens', " +
            "  COUNT(*) " +
            "FROM TB_MESSAGE";
        
        Query query = entityManager.createNativeQuery(sql);
        
        @SuppressWarnings("unchecked")
        List<Object[]> resultados = query.getResultList();
        
        // Converter para Map
        Map<String, Long> estatisticas = new HashMap<>();
        for (Object[] row : resultados) {
            String metrica = (String) row[0];
            Long valor = ((Number) row[1]).longValue();
            estatisticas.put(metrica, valor);
        }
        
        return estatisticas;
    }
}

/**
 * DTO para filtros
 */
@Data
public class FiltroConversacao {
    private String userId;
    private String userName;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private int limit;
}
```

---

## 4. Service Layer - Lógica de Negócio

```java
package br.gov.ba.justina.service;

import br.gov.ba.justina.model.entity.Conversation;
import br.gov.ba.justina.model.entity.Message;
import br.gov.ba.justina.repository.ConversationRepository;
import br.gov.ba.justina.repository.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service: contém a lógica de negócio
 * 
 * Princípios:
 * - Uma transação por operação de negócio
 * - Validações antes de persistir
 * - Tratamento de exceções
 * - Logging para auditoria
 */
@Service
@Slf4j  // Lombok: gera logger automaticamente
public class ConversationService {
    
    // ========== INJEÇÃO DE DEPENDÊNCIAS ==========
    
    /**
     * @Autowired: Spring injeta automaticamente
     * 
     * Melhores práticas (em ordem):
     * 1. Constructor injection (RECOMENDADO)
     * 2. Setter injection
     * 3. Field injection (mais usado mas menos testável)
     */
    
    private final ConversationRepository conversationRepo;
    private final MessageRepository messageRepo;
    
    // Constructor injection (imutável, testável)
    @Autowired
    public ConversationService(
        ConversationRepository conversationRepo,
        MessageRepository messageRepo
    ) {
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
    }
    
    // ========== MÉTODOS TRANSACIONAIS ==========
    
    /**
     * @Transactional: Garante atomicidade (tudo ou nada)
     * 
     * Atributos importantes:
     * - propagation: como transação se propaga entre métodos
     * - isolation: nível de isolamento
     * - readOnly: otimização para queries (não faz flush)
     * - rollbackFor: Exceções que causam rollback
     * - timeout: Tempo máximo em segundos
     */
    
    @Transactional  // Começa transação, faz commit no final, rollback se exceção
    public Conversation criarOuAtualizar(String userId, String userName, String sessionId) {
        
        log.info("Buscando ou criando conversa para userId: {}", userId);
        
        // Buscar conversa existente
        return conversationRepo.findByUserIdAndSessionId(userId, sessionId)
            .map(conversa -> {
                // Atualizar existente
                conversa.setUserName(userName);
                conversa.setUpdatedAt(LocalDateTime.now());
                log.debug("Conversa encontrada, atualizando: {}", conversa.getId());
                return conversationRepo.save(conversa);  // UPDATE
            })
            .orElseGet(() -> {
                // Criar nova
                Conversation novaConversa = new Conversation(userId, userName, sessionId);
                log.debug("Criando nova conversa");
                return conversationRepo.save(novaConversa);  // INSERT
            });
    }
    
    /**
     * Salvar mensagem (incoming e outgoing)
     */
    @Transactional
    public Message salvarMensagem(
        Long conversationId,
        String content,
        MessageDirection direction,
        MessageType messageType
    ) {
        
        // Validações
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Conteúdo da mensagem não pode ser vazio");
        }
        
        // Buscar conversa
        Conversation conversation = conversationRepo.findById(conversationId)
            .orElseThrow(() -> new EntityNotFoundException(
                "Conversa não encontrada: " + conversationId
            ));
        
        // Criar mensagem
        Message message = new Message();
        message.setConversation(conversation);
        message.setContent(content);
        message.setDirection(direction);
        message.setMessageType(messageType);
        message.setTimestamp(LocalDateTime.now());
        message.setProcessed(true);
        
        // Salvar
        Message saved = messageRepo.save(message);
        
        // Atualizar timestamp da conversa
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepo.save(conversation);
        
        log.info("Mensagem salva: {} para conversa: {}", saved.getId(), conversationId);
        
        return saved;
    }
    
    /**
     * Recuperar histórico de mensagens
     * readOnly = true: otimização (sem flush, sem dirty checking)
     */
    @Transactional(readOnly = true)
    public List<Message> buscarUltimas10Mensagens(String userId) {
        
        log.debug("Buscando últimas 10 mensagens para userId: {}", userId);
        
        List<Message> messages = messageRepo.findTop10ByUserIdOrderByTimestampDesc(userId);
        
        // Forçar carregamento de relacionamentos lazy
        messages.forEach(msg -> {
            // Acessar relacionamento lazy força carregamento
            msg.getConversation().getUserName();
        });
        
        return messages;
    }
    
    /**
     * Método com tratamento de exceções
     */
    @Transactional(
        rollbackFor = Exception.class,  // Rollback em qualquer exceção
        timeout = 30  // Timeout de 30 segundos
    )
    public void processarLote(List<Message> messages) {
        
        try {
            for (Message msg : messages) {
                // Processar cada mensagem
                processarMensagem(msg);
            }
            
            log.info("Lote processado com sucesso: {} mensagens", messages.size());
            
        } catch (Exception e) {
            log.error("Erro ao processar lote", e);
            // Exceção causa rollback automático
            throw new RuntimeException("Falha no processamento do lote", e);
        }
    }
    
    private void processarMensagem(Message msg) {
        // Lógica de processamento
        msg.setProcessed(true);
        messageRepo.save(msg);
    }
    
    /**
     * Exclusão em cascata
     */
    @Transactional
    public void deletarConversa(Long conversationId) {
        
        Conversation conversation = conversationRepo.findById(conversationId)
            .orElseThrow(() -> new EntityNotFoundException(
                "Conversa não encontrada: " + conversationId
            ));
        
        // Devido a cascade = ALL e orphanRemoval = true,
        // todas as mensagens serão deletadas automaticamente
        conversationRepo.delete(conversation);
        
        log.info("Conversa deletada: {}", conversationId);
    }
    
    /**
     * Operação de limpeza (delete em massa)
     */
    @Transactional
    public int limparConversasAntigas(int diasAtras) {
        
        LocalDateTime dataLimite = LocalDateTime.now().minusDays(diasAtras);
        
        log.info("Deletando conversas anteriores a: {}", dataLimite);
        
        // @Modifying query no repository
        int deletadas = conversationRepo.deletarAntigas(dataLimite);
        
        log.info("Conversas deletadas: {}", deletadas);
        
        return deletadas;
    }
}

/**
 * Exception customizada
 */
class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }
}
```

---

## 5. Configuração do Hibernate para Oracle

```java
package br.gov.ba.justina.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.Properties;

/**
 * Configuração manual do Hibernate (alternativa ao application.properties)
 */
@Configuration
@EnableTransactionManagement  // Habilita @Transactional
public class HibernateConfig {
    
    @Value("${spring.datasource.url}")
    private String dbUrl;
    
    @Value("${spring.datasource.username}")
    private String dbUsername;
    
    @Value("${spring.datasource.password}")
    private String dbPassword;
    
    /**
     * DataSource: pool de conexões
     * HikariCP: pool mais rápido e eficiente
     */
    @Bean
    public DataSource dataSource() {
        
        HikariConfig config = new HikariConfig();
        
        // Configurações básicas
        config.setJdbcUrl(dbUrl);
        config.setUsername(dbUsername);
        config.setPassword(dbPassword);
        config.setDriverClassName("oracle.jdbc.OracleDriver");
        
        // Pool settings
        config.setMaximumPoolSize(20);        // Máximo de conexões
        config.setMinimumIdle(5);             // Mínimo de conexões idle
        config.setConnectionTimeout(30000);    // Timeout para obter conexão (30s)
        config.setIdleTimeout(600000);         // Tempo máximo idle (10min)
        config.setMaxLifetime(1800000);        // Vida máxima da conexão (30min)
        
        // Validação de conexão
        config.setConnectionTestQuery("SELECT 1 FROM DUAL");
        
        // Oracle specific
        config.addDataSourceProperty("oracle.jdbc.timezoneAsRegion", "false");
        
        return new HikariDataSource(config);
    }
    
    /**
     * EntityManagerFactory: fábrica de EntityManagers
     */
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("br.gov.ba.justina.model.entity");  // Pacote das entidades
        
        // Hibernate como provider JPA
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        
        // Propriedades do Hibernate
        em.setJpaProperties(hibernateProperties());
        
        return em;
    }
    
    /**
     * Propriedades específicas do Hibernate
     */
    private Properties hibernateProperties() {
        
        Properties props = new Properties();
        
        // ===== DIALETO =====
        // Define SQL específico do Oracle
        props.put("hibernate.dialect", "org.hibernate.dialect.Oracle12cDialect");
        
        // ===== DDL =====
        // - validate: apenas valida schema
        // - update: atualiza schema automaticamente
        // - create: recria schema a cada inicialização
        // - create-drop: cria e dropa ao final
        props.put("hibernate.hbm2ddl.auto", "validate");  // Produção: validate ou none
        
        // ===== LOGGING =====
        props.put("hibernate.show_sql", "false");         // Mostrar SQL no console
        props.put("hibernate.format_sql", "true");        // Formatar SQL
        props.put("hibernate.use_sql_comments", "true");  // Comentários no SQL
        
        // ===== BATCH =====
        props.put("hibernate.jdbc.batch_size", "20");              // Tamanho do batch
        props.put("hibernate.order_inserts", "true");              // Ordenar INSERTs
        props.put("hibernate.order_updates", "true");              // Ordenar UPDATEs
        props.put("hibernate.jdbc.batch_versioned_data", "true");  // Batch com versioning
        
        // ===== CACHE =====
        // Second Level Cache (EhCache, Infinispan, etc)
        props.put("hibernate.cache.use_second_level_cache", "false");
        props.put("hibernate.cache.use_query_cache", "false");
        
        // ===== PERFORMANCE =====
        props.put("hibernate.jdbc.fetch_size", "50");           // Fetch size do JDBC
        props.put("hibernate.max_fetch_depth", "3");            // Profundidade de joins
        props.put("hibernate.default_batch_fetch_size", "16");  // Batch fetching
        
        // ===== ORACLE SPECIFIC =====
        props.put("hibernate.jdbc.use_get_generated_keys", "true");  // Recuperar IDs gerados
        
        // Statistics (dev/qa apenas)
        props.put("hibernate.generate_statistics", "false");
        
        return props;
    }
    
    /**
     * Transaction Manager: gerencia transações
     */
    @Bean
    public PlatformTransactionManager transactionManager(
        LocalContainerEntityManagerFactoryBean entityManagerFactory
    ) {
        JpaTransactionManager txManager = new JpaTransactionManager();
        txManager.setEntityManagerFactory(entityManagerFactory.getObject());
        return txManager;
    }
}
```

---

## 6. Tratamento de Exceções

```java
package br.gov.ba.justina.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Tratamento global de exceções
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    /**
     * Entidade não encontrada (404)
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException ex) {
        
        log.warn("Entidade não encontrada: {}", ex.getMessage());
        
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.NOT_FOUND.value());
        error.put("error", "Recurso não encontrado");
        error.put("message", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    /**
     * Argumentos inválidos (400)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        
        log.warn("Argumento inválido: {}", ex.getMessage());
        
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("error", "Requisição inválida");
        error.put("message", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    /**
     * Conflito de concorrência (409)
     */
    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLock(OptimisticLockException ex) {
        
        log.warn("Conflito de concorrência: {}", ex.getMessage());
        
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.CONFLICT.value());
        error.put("error", "Conflito de concorrência");
        error.put("message", "O recurso foi modificado por outro usuário. Tente novamente.");
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    
    /**
     * Erros de SQL/Banco (500)
     */
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<Map<String, Object>> handleSQLException(SQLException ex) {
        
        log.error("Erro de SQL: {}", ex.getMessage(), ex);
        
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        error.put("error", "Erro no banco de dados");
        error.put("message", "Erro ao processar operação no banco de dados");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
    
    /**
     * Erro genérico (500)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        
        log.error("Erro não tratado: {}", ex.getMessage(), ex);
        
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        error.put("error", "Erro interno do servidor");
        error.put("message", "Ocorreu um erro inesperado");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

---

## 7. Testes Unitários

```java
package br.gov.ba.justina.service;

import br.gov.ba.justina.model.entity.Conversation;
import br.gov.ba.justina.repository.ConversationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testes unitários com JUnit 5 e Mockito
 * 
 * @ExtendWith(MockitoExtension.class): Habilita Mockito
 * @Mock: Cria mock do repository
 * @InjectMocks: Injeta mocks no service
 */
@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {
    
    @Mock
    private ConversationRepository conversationRepo;
    
    @Mock
    private MessageRepository messageRepo;
    
    @InjectMocks
    private ConversationService service;
    
    private Conversation conversationMock;
    
    /**
     * @BeforeEach: Executado antes de cada teste
     */
    @BeforeEach
    void setUp() {
        conversationMock = new Conversation("user123@c.us", "João", "default");
        conversationMock.setId(1L);
    }
    
    /**
     * Teste: criar nova conversa
     */
    @Test
    void deveCriarNovaConversa() {
        // Arrange (preparar)
        when(conversationRepo.findByUserIdAndSessionId(anyString(), anyString()))
            .thenReturn(Optional.empty());
        
        when(conversationRepo.save(any(Conversation.class)))
            .thenReturn(conversationMock);
        
        // Act (agir)
        Conversation result = service.criarOuAtualizar("user123@c.us", "João", "default");
        
        // Assert (verificar)
        assertNotNull(result);
        assertEquals("João", result.getUserName());
        
        // Verificar que save foi chamado
        verify(conversationRepo, times(1)).save(any(Conversation.class));
    }
    
    /**
     * Teste: atualizar conversa existente
     */
    @Test
    void deveAtualizarConversaExistente() {
        // Arrange
        when(conversationRepo.findByUserIdAndSessionId(anyString(), anyString()))
            .thenReturn(Optional.of(conversationMock));
        
        when(conversationRepo.save(any(Conversation.class)))
            .thenReturn(conversationMock);
        
        // Act
        Conversation result = service.criarOuAtualizar("user123@c.us", "João Silva", "default");
        
        // Assert
        assertNotNull(result);
        verify(conversationRepo, times(1)).save(any(Conversation.class));
    }
    
    /**
     * Teste: lançar exceção
     */
    @Test
    void deveLancarExcecaoQuandoMensagemVazia() {
        // Assert que exceção será lançada
        assertThrows(IllegalArgumentException.class, () -> {
            service.salvarMensagem(1L, "", MessageDirection.INCOMING, MessageType.TEXT);
        });
    }
}
```

---

**Este documento cobre os principais conceitos de Java, Hibernate e Oracle aplicados ao projeto Justina AI.**

**Próximos estudos recomendados:**
1. Java Streams API
2. Spring Security
3. JSF (JavaServer Faces) para UI
4. Testes de Integração
5. Performance Tuning no Oracle
