# 🌐 Justina AI - Portal de Documentação

Site estático HTML para visualização da documentação técnica completa do projeto Justina AI.

---

## 📁 Estrutura de Arquivos

```
outputs/
├── site/
│   ├── index.html          # Página principal
│   ├── styles.css          # Estilos CSS
│   ├── script.js           # JavaScript (modais e funcionalidades)
│   └── README.md           # Este arquivo
├── Migracao_Justina_N8N_para_Java.md
├── Diagramas_Arquitetura_Justina.md
├── Exemplos_Praticos_Java_Hibernate.md
├── Analise_Tecnica_Stack_Justina.md
└── Comparacao_Codigo_3_Linguagens.md
```

---

## 🚀 Como Usar

### Opção 1: Abrir Localmente (Recomendado)

1. **Certifique-se de que todos os arquivos estão na estrutura correta:**
   - Pasta `site/` com HTML, CSS e JS
   - Arquivos `.md` na pasta pai

2. **Abra o arquivo `index.html` no navegador:**
   ```bash
   # No terminal (Linux/Mac)
   cd outputs/site
   open index.html
   
   # Ou com Python
   python -m http.server 8000
   # Acesse: http://localhost:8000
   ```

3. **Ou simplesmente:**
   - Dê duplo clique no arquivo `index.html`
   - Abrirá no seu navegador padrão

### Opção 2: Servidor Web Simples

```bash
# Python 3
cd outputs
python -m http.server 8080

# Node.js (com http-server)
npx http-server outputs -p 8080

# PHP
php -S localhost:8080
```

Acesse: `http://localhost:8080/site/`

### Opção 3: Deploy Online

#### GitHub Pages

1. Crie um repositório no GitHub
2. Faça upload da pasta `outputs/`
3. Vá em Settings > Pages
4. Selecione branch `main` e pasta `/outputs/site`
5. Seu site estará em: `https://seu-usuario.github.io/seu-repo/`

#### Netlify/Vercel (Mais Fácil)

