export interface AuthenticityResult {
  status: "LIKELY_REAL" | "LIKELY_AI" | "UNCERTAIN";
  confidence: number;
  reason: string;
}

export const imageAuthenticityService = {
  checkImage: async (base64Data: string, mimeType: string): Promise<AuthenticityResult> => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("No Gemini API Key found. Skipping authenticity check.");
        return { status: "UNCERTAIN", confidence: 0.5, reason: "API key missing for screening." };
      }

      const requestBody = JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: `Analyze this image for signs of being AI-generated, synthetically created, or heavily manipulated. Look for anomalies in lighting, physics, background elements, text rendering, impossible geometry, or lack of authentic camera noise. You are acting as an authenticity screening agent for a civic reporting app that requires real-world photographs.
            Return a JSON object with the following schema:
            {
              "status": "LIKELY_REAL" | "LIKELY_AI" | "UNCERTAIN",
              "confidence": number between 0 and 1,
              "reason": "A short, concise explanation of why you reached this conclusion."
            }
            Return ONLY the raw JSON string inside your output.` }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      });

      let response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody }
      );

      if (!response.ok) {
        // Fallback to 2.5 if 3.5 is unavailable
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: requestBody }
        );
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let cleaned = rawText.trim();
      
      // Clean markdown code blocks if Gemini returns them despite responseMimeType
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const parsed: AuthenticityResult = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
      
      return parsed;
    } catch (error) {
      console.error("Image authenticity screening failed:", error);
      return {
        status: "UNCERTAIN",
        confidence: 0,
        reason: "Screening service unavailable."
      };
    }
  }
};
