import { Player, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

const startelo = 1000;

export async function GET(request: Request) {
    const players = await prisma.player.findMany({
        where: { deleted: false },
        include: {
            blackGames: { include: { round: true } },
            whiteGames: { include: { round: true } },
        },
    });

    return NextResponse.json(players);
}

export async function POST(request: Request) {
    const data: { givenName: string; surname: string; birthyear: number } = await request.json();

    const newPlayer: Prisma.PlayerCreateInput = {
        birthyear: data.birthyear,
        givenName: data.givenName,
        surname: data.surname,
        elo: startelo,
        deleted: false,
        present: true,
    };

    const player = await prisma.player.create({ data: newPlayer });

    return NextResponse.json(player);
}
