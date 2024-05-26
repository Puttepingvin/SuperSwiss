import { Round } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

type MoveData = { id: number; tournamentId: number };

export async function POST(request: Request) {
    const data: MoveData = await request.json();

    const round = await prisma.round.update({
        where: {
            id : data?.id,
        },
        data: {
            tournamentId : data.tournamentId,
        }
    });

    return NextResponse.json(round);
}
