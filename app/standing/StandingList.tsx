"use client";

import { useState, useEffect, FormEvent } from "react";
import { Player, TournamentPlayerStatistics, Game, Result as GameResult } from "@prisma/client";
import { Result } from "postcss";

type StatisticWithPlayer = TournamentPlayerStatistics & {
    player: Player;
};

type StatisticWithPlayerAndRealScore = TournamentPlayerStatistics & {
    player: Player;
    realScore: number;
};

type GameWithPlayers = Game & {
    blackPlayer: Player;
    whitePlayer: Player;
};

export default function StandingList() {
    const [statistics, setStatistics] = useState<Array<StatisticWithPlayer>>([]);
    const [games, setGames] = useState<Array<GameWithPlayers>>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/standing", {
            method: "GET",
            cache: "no-cache",
            headers: {
                "content-type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json) => {
                setStatistics(json);
                setLoading(false);
            });

        fetch("/api/games", {
            method: "GET",
            cache: "no-cache",
            headers: {
                "content-type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json) => {
                setGames(json);
                setLoading(false);
                console.log(games);
            });
    }, []);

    if (isLoading) return <p>Loading...</p>;
    if (!statistics) return <p>No tournament data</p>;
    if (!games) return <p>No games</p>;

    const statisticsWithScore: StatisticWithPlayerAndRealScore[] = statistics
        .filter((s) => s.player.givenName != "Patrik" || s.player.surname != "Andrén")
        .map((statistic) => ({
            ...statistic,
            realScore:
                games.filter(
                    (g) =>
                        (g.blackPlayerId == statistic.playerId && g.result == GameResult.BLACK_WON) ||
                        (g.whitePlayerId == statistic.playerId && g.result == GameResult.WHITE_WON)
                ).length *
                    3 +
                games.filter(
                    (g) =>
                        (g.blackPlayerId == statistic.playerId && g.result == GameResult.WHITE_WON) ||
                        (g.whitePlayerId == statistic.playerId && g.result == GameResult.BLACK_WON)
                ).length +
                games.filter(
                    (g) =>
                        (g.blackPlayerId == statistic.playerId && g.result == GameResult.DRAW) ||
                        (g.whitePlayerId == statistic.playerId && g.result == GameResult.DRAW)
                ).length *
                    2,
        }));

    const scorelist = statisticsWithScore
        .sort((a, b) => +b.realScore - +a.realScore) // The plusses are for the compiler
        .map((statistic, idx) => (
            <tr className="" key={statistic.playerId}>
                <td className="border-r-2 px-2 text-right">{idx + 1}</td>
                <td className="px-2">
                    <b className="text-xl">{statistic.player.givenName} </b>
                </td>
                <td className="px-2">{statistic.player.surname}</td>
                <td className="px-2">{statistic.realScore}</td>
                <td className="px-2">
                    {games.filter(
                        (g) =>
                            g.result != GameResult.UNFINISHED &&
                            (g.blackPlayerId == statistic.playerId || g.whitePlayerId == statistic.playerId)
                    ).length + ""}
                </td>
            </tr>
        ));
    return (
        <>
            <table className="w-full md:w-auto">
                <thead>
                    <tr className="border-b-2">
                        <td className="p-2 border-r-2 text-right">
                            <b>Plats</b>
                        </td>
                        <td className="p-2">
                            <b>Förnamn</b>
                        </td>
                        <td className="p-2">
                            <b>Efternamn</b>
                        </td>
                        <td className="p-2">
                            <b>Poäng</b>
                        </td>
                        <td className="p-2">
                            <b>Matcher</b>
                        </td>
                    </tr>
                </thead>
                <tbody>{scorelist}</tbody>
            </table>
        </>
    );
}
