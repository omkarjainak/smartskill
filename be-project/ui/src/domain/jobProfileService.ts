// jobProfileService.ts

import { createClient } from "@supabase/supabase-js";
import config from "../config.js"
import type { JobProfileModel, JobProfileSkill } from "./models.js";

const supabase = createClient(config.ProjectURL, config.ServiceRole);
const userId = "";


export async function getJobProfiles() {
    const { error, data } = await supabase.from('JobProfiles')
        .select(`*, JobProfileSkills(*)`);
    if (error != null)
        throw new Error(error.message);
    return data;

}

export async function deleteJobProfiles(){
    await supabase.from('JobProfiles').delete().neq("id", 0);
    await supabase.from('JobProfileSkills').delete().neq("id", 0);
}

export async function insertJobProfiles(jobProfiles: JobProfileModel[]) {
    const { data: insertedProfiles, error: profileError } = await supabase
        .from('JobProfiles')
        .insert(jobProfiles.map(x => {
            return {
                JobProfile: x.name,
                UserId: userId
            }
        }))
        .select();

    if (profileError) {
        throw new Error(`Error inserting job profiles: ${profileError.message}`);
    }

    console.log(insertedProfiles);
    const skillsToInsert: Omit<JobProfileSkill, "id" | "created_at">[] = [];

    insertedProfiles.forEach(profile => {
        var skills = jobProfiles.find(x => x.name == profile.JobProfile)?.skills;
        if (skills) {
            skills.forEach(skill => {
                skillsToInsert.push({
                    Skill: skill,
                    isActive: true,
                    JobProfileId: profile.id
                });
            })
        }
    });

    // Insert skills
    const { error: skillsError } = await supabase
        .from("JobProfileSkills")
        .insert(skillsToInsert);

    if (skillsError) {
        throw new Error(`Error inserting skills: ${skillsError.message}`);
    }

}




// /**
//  * Inserts job profiles and their associated skills into the database
//  * @param supabase - Supabase client instance
//  * @param jobProfiles - Array of job profiles with their skills
//  * @param userId - User ID for association
//  * @returns Object containing success status and any error messages
//  */
// async function insertJobProfilesWithSkills(
//   jobProfiles: JobProfileModel[],
//   userId: string
// ): Promise<{ success: boolean; error?: string; data?: any }> {
//   try {
//     // Start a Supabase transaction
//     const { data: insertedProfiles, error: profileError } = await supabase
//       .from("JobProfiles")
//       .insert(
//         jobProfiles.map((profile) => ({
//           JobProfile: profile.name,
//           UserId: userId,
//         }))
//       )
//       .select();

//     if (profileError) {
//       throw new Error(`Error inserting job profiles: ${profileError.message}`);
//     }

//     if (!insertedProfiles) {
//       throw new Error("No profiles were inserted");
//     }

//     // Prepare skills data for insertion
//     const skillsToInsert: Omit<DbJobProfileSkill, "id" | "created_at">[] = [];
//     insertedProfiles.forEach((profile: DbJobProfile, index: number) => {
//       const profileSkills = jobProfiles[index].skills;
//       profileSkills.forEach((skill) => {
//         skillsToInsert.push({
//           JobProfileId: profile.id,
//           Skill: skill,
//           isActive: true,
//         });
//       });
//     });

//     // Insert skills
//     const { error: skillsError } = await supabase
//       .from("JobProfileSkills")
//       .insert(skillsToInsert);

//     if (skillsError) {
//       throw new Error(`Error inserting skills: ${skillsError.message}`);
//     }

//     return {
//       success: true,
//       data: {
//         profiles: insertedProfiles,
//         skillsCount: skillsToInsert.length,
//       },
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Unknown error occurred",
//     };
//   }
// }

// // Example usage:
// const exampleUsage = async () => {
//   const supabase = createClient<Database>(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_ANON_KEY!
//   );



//   const userId = "some-user-uuid";

//   const result = await insertJobProfilesWithSkills(supabase, jobProfiles, userId);
//   console.log(result);
// };
