import { GoogleGenAI, Type } from "@google/genai";
import type { VocabularyEntry } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const vocabularySchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            word: {
                type: Type.STRING,
                description: '詞彙本身 (例如: 學習)',
            },
            pronunciation: {
                type: Type.STRING,
                description: '詞彙的完整注音符號 (例如: ㄒㄩㄝˊ ㄒㄧˊ)',
            },
            definition: {
                type: Type.STRING,
                description: '詞彙的簡潔中文解釋',
            },
            example: {
                type: Type.STRING,
                description: '使用該詞彙的中文例句',
            },
        },
        required: ['word', 'pronunciation', 'definition', 'example'],
    },
};

export const fetchVocabulary = async (inputs: string[]): Promise<VocabularyEntry[]> => {
    const systemInstruction = `你是一位專業的繁體中文（Traditional Chinese）語言導師，專精於詞彙學。你的任務是為語言學習者提供清晰、準確且有幫助的資訊。請只回傳 JSON 格式的資料。`;
    
    const nonEmptyInputs = inputs
        .map((input, index) => ({ value: input.trim(), index }))
        .filter(item => item.value !== '');

    if (nonEmptyInputs.length === 0) {
        return [];
    }
    
    const patternDescription = inputs.map((input, index) => {
        const trimmedInput = input.trim();
        if (trimmedInput) {
            return `第 ${index + 1} 個位置是「${trimmedInput}」(可能是國字或注音)`;
        }
        return `第 ${index + 1} 個位置是任意字`;
    }).join('，');

    const prompt = `請生成一個常見的繁體中文詞彙列表，這些詞彙需符合以下模式：${patternDescription}。詞彙長度應為 1 到 4 個字。對於每個詞彙，請提供以下資訊：
1.  完整的注音符號。
2.  繁體中文的簡潔定義。
3.  一個自然的繁體中文例句。

請根據提供的 JSON schema 格式化你的輸出。如果找不到完全符合的詞彙，請提供最相關的結果。`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: vocabularySchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as VocabularyEntry[];

    } catch (error) {
        console.error("Error fetching vocabulary from Gemini API:", error);
        throw new Error("Failed to fetch or parse vocabulary data.");
    }
};
