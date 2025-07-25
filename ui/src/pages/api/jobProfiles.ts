import type { APIRoute } from 'astro';
import { deleteJobProfiles, getJobProfiles } from '../../domain/jobProfileService';

export const GET:APIRoute = async()=>{
    return new Response(
        JSON.stringify(await getJobProfiles())
    );
}

export const DELETE:APIRoute = async()=>{
    await deleteJobProfiles();
    return new Response('');
}