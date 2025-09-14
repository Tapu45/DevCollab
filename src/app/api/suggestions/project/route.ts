import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { SuggestionCacheService } from "@/services/SuggestionCacheService";
import { generateUserSuggestions } from "@/trigger/generateUserSuggestions";

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

        // Enqueue instead of computing synchronously
        await generateUserSuggestions.trigger({ userId: userId });

        return NextResponse.json({
            success: true,
            queued: true,
            message: "Suggestion generation queued",
        }, { status: 202 });
    } catch (error) {
        console.error("Error queuing suggestions:", error);
        return NextResponse.json(
            { error: "Failed to queue suggestions" },
            { status: 500 }
        );
    }
}