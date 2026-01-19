import profileData from '../data/profile_data_enhanced.json';

/**
 * ProfileData - Clean data access layer for profile information
 */
export class ProfileData {
    /**
     * Get all work experience entries
     */
    static getWorkExperience() {
        return profileData.experience.timeline;
    }

    /**
     * Get all competencies/skills
     * Flattens the categories from enhanced data
     */
    static getCompetencies() {
        const categories = Object.values(profileData.skills.categories);
        return categories.flatMap((cat: any) => cat.competencies);
    }

    /**
     * Get contact information
     */
    static getContactInfo() {
        return profileData.contact;
    }

    /**
     * Get a specific company by name (case-insensitive)
     */
    static getCompanyByName(name: string) {
        return profileData.experience.timeline.find(
            (job) => job.company.name.toLowerCase() === name.toLowerCase()
        );
    }

    /**
     * Get a specific competency by name (case-insensitive)
     */
    static getCompetencyByName(name: string) {
        const allSkills = this.getCompetencies();
        return allSkills.find(
            (skill: any) => skill.name.toLowerCase() === name.toLowerCase()
        );
    }

    /**
     * Get work experience sorted by date (most recent first)
     */
    static getWorkExperienceSorted() {
        return [...profileData.experience.timeline].sort((a, b) => {
            // Handle "present" or date strings
            const getDate = (d: string) => d.toLowerCase() === 'present' ? new Date() : new Date(d);
            const dateA = getDate(a.role.start);
            const dateB = getDate(b.role.start);
            return dateB.getTime() - dateA.getTime();
        });
    }

    /**
     * Get top N competencies
     */
    static getTopCompetencies(count: number = 5) {
        return this.getCompetencies().slice(0, count);
    }

    /**
     * Get full name data
     */
    static getFullName() {
        return profileData.identity.full_name;
    }

    /**
     * Get current role
     */
    static getCurrentRole() {
        return profileData.identity.current_title;
    }
}
