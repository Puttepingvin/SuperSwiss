import { PrismaClient, Prisma, Tournament, Game, Result } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { GET as GetTournament } from "../tournament/route";

export async function POST(request: Request) {
    const data: { id: number } = await request.json();

    await prisma.game.delete({ where: { id: data.id } });

    return NextResponse.json({});
}
