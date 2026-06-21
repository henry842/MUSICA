/*
 * Spotify Playlist Adder
 *
 * How to use:
 * 1. Open https://open.spotify.com and log in.
 * 2. Open DevTools Console.
 * 3. Edit PLAYLIST_NAME and SONGS below.
 * 4. Paste this whole file into the console and press Enter.
 *
 * This script runs only in your own browser session. It does not ask for,
 * store, or send your password anywhere.
 */

(async () => {
  "use strict";

  const PLAYLIST_NAME = "HENRY LINDO";

  const SONGS = [
    "BANDIDO NAO",
    "MANLANDRO!",
    "TE ENCONTRO NA LAPA",
    "3AM(PXTR4 RASA)",
    "FOI ASSIM",
    "SEM PAUSA",
    "NUEVAS TOXICAS",
    "MUNDO DALUA",
    "TOCAIA",
    "TUDO AOCNTECEU",
    "INTENCAO",
    "EU NAO SOU TAO BOM ASSIM",
    "DA ONDE EU VENHO",
    "SAGRADO PROFANO",
    "TENTAR SER BREVE",
    "SEGREDO",
    "MELHOR SO",
    "LICOR 43",
    "ENGANA DIZENDO Q AMA",
    "ARTISTA GENERICO",
    "TALVEZ VC PRECISE DE MIM",
    "BALLENA",
    "NOVO BALANCO",
    "AMANHECER",
    "SO ME LIGAR",
    "CACOS DE VIDRO",
    "PLANOS",
    "MUSICA DE AMOR NUNCA MAIS",
    "CONEXAO DE MAFIA",
    "VAMPIRO",
    "QUER VOAR",
    "KENNY G",
    "ANOS LUZ",
    "SOZIN",
    "2H30",
    "CURA",
    "NEM ERA PRA EU TA AQUI",
    "SE QUISER ME GOSTAR TEM Q SER PRO AMOR...",
    "BABY DOLL",
    "NAO ERA EU NO BOLAO",
    "VOLTAVEL",
    "CIGANA",
    "EU VEJO TUA CARA TEU QUERE",
    "QUERO AGRADECER MINHA EX",
    "ELA QUER VIVER NO PANTANAL",
    "YOU KNOW YOUR ON MY MIND",
    "IMPREVISTO",
    "VINGANCA",
    "BLINDADAO",
    "SOLTO",
    "EU ADORO SACANAGEM",
    "PIROCADA QUENTE",
    "BUMP",
    "LAMENTAVEL",
    "INSEGURANCA",
    "SOCA TUDO",
    "IT CALLED FREEFALL",
    "NOME PROBIDO",
    "SINA DE OFELIA",
  ];

  const OPTIONS = {
    market: "BR",
    searchLimit: 1,
    skipDuplicates: true,
    confirmBeforeAdding: true,
  };

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function uniqueSongs(songs) {
    const seen = new Set();
    return songs
      .map((song) => String(song).trim())
      .filter(Boolean)
      .filter((song) => {
        const key = normalizeText(song);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function showStatus(message, details = "") {
    let box = document.getElementById("spotify-playlist-adder-status");
    if (!box) {
      box = document.createElement("section");
      box.id = "spotify-playlist-adder-status";
      box.style.cssText = [
        "position:fixed",
        "z-index:2147483647",
        "right:16px",
        "top:16px",
        "width:min(560px, calc(100vw - 32px))",
        "max-height:72vh",
        "overflow:auto",
        "padding:14px 16px",
        "border-radius:8px",
        "background:#101010",
        "color:white",
        "font:13px/1.45 Arial, sans-serif",
        "box-shadow:0 10px 40px rgba(0,0,0,.45)",
        "white-space:pre-wrap",
      ].join(";");
      document.body.appendChild(box);
    }

    box.textContent = details ? `${message}\n\n${details}` : message;
    document.title = message;
  }

  async function getSpotifyAccessToken() {
    const response = await fetch(
      "https://open.spotify.com/get_access_token?reason=transport&productType=web_player",
      { credentials: "include" },
    );

    if (!response.ok) {
      throw new Error(`Could not get Spotify token: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.accessToken) {
      throw new Error("Spotify token was not available. Are you logged in?");
    }

    return data.accessToken;
  }

  function createSpotifyApi(accessToken) {
    return async function spotifyApi(url, options = {}) {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Spotify API error ${response.status}: ${body.slice(0, 250)}`);
      }

      return response.status === 204 ? null : response.json();
    };
  }

  async function findPlaylistByName(api, playlistName) {
    const wanted = normalizeText(playlistName);
    const playlists = [];
    let nextUrl = "https://api.spotify.com/v1/me/playlists?limit=50";

    while (nextUrl) {
      const page = await api(nextUrl);
      playlists.push(...page.items);
      nextUrl = page.next;
    }

    return (
      playlists.find((playlist) => normalizeText(playlist.name) === wanted) ||
      playlists.find((playlist) => normalizeText(playlist.name).includes(wanted))
    );
  }

  async function getExistingTrackUris(api, playlistId) {
    const existing = new Set();
    let nextUrl =
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks` +
      "?fields=next,items(track(uri))&limit=100";

    while (nextUrl) {
      const page = await api(nextUrl);
      for (const item of page.items) {
        if (item.track && item.track.uri) existing.add(item.track.uri);
      }
      nextUrl = page.next;
    }

    return existing;
  }

  async function searchTrack(api, query) {
    const url =
      "https://api.spotify.com/v1/search" +
      `?type=track&limit=${OPTIONS.searchLimit}` +
      `&market=${encodeURIComponent(OPTIONS.market)}` +
      `&q=${encodeURIComponent(query)}`;

    const result = await api(url);
    return result.tracks && result.tracks.items ? result.tracks.items[0] : null;
  }

  async function addTracks(api, playlistId, uris) {
    for (let index = 0; index < uris.length; index += 100) {
      const chunk = uris.slice(index, index + 100);
      await api(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        body: JSON.stringify({ uris: chunk }),
      });
    }
  }

  const songs = uniqueSongs(SONGS);
  showStatus(`Spotify Adder: connecting...`, `${songs.length} unique song searches loaded.`);

  const accessToken = await getSpotifyAccessToken();
  const api = createSpotifyApi(accessToken);

  const playlist = await findPlaylistByName(api, PLAYLIST_NAME);
  if (!playlist) {
    throw new Error(`Playlist not found: ${PLAYLIST_NAME}`);
  }

  showStatus(`Spotify Adder: reading playlist...`, playlist.name);
  const existingUris = OPTIONS.skipDuplicates
    ? await getExistingTrackUris(api, playlist.id)
    : new Set();

  const tracksToAdd = [];
  const addedPreview = [];
  const missing = [];
  const duplicates = [];

  for (let index = 0; index < songs.length; index += 1) {
    const query = songs[index];
    showStatus(
      `Spotify Adder: searching ${index + 1}/${songs.length}`,
      query,
    );

    const track = await searchTrack(api, query);
    if (!track) {
      missing.push(query);
      continue;
    }

    const artists = track.artists.map((artist) => artist.name).join(", ");
    const preview = `${query} -> ${track.name} - ${artists}`;

    if (existingUris.has(track.uri)) {
      duplicates.push(preview);
      continue;
    }

    existingUris.add(track.uri);
    tracksToAdd.push(track.uri);
    addedPreview.push(preview);
  }

  const summary =
    `Playlist: ${playlist.name}\n` +
    `Found to add: ${tracksToAdd.length}\n` +
    `Duplicates skipped: ${duplicates.length}\n` +
    `Not found: ${missing.length}\n\n` +
    `Tracks selected:\n${addedPreview.join("\n") || "None"}\n\n` +
    `Not found:\n${missing.join("\n") || "None"}`;

  showStatus("Spotify Adder: review", summary);

  if (OPTIONS.confirmBeforeAdding) {
    const ok = window.confirm(
      `Add ${tracksToAdd.length} tracks to "${playlist.name}"?\n\n` +
        `${missing.length} searches were not found. See the black status box for details.`,
    );
    if (!ok) {
      showStatus("Spotify Adder: canceled", summary);
      return;
    }
  }

  await addTracks(api, playlist.id, tracksToAdd);

  showStatus(
    `Spotify Adder: done`,
    `Added ${tracksToAdd.length} tracks to "${playlist.name}".\n\n` +
      `Duplicates skipped: ${duplicates.length}\n` +
      `Not found: ${missing.length}\n\n` +
      `Not found:\n${missing.join("\n") || "None"}`,
  );
})();
