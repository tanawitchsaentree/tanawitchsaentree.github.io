import flowData from '../data/conversation_flows.json';

export interface SessionToken {
    currentNodeId: string;
    history: string[];
    variables: Record<string, any>;
    isFlowActive: boolean;
}

interface FlowNode {
    id: string;
    message: string;
    suggestions?: string[];
    command?: { type: string; value: string };
    transitions: {
        trigger: string;
        target: string;
        condition?: string;
    }[];
}

export class FlowEngine {
    private nodes: Record<string, FlowNode>;

    constructor() {
        this.nodes = (flowData as any).nodes;
    }

    /**
     * Create a fresh token
     */
    createToken(): SessionToken {
        return {
            currentNodeId: 'root',
            history: [],
            variables: {},
            isFlowActive: false
        };
    }

    /**
     * Process User Input against Current Token
     */
    process(token: SessionToken, input: string): {
        nextToken: SessionToken;
        response: { text: string; suggestions?: string[]; command?: any } | null
    } {
        const normalizedInput = input.toLowerCase().trim();
        const currentNode = this.nodes[token.currentNodeId];

        // 1. Check Transitions from Current Node
        if (currentNode && currentNode.transitions) {
            const match = currentNode.transitions.find(t => {
                if (t.trigger === '*') return true;
                return normalizedInput.includes(t.trigger);
            });

            if (match) {
                // Transition Found!
                const nextNodeId = match.target;
                const nextNode = this.nodes[nextNodeId];

                if (nextNode) {
                    // Update Token
                    const nextToken = {
                        ...token,
                        currentNodeId: nextNodeId,
                        history: [...token.history, token.currentNodeId],
                        isFlowActive: true
                    };

                    // Construct Response
                    return {
                        nextToken,
                        response: {
                            text: nextNode.message,
                            suggestions: nextNode.suggestions,
                            command: nextNode.command
                        }
                    };
                }
            }
        }

        // No transition found - Return null (Fallback to LumoAI)
        return { nextToken: token, response: null };
    }
}
