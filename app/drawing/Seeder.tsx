"use client";

import { Player, Game, Round, Result as GameResult } from "@prisma/client";
import { useState, useEffect } from "react";
import { Seed, Pairing } from "./seeding-algorithm";
import Image from "next/image";
import swap from "../images/swap-32.png";
import cancel from "../images/cancel-32.png";

type PlayerWithGames = Player & {
    blackGames: (Game & {
        round: Round;
    })[];
    whiteGames: (Game & {
        round: Round;
    })[];
};

type RoundWithGames = Round & {
    games: (Game & {
        blackPlayer: Player;
        whitePlayer: Player;
    })[];
};

function IsSeeded(player: PlayerWithGames, round: Round) {
    return player.whiteGames.concat(player.blackGames).find((game) => game.roundId == round.id);
}

function playerDropdown(players: Player[]) {
    return (
        <>
            {players.map((player) => (
                <option key={player.id} value={player.id} className="text-neutral-500 bg-white hover:bg-yellow-50">
                    {player.givenName} {player.surname}
                </option>
            ))}
        </>
    );
}

export default function Seeder() {
    const [players, setPlayers] = useState<PlayerWithGames[]>([]);
    const [round, setRound] = useState<RoundWithGames | undefined>(undefined);
    const [isLoading, setLoading] = useState(true);

    async function ImplementMatching(matching: Pairing[], roundToSeed: RoundWithGames) {
        let newPlayers: PlayerWithGames[] = [...players];
        let newRound = { ...roundToSeed };

        for (const pairing of matching) {
            const res = await fetch("/api/make-pairing", {
                method: "POST",
                body: JSON.stringify(pairing),
            });

            const game: Game & {
                whitePlayer: Player;
                blackPlayer: Player;
                round: Round;
            } = await res.json();
            newPlayers.find((p) => p.id == pairing.white.id)?.whiteGames.push(game);
            newPlayers.find((p) => p.id == pairing.black.id)?.blackGames.push(game);
            newRound.games.push(game);
        }
        console.log(newPlayers);
        console.log(newRound);

        setPlayers(newPlayers);
        setRound(newRound);
    }

    async function MakeSeeding(playersToSeed: PlayerWithGames[], roundToSeed: RoundWithGames) {
        setLoading(true);
        const matching = Seed(
            playersToSeed.filter((player) => !IsSeeded(player, roundToSeed)),
            roundToSeed.id
        );

        await ImplementMatching(matching, roundToSeed);

        const byeBlack = round?.games.find((g) => g.blackPlayer.id == -1);
        const byeWhite = round?.games.find((g) => g.whitePlayer.id == -1);
        if (byeBlack) {
            ReportResult(byeBlack, GameResult.WHITE_WON);
        } else if (byeWhite) {
            ReportResult(byeWhite, GameResult.WHITE_WON);
        }

        setLoading(false);
    }

    async function SwapColours(game: Game) {
        await fetch("/api/swap-colours", {
            method: "POST",
            body: JSON.stringify(game),
        })
            .then((res) => res.json())
            .then((newGame) => {
                if (round) {
                    const newRound = { ...round };
                    newRound.games = newRound.games?.map((g) => (g.id === newGame?.id ? newGame : g));
                    setRound(newRound);
                }
            });
    }

    function FinishRound() {
        fetch("/api/finish-round", {
            method: "POST",
        })
            .then((res) => res.json())
            .then((rnd: RoundWithGames | undefined) => {
                setRound(rnd);
            });
    }

    async function RemoveGame(game: Game) {
        fetch("/api/remove-game", {
            method: "POST",
            body: JSON.stringify({ id: game.id }),
            headers: {
                "content-type": "plain/text",
            },
        }).then((res) => {
            if (res.status == 200 && round) {
                const newRound = { ...round };
                newRound.games = newRound.games?.filter((g) => game.id != g.id);
                setRound(newRound);
                if (players) {
                    const newPlayers = players.map((player) => {
                        player.blackGames = player.blackGames.filter((g) => g.id != game.id);
                        player.whiteGames = player.whiteGames.filter((g) => g.id != game.id);
                        return player;
                    });
                    setPlayers(newPlayers);
                }
            }
        });
    }

    async function ReportResult(game: Game, result: GameResult) {
        game.result = result;
        await fetch("/api/report-result", {
            method: "POST",
            body: JSON.stringify(game),
        });

        const nextGames = round?.games.map((g) => {
            if (g.id != game.id) {
                return g;
            } else {
                return {
                    ...g,
                    result: result,
                };
            }
        });

        if (nextGames && round) {
            setRound({ ...round, games: nextGames });
        }
    }

    useEffect(() => {
        fetch("/api/players", {
            method: "GET",
            cache: "no-store",
        })
            .then((res) => res.json())
            .then((json) => {
                setPlayers(json);
                setLoading(false);
            });
        fetch("/api/active-round", {
            method: "GET",
            cache: "no-store",
        })
            .then((res) => res.json())
            .then((json: RoundWithGames) => {
                setRound(json);
                setLoading(false);
            });
    }, []);

    if (isLoading) return <p>Loading...</p>;
    if (players.length == 0) return <p>Inga spelare tillagda</p>;
    if (!round) return <p>Ingen rond existerar</p>;

    const unseeded = players
        .filter((p) => p.present && !IsSeeded(p, round))
        .map((player) => (
            <tr key={player.id}>
                <td className="px-2">
                    <b className="text-xl">{player.givenName} </b>
                </td>
                <td className="px-2">{player.surname}</td>
                <td className="px-2 flex min-w-[160]">
                    <select
                        className="p-1 text-white bg-yellow-700 m-2 w-full"
                        onChange={(e) => {
                            ImplementMatching(
                                [
                                    {
                                        white: player,
                                        black: players.find((p) => p.id === +e.target.value)!,
                                    },
                                ],
                                round
                            );
                        }}
                        defaultValue="DEFAULT"
                    >
                        <option disabled hidden value="DEFAULT" key="-2">
                            Välj motståndare...
                        </option>
                        {playerDropdown(players.filter((p) => p.id != player.id && p.present && !IsSeeded(p, round)))}
                    </select>
                </td>
            </tr>
        ));

    const seeded = round.games.map((game) => (
        <tr key={game.id}>
            <td className="px-2">
                <button
                    className={
                        "rounded border-2 w-full p-2 m-2 " +
                        (game.result == GameResult.WHITE_WON ? "border-yellow-700 bg-yellow-50 border-4 " : "")
                    }
                    onClick={() => ReportResult(game, GameResult.WHITE_WON)}
                >
                    <b className="text-xl">{game.whitePlayer.givenName} </b>
                    {game.whitePlayer.surname}
                </button>
            </td>
            <td className="px-2">
                <button
                    className={
                        "rounded border-2 w-full p-2 m-2 " +
                        (game.result == GameResult.DRAW ? "border-yellow-700 bg-yellow-50 border-4" : "bg-neutral-600 text-white")
                    }
                    onClick={() => ReportResult(game, GameResult.DRAW)}
                >
                    <b className="text-xl">Remi</b>
                </button>
            </td>
            <td className="px-2">
                <button
                    className={
                        "rounded border-2 w-full p-2 m-2 " +
                        (game.result == GameResult.BLACK_WON ? "border-yellow-700 bg-yellow-50 border-4" : "text-white bg-black")
                    }
                    onClick={() => ReportResult(game, GameResult.BLACK_WON)}
                >
                    <b className="text-xl">{game.blackPlayer.givenName} </b>
                    {game.blackPlayer.surname}
                </button>
            </td>
            <td className="px-2 ">
                <div className="flex justify-center">
                    <Image onClick={() => SwapColours(game)} src={swap} width={32} height={32} alt="Byt" className="cursor-pointer" />
                </div>
            </td>
            <td className="px-2">
                <div className="flex justify-center">
                    <Image onClick={() => RemoveGame(game)} src={cancel} width={32} height={32} alt="Byt" className="cursor-pointer" />
                </div>
            </td>
        </tr>
    ));

    console.log(unseeded);

    return (
        <>
            <h1 className="text-xl">
                Rond nummer {round.id}, startade {round.date.toLocaleString()}
            </h1>
            <div className="flex flex-wrap min-h-full flex-1">
                {unseeded?.length > 0 && (
                    <div className="flex-1 border-r-2 border-r-yellow-700">
                        <table className="border-l-2 mb-2">
                            <thead>
                                <tr className="border-b-2">
                                    <td className="p-2">
                                        <b>Förnamn</b>
                                    </td>
                                    <td className="p-2">
                                        <b>Efternamn</b>
                                    </td>
                                    <td className="p-2 whitespace-nowrap">
                                        <b>Manuell match</b>
                                    </td>
                                </tr>
                            </thead>
                            <tbody>{unseeded}</tbody>
                        </table>
                        <button
                            type="button"
                            className="p-2 rounded border-1 bg-yellow-700 text-white"
                            onClick={() =>
                                MakeSeeding(
                                    players.filter((p) => p.present),
                                    round
                                )
                            }
                        >
                            Skapa lottning
                        </button>
                    </div>
                )}
                {seeded.length > 0 && (
                    <div className="flex-[2_2_0%] p-2">
                        <table className="border-l-2 mb-2">
                            <thead className="border-b-2">
                                <tr>
                                    <th className="p-2">Vit</th>
                                    <th className="p-2">-</th>
                                    <th className="p-2">Svart</th>
                                    <th className="p-2 whitespace-nowrap">Byt färg</th>
                                    <th className="p-2">Avmatcha</th>
                                </tr>
                            </thead>
                            <tbody>{seeded}</tbody>
                        </table>
                        <button type="button" className="p-2 rounded border-1 bg-yellow-700 text-white" onClick={() => FinishRound()}>
                            Avsluta rond
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
