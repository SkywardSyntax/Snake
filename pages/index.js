import { useState } from 'react';
import SnakeGame from '../components/SnakeGame'
import styles from '../styles/home.module.css'

function Home() {
  const [score, setScore] = useState(0);

  return (
    <main className={styles.main}>
      <h1>Snake Game</h1>
      <SnakeGame score={score} setScore={setScore} />
      <div className="score">Score: {score}</div>
    </main>
  )
}

export default Home
