# Sistema de Comandas em Tempo Real

Um sistema completo para gerenciar comandas em bares e restaurantes, com sincronização em tempo real entre dispositivos.

## Funcionalidades

- Gerenciamento de comandas e produtos
- Sincronização em tempo real entre múltiplos dispositivos
- Funciona offline como fallback
- Interface responsiva para desktop e dispositivos móveis
- Geração de relatórios e histórico de comandas

## Configurando o Firebase para Sincronização em Tempo Real

Para que o sistema funcione em tempo real entre dispositivos, você precisa configurar o Firebase:

1. Acesse o [Firebase Console](https://console.firebase.google.com/) e crie uma conta se ainda não tiver uma.

2. Clique em "Adicionar projeto" e siga as instruções para criar um novo projeto.

3. No painel do projeto, clique em "Realtime Database" no menu lateral e depois em "Criar banco de dados".

4. Selecione "Iniciar no modo de teste" para facilitar o desenvolvimento (lembre-se de configurar regras de segurança posteriormente).

5. Após criar o banco de dados, vá para "Visão geral do projeto" e clique em "Adicionar app" > "Web".

6. Dê um nome para seu app e registre-o.

7. Você receberá um objeto de configuração do Firebase. Copie os valores para o arquivo `js/utils/firebaseConfig.js`:

```javascript
const FirebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "seu-messaging-sender-id",
    appId: "seu-app-id",
    databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com"
};
```

8. Substitua os valores acima pelos fornecidos pelo Firebase.

## Usando o Sistema

1. Abra o arquivo `index.html` no navegador. O sistema funcionará localmente.

2. Para acessar em outros dispositivos, você pode:
   - Hospedar em um servidor web
   - Usar ferramentas como o [Firebase Hosting](https://firebase.google.com/docs/hosting)
   - Utilizar ferramentas de desenvolvimento como o [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

3. Ao abrir o sistema, ele tentará se conectar ao Firebase. Se a conexão for bem-sucedida, você verá a mensagem "Conectado em tempo real".

4. As comandas e produtos serão sincronizados automaticamente entre todos os dispositivos conectados.

## Modo Offline

Se não houver conexão com o Firebase, o sistema funcionará no modo offline, utilizando o armazenamento local do navegador.

## Segurança

Para ambientes de produção, é essencial configurar regras de segurança adequadas no Firebase. Consulte a [documentação oficial](https://firebase.google.com/docs/database/security) para mais informações.

## Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## Sons no Sistema

Para que os sons funcionem corretamente, siga as instruções abaixo:

1. Adicione o arquivo de som de confirmação `som.mp3` na pasta `assets/sounds/` do seu projeto.
2. O som será reproduzido automaticamente ao fechar uma comanda.

### Configuração de Sons (Para Desenvolvedores)

O sistema possui um gerenciador de sons (`SoundManager`) que permite:

- Ativar/desativar sons: `SoundManager.setEnabled(true/false)`
- Ajustar volume: `SoundManager.setVolume(0.5)` (valores de 0.0 a 1.0)
- Verificar status: `SoundManager.isEnabled()`
- Reproduzir som manualmente: `SoundManager.playSound('CLOSE_TAB')`

Caso precise adicionar novos sons, edite o objeto `SOUNDS` no arquivo `js/utils/soundManager.js`. 