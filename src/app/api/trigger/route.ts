import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { TriggerClient } from "@/trigger/client";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { action, targetUserId } = await request.json();

        if (action === "generate-suggestions") {
            const targetUser = targetUserId || userId;
            const handle = await TriggerClient.triggerUserSuggestions(targetUser);

            return NextResponse.json({
                success: true,
                runId: handle.id,
                message: "Suggestion generation triggered"
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error in trigger API:", error);
        return NextResponse.json(
            { error: "Failed to trigger task" },
            { status: 500 }
        );
    }
}