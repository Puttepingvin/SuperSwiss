import { NextResponse } from "next/server";
import Players from "@/app/players/page";
import { Prisma, Tournament, Player, Round, Game, Result } from "@prisma/client";
import { GET as GetTournament } from "../tournament/route";
import prisma from "@/libs/prisma";

const startelo = 1000;

export const dynamic = "force-dynamic";

export async function GET() {
    const activeTournament: Tournament | null = await prisma.tournament.findFirst({
        where: { active: true },
    });

    const games = await prisma.game.findMany({
        where: { round: { tournamentId: activeTournament?.id } },
        include: { blackPlayer: true, whitePlayer: true },
    });

    return NextResponse.json(games);
}
