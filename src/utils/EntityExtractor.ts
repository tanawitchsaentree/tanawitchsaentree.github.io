/**
 * EntityExtractor - Extract structured data from natural language
 */

import entityPatterns from '../data/entity_patterns.json';
import { FuzzyMatcher } from './FuzzyMatcher';

export interface ExtractedEntity {
    type: string;
    value: string;
    confidence: number;
    position: number;
}

export class EntityExtractor {
    private fuzzyMatcher: FuzzyMatcher;

    constructor() {
        this.fuzzyMatcher = new FuzzyMatcher(0.8);
    }

    /**
     * Extract all entities from query
     */
    extract(query: string): ExtractedEntity[] {
        const entities: ExtractedEntity[] = [];

        for (const [entityType, entityData] of Object.entries(entityPatterns.entities)) {
            const extracted = this.extractEntityType(query, entityType, entityData as any);
            entities.push(...extracted);
        }

        // Sort by confidence descending
        return entities.sort((a, b) => b.confidence - a.confidence);
    }

    /**
     * Extract specific entity type
     */
    extractEntityType(query: string, type: string, entityData: any): ExtractedEntity[] {
        const entities: ExtractedEntity[] = [];

        // 1. Try known entities first (most accurate)
        if (entityData.known_entities) {
            for (const known of entityData.known_entities) {
                const position = query.toLowerCase().indexOf(known.toLowerCase());
                if (position !== -1) {
                    entities.push({
                        type,
                        value: known,
                        confidence: 1.0,
                        position
                    });
                } else if (entityData.fuzzy_match) {
                    // Fuzzy match for known entities
                    const words = query.split(/\s+/);
                    for (let i = 0; i < words.length; i++) {
                        const match = this.fuzzyMatcher.smartMatch(words[i], known);
                        if (match.matches) {
                            entities.push({
                                type,
                                value: known,
                                confidence: match.score * 0.9, // Slightly reduce confidence for fuzzy
                                position: i
                            });
                        }
                    }
                }
            }
        }

        // 2. Try regex patterns
        if (entityData.patterns && entities.length === 0) {
            for (const pattern of entityData.patterns) {
                const regex = new RegExp(pattern, 'gi');
                let match;
                while ((match = regex.exec(query)) !== null) {
                    const value = match[1] || match[0];
                    entities.push({
                        type,
                        value: value.trim(),
                        confidence: 0.8,
                        position: match.index
                    });
                }
            }
        }

        // 3. Apply aliases
        if (entityData.aliases && entities.length > 0) {
            entities.forEach(entity => {
                const aliasKey = entity.value.toLowerCase();
                if ((entityData.aliases as any)[aliasKey]) {
                    entity.value = (entityData.aliases as any)[aliasKey];
                }
            });
        }

        // Get extraction rules for this type
        const rules = (entityPatterns.extraction_rules as any)[type];
        if (rules && rules.max_extractions) {
            // Limit number of extractions
            return entities.slice(0, rules.max_extractions);
        }

        return entities;
    }

    /**
     * Extract specific entity type
     */
    extractEntity(query: string, type: string): ExtractedEntity | null {
        const entityData = (entityPatterns.entities as any)[type];
        if (!entityData) return null;

        const entities = this.extractEntityType(query, type, entityData);
        return entities.length > 0 ? entities[0] : null;
    }

    /**
     * Check for entity relationships
     */
    findRelationships(entities: ExtractedEntity[]): Array<{
        type: string;
        entities: ExtractedEntity[];
        pattern: string;
    }> {
        const relationships: Array<{
            type: string;
            entities: ExtractedEntity[];
            pattern: string;
        }> = [];

        for (const [relKey, relData] of Object.entries(entityPatterns.entity_relationships)) {
            const [type1, type2] = relKey.split(' + ');

            const entity1 = entities.find(e => e.type === type1);
            const entity2 = entities.find(e => e.type === type2);

            if (entity1 && entity2) {
                relationships.push({
                    type: (relData as any).type,
                    entities: [entity1, entity2],
                    pattern: (relData as any).query_pattern
                });
            }
        }

        return relationships;
    }
}
