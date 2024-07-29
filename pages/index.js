import SnakeGame from '../components/SnakeGame'
import styles from '../styles/home.module.css'

function Home() {
  return (
    <main className={styles.main}>
      <h1>Snake Game</h1>
      <SnakeGame />
    </main>
  )
}

export default Home
