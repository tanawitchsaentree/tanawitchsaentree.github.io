import graphData from '../data/knowledge_graph.json';
import profileData from '../../profile_data.json';

type RelationshipType = 'demonstrates' | 'applied_in' | 'foundation_for';

interface GraphResult {
    entity: string;
    relationship: string;
    target: string;
    context: string;
}

export class KnowledgeGraph {
    private relationships: any;

    constructor() {
        this.relationships = graphData.relationships;
    }

    /**
     * Find where a specific skill was demonstrated (Skill -> Experience)
     * e.g. "Where did I use React?" -> "Codefin"
     */
    findSkillUsage(skill: string): GraphResult[] {
        const results: GraphResult[] = [];
        const normalizedSkill = skill.toLowerCase();

        // Check experience_to_skills
        const expToSkills = this.relationships.experience_to_skills.examples;
        expToSkills.forEach((entry: any) => {
            if (entry.demonstrates_skills.some((s: string) => s.replace('_', ' ').toLowerCase().includes(normalizedSkill))) {
                results.push({
                    entity: skill,
                    relationship: 'demonstrated at',
                    target: this.getRealCompanyName(entry.experience_id),
                    context: this.getExperienceContext(entry.experience_id)
                });
            }
        });

        // Check skills_to_projects (if needed, but usually covered above)
        // ...

        return results;
    }

    /**
     * Find what skills were used at a company (Company -> Skills)
     */
    findCompanySkills(companyId: string): string[] {
        const expToSkills = this.relationships.experience_to_skills.examples;
        const entry = expToSkills.find((e: any) => e.experience_id === companyId);
        if (entry) {
            return entry.demonstrates_skills.map((s: string) => s.replace(/_/g, ' '));
        }
        return [];
    }

    /**
     * Helper to get nice Company Name from ID
     */
    private getRealCompanyName(id: string): string {
        switch (id) {
            case 'invitrace': return 'Invitrace';
            case 'cp_origin': return 'CP Origin';
            case 'codefin': return 'Codefin';
            case 'doctoranywhere': return 'Doctor Anywhere';
            default: return id.charAt(0).toUpperCase() + id.slice(1);
        }
    }

    /**
     * Helper to get context/description from profile_data
     */
    private getExperienceContext(id: string): string {
        // Find in profile_data
        // We need to map IDs to profile_data array
        // Simple heuristic: search company name in profile_data
        const companyName = this.getRealCompanyName(id);
        const exp = profileData.work_experience.find(e => e.company.includes(companyName));
        return exp ? exp.role : 'Product Designer';
    }
}

export const knowledgeGraph = new KnowledgeGraph();
