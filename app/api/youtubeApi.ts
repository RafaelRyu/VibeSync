import axios from "axios";

export async function getPlaylist(link: string) {

    const response = await axios.get(`https://api-vibesync.vercel.app/playlist/${link}`);
    
    return response.data; // aqui sim você retorna os dados
}
