import { Player } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET(request: Request) {
    const players = await prisma.player.findMany({
        where: { deleted: true },
    });

    return NextResponse.json(players);
}

export async function POST(request: Request) {
    const data: Player = await request.json();

    const result = await prisma.player.update({
        where: { id: data.id },
        data: { deleted: true },
    });

    return NextResponse.json(result);
}
