import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const handleDefaultGameClick = () => {
    router.push('/game?mode=default');
  };

  const handleNoBordersGameClick = () => {
    router.push('/game?mode=noBorders');
  };

  return (
    <div className="game-mode-selection">
      <h1>Snake Game</h1>
      <div>
        <button className="btn" onClick={handleDefaultGameClick}>Default Game</button>
        <button className="btn" onClick={handleNoBordersGameClick}>No Borders</button>
      </div>
    </div>
  );
}
