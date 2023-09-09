"use client";

import { useState, useEffect, FormEvent } from "react";
import { Player } from "@prisma/client";
import cancel from "../images/cancel-32.png";
import Image from "next/image";

export default function PlayerEditList() {
    const [players, setPlayers] = useState<Array<Player>>([]);
    const [isLoading, setLoading] = useState(true);
    const [extraPoints, setExtraPoints] = useState<{ playerId: number; scoreDeviation: number }[]>([{ playerId: 0, scoreDeviation: 0 }]);

    useEffect(() => {
        fetch("/api/players", {
            method: "GET",
            cache: "no-cache",
            headers: {
                "content-type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json) => {
                setPlayers(json);
                setLoading(false);
            });
    }, []);

    async function RemovePlayer(player: Player) {
        fetch("/api/delete-player", {
            method: "POST",
            body: JSON.stringify(player),
        })
            .then((res) => res.json())
            .then((json: Player) => {
                setPlayers(players.filter((a) => a.id != json.id));
            });
    }

    async function AddPoints(player: Player, points: number) {
        let playerExtraScore = extraPoints.find((p) => p.playerId == player.id)?.scoreDeviation ?? 0;

        const newExtra = extraPoints.filter((p) => p.playerId !== player.id);

        newExtra.push({ playerId: player.id, scoreDeviation: playerExtraScore + points });

        setExtraPoints(newExtra);
    }

    if (isLoading) return <p>Loading...</p>;
    if (!players) return <p>No profile data</p>;

    const playerItems = players
        .sort((a, b) => 0 - ((a.givenName?.toLowerCase() ?? "") < (b.givenName?.toLowerCase() ?? "") ? 1 : -1))
        .map((player) => (
            <tr className="" key={player.id}>
                <td className="border-r-2 px-2">
                    <div className="flex justify-center">
                        <Image
                            onClick={() => RemovePlayer(player)}
                            src={cancel}
                            width={32}
                            height={32}
                            alt="Byt"
                            className="cursor-pointer"
                        />
                    </div>
                </td>
                <td className="px-2">
                    <label htmlFor={"checkbox-player-" + player.id} className="flex-1">
                        <b className="text-xl">{player.givenName} </b>
                    </label>
                </td>
                <td className="px-2">
                    <label htmlFor={"checkbox-player-" + player.id} className="flex-1">
                        {player.surname}
                    </label>
                </td>
                <td className="px-2">
                    <button onClick={() => AddPoints(player, -1)} className="bg-yellow-700 p-1 text-white w-8">
                        -
                    </button>
                    <b className="w-8 inline-block text-center">
                        {extraPoints?.find((a) => a.playerId === player.id)?.scoreDeviation ?? 0}
                    </b>
                    <button onClick={() => AddPoints(player, 1)} className="bg-yellow-700 p-1 text-white w-8">
                        +
                    </button>
                </td>
            </tr>
        ));
    return (
        <>
            <table className="">
                <thead>
                    <tr className="border-b-2">
                        <td className="p-2 border-r-2"></td>
                        <td className="p-2">
                            <b>Förnamn</b>
                        </td>
                        <td className="p-2">
                            <b>Efternamn</b>
                        </td>
                        <td className="p-2">
                            <b>Ändra poäng</b>
                        </td>
                    </tr>
                </thead>
                <tbody>{playerItems}</tbody>
            </table>
        </>
    );
}
