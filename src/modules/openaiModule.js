const OpenAI = require('openai');

const openai = new OpenAI({
    organization: "org-G1Za30U9Jziz5ivfbiUvidNo",
    project: "proj_eI8KnGvRJfS7erjOZhKf1rXi",
});

async function generateIntroduction(options, initialSeedValues, prompt) {
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

async function getAIAnalysis(summaryStats, currentSeedValues, prompt) {
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