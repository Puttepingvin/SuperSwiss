"use client";

import { useState, useEffect, FormEvent } from "react";
import { Player, TournamentPlayerStatistics, Game, Round } from "@prisma/client";
("");
const weekdays = ["Sön", "Mon", "Tis", "Ons", "Tors", "Fre", "Lör"] as const;

type RoundWithGames = Round & {
    games: (Game & {
        blackPlayer: Player;
        whitePlayer: Player;
    })[];
};

export default function Term() {
    const [rounds, setRounds] = useState<Array<RoundWithGames>>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/rounds", {
            method: "GET",
            cache: "no-store",
            headers: {
                "content-type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json) => {
                setRounds(json);
                setLoading(false);
            });
    }, []);

    if (isLoading) return <p>Loading...</p>;
    if (!rounds) return <p>No games</p>;

    const playerRoundist = rounds.map((round) => (
        <>
            {}
            <h1 className="pt-2 text-3xl font-bold">
                {"Round " +
                    round.id +
                    ": " +
                    weekdays[new Date(round.date).getDay()] +
                    " " +
                    new Date(round.date).getDate() +
                    "/" +
                    (new Date(round.date).getMonth() + 1)}
            </h1>
            <ol className="list-decimal pl-4">
                {round.games
                    .map((g) => g.blackPlayer)
                    .concat(round.games.map((g) => g.whitePlayer))
                    .filter((player, index, self) => self.indexOf(player) === index)
                    .sort((a, b) => ((a.givenName ?? "") > (b.givenName ?? "") ? 1 : -1))
                    .map((p) => (
                        <li key={p.id}>
                            <b>{p.givenName}</b> {p.surname}
                        </li>
                    ))}
            </ol>
        </>
    ));
    return <>{playerRoundist}</>;
}
