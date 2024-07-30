import { useState, useEffect } from 'react';
import DarkModeToggle from './DarkModeToggle';

const SnakeGame = ({ score, setScore }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [pressedKeys, setPressedKeys] = useState({});

  const isOppositeDirection = (newDirection, currentDirection) => {
    const opposites = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
      UP_LEFT: 'DOWN_RIGHT',
      UP_RIGHT: 'DOWN_LEFT',
      DOWN_LEFT: 'UP_RIGHT',
      DOWN_RIGHT: 'UP_LEFT',
    };
    return opposites[newDirection] === currentDirection;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newPressedKeys = { ...pressedKeys, [e.key]: true };
      setPressedKeys(newPressedKeys);

      let newDirection;
      if (newPressedKeys['ArrowUp'] && newPressedKeys['ArrowLeft']) {
        newDirection = 'UP_LEFT';
      } else if (newPressedKeys['ArrowUp'] && newPressedKeys['ArrowRight']) {
        newDirection = 'UP_RIGHT';
      } else if (newPressedKeys['ArrowDown'] && newPressedKeys['ArrowLeft']) {
        newDirection = 'DOWN_LEFT';
      } else if (newPressedKeys['ArrowDown'] && newPressedKeys['ArrowRight']) {
        newDirection = 'DOWN_RIGHT';
      } else if (newPressedKeys['ArrowUp']) {
        newDirection = 'UP';
      } else if (newPressedKeys['ArrowDown']) {
        newDirection = 'DOWN';
      } else if (newPressedKeys['ArrowLeft']) {
        newDirection = 'LEFT';
      } else if (newPressedKeys['ArrowRight']) {
        newDirection = 'RIGHT';
      }

      if (newDirection && !isOppositeDirection(newDirection, direction)) {
        setDirection(newDirection);
      }
    };

    const handleKeyUp = (e) => {
      const newPressedKeys = { ...pressedKeys };
      delete newPressedKeys[e.key];
      setPressedKeys(newPressedKeys);
    };

    const disableScroll = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', disableScroll);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', disableScroll);
    };
  }, [direction, pressedKeys]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      const newSnake = [...snake];
      const head = { ...newSnake[0] };

      const speedFactor = Math.sqrt(2) / 2;

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
        case 'UP_LEFT':
          head.y -= speedFactor;
          head.x -= speedFactor;
          break;
        case 'UP_RIGHT':
          head.y -= speedFactor;
          head.x += speedFactor;
          break;
        case 'DOWN_LEFT':
          head.y += speedFactor;
          head.x -= speedFactor;
          break;
        case 'DOWN_RIGHT':
          head.y += speedFactor;
          head.x += speedFactor;
          break;
        default:
          break;
      }

      newSnake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        setFood({
          x: Math.floor(Math.random() * 20),
          y: Math.floor(Math.random() * 20),
        });
        setScore(score + 1);
      } else {
        newSnake.pop();
      }

      if (
        head.x < 0 ||
        head.x >= 20 ||
        head.y < 0 ||
        head.y >= 20 ||
        newSnake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        setGameOver(true);
      } else {
        setSnake(newSnake);
      }
    };

    const interval = setInterval(moveSnake, 100);

    return () => {
      clearInterval(interval);
    };
  }, [snake, direction, food, gameOver, score]);

  const handleRestart = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
  };

  const renderGameOverScreen = () => (
    <div className="game-over-screen">
      <h2>Game Over</h2>
      <button onClick={handleRestart}>Restart</button>
    </div>
  );

  const renderGrid = () => (
    <div className="grid">
      {Array.from({ length: 20 }).map((_, row) =>
        Array.from({ length: 20 }).map((_, col) => (
          <div
            key={`${row}-${col}`}
            className={`cell ${
              snake.some((segment) => segment.x === col && segment.y === row)
                ? `snake`
                : food.x === col && food.y === row
                ? `food`
                : ''
            }`}
            style={{
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            }}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="snake-game">
      <DarkModeToggle />
      <div className="score">Score: {score}</div>
      {gameOver ? renderGameOverScreen() : renderGrid()}
    </div>
  );
};

export default SnakeGame;
