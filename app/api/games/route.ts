import { NextResponse } from "next/server";
import Players from "@/app/players/page";
import { Prisma, Tournament, Player, Round, Game, Result } from "@prisma/client";
import { GET as GetTournament } from "../tournament/route";
import prisma from "@/libs/prisma";

const startelo = 1000;

export async function GET() {
    const activeTournament: Tournament = await (await GetTournament()).json();

    const games = await prisma.game.findMany({
        where: { round: { tournamentId: activeTournament.id } },
        include: { blackPlayer: true, whitePlayer: true },
    });

    return NextResponse.json(games);
}
