import type { APIRoute } from 'astro';
import OpenAI from "openai";


const config = {
    model :'gpt-4o'
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
export const POST: APIRoute = async ({ request }) => {
    const body = await request.json() as any;
    const summary = await summarize(body.article);
    return new Response(JSON.stringify({summary}));
}

function createPrompt(article: string): string {
    return `
      Please provide a concise summary of the following article. 
      Focus on the main points and key takeaways:

      ${article}

      Summary:
    `;
}

async function summarize(article: string): Promise<any> {
    if (!article.trim()) {
        return {
            error: "Article content cannot be empty",
        };
    }

    try {
        const response = await openai.chat.completions.create({
            model: config.model,
            messages: [
                {
                    role: "user",
                    content: createPrompt(article),
                },
            ],
        });

        const summary = response.choices[0]?.message?.content?.trim();

        if (!summary) {
            return {
                error: "Failed to generate summary",
            };
        }

        return summary;
    } catch (error) {
        console.error("Error summarizing article:", error);
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred while summarizing the article",
        };
    }
}
