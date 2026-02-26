import axios from "axios";

export async function getPlaylist(link: string) {

    const response = await axios.get(`http://localhost:8000/playlist/${link}`);
    
    return response.data; // aqui sim você retorna os dados
}
