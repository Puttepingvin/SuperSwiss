import { PrismaClient, Prisma, Tournament, Game, Result } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { GET as GetTournament } from "../tournament/route";

export async function POST(request: Request) {
    const data: Game = await request.json();

    await prisma.game.update({ where: { id: data.id }, data: { result: data.result } });

    return NextResponse.json({});
}
