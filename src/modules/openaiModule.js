const OpenAI = require('openai');

function createOpenAIClient(options = {}) {
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    const organization = options.organization || process.env.OPENAI_ORGANIZATION;
    const project = options.project || process.env.OPENAI_PROJECT;

    if (!apiKey) {
        throw new Error('OpenAI API key is required');
    }

    return new OpenAI({
        apiKey,
        organization,
        project,
    });
}

async function generateIntroduction(options, initialSeedValues, prompt, openAIOptions = {}) {
    const openai = createOpenAIClient(openAIOptions);
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant specialized in statistical analysis." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating introduction:', error);
        return "<p>An error occurred while generating the introduction.</p>";
    }
}

async function getAIAnalysis(summaryStats, currentSeedValues, prompt, openAIOptions = {}) {
    const openai = createOpenAIClient(openAIOptions);
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant specialized in statistical analysis." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('Error in AI analysis:', error);
        return null;
    }
}

module.exports = {
    generateIntroduction,
    getAIAnalysis
};