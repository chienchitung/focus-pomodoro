import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    // In a real application, you'd want to handle this more gracefully.
    // Maybe disable the AI features and show a message to the user.
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getMotivationalQuote = async (language: string): Promise<string> => {
    try {
        const prompt = language === 'zh-TW' 
            ? '產生一句關於專注或生產力的簡短有力勵志名言，少於20個字。'
            : 'Generate a short, powerful motivational quote about focus or productivity, in less than 25 words.';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching motivational quote:", error);
        // Provide a fallback quote if the API call fails
        return "The secret of getting ahead is getting started. – Mark Twain";
    }
};

export const breakDownTask = async (taskText: string, language: string, count?: number, detail?: string): Promise<string[]> => {
    try {
        const isChinese = language === 'zh-TW';

        const promptParts = [
            'Break down the following task into smaller, actionable sub-tasks.',
        ];
        if (count && count > 0) {
            promptParts.push(`Generate around ${count} sub-tasks.`);
        }
        if (detail) {
            promptParts.push(`The level of detail for each sub-task should be ${detail}.`);
        }
        promptParts.push(`Task: "${taskText}"`);

        if (isChinese) {
            promptParts.push('Please provide the sub-tasks in Traditional Chinese.');
        }

        const contents = promptParts.join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subtasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: 'A single, actionable sub-task.'
                            }
                        }
                    },
                    required: ['subtasks']
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);

        if (result && Array.isArray(result.subtasks)) {
            return result.subtasks;
        }
        return [];

    } catch (error) {
        console.error("Error breaking down task:", error);
        return [];
    }
};