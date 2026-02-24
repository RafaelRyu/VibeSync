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
    const [copiado, setCopiado] = useState(false);

    // Paleta de Cores definida
    const colors = {
        primary: "#21B5BF",
        secondary: "#329096",
        accent: "#00DBEB",
        darkTeal: "#36686B",
        deepGray: "#2B3E40",
        background: "#2B3233"
    };

    const handleCopy = () => {
        const dados = separarDadosMusicais();
        if (!dados) return;

        const textoParaCopiar = `🎵 Minhas Recomendações VibeSync:\n\n` +
            `Perfil: ${dados.descricao}\n\n` +
            dados.lista.map(item => `- ${item.item} (${item.artista}): ${item.porque}`).join('\n\n');

        navigator.clipboard.writeText(textoParaCopiar).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        });
    };

    const handleReset = () => {
        setPlaylistUrl("");
        setRecomendacoes(null);
        setErro(null);
    };

    const validarLinkYoutube = (url: string) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*list=([a-zA-Z0-9_-]+)/;
        return regex.test(url);
    };

    const extrairPlaylistId = (url: string) => {
        const regex = /[&?]list=([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleGenerateDiscovery = async () => {
        setErro(null);
        if (!playlistUrl.trim()) {
            setErro("O campo está vazio. Insira um link.");
            return;
        }

        const playlistId = extrairPlaylistId(playlistUrl);
        if (!playlistId || !validarLinkYoutube(playlistUrl)) {
            setErro("Link inválido. Certifique-se de que é uma PLAYLIST do YouTube.");
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
        <div style={{ 
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${colors.deepGray} 0%, ${colors.darkTeal} 50%, ${colors.background} 100%)`,
            padding: '40px 20px', 
            fontFamily: 'sans-serif', 
            color: '#fff' 
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        marginBottom: '10px',
                        color: colors.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '15px'
                    }}>
                        <img src="/VibeSyncLogo.png" alt="Logo" style={{ height: '1.2em' }} />
                        VibeSync
                    </h1>
                    <p style={{ color: colors.primary, fontSize: '1.1rem' }}>Sua próxima música favorita está a um link de distância.</p>
                </header>
                
                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Cole o link da sua playlist aqui..." 
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        disabled={loading || !!dadosProcessados}
                        style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '12px',
                            border: erro ? '2px solid #ff4d4f' : `1px solid ${colors.secondary}`,
                            fontSize: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                    
                    {!dadosProcessados ? (
                        <button 
                            onClick={handleGenerateDiscovery} 
                            disabled={loading}
                            style={{
                                padding: '0 30px',
                                backgroundColor: loading ? colors.darkTeal : colors.primary,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                transition: '0.3s'
                            }}
                        >
                            {loading ? "Analisando..." : "Explorar"}
                        </button>
                    ) : (
                        <button 
                            onClick={handleReset} 
                            style={{
                                padding: '0 30px',
                                backgroundColor: 'transparent',
                                color: '#fff',
                                border: `2px solid ${colors.secondary}`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Nova Busca
                        </button>
                    )}
                </div>

                {erro && <p style={{ color: '#ff4d4f', textAlign: 'center' }}>⚠️ {erro}</p>}

                <hr style={{ margin: '40px 0', border: '0', borderTop: `1px solid ${colors.darkTeal}`, opacity: 0.5 }} />

                {dadosProcessados && !loading && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: colors.accent }}>Descobertas para você</h3>
                            <button 
                                onClick={handleCopy}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: copiado ? '#4caf50' : colors.secondary,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '25px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                {copiado ? "✅ Copiado!" : "📋 Copiar Lista"}
                            </button>
                        </div>

                        <section style={{ 
                            marginBottom: '30px', 
                            padding: '25px', 
                            backgroundColor: 'rgba(33, 181, 191, 0.1)', 
                            borderRadius: '15px', 
                            borderLeft: `6px solid ${colors.primary}` 
                        }}>
                            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '1.1rem' }}>
                                <strong style={{ color: colors.accent }}>Seu Perfil:</strong> {dadosProcessados.descricao}
                            </p>
                        </section>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            {dadosProcessados.lista.map((musica, index) => (
                                <div 
                                    key={index} 
                                    style={{
                                        padding: '20px',
                                        borderRadius: '15px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        border: `1px solid ${colors.darkTeal}`,
                                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', color: colors.accent, fontSize: '1.3rem' }}>
                                                {musica.item}
                                            </h4>
                                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: colors.primary }}>
                                                {musica.artista}
                                            </p>
                                        </div>
                                        <span style={{ fontSize: '1.8rem', opacity: 0.7 }}>🎧</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#ccc', fontStyle: 'italic', borderTop: `1px solid ${colors.darkTeal}`, paddingTop: '10px' }}>
                                        "{musica.porque}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}