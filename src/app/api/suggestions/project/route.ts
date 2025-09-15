import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { SuggestionCacheService } from "@/services/SuggestionCacheService";

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const suggestions = await SuggestionCacheService.getUserSuggestions(userId);

        return NextResponse.json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return NextResponse.json(
            { error: "Failed to fetch suggestions" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { force } = await request.json();

        if (force) {
            await SuggestionCacheService.invalidateUserCache(userId);
        }

        // Compute synchronously with Groq-backed AIService (no Trigger.dev)
        const res = await SuggestionCacheService.generateAndCacheSuggestions(userId);

        return NextResponse.json({
            success: true,
            queued: false,
            data: res,
        }, { status: 200 });
    } catch (error) {
        console.error("Error generating suggestions:", error);
        return NextResponse.json(
            { error: "Failed to generate suggestions" },
            { status: 500 }
        );
    }
}