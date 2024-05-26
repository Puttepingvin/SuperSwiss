import { NextResponse } from "next/server";
import Players from "@/app/players/page";
import { Prisma, Tournament, Player, Round, Game, Result } from "@prisma/client";
import { GET as GetTournament } from "../tournament/route";
import prisma from "@/libs/prisma";

const startelo = 1000;

export async function GET() {
    const rounds = await prisma.round.findMany({
        include: { games: { include: { blackPlayer: true, whitePlayer: true }, }, tournament : true },
    });

    return NextResponse.json(rounds);
}
