// ===== CONFIGURAÇÃO DOS DOCUMENTOS =====
const documents = {
    doc1: {
        title: 'Guia de Migração N8N → Java',
        file: 'Migracao_Justina_N8N_para_Java.md',
        description: 'Interpretação completa do workflow n8n e implementação em Java'
    },
    doc2: {
        title: 'Diagramas de Arquitetura',
        file: 'Diagramas_Arquitetura_Justina.md',
        description: 'Visualização completa da arquitetura com diagramas'
    },
    doc3: {
        title: 'Exemplos Práticos Java/Hibernate',
        file: 'Exemplos_Praticos_Java_Hibernate.md',
        description: 'Tutorial de aprendizado com código comentado'
    },
    doc4: {
        title: 'Análise Técnica de Stack',
        file: 'Analise_Tecnica_Stack_Justina.md',
        description: 'Comparação técnica entre linguagens'
    },
    doc5: {
        title: 'Comparação Prática de Código',
        file: 'Comparacao_Codigo_3_Linguagens.md',
        description: 'Mesmo código em Java, Node.js e Python'
    },
    about: {
        title: 'Sobre o Projeto Justina AI',
        content: getAboutContent(),
        description: 'Informações sobre o projeto'
    }
};

let currentDocId = null;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Justina AI - Portal de Documentação carregado');
    
    // Configurar Marked.js para renderizar markdown
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            highlight: function(code, lang) {
                return code;
            },
            breaks: true,
            gfm: true
        });
    }
});

// ===== MODAL FUNCTIONS =====

/**
 * Abre modal e carrega documento
 */
function openModal(docId) {
    currentDocId = docId;
    const modal = document.getElementById('modalContainer');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const loading = document.getElementById('loadingSpinner');
    
    if (!documents[docId]) {
        alert('Documento não encontrado!');
        return;
    }
    
    // Mostrar modal e loading
    modal.classList.add('active');
    loading.classList.add('active');
    
    // Atualizar título
    modalTitle.textContent = documents[docId].title;
    
    // Limpar corpo
    modalBody.innerHTML = '';
    
    // Carregar conteúdo
    if (documents[docId].content) {
        // Conteúdo inline (como "sobre")
        setTimeout(() => {
            modalBody.innerHTML = documents[docId].content;
            loading.classList.remove('active');
        }, 300);
    } else {
        // Carregar arquivo markdown
        loadMarkdownFile(docId);
    }
    
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';
}

/**
 * Fecha modal
 */
function closeModal(event) {
    // Se clicar no overlay (fora do conteúdo) ou no botão fechar
    if (!event || event.target.id === 'modalContainer' || event.target.classList.contains('modal-close')) {
        const modal = document.getElementById('modalContainer');
        modal.classList.remove('active');
        currentDocId = null;
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
    }
}

/**
 * Carrega arquivo markdown e converte para HTML
 */
