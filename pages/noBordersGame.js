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
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        // Handle no borders logic
        if (head.x < 0) head.x = WIDTH / CELL_SIZE - 1;
        if (head.x >= WIDTH / CELL_SIZE) head.x = 0;
        if (head.y < 0) head.y = HEIGHT / CELL_SIZE - 1;
        if (head.y >= HEIGHT / CELL_SIZE) head.y = 0;

        newSnake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          setFood(getRandomPosition());
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
    }, 100);

    return () => clearInterval(interval);
  }, [direction, food, gameOver]);

  return (
    <div>
      <h1>No Borders Game</h1>
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
