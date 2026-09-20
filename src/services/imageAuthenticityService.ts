export interface AuthenticityResult {
  status: "LIKELY_REAL" | "LIKELY_AI" | "UNCERTAIN";
  confidence: number;
  reason: string;
}

export const imageAuthenticityService = {
  checkImage: async (base64Data: string, mimeType: string): Promise<AuthenticityResult> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      
      const response = await fetch(`${apiUrl}/winston/image-detection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data, mimeType })
      });

      if (!response.ok) {
        throw new Error(`Winston Proxy Error: ${response.status}`);
      }

      const data: AuthenticityResult = await response.json();
      return data;
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
