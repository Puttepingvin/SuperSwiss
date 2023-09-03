import { PrismaClient, Player } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function POST(request: Request) {
    const data: { present: boolean } = await request.json();

    const result = await prisma.player.updateMany({
        where: { deleted: false },
        data: { present: data.present },
    });

    return NextResponse.json(result);
}
