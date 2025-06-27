import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function generateAIResponse(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function validateDataWithAI(data: any[], dataType: string): Promise<string[]> {
  const prompt = `
    Analyze the following ${dataType} data for potential issues, inconsistencies, or anomalies.
    Look for patterns that might indicate data quality problems beyond basic validation rules.
    
    Data: ${JSON.stringify(data.slice(0, 10))} // First 10 rows for analysis
    
    Return a JSON array of issue descriptions. Focus on business logic violations, unusual patterns, or data quality concerns.
  `;
  
  try {
    const response = await generateAIResponse(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('AI validation error:', error);
    return [];
  }
}

export async function parseNaturalLanguageQuery(query: string, availableFields: string[]): Promise<any> {
  const prompt = `
    Convert this natural language query into a filter object for data searching:
    Query: "${query}"
    Available fields: ${availableFields.join(', ')}
    
    Return a JSON object with filter conditions. Use operators like 'contains', 'equals', 'greaterThan', 'lessThan'.
    Example: {"ClientName": {"operator": "contains", "value": "Acme"}, "PriorityLevel": {"operator": "lessThan", "value": 3}}
  `;
  
  try {
    const response = await generateAIResponse(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Query parsing error:', error);
    return {};
  }
}

export async function generateRuleFromNaturalLanguage(description: string, availableData: any): Promise<any> {
  const prompt = `
    Convert this natural language rule description into a structured rule object:
    Description: "${description}"
    Available data context: ${JSON.stringify(availableData)}
    
    Return a JSON object with: {type, parameters, description, priority}
    Rule types: 'coRun', 'slotRestriction', 'loadLimit', 'phaseWindow', 'patternMatch', 'precedence'
  `;
  
  try {
    const response = await generateAIResponse(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Rule generation error:', error);
    return null;
  }
}

export async function suggestDataCorrections(errors: any[], data: any[]): Promise<any[]> {
  const prompt = `
    Given these validation errors and data sample, suggest specific corrections:
    Errors: ${JSON.stringify(errors)}
    Data sample: ${JSON.stringify(data.slice(0, 5))}
    
    Return a JSON array of correction suggestions with: {row, column, currentValue, suggestedValue, reason}
  `;
  
  try {
    const response = await generateAIResponse(prompt);
    return JSON.parse(response);
  } catch (error) {
    console.error('Correction suggestion error:', error);
    return [];
  }
}