async function loadMarkdownFile(docId) {
    const loading = document.getElementById('loadingSpinner');
    const modalBody = document.getElementById('modalBody');
    
    try {
        const fileName = documents[docId].file;
        const response = await fetch(`../${fileName}`);
        
        if (!response.ok) {
            throw new Error(`Erro ao carregar: ${response.status}`);
        }
        
        const markdown = await response.text();
        
        // Converter markdown para HTML usando marked.js
        if (typeof marked !== 'undefined') {
            const html = marked.parse(markdown);
            modalBody.innerHTML = html;
        } else {
            // Fallback: mostrar como texto
            modalBody.innerHTML = `<pre>${markdown}</pre>`;
        }
        
        // Adicionar classes de estilo aos elementos
        styleModalContent();
        
    } catch (error) {
        console.error('Erro ao carregar documento:', error);
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2>❌ Erro ao Carregar Documento</h2>
                <p style="color: #64748b; margin-top: 16px;">
                    Não foi possível carregar o documento. Verifique se o arquivo existe.
                </p>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 8px;">
                    Arquivo: ${documents[docId].file}
                </p>
                <button onclick="closeModal()" style="margin-top: 24px; padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Fechar
                </button>
            </div>
        `;
    } finally {
        loading.classList.remove('active');
    }
}

/**
 * Adiciona classes CSS aos elementos do markdown
 */
function styleModalContent() {
    const modalBody = document.getElementById('modalBody');
    
    // Adicionar classe aos blocos de código
    modalBody.querySelectorAll('pre code').forEach((block) => {
        block.parentElement.style.whiteSpace = 'pre-wrap';
    });
    
    // Adicionar estilos às tabelas
    modalBody.querySelectorAll('table').forEach((table) => {
        table.style.width = '100%';
    });
    
    // Scroll suave para âncoras dentro do modal
    modalBody.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = modalBody.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ===== DOWNLOAD FUNCTIONS =====

/**
 * Download do documento atual
 */
function downloadCurrentDoc() {
    if (!currentDocId) return;
    
    const doc = documents[currentDocId];
    
    if (doc.content) {
        // Download de conteúdo inline
        downloadAsFile(doc.title + '.html', doc.content);
    } else {
        // Download de arquivo markdown
        downloadMarkdownFile(doc.file, doc.title);
    }
}

/**
 * Download de arquivo markdown do servidor
 */
async function downloadMarkdownFile(fileName, title) {
    try {
        const response = await fetch(`../${fileName}`);
        const content = await response.text();
        downloadAsFile(title + '.md', content);
    } catch (error) {
        alert('Erro ao baixar documento: ' + error.message);
    }
}

/**
 * Download genérico de arquivo
 */
function downloadAsFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

/**
 * Download de todos os documentos
 */
async function downloadAll() {
    const loading = document.getElementById('loadingSpinner');
    loading.classList.add('active');
    
    try {
        for (const [id, doc] of Object.entries(documents)) {
            if (doc.file) {
                await downloadMarkdownFile(doc.file, doc.title);
                // Pequeno delay entre downloads
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        alert('✅ Todos os documentos foram baixados!');
    } catch (error) {
        alert('❌ Erro ao baixar documentos: ' + error.message);
    } finally {
        loading.classList.remove('active');
    }
}

// ===== NAVIGATION FUNCTIONS =====

/**
 * Scroll suave para seção
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // ESC para fechar modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('modalContainer');
        if (modal.classList.contains('active')) {
            closeModal();
        }
    }
});

// ===== CONTENT GENERATORS =====

/**
 * Gera conteúdo HTML da página "Sobre"
 */
function getAboutContent() {
    return `
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 40px;">
                <div style="font-size: 80px; margin-bottom: 20px;">⚖️</div>
                <h1 style="font-size: 36px; margin-bottom: 16px;">Justina AI</h1>
                <p style="font-size: 18px; color: #64748b;">
                    Assistente Judicial Automatizado para Acesso à Justiça
                </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px; border-radius: 12px; margin-bottom: 32px;">
                <h2 style="font-size: 24px; margin-bottom: 16px; color: white; border: none; padding: 0;">🎯 Missão</h2>
                <p style="font-size: 16px; line-height: 1.8; color: white; opacity: 0.95;">
                    Facilitar o acesso à justiça para cidadãos baianos através de um chatbot inteligente 
                    que orienta sobre direitos, fornece informações jurídicas e promove a resolução 
                    extrajudicial de conflitos (desjudicialização).
                </p>
            </div>
            
            <h2 style="font-size: 24px; margin-top: 32px; margin-bottom: 16px;">💡 Como Funciona</h2>
            <div style="background: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
                <ol style="padding-left: 20px;">
                    <li style="margin-bottom: 12px;">
                        <strong>Usuário envia mensagem via WhatsApp</strong> para o número do Justina AI
                    </li>
                    <li style="margin-bottom: 12px;">
                        <strong>WAHA recebe</strong> a mensagem e envia via webhook para o sistema
                    </li>
                    <li style="margin-bottom: 12px;">
                        <strong>Sistema processa</strong> com IA (Gemini 2.5 Pro) considerando histórico
                    </li>
                    <li style="margin-bottom: 12px;">
                        <strong>Busca jurisprudência</strong> do TJBA e orienta sobre canais extrajudiciais
                    </li>
                    <li style="margin-bottom: 12px;">
                        <strong>Responde ao usuário</strong> com linguagem simples e acessível
                    </li>
                </ol>
            </div>
            
            <h2 style="font-size: 24px; margin-top: 32px; margin-bottom: 16px;">🛠️ Stack Tecnológica</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">☕</div>
                    <strong>Java 17</strong>
                    <div style="font-size: 14px; color: #64748b;">Spring Boot</div>
                </div>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🗄️</div>
                    <strong>Oracle DB</strong>
                    <div style="font-size: 14px; color: #64748b;">Enterprise</div>
                </div>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🤖</div>
                    <strong>Gemini 2.5 Pro</strong>
                    <div style="font-size: 14px; color: #64748b;">Google AI</div>
                </div>
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">💬</div>
                    <strong>WAHA</strong>
                    <div style="font-size: 14px; color: #64748b;">WhatsApp API</div>
                </div>
            </div>
            
            <h2 style="font-size: 24px; margin-top: 32px; margin-bottom: 16px;">📊 Arquitetura</h2>
            <div style="background: #1e293b; color: #e2e8f0; padding: 24px; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.6; overflow-x: auto;">
<pre style="margin: 0; color: #e2e8f0;">
Usuario (WhatsApp)
    ↓
WAHA API
    ↓ HTTP POST /webhook
Spring Boot (Java)
    ├─ WebhookController
    ├─ MessageService
    ├─ GeminiService (IA)
    ├─ WahaService
    └─ Repositories (JPA)
        ↓
Oracle Database
    ├─ TB_CONVERSATION
    └─ TB_MESSAGE
</pre>
            </div>
            
            <h2 style="font-size: 24px; margin-top: 32px; margin-bottom: 16px;">🎓 Projeto de Aprendizado</h2>
            <p style="line-height: 1.8; color: #64748b; margin-bottom: 16px;">
                Este projeto serve como material de estudo para migração de sistemas de automação 
                (n8n) para arquiteturas enterprise Java. A documentação cobre:
            </p>
            <ul style="padding-left: 20px; color: #64748b;">
                <li style="margin-bottom: 8px;">Fundamentos de Java e Programação Orientada a Objetos</li>
                <li style="margin-bottom: 8px;">Hibernate e mapeamento objeto-relacional</li>
                <li style="margin-bottom: 8px;">Integração com Oracle Database</li>
                <li style="margin-bottom: 8px;">APIs REST com Spring Boot</li>
                <li style="margin-bottom: 8px;">Integração com APIs externas (WAHA, Gemini)</li>
                <li style="margin-bottom: 8px;">Boas práticas de arquitetura enterprise</li>
            </ul>
            
            <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 20px; margin-top: 32px; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #1e40af;">👨‍💻 Desenvolvedor</h3>
                <p style="margin: 8px 0; color: #1e40af;">
                    <strong>Rafael Brito</strong><br>
                    Equipe Bit Bashing<br>
                    Tribunal de Justiça da Bahia
                </p>
                <div style="margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap;">
                    <a href="https://github.com/RafaTheMonk" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #1e293b; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; transition: all 0.3s;">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/rafael-brito-ba3021b4/" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #0077b5; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; transition: all 0.3s;">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        LinkedIn
                    </a>
                    <a href="https://instagram.com/rafaelbrito.dev" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white; text-decoration: none; border-radius: 6px; font-size: 14px; transition: all 0.3s;">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                    </a>
                    <a href="https://wa.me/5571988904263" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: #25D366; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; transition: all 0.3s;">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        WhatsApp
                    </a>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 32px; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 14px;">
                    Desenvolvido em Outubro de 2025 • Versão 1.0.0
                </p>
            </div>
        </div>
    `;
}

// ===== UTILS =====

/**
 * Formata data para exibição
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

/**
 * Copia texto para clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erro ao copiar:', err);
        return false;
    }
}

// ===== ANALYTICS (opcional) =====
function trackDocumentView(docId) {
    // Aqui você pode adicionar código para rastrear visualizações
    console.log('Documento visualizado:', docId);
}

// ===== EXPORT =====
// Exportar funções para uso global
window.openModal = openModal;
window.closeModal = closeModal;
window.downloadCurrentDoc = downloadCurrentDoc;
window.downloadAll = downloadAll;
window.scrollToSection = scrollToSection;

console.log('✅ Sistema carregado com sucesso!');
