import { Player, Game, Round } from "@prisma/client";
import blossom from "edmonds-blossom";

type PlayerWithGames = Player & {
    blackGames: (Game & {
        round: Round;
    })[];
    whiteGames: (Game & {
        round: Round;
    })[];
};

export type Pairing = { white: Player; black: Player };

export function Seed(players: PlayerWithGames[], roundId: number) {
    const byePlayer: PlayerWithGames = {
        id: -1,
        givenName: "Walk",
        surname: "Over",
        birthyear: 0,
        deleted: false,
        elo: 0,
        present: true,
        blackGames: [],
        whiteGames: [],
    };

    if (players.length % 2 != 0) {
        players.push(byePlayer);
    }

    const parings: Pairing[] = [];
    const edges: number[][] = [];
    let done = false;
    const now = Date.now();

    for (let maxRounds = 7; maxRounds >= 0 && !done; maxRounds--) {
        players.forEach((p1, id1) => {
            players.forEach((p2, id2) => {
                if (id2 > id1 && IsValidParining(p1, p2, maxRounds)) {
                    edges.push([id1, id2, PairingWeight(p1, p2)]);
                }
            });
        });

        const pairing = blossom(edges, true);

        if (pairing.length > 0 && !pairing.some((e) => e == -1)) {
            done = true;

            pairing.forEach((id2, id1) => {
                if (id2 > id1) {
                    if (PlayerWasLastWhiteVs(players[id1], players[id2])) {
                        parings.push({ white: players[id2], black: players[id1] });
                    } else if (PlayerWasLastWhiteVs(players[id2], players[id1]) || Math.random() < 0.5) {
                        parings.push({ white: players[id1], black: players[id2] });
                    } else {
                        parings.push({ white: players[id2], black: players[id1] });
                    }
                }
            });
        }
    }

    return parings;
}

function IsValidParining(a: PlayerWithGames, b: PlayerWithGames, maxRounds: number, flip: boolean = true): boolean {
    const found = a.whiteGames
        .concat(a.blackGames)
        .sort((g1, g2) => (g1.round.date > g2.round.date ? 1 : -1))
        .slice(-maxRounds)
        .find((game) => game.blackPlayerId == b.id || game.whitePlayerId == b.id);
    return !found && (!flip || IsValidParining(b, a, maxRounds, false));
}

function PairingWeight(a: Player, b: Player) {
    const score = Math.abs(a.elo - b.elo);
    return Math.max(10000 - score, 1);
}

function PlayerWasLastWhiteVs(a: PlayerWithGames, b: PlayerWithGames) {
    const gamesSinceWhite = a.whiteGames
        .sort((g1, g2) => (g1.round.date > g2.round.date ? 1 : -1))
        .reverse()
        .findIndex((g) => g.blackPlayerId == b.id);
    const gamesSinceBlack = a.blackGames
        .sort((g1, g2) => (g1.round.date > g2.round.date ? 1 : -1))
        .reverse()
        .findIndex((g) => g.whitePlayerId == b.id);

    if (gamesSinceWhite === -1) {
        return false;
    } else if (gamesSinceBlack === -1) {
        return true;
    }

    return gamesSinceWhite < gamesSinceBlack;
}
