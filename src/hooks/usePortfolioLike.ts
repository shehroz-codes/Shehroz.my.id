import { useEffect, useRef, useState } from "react";
import { localLikePersistence, type LikePersistence } from "../services/likePersistence";

export function usePortfolioLike(persistence: LikePersistence = localLikePersistence) {
  const [liked, setLiked] = useState(false);
  const [ready, setReady] = useState(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let current = true;
    setReady(false);
    persistence.load().then(value => {
      if (current) setLiked(value);
    }).catch(() => {}).finally(() => {
      if (current) setReady(true);
    });
    return () => { current = false; };
  }, [persistence]);
  const change = (next: boolean) => {
    if (!ready) return;
    setLiked(next);
    // Serialize writes so rapid interactions cannot persist an older preference last.
    writes.current = writes.current.then(() => persistence.save(next)).catch(() => {});
  };
  return { liked, ready, change };
}
