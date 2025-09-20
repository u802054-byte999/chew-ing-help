import { GoogleGenAI, Type } from "@google/genai";
import type { Handler } from "@netlify/functions";

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
  const queryPattern = inputs.map(input => input.trim() || '?').join(' ');
  return `身為一個嚴格的 JSON API，請根據以下查詢模式，找出數個最相關的繁體中文詞彙。查詢模式：[${queryPattern}]。'?' 代表任何字或發音。只回傳 JSON 陣列，不要有任何額外的文字或解釋。`;
};

const MAX_RETRIES = 3;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { inputs } = JSON.parse(event.body || '{}');
    if (!Array.isArray(inputs) || inputs.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid input: inputs array is required.' }) };
    }

    const prompt = generatePrompt(inputs);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: vocabularySchema,
                temperature: 0.5,
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
        
        const jsonText = response.text?.trim() ?? '';

        // 嘗試解析 JSON 來驗證其有效性
        if (jsonText) {
          const parsedData = JSON.parse(jsonText);
          // 確保回傳的是一個陣列
          if (Array.isArray(parsedData)) {
            return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json' },
              body: jsonText,
            };
          }
        }
        // 如果 jsonText 是空的，或解析後不是陣列，就當作失敗，進入下一次重試
        console.warn(`Attempt ${attempt} failed: Received invalid data. Retrying...`);

      } catch (e) {
        console.error(`Error during attempt ${attempt}:`, e);
        if (attempt === MAX_RETRIES) {
          // 如果是最後一次嘗試，則拋出錯誤
          throw e;
        }
      }
    }

    // 如果所有重試都失敗了
    console.error("All retries failed to get a valid response from Gemini API.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI 模型在多次嘗試後仍無法回傳有效結果，請調整您的輸入或稍後再試。' }),
    };

  } catch (error) {
    console.error("Error in Netlify function after all retries:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '後端函式執行失敗。', details: errorMessage }),
    };
  }
};
