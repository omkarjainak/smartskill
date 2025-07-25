import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import config from '../../config.ts';

const supabase = createClient(config.ProjectURL, config.ServiceRole);

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { jobProfileId, skills } = body;
        if (!jobProfileId || !Array.isArray(skills)) {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid input' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        // Deduplicate skills
        const uniqueSkills = Array.from(new Set(skills.map(s => s.trim()).filter(Boolean)));
        // Prepare for insert
        const skillsToInsert = uniqueSkills.map(skill => ({
            Skill: skill,
            isActive: true,
            JobProfileId: jobProfileId
        }));
        // Insert into JobProfileSkills
        const { error } = await supabase
            .from('JobProfileSkills')
            .insert(skillsToInsert);
        if (error) {
            return new Response(
                JSON.stringify({ success: false, error: error.message }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (e: any) {
        return new Response(
            JSON.stringify({ success: false, error: e?.message || 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}; 