import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET() {
    const tournament = await prisma.tournament.findFirst({
        where: { active: true },
    });

    return NextResponse.json(tournament);
}

export async function POST(request: Request) {
    const data: { id: number } = await request.json();

    await prisma.tournament.updateMany({
        where: { active: true },
        data: { active: false },
    });

    await prisma.tournament.update({
        where: { id: data.id },
        data: { active: true },
    });

    return NextResponse.json({});
}
