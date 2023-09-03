import PlayerEditList from "./PlayerEditList";
import PlayerRestorationList from "./PlayerRestorationList";

export default function Players() {
    return (
        <>
            <h2 className="text-2xl">Redigera spelare</h2>
            <PlayerEditList />
            <div className="border-t-2 my-5 border-yellow-700"></div>
            <h2 className="text-2xl">Återställ spelare</h2>
            <PlayerRestorationList />
        </>
    );
}
