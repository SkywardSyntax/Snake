import { useState } from 'react';
import SnakeGame from '../components/SnakeGame';
import styles from '../styles/home.module.css';

function Home() {
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState(null);
  const [level, setLevel] = useState(1);

  const handleGameModeSelection = (mode) => {
    setGameMode(mode);
  };

  const handleLevelSelection = (selectedLevel) => {
    setLevel(selectedLevel);
  };

  return (
    <main className={styles.main}>
      {!gameMode ? (
        <div className="game-mode-selection">
          <h2>Select Game Mode</h2>
          <button onClick={() => handleGameModeSelection('classic')}>Classic</button>
          <button onClick={() => handleGameModeSelection('no-borders')}>No Borders</button>
          <button onClick={() => handleGameModeSelection('hardcore')}>Hardcore</button>
          <button onClick={() => handleGameModeSelection('time-attack')}>Time Attack</button>
          <button onClick={() => handleGameModeSelection('survival')}>Survival</button>
        </div>
      ) : (
        <div className="level-selection">
          <h2>Select Level</h2>
          <button onClick={() => handleLevelSelection(1)}>Level 1</button>
          <button onClick={() => handleLevelSelection(2)}>Level 2</button>
          <button onClick={() => handleLevelSelection(3)}>Level 3</button>
          <button onClick={() => handleLevelSelection(4)}>Level 4</button>
          <button onClick={() => handleLevelSelection(5)}>Level 5</button>
        </div>
      )}
      {gameMode && level && (
        <SnakeGame score={score} setScore={setScore} gameMode={gameMode} level={level} />
      )}
    </main>
  );
}

export default Home;
