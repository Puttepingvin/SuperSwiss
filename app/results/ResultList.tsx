import { useState, useEffect } from "react";
import { Player, Tournament } from "@prisma/client";
import prisma from "@/libs/prisma";
import { GET as GetTournament } from "../api/tournament/route";
import { start } from "repl";

export default async function ResultList() {
    const tournament: Tournament = await (await GetTournament()).json();

    const statistics = await prisma.tournamentPlayerStatistics.findMany({
        where: { tournamentId: tournament.id, playerId: { not: -1 } },
        include: { player: true },
        orderBy: { score: "desc" },
    });

    return (
        <table className="border-l-2">
            <thead>
                <tr className="border-b-2">
                    <td className="p-2">
                        <b>Förnamn</b>
                    </td>
                    <td className="p-2">
                        <b>Efternamn</b>
                    </td>
                    <td className="p-2">
                        <b>Poäng</b>
                    </td>
                </tr>
            </thead>
            <tbody>
                {statistics.map((stat) => (
                    <tr key={stat.id} className="hover:bg-yellow-50">
                        <td className="p-2">{stat.player.givenName}</td>
                        <td className="p-2">{stat.player.surname}</td>
                        <td className="p-2 text-right">{stat.score.toString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
