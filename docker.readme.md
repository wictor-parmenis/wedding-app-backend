# 🐳 Instalação Docker e Docker Compose no WSL2

Este guia vai te ajudar a instalar Docker e Docker Compose diretamente no WSL2, sem precisar do Docker Desktop.

## 📋 Pré-requisitos

- WSL2 instalado e configurado
- Ubuntu no WSL2
- Acesso de administrador (sudo)

## 🚀 Instalação do Docker

### 1️⃣ Atualize o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Instale as dependências
```bash
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release -y
```

### 3️⃣ Adicione a chave GPG do Docker
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### 4️⃣ Adicione o repositório oficial do Docker
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 5️⃣ Instale o Docker
```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io -y
```

### 6️⃣ Adicione seu usuário ao grupo docker
```bash
sudo usermod -aG docker $USER
```

### 7️⃣ Inicie o serviço
```bash
sudo service docker start
```

## 🔧 Instalação do Docker Compose

### Opção A: Via repositório (recomendado)
```bash
sudo apt install docker-compose-plugin -y
```

### Opção B: Download direto (última versão)
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## ⚙️ Configuração de inicialização automática

Para o Docker iniciar automaticamente:

```bash
echo 'sudo service docker start' >> ~/.bashrc
```

**Para evitar digitar senha sempre:**
```bash
echo "$USER ALL=(ALL) NOPASSWD: /usr/bin/service docker start" | sudo tee -a /etc/sudoers
```

## ✅ Testando a instalação

### 1. Reinicie o WSL2
Feche e abra novamente o terminal WSL2 (importante para aplicar as permissões do grupo docker)

### 2. Teste o Docker
```bash
docker --version
docker run hello-world
```

### 3. Teste o Docker Compose
```bash
# Se usou a Opção A
docker compose version

# Se usou a Opção B  
docker-compose --version
```

## 💡 Dicas importantes

- ✨ **Use `docker compose`** (novo) ao invés de `docker-compose` quando possível
- 🚫 **Não instale Docker Desktop** se quer usar Docker nativo no WSL2
- 🔄 **Sempre reinicie o terminal** após adicionar usuário ao grupo docker
- 🐧 **Performance nativa** - Docker roda diretamente no kernel Linux do WSL2

## 🆘 Problemas comuns

### Erro de permissão
```bash
# Se aparecer "permission denied"
sudo service docker start
# E certifique-se de ter reiniciado o terminal após o usermod
```

### Docker não inicia
```bash
# Verifique o status
sudo service docker status

# Force o restart
sudo service docker restart
```

## 🎯 Próximos passos

Agora você pode:
- Criar seus primeiros containers
- Usar docker-compose.yml para projetos
- Desenvolver com containers no VSCode + WSL2

---

**📝 Nota:** Este guia foi testado especificamente no Ubuntu 22.04 LTS rodando no WSL2.

**🤝 Precisa de ajuda?** Manda mensagem que eu te ajudo!