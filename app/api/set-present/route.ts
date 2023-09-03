import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function POST(request: Request) {
    const data = await request.json();

    const result = await prisma.player.update({
        where: { id: data.playerId },
        data: { present: data.isPresent },
    });

    return NextResponse.json(result);
}
