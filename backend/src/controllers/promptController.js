const { optimizeWithGemini } = require("../services/geminiService");

const optimizePrompt = async (req, res) => {
    try {

        const { prompt, model } = req.body;

        if (!prompt || !model) {
            return res.status(400).json({
                success: false,
                message: "Prompt and model are required."
            });
        }

        const optimizedPrompt = await optimizeWithGemini(prompt, model);

        res.status(200).json({
            success: true,
            optimizedPrompt
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to optimize prompt."
        });

    }
};

module.exports = {
    optimizePrompt
};