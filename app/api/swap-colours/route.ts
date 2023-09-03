import { PrismaClient, Prisma, Tournament, Game, Result } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { GET as GetTournament } from "../tournament/route";

export async function POST(request: Request) {
    const data: Game = await request.json();

    const newGame = await prisma.game.update({
        where: { id: data.id },
        data: { whitePlayerId: data.blackPlayerId, blackPlayerId: data.whitePlayerId },
        include: { whitePlayer: true, blackPlayer: true },
    });

    return NextResponse.json(newGame);
}
