import { Player, Game, Round } from "@prisma/client";

export as namespace types;

export type PlayerWithGames = Player & {
  blackGames: Game[];
  whiteGames: Game[];
};
