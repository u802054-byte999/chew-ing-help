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

    return `請生成符合以下模式的常見繁體中文詞彙列表：${patternDescription}。詞彙長度最多為四個字。如果找不到完全符合的詞彙，請提供最相關的結果。`;
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

    const systemInstruction = `你是一位專業的繁體中文（Traditional Chinese）語言導師，專精於詞彙學。你的任務是為語言學習者提供清晰、準確且有幫助的資訊。`;
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
    
    const jsonText = response.text?.trim() ?? '';

    if (!jsonText) {
      console.error("Gemini API returned an empty response.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'AI 模型沒有回傳任何結果，可能是因為找不到符合的詞彙或觸發了內容安全限制。' }),
      };
    }

    try {
      // 驗證 Gemini 回傳的是否為有效的 JSON
      JSON.parse(jsonText);
    } catch (e) {
      console.error("Gemini API returned invalid JSON:", jsonText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'AI 模型回傳了格式不正確的資料。' }),
      };
    }
    
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
