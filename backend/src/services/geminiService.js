const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

const normalizeProviderModel = (requestedModel) => {
    const modelName = String(requestedModel || "").trim().toLowerCase();

    if (!modelName) {
        return DEFAULT_MODEL;
    }

    const supportedAliasMap = {
        gemini: DEFAULT_MODEL,
        claude: DEFAULT_MODEL,
        chatgpt: DEFAULT_MODEL,
        deepseek: DEFAULT_MODEL,
    };

    return supportedAliasMap[modelName] || DEFAULT_MODEL;
};

const extractText = (response) => {
    if (response?.text) {
        return response.text;
    }

    const parts = response?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
        return parts.map((part) => part?.text || "").join(" ").trim();
    }

    return "";
};

const optimizeWithGemini = async (prompt, model) => {
    try {
        console.log("Calling Gemini API...");

        const providerModel = normalizeProviderModel(model);

        const systemPrompt = `
You are PromptCatalyst.

Target AI Model: ${model || "Gemini"}

Rewrite the user's prompt to make it clear, detailed and structured.
Return ONLY the optimized prompt.
`;

        const response = await ai.models.generateContent({
            model: providerModel,
            contents: `${systemPrompt}\n\nUser Prompt:\n${prompt}`,
        });

        const optimizedPrompt = extractText(response);

        if (!optimizedPrompt) {
            throw new Error("Gemini returned an empty response.");
        }

        return optimizedPrompt;
    } catch (error) {
        console.error("Gemini Service Error:");
        console.error(error);
        throw error;
    }
};

module.exports = {
    optimizeWithGemini,
};