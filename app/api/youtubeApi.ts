import axios from "axios";



export async function getPlaylist(link: string) {

    const response = await axios.get(`${process.env.WEBSITE_URL}/playlist/${link}`);
    
    return response.data; // aqui sim você retorna os dados
}
