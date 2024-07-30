import { useState } from 'react';
import SnakeGame from '../components/SnakeGame';
import styles from '../styles/home.module.css';

function Home() {
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState(null);

  const handleGameModeSelection = (mode) => {
    setGameMode(mode);
  };

  return (
    <main className={styles.main}>
      {!gameMode ? (
        <div className="game-mode-selection">
          <h2>Select Game Mode</h2>
          <button onClick={() => handleGameModeSelection('classic')}>Classic</button>
          <button onClick={() => handleGameModeSelection('no-borders')}>No Borders</button>
        </div>
      ) : (
        <SnakeGame score={score} setScore={setScore} gameMode={gameMode} />
      )}
    </main>
  );
}

export default Home;
