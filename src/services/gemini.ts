// Gemini AI Service for Workflow Intelligence
import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  WorkflowDefinition,
  NodeType,
  NODE_REGISTRY,
  AIRecommendation,
  AnomalyDetection
} from '../types/workflow'

// API key with fallback for production environments
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAWg6XO3SvNV5T3t7qMgNczv9gmM4r2aN8'

let genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    if (!API_KEY) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.')
    }
    genAI = new GoogleGenerativeAI(API_KEY)
  }
  return genAI
}

export const geminiService = {
  /**
   * Generate workflow structure from natural language description
   */
  async generateWorkflow(description: string): Promise<Partial<WorkflowDefinition>> {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })

    const nodeTypes = Object.entries(NODE_REGISTRY)
      .map(([type, meta]) => `${type}: ${meta.label} - ${meta.description}`)
      .join('\n')

    const prompt = `You are an expert healthcare workflow designer. Based on the following description, generate a workflow structure for a healthcare claims/benefits administration system.

Available node types:
${nodeTypes}

User request: "${description}"

Respond with a JSON object containing:
{
  "name": "Workflow name",
  "description": "Brief description",
  "nodes": [
    {
      "id": "unique-id",
      "type": "nodeType from list above",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Display label",
        "nodeType": "same as type",
        "config": {}
      }
    }
  ],
  "edges": [
    {
      "id": "unique-id", 
      "source": "source-node-id",
      "target": "target-node-id"
    }
  ]
}

Position nodes in a logical flow (left to right, top to bottom). Space nodes ~250px apart horizontally, ~150px vertically.
Only use valid node types from the list. Include appropriate HITL checkpoints for human oversight.
Return ONLY valid JSON, no markdown or explanation.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Clean up response (remove markdown code blocks if present)
    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    try {
      return JSON.parse(cleanedResponse)
    } catch {
      throw new Error('Failed to parse AI-generated workflow')
    }
  },

  /**
   * Analyze a document/claim and extract structured data
   */
  async analyzeDocument(
    content: string,
    extractionFields: string[]
  ): Promise<Record<string, unknown>> {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Analyze the following healthcare document and extract these fields:
${extractionFields.map((f) => `- ${f}`).join('\n')}

Document content:
${content}

Respond with a JSON object containing the extracted fields. Use null for fields that cannot be determined.
Return ONLY valid JSON, no markdown or explanation.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(cleanedResponse)
  },

  /**
   * Evaluate medical necessity for a claim
   */
  async evaluateMedicalNecessity(
    claimData: Record<string, unknown>,
    guidelines: string
  ): Promise<AIRecommendation> {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are a medical necessity reviewer for healthcare claims. Evaluate the following claim based on the provided clinical guidelines.

Claim Data:
${JSON.stringify(claimData, null, 2)}

Clinical Guidelines:
${guidelines}

Provide your evaluation as a JSON object:
{
  "decision": "approve" | "deny" | "review",
  "confidence": 0.0 to 1.0,
  "reasoning": "detailed explanation",
  "factors": [
    {
      "factor": "factor description",
      "impact": "positive" | "negative" | "neutral",
      "weight": 0.0 to 1.0
    }
  ],
  "suggestedActions": ["array of recommended next steps"]
}

Be conservative - recommend "review" for uncertain cases.
Return ONLY valid JSON, no markdown or explanation.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(cleanedResponse)
  },

  /**
   * Detect anomalies/potential fraud in claims
   */
  async detectAnomalies(
    currentClaim: Record<string, unknown>,
    historicalPatterns: string
  ): Promise<AnomalyDetection> {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `You are a fraud detection analyst for healthcare claims. Analyze the following claim for anomalies or suspicious patterns.

Current Claim:
${JSON.stringify(currentClaim, null, 2)}

Historical Patterns & Benchmarks:
${historicalPatterns}

Provide your analysis as a JSON object:
{
  "isAnomaly": true | false,
  "score": 0.0 to 1.0 (higher = more suspicious),
  "patterns": [
    {
      "type": "pattern type",
      "description": "what was detected",
      "severity": "low" | "medium" | "high" | "critical"
    }
  ],
  "recommendation": "what action to take"
}

Return ONLY valid JSON, no markdown or explanation.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(cleanedResponse)
  },

  /**
   * Get suggestions for optimizing a workflow
   */
  async suggestOptimizations(
    workflow: WorkflowDefinition
  ): Promise<Array<{ suggestion: string; priority: 'low' | 'medium' | 'high'; details: string }>> {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Analyze this healthcare workflow and suggest optimizations for efficiency, accuracy, and compliance.

Workflow:
${JSON.stringify(workflow, null, 2)}

Provide suggestions as a JSON array:
[
  {
    "suggestion": "brief suggestion title",
    "priority": "low" | "medium" | "high",
    "details": "detailed explanation of the optimization"
  }
]

Focus on:
- Adding missing HITL checkpoints for high-risk decisions
- Parallel processing opportunities
- Error handling improvements
- Compliance requirements
- Performance bottlenecks

Return ONLY valid JSON, no markdown or explanation.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(cleanedResponse)
  },

  /**
   * Chat with AI assistant about workflows
   */
  async chat(
    message: string,
    context?: { workflow?: WorkflowDefinition; selectedNode?: string }
  ): Promise<string> {
    const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' })

    let contextStr = ''
    if (context?.workflow) {
      contextStr += `\nCurrent Workflow: ${context.workflow.name}\nNodes: ${context.workflow.nodes.length}, Edges: ${context.workflow.edges.length}`
    }
    if (context?.selectedNode) {
      contextStr += `\nSelected Node: ${context.selectedNode}`
    }

    const prompt = `You are an AI assistant helping users build healthcare claims and benefits workflows in the Apex Orchestrator platform.
${contextStr}

User message: "${message}"

Provide a helpful, concise response. If the user wants to create or modify a workflow, explain what you would do.
For complex requests, break down the steps clearly.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  },
}

export default geminiService
