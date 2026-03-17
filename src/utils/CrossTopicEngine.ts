/**
 * CrossTopicEngine — the ecosystem connector.
 * When a user shifts between topics, this finds the bridge
 * between them instead of treating every question as isolated.
 *
 * This is what makes the chatbot feel like a conversation, not a lookup table.
 */

import type { Suggestion } from './ChatEngine';

export interface Bridge {
    text: string;
    suggestions: Suggestion[];
}

type BridgeMap = Record<string, Bridge>;

const TOPIC_GRAPH: Record<string, { related: string[]; bridges: BridgeMap }> = {
    allianz: {
        related: ['invitrace', 'skill_design_systems'],
        bridges: {
            invitrace: {
                text: "Interesting contrast — at Invitrace I built a design system from zero, at Allianz I'm extending NDBX, an established enterprise system. Both are hard in completely different ways. Building from scratch means total freedom and total responsibility. Extending means constraints everywhere, but the foundation is solid.",
                suggestions: [
                    { label: 'The from-scratch version →', payload: 'Tell me about Invitrace' },
                    { label: 'Design systems deep dive', payload: 'Tell me about design systems' },
                ]
            },
            skill_design_systems: {
                text: "NDBX is Allianz's enterprise design system — covers about 70% of what you need. The other 30% I had to build custom: ResizeObserver-based tab overflow, drag-to-resize panels, full test matrix UI. The challenge is extending without breaking the system language.",
                suggestions: [
                    { label: 'Where he built one from scratch →', payload: 'Tell me about Invitrace' },
                    { label: 'Full Allianz story', payload: 'Tell me about Allianz' },
                ]
            },
            cp_origin: {
                text: "CP Origin and Allianz are both about making complex systems navigable — but different kinds of complex. At CP Origin it was information architecture and taxonomy. At Allianz it's insurance logic and multi-state workflows. Same underlying skill, very different domain.",
                suggestions: [
                    { label: 'CP Origin full story', payload: 'Tell me about CP Origin' },
                    { label: 'Allianz full story', payload: 'Tell me about Allianz' },
                ]
            }
        }
    },

    invitrace: {
        related: ['allianz', 'skill_design_systems', 'skill_design_leadership'],
        bridges: {
            allianz: {
                text: "Both roles require systems thinking, but different pressure. At Invitrace I was building the system while managing the team using it — and serving healthcare users who couldn't afford confusion. At Allianz it's enterprise insurance — a different kind of critical.",
                suggestions: [
                    { label: 'The Allianz side →', payload: 'Tell me about Allianz' },
                    { label: 'His leadership approach', payload: 'Tell me about design leadership' },
                ]
            },
            skill_design_leadership: {
                text: "At Invitrace, managing the team while doing IC work meant being deliberate about when to lead vs when to design myself. The system I'm most proud of from that time isn't the design system — it's the review process that made the team sharper.",
                suggestions: [
                    { label: 'The design system side', payload: 'Tell me about design systems' },
                    { label: 'Full Invitrace story', payload: 'Tell me about Invitrace' },
                ]
            },
            cp_origin: {
                text: "After Invitrace's 2.75 years in healthcare, CP Origin was a shift to productivity tools — but the systems thinking carried over. The card sorting work there was the most research-heavy thing I'd done since healthcare user testing.",
                suggestions: [
                    { label: 'CP Origin story', payload: 'Tell me about CP Origin' },
                    { label: 'His research approach', payload: 'Tell me about user research' },
                ]
            }
        }
    },

    cp_origin: {
        related: ['skill_user_research', 'skill_information_architecture', 'skill_design_systems'],
        bridges: {
            skill_user_research: {
                text: "CP Origin is where research changed everything for me. Card sorting with real users showed that every navigation label we'd written made sense inside our heads — and nowhere else. That one session restructured the entire IA before a single wireframe was drawn.",
                suggestions: [
                    { label: 'His research approach', payload: 'Tell me about user research' },
                    { label: 'Full CP Origin story', payload: 'Tell me about CP Origin' },
                ]
            },
            skill_information_architecture: {
                text: "IA at CP Origin wasn't theoretical. Card sorting with users revealed that 'My Documents' and 'Files' meant entirely different things to them vs us. The structure you can't see is the structure that breaks everything.",
                suggestions: [
                    { label: 'The research behind it', payload: 'Tell me about user research' },
                    { label: 'Design systems from the same project', payload: 'Tell me about design systems' },
                ]
            },
            invitrace: {
                text: "Going from CP Origin's full lifecycle work to Invitrace's lead role was a shift in scope — from owning every artifact to owning the team's direction. Same design thinking, more leverage.",
                suggestions: [
                    { label: 'Invitrace story →', payload: 'Tell me about Invitrace' },
                    { label: 'His leadership side', payload: 'Tell me about design leadership' },
                ]
            }
        }
    },

    codefin: {
        related: ['peakaccount', 'doctoranywhere'],
        bridges: {
            peakaccount: {
                text: "Peakaccount was where I learned fintech from the ground up. Codefin came later — same domain but different challenge. Peakaccount was about building intuition. Codefin was about using it to win an award.",
                suggestions: [
                    { label: 'Peakaccount story', payload: 'Tell me about Peakaccount' },
                    { label: 'Full Codefin story', payload: 'Tell me about Codefin' },
                ]
            },
            doctoranywhere: {
                text: "Two very different high-pressure projects back to back. Codefin was short contract, high stakes, awards outcome. DoctorAnywhere was crisis design — different kind of pressure, different definition of success.",
                suggestions: [
                    { label: 'DoctorAnywhere story', payload: 'Tell me about DoctorAnywhere' },
                    { label: 'His full timeline →', payload: "What's his experience?" },
                ]
            }
        }
    },

    doctoranywhere: {
        related: ['invitrace', 'codefin'],
        bridges: {
            invitrace: {
                text: "DoctorAnywhere and Invitrace are both healthcare — but opposite ends of the spectrum. DoctorAnywhere was crisis design: ship fast, public health urgency, no time. Invitrace was sustained: 2.75 years, deep systems, real team. Both made me a better healthcare designer.",
                suggestions: [
                    { label: 'Invitrace deep dive →', payload: 'Tell me about Invitrace' },
                    { label: 'His healthcare experience', payload: "What's his experience?" },
                ]
            }
        }
    },

    peakaccount: {
        related: ['codefin'],
        bridges: {
            codefin: {
                text: "The arc from Peakaccount to Codefin is the story of going from learning fintech UX to winning an award for it. Peakaccount was foundations. Codefin was proof.",
                suggestions: [
                    { label: 'Codefin story →', payload: 'Tell me about Codefin' },
                    { label: 'Full career timeline', payload: "What's his experience?" },
                ]
            }
        }
    },

    skill_design_systems: {
        related: ['allianz', 'invitrace', 'cp_origin'],
        bridges: {
            allianz: {
                text: "At Allianz, extending NDBX meant hitting enterprise system limits and building what was missing — ResizeObserver tab overflow, drag-resize panels. Extending a mature system is a different discipline from building one fresh.",
                suggestions: [
                    { label: 'When he built one from scratch →', payload: 'Tell me about Invitrace' },
                ]
            },
            invitrace: {
                text: "Invitrace was the biggest systems project — built from zero, scaled across 3 product areas over 2.75 years, while managing the team using it. That's a different kind of ownership.",
                suggestions: [
                    { label: 'Full Invitrace story', payload: 'Tell me about Invitrace' },
                ]
            },
            skill_visual_design: {
                text: "Design systems and visual design are inseparable — the system is only as good as the visual language underneath it. The tokens, the spacing, the type scale — those ARE the visual design, systematized.",
                suggestions: [
                    { label: 'Visual design angle', payload: 'Tell me about visual design' },
                    { label: 'Systems work in practice', payload: "What's his experience?" },
                ]
            }
        }
    },

    skill_visual_design: {
        related: ['skill_design_systems'],
        bridges: {
            skill_design_systems: {
                text: "Visual design and systems thinking feed each other. A great visual language becomes meaningless without a system to scale it. And a design system without strong visual principles becomes a pile of grey boxes.",
                suggestions: [
                    { label: 'Design systems work', payload: 'Tell me about design systems' },
                    { label: 'Where he applied both →', payload: "What's his experience?" },
                ]
            }
        }
    },

    skill_user_research: {
        related: ['cp_origin', 'skill_information_architecture'],
        bridges: {
            skill_information_architecture: {
                text: "Research and IA are inseparable for me. At CP Origin, the card sorting wasn't just research — it was the direct input that shaped the IA. You can't structure information you don't understand from the user's perspective.",
                suggestions: [
                    { label: 'CP Origin story', payload: 'Tell me about CP Origin' },
                    { label: 'IA deep dive', payload: 'Tell me about information architecture' },
                ]
            }
        }
    },
};

export class CrossTopicEngine {
    checkBridge(currentTopic: string, previousTopic: string | null): Bridge | null {
        if (!previousTopic || currentTopic === previousTopic) return null;

        // Check current → previous
        const currentBridge = TOPIC_GRAPH[currentTopic]?.bridges[previousTopic];
        if (currentBridge) return currentBridge;

        // Check previous → current (bidirectional)
        const reverseBridge = TOPIC_GRAPH[previousTopic]?.bridges[currentTopic];
        if (reverseBridge) return reverseBridge;

        return null;
    }

    getRelated(topic: string): string[] {
        return TOPIC_GRAPH[topic]?.related ?? [];
    }
}
