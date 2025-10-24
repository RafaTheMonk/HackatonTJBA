# ⚖️ Justina AI - Portal de Documentação

![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Portal de documentação técnica completa para o projeto Justina AI - Sistema de assistente judicial automatizado via WhatsApp para o Tribunal de Justiça da Bahia.

---

## 👨‍💻 Desenvolvedor

**Rafael Brito**  
Equipe Bit Bashing  
Tribunal de Justiça da Bahia

### 📱 Contato

- **GitHub:** [@RafaTheMonk](https://github.com/RafaTheMonk)
- **LinkedIn:** [Rafael Brito](https://www.linkedin.com/in/rafael-brito-ba3021b4/)
- **Instagram:** [@rafaelbrito.dev](https://instagram.com/rafaelbrito.dev)
- **WhatsApp:** [(71) 98890-4263](https://wa.me/5571988904263)

---

## 🎯 Sobre o Projeto

O **Justina AI** é um chatbot inteligente desenvolvido para o Tribunal de Justiça da Bahia, com foco em:
- Facilitar o acesso à justiça para cidadãos baianos
- Orientar sobre direitos e procedimentos judiciais
- Promover a desjudicialização de pequenas causas
- Fornecer informações jurídicas de forma acessível

---

## 📦 Conteúdo do Portal

### 📚 Documentação Técnica (5 documentos)

1. **Guia de Migração N8N → Java**  
   Interpretação completa do workflow n8n e implementação em Java Spring Boot

2. **Diagramas de Arquitetura**  
   Visualização completa da arquitetura com diagramas e fluxogramas

3. **Exemplos Práticos Java/Hibernate**  
   Tutorial de aprendizado com código comentado e fundamentos

4. **Análise Técnica de Stack**  
   Comparação técnica entre Java, Node.js e Python

5. **Comparação Prática de Código**  
   Mesmo fluxo implementado em 3 linguagens lado a lado

### 🌐 Site Estático

- **Design moderno e responsivo** (desktop, tablet, mobile)
- **Interface profissional** com animações suaves
- **Modais interativos** para visualização de documentos
- **Sistema de download** individual ou completo
- **Navegação intuitiva** e acessível

---

## 🚀 Como Usar

### Opção 1: Visualização Local (Mais Simples)

```bash
# Simplesmente abra o arquivo no navegador
open outputs/site/index.html

# Ou dê duplo clique no arquivo
```

### Opção 2: Servidor Local (Recomendado)

```bash
# Navegue até a pasta outputs
cd outputs

# Inicie servidor Python
python3 -m http.server 8080

# Acesse no navegador
http://localhost:8080/site/
```

### Opção 3: Deploy Online

#### Netlify (Mais Fácil)
1. Acesse [netlify.com/drop](https://app.netlify.com/drop)
2. Arraste a pasta `outputs/`
3. Pronto! Site publicado automaticamente

#### GitHub Pages
```bash
# 1. Criar repositório no GitHub
# 2. Subir arquivos
git init
git add .
git commit -m "Deploy Justina AI Portal"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main

# 3. Ativar GitHub Pages nas configurações do repositório
# Settings > Pages > Source: main branch > Folder: /outputs/site
```

#### Script de Deploy Automatizado
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## ✨ Funcionalidades

- ✅ **5 documentos técnicos completos** com mais de 2.500 linhas
- ✅ **Design profissional** com gradientes e animações
- ✅ **100% responsivo** para todos dispositivos
- ✅ **Modais interativos** para visualização rápida
- ✅ **Markdown renderizado** para HTML com syntax highlighting
- ✅ **Downloads individuais** ou completos
- ✅ **Links para redes sociais** integrados
- ✅ **Cartão de visita digital** do desenvolvedor
- ✅ **Totalmente personalizável** (cores, conteúdo, layout)

---

## 🛠️ Stack Tecnológica

### Frontend
- HTML5 (semântico)
- CSS3 (Grid + Flexbox + Animations)
- JavaScript ES6+ (Vanilla)
- Marked.js (Markdown rendering)
- Google Fonts (Inter)

### Documentação
- Markdown
- Diagramas ASCII
- Blocos de código com syntax highlighting

### Backend
- Nenhum! Site 100% estático
- Funciona offline após carregamento inicial

---

## 📊 Estrutura de Arquivos

```
outputs/
├── site/                           # Portal principal
│   ├── index.html                 # Página inicial
│   ├── styles.css                 # Estilos completos
│   ├── script.js                  # Funcionalidades
│   ├── cartao.html               # Cartão de visita digital
│   ├── guia-rapido.html          # Tutorial visual
│   ├── README.md                  # Documentação
│   └── CHECKLIST.md               # Validação
├── Migracao_Justina_N8N_para_Java.md
├── Diagramas_Arquitetura_Justina.md
├── Exemplos_Praticos_Java_Hibernate.md
├── Analise_Tecnica_Stack_Justina.md
├── Comparacao_Codigo_3_Linguagens.md
├── deploy.sh                      # Script de deploy
├── index.html                     # Redirecionamento
└── LEIA-ME.txt                   # Instruções rápidas
```

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
1. Coloque arquivo `.md` na pasta `outputs/`
2. Edite `script.js` e adicione entrada em `documents`
3. Crie novo card no `index.html`
4. Teste e faça deploy

### Mudar Logo/Branding
1. Edite `index.html`
2. Procure por `<div class="logo">⚖️</div>`
3. Substitua o emoji
4. Atualize textos conforme necessário

---

## 📈 Performance

- **Tamanho total:** ~50KB (HTML + CSS + JS)
- **Tempo de carregamento:** < 1 segundo
- **Documentos Markdown:** ~2.500 linhas
- **Lighthouse Score (esperado):**
  - Performance: 95+
  - Accessibility: 90+
  - Best Practices: 95+
  - SEO: 90+

---

## 🌐 Compatibilidade

### Navegadores
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+
- ❌ Internet Explorer (não suportado)

### Dispositivos
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)

---

## 🐛 Troubleshooting

### Problema: Modais não carregam documentos
**Solução:** Use servidor local (não abra HTML direto do sistema de arquivos)
```bash
python3 -m http.server 8080
```

### Problema: Estilos não aparecem
**Solução:** Verifique se `styles.css` está no mesmo diretório que `index.html`

### Problema: JavaScript não funciona
**Solução:** Abra Console do navegador (F12) e verifique erros

---

## 📝 Roadmap Futuro (Opcional)

- [ ] Dark mode toggle
- [ ] Sistema de busca nos documentos
- [ ] Exportação para PDF
- [ ] Comentários nos documentos
- [ ] Vídeos tutoriais integrados
- [ ] Analytics (opcional)

---

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

---

## 🙏 Agradecimentos

- **Tribunal de Justiça da Bahia** - Por apoiar a inovação tecnológica
- **Equipe Bit Bashing** - Pelo trabalho colaborativo
- **Comunidade Open Source** - Pelas ferramentas utilizadas

---

## 📞 Suporte

### Dúvidas Técnicas
- Leia o [README.md](site/README.md) completo
- Consulte o [guia-rapido.html](site/guia-rapido.html)
- Verifique o Console do navegador (F12)

### Contato Direto
- **WhatsApp:** [(71) 98890-4263](https://wa.me/5571988904263)
- **LinkedIn:** [Rafael Brito](https://www.linkedin.com/in/rafael-brito-ba3021b4/)
- **GitHub:** [@RafaTheMonk](https://github.com/RafaTheMonk)

---

## 🏆 Status

```
┌─────────────────────────────────────┐
│   ✅ PROJETO COMPLETO E PRONTO!    │
│                                     │
│   5 Documentos ✓                   │
│   Site Responsivo ✓                │
│   Modais Funcionais ✓              │
│   Downloads ✓                      │
│   Redes Sociais ✓                  │
│   Cartão Digital ✓                 │
│   Deploy Ready ✓                   │
│                                     │
│   🎉 100% FUNCIONAL!               │
└─────────────────────────────────────┘
```

---

## 📸 Screenshots

### Desktop
![Portal Desktop](https://via.placeholder.com/800x450/667eea/ffffff?text=Portal+Desktop)

### Mobile
![Portal Mobile](https://via.placeholder.com/375x667/764ba2/ffffff?text=Portal+Mobile)

### Modal
![Modal Document](https://via.placeholder.com/800x600/2563eb/ffffff?text=Modal+Document)

---

## 🌟 Recursos Extras

- **[Cartão Digital](site/cartao.html)** - Cartão de visita digital do desenvolvedor
- **[Guia Rápido](site/guia-rapido.html)** - Tutorial visual para iniciantes
- **[Script de Deploy](deploy.sh)** - Automatização de deploy

---

<div align="center">

**Desenvolvido com 💙 por Rafael Brito**  
*Equipe Bit Bashing • Tribunal de Justiça da Bahia*

[![GitHub](https://img.shields.io/badge/GitHub-RafaTheMonk-181717?style=for-the-badge&logo=github)](https://github.com/RafaTheMonk)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rafael%20Brito-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/rafael-brito-ba3021b4/)
[![Instagram](https://img.shields.io/badge/Instagram-rafaelbrito.dev-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/rafaelbrito.dev)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-(71)%2098890--4263-25D366?style=for-the-badge&logo=whatsapp)](https://wa.me/5571988904263)

**⚖️ Justina AI • 2025 • Versão 1.0.0**

</div>
