import type { APIRoute } from 'astro';

const API_CONFIG = {
    URL: "https://google-search74.p.rapidapi.com"
}

function validateJobProfile(jobProfile: string): string | null {
    if (!jobProfile) {
        return "Job Profile is required";
    }

    if (jobProfile.length < 2) {
        return "Job Profile must be at least 2 characters long";
    }

    if (jobProfile.length > 100) {
        return "Job Profile must not exceed 100 characters";
    }

    if (!/^[a-zA-Z0-9\s-]+$/.test(jobProfile)) {
        return "Job Profile contains invalid characters";
    }

    return null;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json() as any;
        const validationError = validateJobProfile(body.jobProfile);
        if (validationError) {
            return new Response(
                JSON.stringify({ error: validationError }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const sanitizedjobProfile = body.jobProfile
            .trim()
            .replace(/[^\w\s-]/g, '')
            .substring(0, 100);

        const data = await Search(sanitizedjobProfile);

        return new Response(JSON.stringify({ data }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                // Add CORS headers if needed
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        console.error("API Error:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error occurred",
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }

}

async function Search(jobprofile: string) {

    const baseQuery = `site:linkedin.com OR site:forbes.com "skills prediction trends for future jobs based on ${jobprofile} job description" after:2025-01-23`;

    const url = new URL(API_CONFIG.URL);
    url.searchParams.append("query", baseQuery);
    url.searchParams.append("limit", "5");
    url.searchParams.append("related_keywords", "true");

    const headers = {
        'x-rapidapi-key': "64c61d81e9mshd259d99efdd4233p15c031jsn02d9f42adb58",
        'x-rapidapi-host': "google-search74.p.rapidapi.com"
    };

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

}