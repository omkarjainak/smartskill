import type { APIRoute } from 'astro';
import OpenAI from "openai";

const config = {
    model: 'gpt-4o'
};

const openai = new OpenAI({
    apiKey: 
});

function createPrompt(jobProfile: string, skills: string[], articles: string[]): string {
    return `Given a job profile, associated skills, and a collection of articles, analyze the content of the articles to identify and recommend new, relevant skills that would enhance the job profile. The output should be a JSON array of recommended skills, don't add any formatting or comments return only the JSON array.\n\nJob Profile: ${jobProfile}\nSkills: ${JSON.stringify(skills)}\nArticles: ${articles.map((a, i) => `\nArticle ${i+1}: ${a}`).join('')}\n\nRecommended Skills (JSON array):`;
}

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json();
    const { jobProfile, skills, articles } = body;
    const prompt = createPrompt(jobProfile, skills, articles);

    try {
        const response = await openai.chat.completions.create({
            model: config.model,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const content = response.choices[0]?.message?.content?.trim();
        console.log("Recommendations API output:", content);
        let recommendedSkills: any[] = [];
        try {
            const parsed = JSON.parse(content || '[]');
            if (Array.isArray(parsed)) {
                recommendedSkills = parsed;
            } else {
                recommendedSkills = [];
            }
        } catch (e) {
            // If not valid JSON, fallback to empty array
            recommendedSkills = [];
        }

        return new Response(
            JSON.stringify({ recommendedSkills }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error("Error getting recommendations:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}; 