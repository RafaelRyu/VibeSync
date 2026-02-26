from fastapi import FastAPI, HTTPException
from ytmusicapi import YTMusic
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://vibe-sync-gold.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Inicializa a API (Não funciona com playlists privadas)
yt = YTMusic()


@app.get("/playlist/{playlist_id}")
async def get_playlist_data(playlist_id: str):
    try:
        # Busca os dados da playlist
        playlist = yt.get_playlist(playlist_id)


        # Estrutura os dados para o JSON de resposta
        songs_data = []
        for item in playlist['tracks']:
            songs_data.append({
                "titulo": item['title'],
                "artista": ", ".join([a['name'] for a in item['artists']]),
                "album": item['album']['name'] if item['album'] else None
            })



        return {
            "playlist_nome": playlist['title'],
            "total_musicas": playlist['trackCount'],
            "musicas": songs_data
        }



    except Exception as e:
        # Se o ID for inválido ou a playlist for privada de terceiros
        raise HTTPException(status_code=404, detail=f"Erro ao acessar playlist: {str(e)}")
