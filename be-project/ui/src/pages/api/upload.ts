// src/pages/api/upload.ts
import type { APIRoute } from 'astro';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { insertJobProfiles } from '../../domain/jobProfileService';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response(
                JSON.stringify({ error: 'No file provided' }),
                { status: 400 }
            );
        }

        const fileBuffer = await file.arrayBuffer();
        let rawData: any[] = [];

        if (file.name.endsWith('.csv')) {
            // Handle CSV files
            const content = new TextDecoder().decode(fileBuffer);
            rawData = parse(content, {
                columns: true,
                skip_empty_lines: true
            });
        } else {
            // Handle Excel files
            const workbook = XLSX.read(fileBuffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            rawData = XLSX.utils.sheet_to_json(worksheet);
        }

        const profileMap = new Map<string, Set<string>>();

        rawData.forEach((row: any) => {
            const profileName = row.JobProfile?.trim();
            const skill = row.Skill?.trim();

            if (profileName && skill) {
                if (!profileMap.has(profileName)) {
                    profileMap.set(profileName, new Set<string>());
                }
                profileMap.get(profileName)?.add(skill);
            }
        });

        if(profileMap.size ==0)
            throw new Error("Invalid data");

        let data = Array.from(profileMap.entries()).map(([name, skillSet]) => ({
            name,
            skills: Array.from(skillSet)
          }));

        await insertJobProfiles(data);

        return new Response();
      
    } catch (error) {
        console.error('File processing error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process file' }),
            { status: 500 }
        );
    }
};
