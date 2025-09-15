// src/lib/groqClient.ts
import Groq from "groq-sdk";

const API_KEY = process.env.GROQ_API_KEY!;
const groq = new Groq({ apiKey: API_KEY });

export type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

type Options = {
    temperature?: number;
    max_tokens?: number;
};

function estimateTokens(text: string) {
    // very rough: ~4 chars/token
    return Math.ceil((text || "").length / 4);
}

export const GroqChat = {
    async json(model: string, messages: ChatMessage[], opts: Options = {}) {
        const response = await groq.chat.completions.create({
            model,
            messages,
            temperature: opts.temperature ?? 0.2,
            max_tokens: opts.max_tokens ?? 800,
            response_format: { type: "json_object" },
        });

        // Track rate limits (if you’re using ./rateLimits)
        await import("./rateLimits").then(({ RateLimits }) => {
            RateLimits.record(model, {
                ok: true,
                status: 200,
                headers: new Headers(), 
                estInputTokens: estimateTokens(JSON.stringify(messages)),
            });
        });

        const content = response.choices[0]?.message?.content;
        if (typeof content !== "string") {
            throw new Error("Invalid Groq response content");
        }

        return content.trim();
    },
};
