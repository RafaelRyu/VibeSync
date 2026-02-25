"use client";

import { useState } from "react";
import { getPlaylist } from "./api/youtubeApi";
import { gerarRecomendacoes } from "./api/geminiApi";
import { converterPlaylistToList } from "./converter";
import { extrairDadosMusical } from "./organizerOfData";

export default function Home() {
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [vibe, setVibe] = useState(""); // Novo estado para a vibe
    const [loading, setLoading] = useState(false);
    const [recomendacoes, setRecomendacoes] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [copiado, setCopiado] = useState(false);

    const colors = {
        primary: "#21B5BF",
        secondary: "#329096",
        accent: "#00DBEB",
        darkTeal: "#36686B",
        deepGray: "#2B3E40",
        background: "#2B3233"
    };
    
    const handleReset = () => {
        setPlaylistUrl("");
        setRecomendacoes(null);
        setErro(null);
        // Mantivemos a vibe aqui para que ela só suma no refresh ou no botão de limpar específico
    };

    const extrairPlaylistId = (url: string) => {
        const regex = /[&?]list=([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    const handleGenerateDiscovery = async () => {
        setErro(null);
        const playlistId = extrairPlaylistId(playlistUrl);
        if (!playlistId) {
            setErro("Link inválido. Insira uma playlist do YouTube.");
            return;
        }

        setLoading(true);
        try {
            const playlistData = await getPlaylist(playlistId);
            const playlistTrimmada = (converterPlaylistToList(playlistData)).slice(0, 30);
            
            // Agora enviamos a vibe como segundo argumento
            const recomendacoesBrutas = await gerarRecomendacoes(playlistTrimmada, vibe); 
            setRecomendacoes(recomendacoesBrutas);
        } catch (error) {
            setErro("Erro ao acessar playlist.");
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

    const dadosProcessados = separarDadosMusicais();

    return (
        <div style={{ 
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${colors.deepGray} 0%, ${colors.darkTeal} 50%, ${colors.background} 100%)`,
            padding: '40px 20px', 
            fontFamily: 'var(--font-outfit)', 
            color: '#fff' 
        }}>
            <style jsx global>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-item { opacity: 0; animation: fadeInUp 0.6s ease-out forwards; }
            `}</style>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '3rem', color: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                        <img src="/VibeSyncLogo.png" alt="Logo" style={{ height: '1.2em' }} />
                        VibeSync
                    </h1>
                </header>
                
                {/* Input da Playlist */}
                <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Cole o link da sua playlist aqui..." 
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        style={{ flex: 1, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.secondary}`, backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#fff', outline: 'none' }}
                    />
                    {!dadosProcessados ? (
                        <button onClick={handleGenerateDiscovery} disabled={loading} style={{ padding: '0 30px', backgroundColor: colors.primary, borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', border: 'none', color: '#fff' }}>
                            {loading ? "Analisando..." : "Explorar"}
                        </button>
                    ) : (
                        <button onClick={handleReset} style={{ padding: '0 30px', backgroundColor: 'transparent', border: `2px solid ${colors.secondary}`, color: '#fff', borderRadius: '12px', cursor: 'pointer' }}>Nova Busca</button>
                    )}
                </div>

                {/* NOVO: Input da Vibe Opcional */}
                <div style={{ marginBottom: '20px', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                            type="text" 
                            maxLength={100}
                            placeholder="Qual a vibe? (Ex: Indie triste, Treino pesado...)" 
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: `1px solid ${colors.darkTeal}`, backgroundColor: 'rgba(0, 0, 0, 0.2)', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                        />
                        {vibe && (
                            <button 
                                onClick={() => setVibe("")}
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                            >
                                Limpar Vibe
                            </button>
                        )}
                    </div>
                    <p style={{ marginTop: '8px', fontSize: '0.85rem', color: colors.accent, opacity: 0.8 }}>
                        {vibe ? `Vibe atual: "${vibe}"` : "Vibe padrão: Baseada apenas na playlist"}
                    </p>
                </div>

                {erro && <p style={{ color: '#ff4d4d', textAlign: 'center' }}>{erro}</p>}

                <hr style={{ margin: '30px 0', border: '0', borderTop: `1px solid ${colors.darkTeal}`, opacity: 0.3 }} />

                {dadosProcessados && !loading && (
                    <div>
                        <section className="fade-item" style={{ 
                            marginBottom: '30px', padding: '25px', backgroundColor: 'rgba(33, 181, 191, 0.1)', 
                            borderRadius: '15px', borderLeft: `6px solid ${colors.primary}`,
                            animationDelay: '0.1s'
                        }}>
                            <p style={{ margin: 0 }}><strong>Seu Perfil:</strong> {dadosProcessados.descricao}</p>
                        </section>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            {dadosProcessados.lista.map((musica, index) => (
                                <div 
                                    key={index} 
                                    className="fade-item"
                                    style={{
                                        padding: '20px', borderRadius: '15px', backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        border: `1px solid ${colors.darkTeal}`, backdropFilter: 'blur(4px)',
                                        animationDelay: `${(index + 2) * 0.1}s` 
                                    }}
                                >
                                    <h4 style={{ margin: '0 0 5px 0', color: colors.accent }}>{musica.item}</h4>
                                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: colors.primary }}>{musica.artista}</p>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#ccc', fontStyle: 'italic' }}>"{musica.porque}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}