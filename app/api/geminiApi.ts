"use server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function gerarRecomendacoes(musicas: string[], vibe: string) {
    const apiKey = process.env.API_KEY;
    const InputSchema = z.object({
  musicas: z.array(z.string()).min(1),
  vibe: z.string().min(0).max(100).transform(v => v.replace(/[<>"{}]/g, ""))
});

const validation = InputSchema.safeParse({ musicas: musicas, vibe: vibe });
    
    if (!validation.success) {
        throw new Error("Entrada inválida: " + validation.error.message);
    }

    const { musicas: musicasSeguras, vibe: vibeSegura } = validation.data;

    if (!apiKey) {
        throw new Error("ERRO: A variável de ambiente API_KEY não foi definida no servidor.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite",
        generationConfig: {
            temperature: 0.95, // Aumenta a criatividade
            topP: 0.8,         // Seleciona tokens mais diversificados
            responseMimeType: "application/json",
        }
     });


     
    const prompt = `Aja como um crítico musical "cool" e perspicaz. 
Analise a lista de músicas abaixo levando em conta que a vibe atual é: "${vibeSegura}". 

Diretrizes:
1. "descricao": Um perfil psicológico/musical irônico da pessoa baseado na lista e na vibe (máx 30 palavras). 
2. "recomendacoes": 6 músicas que se encaixem na vibe "${vibeSegura}". Fuja do óbvio (B-sides, selos independentes, artistas com menos de 100k ouvintes).
3. Seja conciso. Responda APENAS o JSON.

Lista:
${musicasSeguras.join("\n")}

Formato de Saída:
{"descricao": "", "recomendacoes": [{"item": "NOME DA MÚSICA", "artista": "NOME DO ARTISTA", "porque": "explicação curta"}]}`;

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