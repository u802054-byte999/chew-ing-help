import type { VocabularyEntry } from "../types";

export const fetchVocabulary = async (inputs: string[]): Promise<VocabularyEntry[]> => {
  try {
    const response = await fetch('/.netlify/functions/getVocabulary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data = await response.json();
    return data as VocabularyEntry[];

  } catch (error) {
    console.error("Error fetching vocabulary from backend function:", error);
    throw new Error("Failed to fetch or parse vocabulary data.");
  }
};
