import { Prisma, Tournament, Player, Round, Game, Result } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { GET as GetTournament } from "../tournament/route";

export async function POST(request: Request) {
    var round = await prisma.round.findFirst({
        orderBy: { date: "desc" },
        include: { games: { include: { blackPlayer: true, whitePlayer: true } } },
    });

    if (!round?.finished) {
        await prisma.round.update({ where: { id: round?.id }, data: { finished: true } });

        const activeTournament: Tournament = await (await GetTournament()).json();

        round?.games.forEach((game) => {
            reportGameResult(game, activeTournament);
        });

        const newRound: Prisma.RoundCreateInput = {
            tournament: { connect: { id: activeTournament.id } },
        };

        round = await prisma.round.create({ data: newRound, include: { games: { include: { blackPlayer: true, whitePlayer: true } } } });
    }

    return NextResponse.json(round);
}

async function reportGameResult(
    game: Game & {
        blackPlayer: Player;
        whitePlayer: Player;
    },
    activeTournament: Tournament
) {
    if (game.result == Result.UNFINISHED) return;
    const blackResult = game.result == Result.BLACK_WON ? 1 : game.result == Result.WHITE_WON ? -1 : 0;
    const whiteResult = game.result == Result.WHITE_WON ? 1 : game.result == Result.BLACK_WON ? -1 : 0;

    await prisma.player.update({
        where: { id: game.whitePlayerId },
        data: { elo: game.whitePlayer.elo + whiteResult },
    });
    await prisma.player.update({
        where: { id: game.blackPlayerId },
        data: { elo: game.blackPlayer.elo + blackResult },
    });

    await prisma.tournamentPlayerStatistics.upsert({
        where: {
            TournamentPlayerCombo: { playerId: game.whitePlayerId, tournamentId: activeTournament.id },
        },
        update: {
            score: { increment: whiteResult + 2 },
            whitebalance: { increment: 1 },
        },
        create: {
            tournamentId: activeTournament.id,
            playerId: game.whitePlayerId,
            whitebalance: 1,
            score: whiteResult + 2,
        },
    });
    await prisma.tournamentPlayerStatistics.upsert({
        where: {
            TournamentPlayerCombo: { playerId: game.blackPlayerId, tournamentId: activeTournament.id },
        },
        update: {
            score: { increment: blackResult + 2 },
            whitebalance: { decrement: 1 },
        },
        create: {
            tournamentId: activeTournament.id,
            playerId: game.blackPlayerId,
            whitebalance: -1,
            score: blackResult + 2,
        },
    });
}
