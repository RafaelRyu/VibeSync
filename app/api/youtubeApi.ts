import axios from "axios";

export async function getPlaylist(link: string) {

    const response = await axios.get(`http://127.0.0.1:8000/playlist/${link}`);
    
    return response.data; // aqui sim você retorna os dados
}
