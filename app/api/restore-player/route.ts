import { PrismaClient, Player } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function POST(request: Request) {
    const data: Player = await request.json();

    const result = await prisma.player.update({
        where: { id: data.id },
        data: { deleted: false },
    });

    return NextResponse.json(result);
}
