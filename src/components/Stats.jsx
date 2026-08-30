import React, { useEffect, useState } from "react";
import { fetchPublicStats } from "../api";

const Counter = ({ target }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const safeTarget = Number(target) || 0;
    if (safeTarget <= 0) {
      setCount(0);
      return;
    }
    const duration = 1500;
    const incrementTime = 30;
    const increment = safeTarget / (duration / incrementTime);

    const timer = setInterval(() => {
      current += increment;
      if (current >= safeTarget) {
        current = safeTarget;
        clearInterval(timer);
      }
      setCount(Math.floor(current));
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target]);

  return <strong>{count}</strong>;
};

const Stats = () => {
  const [stats, setStats] = useState({
    compliments: 0,
    smiles: 0,
    kindStudents: 0,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchPublicStats();
        if (alive) {
          setStats({
            compliments: data.compliments ?? 0,
            smiles: data.smiles ?? 0,
            kindStudents: data.kindStudents ?? 0,
          });
        }
      } catch (e) {
        console.error("stats:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="stats-container">
      <div className="stat-card">
        <Counter target={stats.compliments} />
        <span>😊 Compliments</span>
      </div>
      <div className="stat-card">
        <Counter target={stats.smiles} />
        <span>❤️ Smiles created</span>
      </div>
      <div className="stat-card">
        <Counter target={stats.kindStudents} />
        <span>🌸 Kind students</span>
      </div>
    </div>
  );
};

export default Stats;
