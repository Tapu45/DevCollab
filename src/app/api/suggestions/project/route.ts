import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SuggestionCacheService } from "@/services/SuggestionCacheService";
import { generateUserSuggestions } from "@/trigger/generateUserSuggestions";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const suggestions = await SuggestionCacheService.getUserSuggestions(session.user.id);

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
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { force } = await request.json();

        if (force) {
            await SuggestionCacheService.invalidateUserCache(session.user.id);
        }

        // Enqueue instead of computing synchronously
        await generateUserSuggestions.trigger({ userId: session.user.id });

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