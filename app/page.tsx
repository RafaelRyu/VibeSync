"use client";

import { useState } from "react";
import { getPlaylist } from "./api/youtubeApi";
import { PlaylistResponse } from "./types/youtubeApiTypes";
import { gerarRecomendacoes } from "./api/geminiApi";
import { converterPlaylistToList } from "./converter";
import { extrairDadosMusical } from "./organizerOfData";

export default function Home() {
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [recomendacoes, setRecomendacoes] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [copiado, setCopiado] = useState(false); // Estado para feedback de cópia

    // Função para copiar os dados formatados
    const handleCopy = () => {
        const dados = separarDadosMusicais();
        if (!dados) return;

        const textoParaCopiar = `🎵 Minhas Recomendações MuseAI:\n\n` +
            `Perfil: ${dados.descricao}\n\n` +
            dados.lista.map(item => `- ${item.item} (${item.artista}): ${item.porque}`).join('\n\n');

        navigator.clipboard.writeText(textoParaCopiar).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000); // Volta ao normal após 2s
        });
    };

    // Função para resetar o estado da aplicação
    const handleReset = () => {
        setPlaylistUrl("");
        setRecomendacoes(null);
        setErro(null);
    };

    const validarLinkYoutube = (url: string) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*list=([a-zA-Z0-9_-]+)/;
        return regex.test(url);
    };

    // Função para extrair apenas o ID da Playlist
    const extrairPlaylistId = (url: string) => {
        const regex = /[&?]list=([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleGenerateDiscovery = async () => {
        setErro(null);
        if (!playlistUrl.trim()) {
            setErro("O campo está vazio. Insira um link para receber recomendações.");
            return;
        }

        // 3. Extração do ID
        const playlistId = extrairPlaylistId(playlistUrl);

        if (!playlistId) {
            setErro("Não encontramos um ID de playlist válido no link fornecido.");
            return;
        }

        if (!validarLinkYoutube(playlistUrl)) {
            setErro("Link inválido. Certifique-se de que é um link de PLAYLIST do YouTube.");
            return;
        }

        setLoading(true);
        try {
            const playlistData = await getPlaylist(playlistId);
            const playlistTrimmada = trimPlaylist(converterPlaylistToList(playlistData));
            const recomendacoesBrutas = await gerarRecomendacoes(playlistTrimmada);
            setRecomendacoes(recomendacoesBrutas);
        } catch (error) {
            setErro("Não conseguimos acessar essa playlist. Verifique se ela é pública.");
        } finally {
            setLoading(false);
        }
    };

    function separarDadosMusicais() {
        if (recomendacoes) {
            const dados = extrairDadosMusical(recomendacoes);
            if (dados) return { descricao: dados.descricao, lista: dados.listaRecomendacoes };
        }
        return null;
    }

    function trimPlaylist(listOfMusics: string[]) {
        return listOfMusics.length >= 30 ? listOfMusics.slice(0, 30) : listOfMusics;
    }

    const dadosProcessados = separarDadosMusicais();

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', color: '#333' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#0070f3' }}>🎵 MuseAI</h1>
                <p style={{ color: '#666' }}>Sua próxima música favorita está a um link de distância.</p>
            </header>
            
            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Cole o link da sua playlist aqui..." 
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    disabled={loading || !!dadosProcessados}
                    style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '12px',
                        border: erro ? '2px solid #ff4d4f' : '1px solid #ddd',
                        fontSize: '16px',
                        backgroundColor: (loading || dadosProcessados) ? '#f5f5f5' : '#fff',
                        outline: 'none'
                    }}
                />
                
                {!dadosProcessados ? (
                    <button 
                        onClick={handleGenerateDiscovery} 
                        disabled={loading}
                        style={{
                            padding: '0 30px',
                            backgroundColor: loading ? '#ccc' : '#0070f3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {loading ? "Analisando..." : "Explorar"}
                    </button>
                ) : (
                    <button 
                        onClick={handleReset} 
                        style={{
                            padding: '0 30px',
                            backgroundColor: '#f0f0f0',
                            color: '#333',
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Nova Busca
                    </button>
                )}
            </div>

            {erro && <p style={{ color: '#ff4d4f', fontSize: '0.9em', textAlign: 'center', marginTop: '10px' }}>⚠️ {erro}</p>}

            <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

            {/* EMPTY STATE & LOADING (mantenha como no código anterior) */}

            {/* RESULTADOS */}
            {dadosProcessados && !loading && (
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Resultados</h3>
                        <button 
                            onClick={handleCopy}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: copiado ? '#4caf50' : '#0070f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '0.85em',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {copiado ? "✅ Copiado!" : "📋 Copiar Lista"}
                        </button>
                    </div>

                    <section style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '15px', borderLeft: '6px solid #0070f3' }}>
                        <p style={{ margin: 0, lineHeight: '1.6' }}><strong>Seu Perfil:</strong> {dadosProcessados.descricao}</p>
                    </section>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        {dadosProcessados.lista.map((musica, index) => (
        <div 
            key={index} 
            style={{
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid #eee',
                backgroundColor: '#fff',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#0070f3', fontSize: '1.2rem' }}>
                        {musica.item}
                    </h4>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#555' }}>
                        {musica.artista}
                    </p>
                </div>
                <span style={{ fontSize: '1.5rem' }}>🎧</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                " {musica.porque} "
            </p>
        </div>
    ))}
                    </div>
                </div>
            )}
        </div>
    );
}