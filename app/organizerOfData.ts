// 1. Definição das interfaces para tipagem
interface Recomendacao {
  item: string;
  artista: string;
  porque: string;
}

interface RespostaGemini {
  descricao: string;
  recomendacoes: Recomendacao[];
}

//Limpa e extrai os dados do JSON gerado pela Gemini API
export function extrairDadosMusical(jsonString: string) {
  try {
    
    const cleanJson = jsonString.replace(/```json|```/g, "").trim();
    
    const dados: RespostaGemini = JSON.parse(cleanJson);

    const descricao: string = dados.descricao;
    const listaRecomendacoes: Recomendacao[] = dados.recomendacoes;

    return {
      descricao,
      listaRecomendacoes
    };

  } catch (error) {
    console.error("Erro ao processar o JSON:", error);
    return null;
  }
}
