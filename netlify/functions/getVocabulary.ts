import { GoogleGenAI, Type } from "@google/genai";
import type { Handler } from "@netlify/functions";

interface VocabularyEntry {
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
}

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set in Netlify build environment");
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

const generatePrompt = (inputs: string[]): string => {
    const patternDescription = inputs.map((input, index) => {
        const trimmedInput = input.trim();
        if (trimmedInput) {
            return `第 ${index + 1} 個位置是「${trimmedInput}」(可能是國字或注音)`;
        }
        return `第 ${index + 1} 個位置是任意字`;
    }).join('，');

    return `請生成一個常見的繁體中文詞彙列表，這些詞彙需符合以下模式：${patternDescription}。詞彙長度應為 1 到 4 個字。對於每個詞彙，請提供以下資訊：
1.  完整的注音符號。
2.  繁體中文的簡潔定義。
3.  一個自然的繁體中文例句。

請根據提供的 JSON schema 格式化你的輸出。如果找不到完全符合的詞彙，請提供最相關的結果。`;
}


export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { inputs } = JSON.parse(event.body || '{}');

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input: inputs array is required.' }),
      };
    }

    const systemInstruction = `你是一位專業的繁體中文（Traditional Chinese）語言導師，專精於詞彙學。你的任務是為語言學習者提供清晰、準確且有幫助的資訊。請只回傳 JSON 格式的資料。`;
    const prompt = generatePrompt(inputs);

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
    // The Gemini response is already a JSON string because of the schema, no need to re-parse and stringify
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonText,
    };

  } catch (error) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch vocabulary data.' }),
    };
  }
};
