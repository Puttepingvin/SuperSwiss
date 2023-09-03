"use client";

import { useState, useEffect, FormEvent } from "react";
import { Player } from "@prisma/client";

export default function PlayerList() {
    const [players, setPlayers] = useState<Array<Player>>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/players", {
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

    async function SetPresent(playerId: number, isPresent: boolean) {
        fetch("/api/set-present", {
            method: "POST",
            body: JSON.stringify({
                playerId: playerId,
                isPresent: isPresent,
            }),
            headers: {
                "content-type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((json: Player) => {
                setPlayers([...players.filter((p) => p.id !== json.id), json]);
            });
    }

    function SubmitAddPlayer(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form: HTMLFormElement = e.currentTarget;
        const formData = new FormData(form);

        AddPlayer(formData.get("givenName") as string, formData.get("surname") as string, formData.get("birthyear") as string);
    }

    async function AddPlayer(givenName: string | null, surname: string, birthyear: string) {
        fetch("/api/players", {
            method: "POST",
            body: JSON.stringify({ givenName: givenName, surname: surname, birthyear: +birthyear }),
        })
            .then((res) => res.json())
            .then((json: Player) => {
                setPlayers([...players, json]);
            });
    }

    async function SetAllPresetStatus(present: boolean) {
        fetch("/api/set-all-present-status", {
            method: "POST",
            body: JSON.stringify({ present: present }),
        }).then((res) => {
            if (res.status == 200) {
                const newplayers = players.map((p) => {
                    return { ...p, present: present };
                });
                console.log(newplayers);
                setPlayers(newplayers);
            }
        });
    }

    if (isLoading) return <p>Loading...</p>;
    if (!players) return <p>No profile data</p>;

    const playerItems = players
        .sort((a, b) => 0 - ((a.givenName?.toLowerCase() ?? "") < (b.givenName?.toLowerCase() ?? "") ? 1 : -1))
        .map((player) => (
            <tr className="" key={player.id}>
                <td className="border-r-2 px-2">
                    <input
                        id={"checkbox-player-" + player.id}
                        type="checkbox"
                        className="mx-2 w-8 h-8 accent-yellow-700"
                        checked={player.present}
                        onChange={(e) =>
                            SetPresent(player.id, (document.getElementById("checkbox-player-" + player.id) as HTMLInputElement).checked)
                        }
                    ></input>
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
                        <td className="p-2 border-r-2">
                            {" "}
                            <input
                                id={"checkbox-all-present"}
                                type="checkbox"
                                className="mx-2 w-8 h-8 accent-yellow-700"
                                defaultChecked={false}
                                onChange={(e) =>
                                    SetAllPresetStatus((document.getElementById("checkbox-all-present") as HTMLInputElement).checked)
                                }
                            ></input>
                        </td>
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

            <div className="border-t-2 mt-4"></div>
            <b>Ny spelare</b>
            <br />
            <form method="post" onSubmit={SubmitAddPlayer}>
                <table>
                    <thead>
                        <tr>
                            <td>Förnamn</td>
                            <td>Efternamn</td>
                            <td>Födelseår</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <input type="text" className="p-1 m-1 border-2" name="givenName"></input>
                            </td>
                            <td>
                                <input type="text" className="p-1 m-1 border-2" name="surname"></input>
                            </td>
                            <td>
                                <input type="number" className="p-1 m-1 border-2" name="birthyear"></input>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button className="border-2 p-2 bg-yellow-700 text-white" type="submit">
                    Lägg till
                </button>
            </form>
        </>
    );
}
