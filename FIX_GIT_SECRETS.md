# Como Resolver o Problema de Secrets no Git

O GitHub detectou uma API key no histórico de commits. Aqui estão as soluções:

## Opção 1: Criar Novo Repositório (Recomendado)

Esta é a forma mais simples e segura:

```bash
# 1. Renomear o repositório atual
cd ..
mv ActiveStudy.AI ActiveStudy.AI.old

# 2. Criar novo repositório limpo
mkdir ActiveStudy.AI
cd ActiveStudy.AI

# 3. Copiar apenas os arquivos atuais (sem histórico)
cp -r ../ActiveStudy.AI.old/* .
cp ../ActiveStudy.AI.old/.gitignore .

# 4. Remover o .git antigo
rm -rf .git

# 5. Inicializar novo repositório
git init
git add .
git commit -m "v1.3.0: Initial clean commit - Quiz for YouTube

Complete extension with:
- AI-powered quiz generation
- Dual modes (OpenAI API + ChatGPT)
- Full keyboard navigation
- Comprehensive documentation
- Build system
- Bilingual support (EN/PT-BR)"

# 6. Adicionar remote e fazer push
git remote add origin <seu-repo-url>
git branch -M main
git push -u origin main --force
```

## Opção 2: Usar BFG Repo-Cleaner

Se você quer manter o histórico limpo:

```bash
# 1. Instalar BFG
# Download de: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Fazer backup
cd ..
cp -r ActiveStudy.AI ActiveStudy.AI.backup

# 3. Criar arquivo com patterns a remover
cd ActiveStudy.AI
echo "sk-*" > secrets.txt
echo "OPENAI_API_KEY=*" >> secrets.txt

# 4. Rodar BFG
java -jar bfg.jar --replace-text secrets.txt .git

# 5. Limpar e fazer push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin main --force
```

## Opção 3: Usar git-filter-repo

```bash
# 1. Instalar git-filter-repo
pip install git-filter-repo

# 2. Criar arquivo de patterns
echo "regex:sk-[a-zA-Z0-9]{48}==>" > patterns.txt
echo "regex:OPENAI_API_KEY=.*==>" >> patterns.txt

# 3. Filtrar repositório
git filter-repo --replace-text patterns.txt

# 4. Fazer push forçado
git remote add origin <seu-repo-url>
git push origin main --force
```

## Opção 4: Squash de Commits (Mais Simples)

Se você não se importa em perder o histórico:

```bash
# 1. Criar branch órfã (sem histórico)
git checkout --orphan new-main

# 2. Adicionar todos os arquivos
git add -A

# 3. Fazer commit único
git commit -m "v1.3.0: Quiz for YouTube - Clean history

Complete rewrite with:
- Extension renamed to 'Quiz for YouTube'
- Comprehensive documentation
- Build system
- Performance improvements
- Simplified JSON format"

# 4. Deletar branch antiga e renomear
git branch -D main
git branch -m main

# 5. Push forçado
git push -f origin main
```

## ⚠️ Importante Depois de Limpar

1. **Revogar a API key antiga**
   - Vá em https://platform.openai.com/api-keys
   - Delete a key que foi exposta
   - Crie uma nova

2. **Verificar se limpou**
   ```bash
   git log --all --full-history --source -- "*" | grep -i "sk-"
   ```

3. **Adicionar ao .gitignore**
   ```
   .env
   .env.local
   *.key
   secrets.txt
   ```

## Recomendação

Use a **Opção 1** (novo repositório limpo) ou **Opção 4** (squash). São as mais simples e garantem que não há secrets no histórico.

Depois de limpar, **sempre revogue a API key antiga** no painel da OpenAI!
