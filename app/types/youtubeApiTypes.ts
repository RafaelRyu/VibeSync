// Interface para os elementos individuais de songs_data
export interface SongData {
  titulo: string;
  artista: string;
  album: string | null; // Pode ser null conforme o 'if item['album'] else None' da API
}

// Interface para o retorno geral (o objeto da playlist)
export interface PlaylistResponse {
  playlist_nome: string;
  total_musicas: number;
  musicas: SongData[];
}