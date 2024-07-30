import { useState } from 'react';
import SnakeGame from '../components/SnakeGame';
import styles from '../styles/home.module.css';

function Home() {
  const [score, setScore] = useState(0);

  return (
    <main className={styles.main}>
      <SnakeGame score={score} setScore={setScore} />
    </main>
  );
}

export default Home;
