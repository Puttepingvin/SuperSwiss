"use client";

import { useState, useEffect, FormEvent } from "react";
import { Player, TournamentPlayerStatistics, Game, Round, Tournament } from "@prisma/client";
("");
const weekdays = ["Sön", "Mon", "Tis", "Ons", "Tors", "Fre", "Lör"] as const;

type RoundWithGames = Round & {
    games: (Game & {
        blackPlayer: Player;
        whitePlayer: Player;
    })[];

    tournament: Tournament;
};

export default function Term() {
    const [rounds, setRounds] = useState<Array<RoundWithGames>>([]);
    const [tournaments, setTournaments] = useState<Array<Tournament>>([]);
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

        fetch("/api/tournaments", {
            method: "GET",
            cache: "no-cache",
            headers: {
                "content-type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json) => {
                setTournaments(json);
                setLoading(false);
            });
    }, []);

    async function SetTournament(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log(e);

        const tournamentId: number = +(((e.target as HTMLFormElement).getElementsByTagName("select")[0] as HTMLSelectElement)
            .value as string);

        const roundId: number = +(((e.target as HTMLFormElement).getElementsByTagName("input")[0] as HTMLInputElement).value as string);

        fetch("/api/move-round", {
            method: "POST",
            body: JSON.stringify({ id: roundId, tournamentId: tournamentId }),
        }).then((res) => {
            if (res.status != 200) {
                window.alert("Misslyckades ass byta");
            }
        });
    }

    if (isLoading) return <p>Loading...</p>;
    if (!rounds) return <p>No games</p>;
    if (!tournaments) return <p>No tournaments</p>;

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
            <h2>{round.tournament.name}</h2>
            <form onSubmit={SetTournament} key={round.id}>
                <input hidden value={round.id} />
                <select
                    id="tournamentPicker"
                    className="p-1 text-black bg-white border-2 m-2 w-64"
                    name="tournament"
                    defaultValue={round.tournamentId}
                >
                    {tournaments.map((tournament) => (
                        <option key={tournament.id} value={tournament.id}>
                            {tournament.name}
                        </option>
                    ))}
                </select>
                <button className="border-2 p-2 bg-yellow-700 text-white" type="submit">
                    Byt
                </button>
            </form>
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
