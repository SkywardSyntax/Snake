import { useState, useEffect } from 'react';

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
    };
    return opposites[newDirection] === currentDirection;
  };

  const handleKeyDown = (e) => {
    const newPressedKeys = { ...pressedKeys, [e.key]: true };
    setPressedKeys(newPressedKeys);

    let newDirection;
    if (newPressedKeys['ArrowUp']) {
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

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keydown', disableScroll);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', disableScroll);
    };
  }, [direction, pressedKeys]);

  const moveSnake = (snake, direction) => {
    const newSnake = [...snake];
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
      default:
        break;
    }

    newSnake.unshift(head);
    return newSnake;
  };

  const checkCollision = (head, snake) => {
    return (
      head.x < 0 ||
      head.x >= 20 ||
      head.y < 0 ||
      head.y >= 20 ||
      snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
    );
  };

  const handleFoodCollision = (head, food) => {
    if (head.x === food.x && head.y === food.y) {
      setFood({
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20),
      });
      setScore(score + 1);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      let newSnake = moveSnake(snake, direction);
      const head = { ...newSnake[0] };

      if (handleFoodCollision(head, food)) {
        // Do not remove the tail if food is eaten
      } else {
        newSnake.pop();
      }

      if (checkCollision(head, newSnake)) {
        setGameOver(true);
      } else {
        setSnake(newSnake);
      }
    }, 100);

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
          />
        ))
      )}
    </div>
  );

  return (
    <div className="snake-game">
      <div className="score">Score: {score}</div>
      {gameOver ? renderGameOverScreen() : renderGrid()}
    </div>
  );
};

export default SnakeGame;
