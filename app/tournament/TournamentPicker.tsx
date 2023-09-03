"use client";

import { useState, useEffect, FormEvent } from "react";
import { Tournament } from "@prisma/client";

export default function TournamentPicker() {
    const [tournaments, setTournaments] = useState<Array<Tournament>>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/tournaments", {
            method: "GET",
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

        const id: number = +((document.getElementById("tournamentPicker") as HTMLSelectElement).value as string);

        fetch("/api/tournament", {
            method: "POST",
            body: JSON.stringify({ id: id }),
        }).then((res) => {
            if (res.status == 200) {
                const lastActive = tournaments.find((t) => t.active === true);
                const newActive = tournaments.find((t) => t.id === id);
                const newTournamentarray = [...tournaments.filter((t) => t.active === false && t.id !== id)];
                if (newActive) {
                    newActive.active = true;
                    newTournamentarray.push(newActive);
                }
                if (lastActive) {
                    lastActive.active = false;
                    newTournamentarray.push(lastActive);
                }
                console.log(newTournamentarray);
                setTournaments(newTournamentarray);
            }
        });
    }

    async function AddTournament(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form: HTMLFormElement = e.currentTarget;
        const formData = new FormData(form);

        fetch("/api/tournaments", {
            method: "POST",
            body: JSON.stringify({ name: formData.get("name") as string }),
        })
            .then((res) => res.json())
            .then((json: Tournament) => {
                setTournaments([...tournaments, json]);
            });
    }

    if (isLoading) return <p>Loading...</p>;
    if (!tournaments) return <p>No tournament data</p>;

    return (
        <>
            <div>
                <h1>
                    Aktiv turnering: <b>{tournaments.find((t) => t.active == true)?.name ?? "Ingen aktiv turnering"}</b>
                </h1>
            </div>
            <form onSubmit={SetTournament}>
                <select
                    id="tournamentPicker"
                    className="p-1 text-black bg-white border-2 m-2 w-64"
                    name="tournament"
                    defaultValue={tournaments.find((t) => t.active == true)?.id}
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
            <div className="border-t-2 mt-4"></div>
            <form onSubmit={AddTournament}>
                <b>Ny turnering</b>
                <br></br>
                <input name="name" className="p-1 m-1 border-2" required></input>
                <label>Namn</label>
                <button type="submit" className="border-2 p-2 bg-yellow-700 text-white">
                    Lägg till
                </button>
            </form>
        </>
    );
}
