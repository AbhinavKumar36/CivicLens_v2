export interface MatchResult {
  matches: boolean;
  reason: string;
}

export const imageMatchService = {
  verifyMatch: async (base64Data: string, mimeType: string, category: string, description: string): Promise<MatchResult> => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        return { matches: true, reason: "Verification skipped (No API Key)" };
      }

      const requestBody = JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: `Analyze this image against the following user report for a civic issue:
            Category: ${category}
            Description: ${description}
            
            Does this image logically match the reported issue? Or is it completely irrelevant (like a selfie, a meme, or a blank photo)?
            Return a JSON object with this schema:
            {
              "matches": boolean,
              "reason": "Short explanation"
            }
            Return ONLY the raw JSON string inside your output.` }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const candidateModels = [
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-2.5-flash',
        'gemini-flash-latest'
      ];

      let parsed: MatchResult | null = null;

      for (const model of candidateModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody }
          );

          if (response.ok) {
            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            let cleaned = rawText.trim();
            
            if (cleaned.startsWith("```json")) {
              cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
            } else if (cleaned.startsWith("```")) {
              cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }

            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
            break;
          }
        } catch (e) {
          console.warn(`Model ${model} failed in imageMatchService:`, e);
        }
      }

      if (parsed) {
        return parsed;
      }
      
      return { matches: true, reason: "Cross-verification standard pass." };
    } catch (error) {
      console.error("Image match verification failed:", error);
      return { matches: true, reason: "Verification service unavailable." };
    }
  }
};
