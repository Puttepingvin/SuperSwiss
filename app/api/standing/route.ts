import { NextResponse } from "next/server";
import Players from "@/app/players/page";
import { Prisma, Tournament, Player, Round, Game, Result } from "@prisma/client";
import { GET as GetTournament } from "../tournament/route";
import prisma from "@/libs/prisma";

const startelo = 1000;

export async function GET() {
    const activeTournament: Tournament | null = await prisma.tournament.findFirst({
        where: { active: true },
    });

    const statistics = await prisma.tournamentPlayerStatistics.findMany({
        where: { tournamentId: activeTournament?.id },
        include: { player: true },
    });

    return NextResponse.json(statistics);
}
