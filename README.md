# Spotify Playlist Adder

Script simples para adicionar muitas músicas a uma playlist do Spotify Web a partir de uma lista de nomes.

Ele foi criado a partir de uma automação manual feita no Spotify Web: buscar música por música, escolher o primeiro resultado e clicar em adicionar. A diferença é que este script faz isso usando a sessão logada do próprio navegador.

## O que ele faz

- Procura uma playlist pelo nome.
- Busca cada música da lista no Spotify.
- Seleciona o primeiro resultado de cada busca.
- Pula duplicadas que já existem na playlist.
- Mostra um resumo antes de adicionar.
- Adiciona as faixas em lotes de até 100.

## Importante

- Use apenas na sua própria conta ou em uma conta que você tem permissão para editar.
- O script não pede senha, não salva token e não envia seus dados para nenhum servidor externo.
- Ele usa a sessão já logada no `open.spotify.com`.
- Como ele usa uma rota interna do Spotify Web para obter o token da sessão, pode parar de funcionar se o Spotify mudar o site.
- Revise o resumo antes de confirmar, porque nomes digitados errado podem cair em resultados parecidos.

## Como usar

1. Abra [open.spotify.com](https://open.spotify.com) e entre na sua conta.
2. Crie ou deixe existente a playlist que receberá as músicas.
3. Abra o arquivo `spotify-playlist-adder.js`.
4. Edite estas partes no começo do arquivo:

```js
const PLAYLIST_NAME = "HENRY LINDO";

const SONGS = [
  "BANDIDO NAO",
  "MANLANDRO!",
  "TE ENCONTRO NA LAPA",
];
```

5. Abra o DevTools do navegador:

- Chrome/Edge/Brave: `F12` ou `Ctrl+Shift+J`.
- Firefox: `F12` ou `Ctrl+Shift+K`.

6. Cole o conteúdo inteiro de `spotify-playlist-adder.js` no console.
7. Pressione `Enter`.
8. Revise o painel preto que aparece no canto da página.
9. Confirme quando o navegador perguntar se deseja adicionar as faixas.

## Configurações

No topo do script existe este bloco:

```js
const OPTIONS = {
  market: "BR",
  searchLimit: 1,
  skipDuplicates: true,
  confirmBeforeAdding: true,
};
```

- `market`: país usado na busca. Para Brasil, deixe `"BR"`.
- `searchLimit`: quantos resultados o Spotify retorna por busca. O script usa o primeiro.
- `skipDuplicates`: evita adicionar músicas que já estão na playlist.
- `confirmBeforeAdding`: mostra confirmação antes de modificar a playlist.

## Publicando no GitHub

Na pasta do projeto:

```bash
git init
git add README.md spotify-playlist-adder.js songs.example.txt LICENSE .gitignore
git commit -m "Add Spotify playlist adder"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/spotify-playlist-adder.git
git push -u origin main
```

Troque `SEU_USUARIO` pelo seu usuário do GitHub.

## Licença

MIT. Veja `LICENSE`.
