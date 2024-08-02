import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const CELL_SIZE = 20;
const WIDTH = 600;
const HEIGHT = 600;

const getRandomPosition = () => {
  const x = Math.floor(Math.random() * (WIDTH / CELL_SIZE));
  const y = Math.floor(Math.random() * (HEIGHT / CELL_SIZE));
  return { x, y };
};

const Game = () => {
  const router = useRouter();
  const { mode } = router.query;

  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState(getRandomPosition());
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);

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
        if (head.x === food.x && head.y === food.y) {
          setFood(getRandomPosition());
        } else {
          newSnake.pop();
        }

        if (mode === 'default') {
          if (
            head.x < 0 ||
            head.x >= WIDTH / CELL_SIZE ||
            head.y < 0 ||
            head.y >= HEIGHT / CELL_SIZE ||
            newSnake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
          ) {
            setGameOver(true);
          }
        } else if (mode === 'noBorders') {
          if (head.x < 0) head.x = WIDTH / CELL_SIZE - 1;
          if (head.x >= WIDTH / CELL_SIZE) head.x = 0;
          if (head.y < 0) head.y = HEIGHT / CELL_SIZE - 1;
          if (head.y >= HEIGHT / CELL_SIZE) head.y = 0;

          if (newSnake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)) {
            setGameOver(true);
          }
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 200);

    return () => {
      clearInterval(interval);
    };
  }, [direction, food, gameOver, mode]);

  return (
    <div>
      <h1>{mode === 'default' ? 'Default Game' : 'No Borders Game'}</h1>
      <div className="board">
        {Array.from({ length: WIDTH / CELL_SIZE }).map((_, rowIndex) => (
          <div key={rowIndex} className="row">
            {Array.from({ length: HEIGHT / CELL_SIZE }).map((_, colIndex) => {
              const isSnake = snake.some((segment) => segment.x === colIndex && segment.y === rowIndex);
              const isFood = food.x === colIndex && food.y === rowIndex;
              return (
                <div
                  key={colIndex}
                  className={`cell ${isSnake ? 'snake' : ''} ${isFood ? 'food' : ''}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      {gameOver && <div className="game-over">Game Over</div>}
    </div>
  );
};

export default Game;
