import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const analyzeHealthResult = async (score: number, age: string, symptoms: string) => {
    try {
        const ai = getClient();
        const model = "gemini-2.5-flash";
        
        const prompt = `
        Aja como um cardiologista especialista vascular experiente.
        O usuário calculou seu Índice Tornozelo-Braquial (ITB/ABI) e o resultado foi: ${score}.
        Idade do usuário: ${age || 'Não informada'}.
        Sintomas relatados: ${symptoms || 'Nenhum'}.

        Com base APENAS neste resultado e nas diretrizes médicas padrão (TASC II, AHA):
        1. Explique o que este número significa em linguagem simples para um paciente.
        2. Dê 3 recomendações práticas de estilo de vida (focadas em quem tem pressão alta).
        3. Indique sinais de alerta que exigiriam ida imediata ao médico.
        
        Mantenha o tom profissional, empático, mas direto. Use formatação Markdown.
        IMPORTANTE: Sempre inclua um aviso de que isso não substitui uma consulta médica real.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                safetySettings: [
                    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                ],
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing results:", error);
        throw error;
    }
};

export const scanHandwrittenNote = async (base64Image: string) => {
    try {
        const ai = getClient();
        const model = "gemini-2.5-flash";

        const prompt = `
        Analise esta imagem de anotações médicas ou monitor de pressão arterial.
        Identifique dois números principais para o cálculo do ITB (Índice Tornozelo-Braquial):
        1. Pressão Sistólica do Braço (Arm Systolic) - geralmente o valor mais alto se houver dois braços, ou em torno de 100-180.
        2. Pressão Sistólica do Tornozelo (Ankle Systolic) - valor medido na perna.

        Retorne APENAS um objeto JSON (sem markdown, sem crases) com este formato:
        {
           "armSystolic": number | null,
           "ankleSystolic": number | null
        }
        
        Se não conseguir identificar claramente, retorne null nos campos.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Image
                        }
                    },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Error scanning image:", error);
        throw error;
    }
}