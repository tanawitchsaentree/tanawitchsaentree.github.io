import profileData from '../../profile_data.json';

/**
 * ProfileData - Clean data access layer for profile information
 */
export class ProfileData {
    /**
     * Get all work experience entries
     */
    static getWorkExperience() {
        return profileData.work_experience;
    }

    /**
     * Get all competencies/skills
     */
    static getCompetencies() {
        return profileData.competencies;
    }

    /**
     * Get contact information
     */
    static getContactInfo() {
        return profileData.contact_info;
    }

    /**
     * Get a specific company by name (case-insensitive)
     */
    static getCompanyByName(name: string) {
        return profileData.work_experience.find(
            (job: any) => job.company.toLowerCase() === name.toLowerCase()
        );
    }

    /**
     * Get a specific competency by name (case-insensitive)
     */
    static getCompetencyByName(name: string) {
        return profileData.competencies.find(
            (skill: any) => skill.name.toLowerCase() === name.toLowerCase()
        );
    }

    /**
     * Get work experience sorted by date (most recent first)
     */
    static getWorkExperienceSorted() {
        return [...profileData.work_experience].sort((a, b) => {
            const dateA = new Date(a.start_date);
            const dateB = new Date(b.start_date);
            return dateB.getTime() - dateA.getTime();
        });
    }

    /**
     * Get top N competencies
     */
    static getTopCompetencies(count: number = 5) {
        return profileData.competencies.slice(0, count);
    }

    /**
     * Get full name data
     */
    static getFullName() {
        return profileData.full_name;
    }

    /**
     * Get current role
     */
    static getCurrentRole() {
        return profileData.current_role;
    }
}
