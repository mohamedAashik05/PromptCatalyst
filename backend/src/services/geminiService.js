const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
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

const optimizePromptLocally = (prompt, model) => {
    const safePrompt = String(prompt || "").trim();
    const targetModel = String(model || "Gemini").trim() || "Gemini";

    if (!safePrompt) {
        throw new Error("Prompt and model are required.");
    }

    const cleanPrompt = safePrompt.replace(/\s+/g, " ").trim();

    return `You are a prompt engineering expert for ${targetModel}. Rewrite the prompt below to be more effective for that model, following these rules:

1. Preserve the original intent — don't add scope the user didn't ask for.
2. State the goal in one clear sentence.
3. Add only constraints that are missing but implied (format, length, tone, edge cases) — skip anything already clear.
4. If the task benefits from step-by-step reasoning, say so explicitly.
5. Specify output format only if it's ambiguous.
6. Keep the result as short as possible while losing no meaning — no filler like "please" or "I would like you to."

Original: "${cleanPrompt}"

Return ONLY the optimized prompt. No preamble, no explanation, no labels.
Do not exceed ${Math.ceil(cleanPrompt.length * 1.5)} characters unless absolutely necessary.`;
};

const optimizeWithGemini = async (prompt, model) => {
    try {
        const providerModel = normalizeProviderModel(model);
        const hasApiKey = Boolean(process.env.GEMINI_API_KEY);

        if (!hasApiKey) {
            console.warn("GEMINI_API_KEY missing. Falling back to local prompt optimization.");
            return optimizePromptLocally(prompt, model);
        }

        console.log("Calling Gemini API...");

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
        const status = error?.status || error?.code;
        const isPermittedFallback = status === 403 || status === 401 || status === 400;

        if (isPermittedFallback) {
            console.warn("Gemini request failed. Falling back to local prompt optimization.");
            return optimizePromptLocally(prompt, model);
        }

        console.error("Gemini Service Error:");
        console.error(error);
        throw error;
    }
};

module.exports = {
    optimizeWithGemini,
};