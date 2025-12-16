import MiniSearch from 'minisearch';
import profileData from '../../profile_data.json';

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

        const documents = [];

        // 1. Index Work Experience
        profileData.work_experience.forEach((exp, index) => {
            documents.push({
                id: `exp-${index}`,
                type: 'experience',
                title: exp.role,
                company: exp.company,
                role: exp.role,
                description: exp.description || exp.summary,
                keywords: `${exp.company} ${exp.role} ${exp.description}`,
                link: exp.link,
                start_date: exp.start_date,
                end_date: exp.end_date
            });
        });

        // 2. Index Skills
        // Flatten skills from categories
        if (profileData.competencies) {
            profileData.competencies.forEach((comp: any, index: number) => { // Use 'any' or define interface to avoid TS error
                documents.push({
                    id: `skill-cat-${index}`,
                    type: 'skill',
                    title: comp.name,
                    description: comp.description,
                    category: 'Competency',
                    keywords: `${comp.name} ${comp.description}`
                });
            });
        }

        // 3. Index Education
        if (profileData.education) {
            profileData.education.forEach((edu, index) => {
                documents.push({
                    id: `edu-${index}`,
                    type: 'education',
                    title: edu.degree,
                    company: edu.institution,
                    description: `${edu.field} at ${edu.location}`,
                    keywords: `${edu.institution} ${edu.field}`
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
