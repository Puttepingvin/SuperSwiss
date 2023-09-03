import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET() {
    const tournaments = await prisma.tournament.findMany();

    return NextResponse.json(tournaments);
}

export async function POST(request: Request) {
    const data: { name: string } = await request.json();

    const tournament = await prisma.tournament.create({ data: { name: data.name } });

    return NextResponse.json(tournament);
}
