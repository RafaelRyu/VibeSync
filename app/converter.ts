import { PlaylistResponse } from "./types/youtubeApiTypes";

export function converterPlaylistToList(playlist: PlaylistResponse | null) {
    if (!playlist) {
        return [];
    }

    return playlist.musicas.map((musica) => {
        return `${musica.titulo} - ${musica.artista}`;
    });
}