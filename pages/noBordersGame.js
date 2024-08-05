import { useState, useEffect } from 'react';

const CELL_SIZE = 20;
const WIDTH = 600;
const HEIGHT = 600;

const getRandomPosition = () => {
  const x = Math.floor(Math.random() * (WIDTH / CELL_SIZE));
  const y = Math.floor(Math.random() * (HEIGHT / CELL_SIZE));
  return { x, y };
};

const NoBordersGame = () => {
  const [snake, setSnake] = useState([{ x: 2, y: 2 }]);
  const [food, setFood] = useState(getRandomPosition());
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        switch (direction) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        newSnake.unshift(head);

        if (head.x < 0) head.x = WIDTH / CELL_SIZE - 1;
        if (head.x >= WIDTH / CELL_SIZE) head.x = 0;
        if (head.y < 0) head.y = HEIGHT / CELL_SIZE - 1;
        if (head.y >= HEIGHT / CELL_SIZE) head.y = 0;

        if (head.x === food.x && head.y === food.y) {
          setFood(getRandomPosition());
          setScore(score + 1);
        } else {
          newSnake.pop();
        }

        // Check for collision with itself
        for (let i = 1; i < newSnake.length; i++) {
          if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
            setGameOver(true);
            return prevSnake;
          }
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 200);

    return () => clearInterval(interval);
  }, [direction, food, gameOver]);

  return (
    <div>
      <h1>No Borders Game</h1>
      <div>Score: {score}</div>
      <div
        style={{
          position: 'relative',
          width: WIDTH,
          height: HEIGHT,
          background: '#f0f0f0',
          border: '1px solid #333',
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: CELL_SIZE,
              height: CELL_SIZE,
              background: '#4caf50',
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            width: CELL_SIZE,
            height: CELL_SIZE,
            background: '#ff5722',
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        />
      </div>
      {gameOver && <div className="game-over">Game Over</div>}
    </div>
  );
};

export default NoBordersGame;
