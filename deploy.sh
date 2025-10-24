#!/bin/bash

# ================================================
# Script de Deploy - Justina AI Portal
# Desenvolvedor: Rafael Brito - Equipe Bit Bashing
# ================================================

echo "🚀 Iniciando deploy do Justina AI Portal..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar se está na pasta correta
print_step "Verificando estrutura de pastas..."
if [ ! -d "site" ]; then
    print_error "Pasta 'site' não encontrada!"
    print_warning "Execute este script da pasta 'outputs/'"
    exit 1
fi
print_success "Estrutura de pastas OK"

# Verificar arquivos necessários
print_step "Verificando arquivos..."
required_files=(
    "site/index.html"
    "site/styles.css"
    "site/script.js"
    "Migracao_Justina_N8N_para_Java.md"
    "Diagramas_Arquitetura_Justina.md"
    "Exemplos_Praticos_Java_Hibernate.md"
    "Analise_Tecnica_Stack_Justina.md"
    "Comparacao_Codigo_3_Linguagens.md"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_error "Arquivos faltando:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi
print_success "Todos os arquivos encontrados"

# Menu de deploy
echo ""
echo "======================================"
echo "   OPÇÕES DE DEPLOY"
echo "======================================"
echo "1) Testar localmente (Python HTTP Server)"
echo "2) Criar pacote ZIP para download"
echo "3) Deploy para GitHub Pages (requer git)"
echo "4) Deploy para Netlify (requer netlify-cli)"
echo "5) Apenas validar arquivos"
echo "0) Sair"
echo ""

read -p "Escolha uma opção: " option

case $option in
    1)
        print_step "Iniciando servidor local..."
        echo ""
        print_success "Servidor iniciado em: http://localhost:8080/site/"
        print_warning "Pressione Ctrl+C para parar"
        echo ""
        python3 -m http.server 8080
        ;;
    
    2)
        print_step "Criando pacote ZIP..."
        
        # Criar diretório temporário
        temp_dir="justina-ai-portal"
        mkdir -p "$temp_dir"
        
        # Copiar arquivos
        cp -r site "$temp_dir/"
        cp *.md "$temp_dir/" 2>/dev/null
        
        # Criar README no pacote
        cat > "$temp_dir/LEIA-ME.txt" << EOF
====================================
JUSTINA AI - PORTAL DE DOCUMENTAÇÃO
====================================

Desenvolvido por: Rafael Brito
Equipe: Bit Bashing
Data: $(date +"%d/%m/%Y")

COMO USAR:
1. Extraia este ZIP
2. Abra a pasta 'site'
3. Dê duplo clique em 'index.html'

OU use um servidor web:
   python3 -m http.server 8080
   
Acesse: http://localhost:8080/site/

====================================
EOF
        
        # Criar ZIP
        zip_name="justina-ai-portal-$(date +%Y%m%d).zip"
        zip -r "$zip_name" "$temp_dir" > /dev/null
        
        # Limpar
        rm -rf "$temp_dir"
        
        print_success "Pacote criado: $zip_name"
        print_warning "Tamanho: $(du -h $zip_name | cut -f1)"
        ;;
    
    3)
        print_step "Preparando deploy para GitHub Pages..."
        
        if ! command -v git &> /dev/null; then
            print_error "Git não instalado!"
            exit 1
        fi
        
        # Verificar se já é repositório git
        if [ ! -d ".git" ]; then
            print_warning "Não é um repositório Git. Inicializando..."
            git init
            print_success "Repositório Git criado"
        fi
        
        # Instruções
        echo ""
        echo "======================================"
        echo "PRÓXIMOS PASSOS:"
        echo "======================================"
        echo "1. Crie um repositório no GitHub"
        echo "2. Execute os comandos:"
        echo ""
        echo "   git add ."
        echo "   git commit -m 'Deploy Justina AI Portal'"
        echo "   git branch -M main"
        echo "   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git"
        echo "   git push -u origin main"
        echo ""
        echo "3. No GitHub:"
        echo "   - Vá em Settings > Pages"
        echo "   - Source: Deploy from branch"
        echo "   - Branch: main"
        echo "   - Folder: /outputs/site"
        echo "   - Save"
        echo ""
        echo "Seu site estará em:"
        echo "https://SEU-USUARIO.github.io/SEU-REPO/"
        echo "======================================"
        ;;
    
    4)
        print_step "Preparando deploy para Netlify..."
        
        if ! command -v netlify &> /dev/null; then
            print_error "Netlify CLI não instalado!"
            echo ""
            echo "Instale com: npm install -g netlify-cli"
            echo "Ou acesse: https://app.netlify.com/drop"
            echo "E arraste a pasta 'outputs' para fazer upload"
            exit 1
        fi
        
        print_step "Fazendo deploy para Netlify..."
        netlify deploy --dir=. --prod
        ;;
    
    5)
        print_step "Validando arquivos..."
        
        # Verificar tamanho dos arquivos
        echo ""
        echo "Tamanhos dos arquivos:"
        echo "======================"
        du -h site/index.html | awk '{print "index.html:  " $1}'
        du -h site/styles.css | awk '{print "styles.css:  " $1}'
        du -h site/script.js | awk '{print "script.js:   " $1}'
        
        total_site=$(du -sh site | cut -f1)
        total_docs=$(du -sh *.md 2>/dev/null | awk '{s+=$1}END{print s}')
        
        echo ""
        echo "Total site/: $total_site"
        echo "Total docs:  ${total_docs}M"
        
        # Verificar links no HTML
        print_step "Verificando links no HTML..."
        if command -v grep &> /dev/null; then
            broken_links=0
            
            # Verificar se CSS existe
            if ! grep -q "styles.css" site/index.html; then
                print_warning "Link para styles.css não encontrado"
                broken_links=$((broken_links + 1))
            fi
            
            # Verificar se JS existe
            if ! grep -q "script.js" site/index.html; then
                print_warning "Link para script.js não encontrado"
                broken_links=$((broken_links + 1))
            fi
            
            if [ $broken_links -eq 0 ]; then
                print_success "Todos os links estão OK"
            else
                print_warning "Encontrados $broken_links links quebrados"
            fi
        fi
        
        print_success "Validação concluída!"
        ;;
    
    0)
        echo "Saindo..."
        exit 0
        ;;
    
    *)
        print_error "Opção inválida!"
        exit 1
        ;;
esac

echo ""
print_success "Deploy concluído! 🎉"
echo ""
echo "Desenvolvido por Rafael Brito - Equipe Bit Bashing"
echo ""
