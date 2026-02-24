"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function gerarRecomendacoes(musicas: string[]) {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        throw new Error("ERRO: A variável de ambiente API_KEY não foi definida no servidor.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite",
        generationConfig: {
            temperature: 0.95, // Aumenta a criatividade
            topP: 0.8,         // Seleciona tokens mais diversificados
        }
     });

    const prompt = `Aja como um crítico musical "cool" e perspicaz. Analise a lista de músicas abaixo (Título - Artista) e retorne um JSON estrito.

Diretrizes:
1. "descricao": Um perfil psicológico/musical irônico e criativo da pessoa (máx 30 palavras). 
2. "recomendacoes": 6 músicas diferentes. Priorize descobertas "underground" ou indie que fujam do óbvio (B-sides, selos independentes).
3. Seja conciso para economizar tokens. Responda APENAS o JSON.

Lista:
${musicas.join("\n")}

Formato de Saída:
{"descricao": "", "recomendacoes": [{"item": "NOME DA MÚSICA OU DO ÁLBUM", 
      "artista": "NOME DO ARTISTA", 
      "porque": "explicação curta"}]}`;

    try {
        // 2. Gera o conteúdo
        const result = await model.generateContent(prompt);

        // 3. Extrai a resposta (o SDK exige o await para o método text())
        const response = result.response;
        console.log(response);
        const text = await response.text();


        console.log(text);
        return text;
    } catch (error) {
        console.error("Erro ao gerar conteúdo:", error);
        return null;
    }
}