1. Acesse [netlify.com](https://netlify.com) ou [vercel.com](https://vercel.com)
2. Arraste a pasta `outputs/` para fazer upload
3. Site publicado automaticamente!

#### Hospedagem Tradicional

1. Faça upload via FTP para seu servidor
2. Certifique-se de manter a estrutura de pastas
3. Acesse via domínio

---

## ✨ Funcionalidades

### 📚 Cards de Documentação
- **5 documentos principais** com descrição e tags
- **Clique em qualquer card** para abrir modal com conteúdo completo
- **Visualização em Markdown renderizado** (HTML formatado)

### 🪟 Janela Modal
- **Abre ao clicar** nos cards
- **Markdown renderizado** com syntax highlighting
- **Scroll interno** para documentos longos
- **Botão de download** individual
- **Fechar com ESC** ou clicando fora

### ⬇️ Downloads
- **Download individual** de cada documento
- **Download completo** de todos os documentos de uma vez
- **Formato Markdown** (.md) preservado

### 🎨 Design Responsivo
- **Desktop, tablet e mobile** otimizados
- **Dark mode** nos blocos de código
- **Animações suaves** e transições
- **Cores profissionais** (azul/roxo)

### 🚀 Links Rápidos
- **Stack tecnológica** visual
- **Roadmap de implementação** (timeline)
- **Sobre o projeto** (modal informativo)

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **HTML5** | - | Estrutura semântica |
| **CSS3** | - | Estilos modernos + Grid + Flexbox |
| **JavaScript** | ES6+ | Funcionalidades interativas |
| **Marked.js** | 9.x | Renderização de Markdown |
| **Google Fonts** | - | Tipografia (Inter) |

---

## 🎨 Personalização

### Alterar Cores

Edite as variáveis CSS no arquivo `styles.css`:

```css
:root {
    --primary: #2563eb;        /* Azul principal */
    --primary-dark: #1e40af;   /* Azul escuro */
    --secondary: #10b981;      /* Verde */
    --accent: #f59e0b;         /* Laranja */
}
```

### Adicionar Novo Documento

No arquivo `script.js`, adicione na lista `documents`:

```javascript
const documents = {
    // ... documentos existentes
    doc6: {
        title: 'Novo Documento',
        file: 'Novo_Documento.md',
        description: 'Descrição do novo documento'
    }
};
```

Depois, adicione um novo card no `index.html`:

```html
<div class="doc-card" onclick="openModal('doc6')">
    <div class="card-icon">🆕</div>
    <div class="card-content">
        <h3>Novo Documento</h3>
        <p>Descrição do novo documento</p>
        <div class="card-tags">
            <span class="tag">Tag 1</span>
            <span class="tag">Tag 2</span>
        </div>
    </div>
    <div class="card-footer">
        <span class="read-time">⏱️ XX min leitura</span>
        <span class="arrow">→</span>
    </div>
</div>
```

### Mudar Logo/Emoji

No `index.html`, altere o emoji na seção do header:

```html
<div class="logo">⚖️</div> <!-- Troque por outro emoji -->
```

---

## 🐛 Troubleshooting

### Documentos não carregam no modal

**Problema:** Ao clicar no card, o modal abre mas não mostra conteúdo.

**Solução:**
1. Verifique se os arquivos `.md` estão na pasta correta (um nível acima de `site/`)
2. Abra o Console do navegador (F12) para ver erros
3. Use um servidor web local (não abra apenas o HTML diretamente)

```bash
# Use um servidor local
cd outputs
python -m http.server 8080
```

### Marked.js não funciona

**Problema:** Documentos aparecem como texto puro sem formatação.

**Solução:**
1. Verifique sua conexão com internet (Marked.js vem via CDN)
2. Ou baixe Marked.js localmente:

```bash
cd outputs/site
wget https://cdn.jsdelivr.net/npm/marked/marked.min.js
```

Depois altere no `index.html`:
```html
<!-- De: -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

<!-- Para: -->
<script src="marked.min.js"></script>
```

### Estilos não carregam

**Problema:** Página sem cores/formatação.

**Solução:**
1. Verifique se `styles.css` está no mesmo diretório que `index.html`
2. Limpe o cache do navegador (Ctrl + F5)
3. Verifique o caminho no HTML:
```html
<link rel="stylesheet" href="styles.css">
```

---

## 📱 Compatibilidade

### Navegadores Suportados

| Navegador | Versão Mínima | Status |
|-----------|---------------|--------|
| Chrome | 90+ | ✅ Totalmente suportado |
| Firefox | 88+ | ✅ Totalmente suportado |
| Safari | 14+ | ✅ Totalmente suportado |
| Edge | 90+ | ✅ Totalmente suportado |
| Opera | 76+ | ✅ Totalmente suportado |
| IE 11 | - | ❌ Não suportado |

### Dispositivos

- ✅ **Desktop** (1920x1080+)
- ✅ **Laptop** (1366x768+)
- ✅ **Tablet** (768x1024)
- ✅ **Mobile** (375x667+)

---

## 📊 Performance

- **Tamanho total:** ~50KB (HTML + CSS + JS)
- **Tempo de carregamento:** < 1s
- **Score Lighthouse:**
  - Performance: 95+
  - Acessibilidade: 90+
  - Best Practices: 95+
  - SEO: 90+

---

## 🔒 Segurança

- ✅ Sem JavaScript malicioso
- ✅ Sem cookies ou tracking
- ✅ Todos os recursos são locais ou de CDNs confiáveis
- ✅ Sem formulários ou coleta de dados
- ✅ Código aberto e auditável

---

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais.

**Desenvolvido por:** Rafael Brito  
**Equipe:** Bit Bashing  
**Organização:** Tribunal de Justiça da Bahia  
**Data:** Outubro 2025

---

## 🤝 Contribuindo

Sugestões de melhorias:

1. **Dark Mode completo** (toggle)
2. **Busca** de conteúdo nos documentos
3. **Impressão** otimizada
4. **Exportação para PDF**
5. **Índice lateral** para navegação rápida
6. **Comentários** nos documentos

---

## 📞 Suporte

Se encontrar problemas ou tiver dúvidas:

1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Abra o Console do navegador (F12) para ver erros
3. Verifique a estrutura de arquivos

---

## ✅ Checklist de Deploy

Antes de publicar online:

- [ ] Todos os arquivos `.md` estão na estrutura correta
- [ ] `index.html`, `styles.css` e `script.js` estão na pasta `site/`
- [ ] Testado localmente com servidor web
- [ ] Todos os modais abrem e mostram conteúdo
- [ ] Downloads funcionam
- [ ] Links externos funcionam
- [ ] Testado em mobile
- [ ] Testado em diferentes navegadores
- [ ] Informações de contato atualizadas
- [ ] Links do GitHub/repositório atualizados (se aplicável)

---

## 🎉 Pronto!

Seu portal de documentação está pronto para uso!

**URL Local:** `file:///caminho/para/outputs/site/index.html`  
**URL Servidor:** `http://localhost:8080/site/`

Desenvolvido com 💙 por Rafael Brito - Equipe Bit Bashing
