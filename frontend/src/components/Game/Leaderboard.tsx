import { useState, useRef, useEffect } from "react";
import useLeaderboard from "../../hooks/useLeaderboard";
import { useGame } from "../../hooks/useGame";
import { getDifficultyName } from "../../Utils/functions";

const Leaderboard = () => {
  const { entries, loading, postScore } = useLeaderboard();
  const { score, boardSize } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userRowRef = useRef<HTMLTableRowElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const { success, id } = await postScore({ name: playerName.trim(), score });
    setSuccess(success);
    setUserId(id);
    setPlayerName("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!scrollContainerRef.current || entries.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const userRow = userRowRef.current || 
        (userId ? container.querySelector(`[data-user-id="${userId}"]`) : null) ||
        container.querySelector('tr[data-is-user-entry="true"]') as HTMLTableRowElement;
      
      if (userRow) {
        const thead = container.querySelector('thead');
        const theadHeight = thead?.offsetHeight || 0;
        const rowPosition = userRow.offsetTop - theadHeight;
        const scrollPosition = rowPosition - (container.clientHeight * 0.4) + (userRow.offsetHeight / 2);
        
        container.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' });
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [userId, entries]);

  if (loading) {
    return (
      <div className="mt-6 pt-6 border-t border-base-300">
        <h4 className="font-regitha text-xl font-bold mb-3">Leaderboard</h4>
        <div className="text-center py-4">
          <span className="loading loading-spinner loading-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-base-300">
      <h4 className="font-regitha text-xl font-bold mb-3">
        {getDifficultyName(boardSize)} Leaderboard
      </h4>

      {success === false && (
        <div className="mb-4 p-3 bg-error/20 rounded-lg">
          <p className="font-beezle text-sm text-error">
            Failed to submit score. Please try again.
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <div ref={scrollContainerRef} className="overflow-y-auto" style={{ maxHeight: "calc(5 * 2.8rem)" }}>
          <table className="table table-xs table-zebra w-full">
            <thead className="sticky top-0 bg-base-100 z-10">
              <tr>
                <th className="font-beezle text-xl">Rank</th>
                <th className="font-beezle text-xl">Name</th>
                <th className="font-beezle text-xl">Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                if (entry.rank === null) {
                  return (
                    <tr key={`separator-${index}`} className="bg-base-200">
                      <td colSpan={3} className="text-center py-2">
                        <span className="text-lg opacity-50">...</span>
                      </td>
                    </tr>
                  );
                }

              if (entry.name === null && userId == null) {
                return (
                  <tr 
                    key={`user-${index}`} 
                    ref={userRowRef}
                    data-is-user-entry="true"
                    className="bg-primary/20 text-lg"
                  >
                    <td className="font-beezle">#{entry.rank}</td>
                    <td className="">
                      <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter your name"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          className="input input-bordered flex-1 font-beezle"
                          maxLength={50}
                          disabled={isSubmitting}
                        />
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={!playerName.trim() || isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            "Submit"
                          )}
                        </button>
                      </form>
                    </td>
                    <td className="font-bold">{entry.score?.toFixed(2)}</td>
                  </tr>
                );
              }

              if (entry.name !== null) {
                const isUserRow = entry.id === userId;
                return (
                  <tr 
                    key={`entry-${index}-${entry.name}`} 
                    ref={isUserRow ? userRowRef : null}
                    data-user-id={entry.id}
                    className={`text-lg ${isUserRow && "bg-primary/20"}`}
                  >
                    <td className="font-beezle">#{entry.rank}</td>
                    <td className="font-beezle">{entry.name}</td>
                    <td className="font-bold">{entry.score?.toFixed(2)}</td>
                  </tr>
                );
              }
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
