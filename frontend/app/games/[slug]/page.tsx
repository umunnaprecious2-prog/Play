import { GameSetupClient } from "../../../components/GameSetupClient";
import { GAMES } from "../../../lib/games";

export function generateStaticParams() {
  return GAMES.map((game) => ({ slug: game.slug }));
}

export default function GameSetupPage() {
  return <GameSetupClient />;
}
