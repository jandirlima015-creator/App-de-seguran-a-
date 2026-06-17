import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Shared Gemini credentials setup
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Endpoint for safety risk analysis using gemini-3.5-flash
  app.post("/api/analyze-hazard", async (req, res) => {
    try {
      const { activityName, location, department, description, immediateAction } = req.body;

      if (!activityName || !description) {
        return res.status(400).json({ error: "Nome da atividade e descrição do risco são obrigatórios." });
      }

      const systemPrompt = `Você é um Engenheiro de Segurança do Trabalho e Engenheiro de Meio Ambiente sênior, especialista na legislação de segurança do trabalho do Brasil (Normas Regulamentadoras - NRs) e em confecção de APR (Análise Preliminar de Risco).
Dado um relato de atividade de risco ou operação perigosa, gere uma análise de segurança extremamente detalhada, séria, técnica e estruturada em português.
Seja preciso, avalie o nível de severidade e recomende os EPIs, EPCs, Medidas de Controle corretas e associe-as às NRs cabíveis (ex: NR-35 para Trabalho em Altura, NR-10 para Eletricidade, NR-33 para Espaço Confinado, NR-12 para Máquinas e Equipamentos).
Retorne os dados no formato JSON especificado.`;

      const userPrompt = `
Formulário de Relato de Risco preenchido em campo:
Atividade/Operação: ${activityName}
Localização do Risco (Área/Frente de Trabalho): ${location || "Não especificado"}
Setor/Departamento: ${department || "Não especificado"}
Descrição Detalhada do Risco ou Ato Inseguro: ${description}
Ação de Controle Imediata Adotada: ${immediateAction || "Nenhuma ação imediata adotada"}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["riskLevel", "riskLevelColor", "riskAssessment", "episRecommended", "epcsRecommended", "controlMeasures", "applicableNRs", "aprChecklist"],
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: "Nível de severidade do risco. Retorne APENAS um destes valores: 'Baixo', 'Médio', 'Alto' ou 'Crítico'."
              },
              riskLevelColor: {
                type: Type.STRING,
                description: "A cor associada à severidade: 'green' para Baixo, 'yellow' para Médio, 'orange' para Alto e 'red' para Crítico."
              },
              riskAssessment: {
                type: Type.STRING,
                description: "Uma análise técnica bem detalhada fundamentando o nível de risco atribuído e as consequências potenciais do cenário sem o controle adequado."
              },
              episRecommended: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Equipamentos de Proteção Individual específicos (EPIs) recomendados para mitigar este risco."
              },
              epcsRecommended: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Equipamentos de Proteção Coletiva (EPCs), barreiras, isolamentos ou sinalizações fundamentais necessárias."
              },
              controlMeasures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Medidas de controle administrativas, operacionais ou de engenharia imediatas que devem ser implantadas."
              },
              applicableNRs: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array de strings listando as NRs relevantes da Portaria 3.214/77 com breve título associativo (ex: ['NR-35 (Trabalho em Altura)', 'NR-06 (Equipamentos de Proteção Individual)'])."
              },
              aprChecklist: {
                type: Type.ARRAY,
                description: "Uma checklist de 4 a 6 perguntas de segurança de campo essenciais (APR) para que o encarregado ou inspetor faça a verificação antes de autorizar o início da atividade.",
                items: {
                  type: Type.OBJECT,
                  required: ["item", "verified"],
                  properties: {
                    item: {
                      type: Type.STRING,
                      description: "Pergunta direta do que verificar em campo (ex: 'A bacia de contenção do gerador está seca e sem vazamentos?')."
                    },
                    verified: {
                      type: Type.BOOLEAN,
                      description: "Valor booleano inicial, defina como false."
                    }
                  }
                }
              }
            }
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Opá! Ocorreu um erro ao obter resposta do modelo de Inteligência Artificial da Google.");
      }

      const jsonResult = JSON.parse(resultText);
      res.json(jsonResult);
    } catch (err: any) {
      console.error("Erro na análise do Gemini:", err);
      res.status(500).json({ error: "Falha ao analisar a segurança da atividade de risco. " + (err.message || "") });
    }
  });

  // Vite middleware flow for fullstack support inside async context
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical server boot failed:", error);
});
