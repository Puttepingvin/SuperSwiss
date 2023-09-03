import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import Players from "@/app/players/page";
import { Prisma, Tournament, Player, Round, Game, Result } from "@prisma/client";
import { GET as GetTournament } from "../tournament/route";

export async function GET(request: Request) {
    let round = await prisma.round.findFirst({
        orderBy: { date: "desc" },
        include: { games: { include: { blackPlayer: true, whitePlayer: true } } },
    });

    if (!round) {
        const activeTournament: Tournament = await (await GetTournament()).json();
        const newRound: Prisma.RoundCreateInput = {
            tournament: { connect: { id: activeTournament.id } },
        };

        round = await prisma.round.create({ data: newRound, include: { games: { include: { blackPlayer: true, whitePlayer: true } } } });
    }

    return NextResponse.json(round);
}
