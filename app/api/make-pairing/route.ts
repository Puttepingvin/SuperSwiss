import { Prisma, Tournament, Player, Round } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { GET as GetTournament } from "../tournament/route";

type Pairing = { white: Player; black: Player };

export async function POST(request: Request) {
    const data: Pairing = await request.json();

    var round = await prisma.round.findFirst({
        orderBy: { date: "desc" },
    });

    const newGame: Prisma.GameCreateInput = {
        result: "UNFINISHED",
        whitePlayer: { connect: { id: data.white.id } },
        blackPlayer: { connect: { id: data.black.id } },
        tournament: { connect: { id: round?.tournamentId } },
        round: { connect: { id: round?.id } },
    };

    const game = await prisma.game.create({
        data: newGame,
        include: { round: true, blackPlayer: true, whitePlayer: true },
    });

    return NextResponse.json(game);
}
