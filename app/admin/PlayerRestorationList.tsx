"use client";

import { useState, useEffect, FormEvent } from "react";
import { Player } from "@prisma/client";
import restore from "../images/restore-32.png";
import Image from "next/image";

export default function PlayerRestorationList() {
    const [players, setPlayers] = useState<Array<Player>>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/delete-player", {
            method: "GET",
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

    async function RestorePlayer(player: Player) {
        fetch("/api/restore-player", {
            method: "POST",
            body: JSON.stringify(player),
        })
            .then((res) => res.json())
            .then((json: Player) => {
                setPlayers(players.filter((a) => a.id != json.id));
            });
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
                            onClick={() => RestorePlayer(player)}
                            src={restore}
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
                    </tr>
                </thead>
                <tbody>{playerItems}</tbody>
            </table>
        </>
    );
}
