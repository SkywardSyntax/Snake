import { useRouter } from 'next/router';
import Game from './game';

export default function Home() {
  const router = useRouter();

  const handleGameModeSelection = (mode) => {
    router.push({
      pathname: '/game',
      query: { mode },
    });
  };

  return (
    <div className="game-mode-selection">
      <h1>Select Game Mode</h1>
      <button className="btn" onClick={() => handleGameModeSelection('default')}>
        Default Game
      </button>
      <button className="btn" onClick={() => handleGameModeSelection('noBorders')}>
        No Borders Game
      </button>
    </div>
  );
}
