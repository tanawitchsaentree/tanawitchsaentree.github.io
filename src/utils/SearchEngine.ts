import MiniSearch from 'minisearch';
import profileData from '../data/profile_data_enhanced.json';

interface SearchResult {
    id: string;
    type: 'experience' | 'skill' | 'education' | 'project';
    title: string;
    description: string;
    score: number;
    [key: string]: any;
}

export class SearchEngine {
    private miniSearch: MiniSearch;
    private isInitialized: boolean = false;

    constructor() {
        this.miniSearch = new MiniSearch({
            fields: ['title', 'description', 'company', 'role', 'category', 'keywords'], // Fields to index
            storeFields: ['title', 'description', 'company', 'role', 'link', 'type', 'start_date', 'end_date'], // Fields to return
            searchOptions: {
                boost: { title: 3, company: 2, keywords: 2 },
                fuzzy: 0.2,
                prefix: true
            }
        });
        this.init();
    }

    private init() {
        if (this.isInitialized) return;

        const documents: any[] = [];

        // 1. Index Work Experience
        profileData.experience.timeline.forEach((exp, index) => {
            documents.push({
                id: `exp-${index}`,
                type: 'experience',
                title: exp.role.title,
                company: exp.company.name,
                role: exp.role.title,
                description: exp.storytelling.detailed || exp.storytelling.medium,
                keywords: `${exp.company.name} ${exp.role.title} ${exp.impact.headline}`,
                link: exp.company.url,
                start_date: exp.role.start,
                end_date: exp.role.end
            });
        });

        // 2. Index Skills
        // Flatten skills from categories
        if (profileData.skills && profileData.skills.categories) {
            const categories = Object.values(profileData.skills.categories);
            categories.forEach((cat: any, catIndex: number) => {
                if (cat.competencies) {
                    cat.competencies.forEach((comp: any, compIndex: number) => {
                        documents.push({
                            id: `skill-${catIndex}-${compIndex}`,
                            type: 'skill',
                            title: comp.name,
                            description: comp.description,
                            category: cat.label,
                            keywords: `${comp.name} ${comp.description} ${cat.label}`
                        });
                    });
                }
            });
        }

        // 3. Index Education
        if (profileData.education) {
            profileData.education.forEach((edu, index) => {
                // Ensure edu.field exists in the new structure (it is 'field' in enhanced)
                documents.push({
                    id: `edu-${index}`,
                    type: 'education',
                    title: edu.degree_type === 'bachelor' ? "Bachelor's Degree" : "Diploma",
                    company: edu.institution,
                    description: `${edu.field} at ${edu.location}`,
                    keywords: `${edu.institution} ${edu.field} ${edu.degree_type}`
                });
            });
        }

        this.miniSearch.addAll(documents);
        this.isInitialized = true;
        console.log(`[🧠 Cortex] System Indexed ${documents.length} knowledge nodes.`);
    }

    /**
     * Search the memory bank for relevant info
     */
    public search(query: string, limit: number = 3): SearchResult[] {
        const results = this.miniSearch.search(query);
        return results.slice(0, limit) as any as SearchResult[];
    }
}

// Singleton instance
export const searchEngine = new SearchEngine();
