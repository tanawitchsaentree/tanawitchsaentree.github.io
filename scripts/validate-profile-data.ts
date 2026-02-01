import profileData from '../profile_data.json' assert { type: 'json' };

interface WorkExperience {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
  link: string;
  summary?: string;
  achievements?: string[];
}

interface Competency {
  name: string;
  description: string;
}

interface Intent {
  keywords: string[];
  response: string[];
}

interface ProfileData {
  full_name: {
    primary_response: string;
    extra_notes: string[];
  };
  current_role: string;
  career_outlook: string;
  work_experience: WorkExperience[];
  competencies: Competency[];
  intents: Record<string, Intent>;
}

// Assigning to ProfileData triggers TypeScript's structural validation
const data: ProfileData = profileData;

export default data;
