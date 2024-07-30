import { useState, useEffect } from 'react';
import DarkModeToggle from './DarkModeToggle';

const SnakeGame = ({ score, setScore }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [pressedKeys, setPressedKeys] = useState({});
  const [level, setLevel] = useState(1);
  const [powerUps, setPowerUps] = useState([]);
  const [multiplayer, setMultiplayer] = useState(false);
  const [player2, setPlayer2] = useState({ snake: [{ x: 5, y: 5 }], direction: 'LEFT' });

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
      if (score % 5 === 0) {
        setLevel(level + 1);
      }
      return true;
    }
    return false;
  };

  const handlePowerUpCollision = (head, powerUps) => {
    const collidedPowerUp = powerUps.find((powerUp) => powerUp.x === head.x && powerUp.y === head.y);
    if (collidedPowerUp) {
      setPowerUps(powerUps.filter((powerUp) => powerUp !== collidedPowerUp));
      // Apply power-up effect here
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      let newSnake = moveSnake(snake, direction);
      const head = { ...newSnake[0] };

      if (handleFoodCollision(head, food) || handlePowerUpCollision(head, powerUps)) {
        // Do not remove the tail if food or power-up is eaten
      } else {
        newSnake.pop();
      }

      if (checkCollision(head, newSnake)) {
        setGameOver(true);
      } else {
        setSnake(newSnake);
      }

      if (multiplayer) {
        let newPlayer2Snake = moveSnake(player2.snake, player2.direction);
        const player2Head = { ...newPlayer2Snake[0] };

        if (checkCollision(player2Head, newPlayer2Snake)) {
          setGameOver(true);
        } else {
          setPlayer2({ ...player2, snake: newPlayer2Snake });
        }
      }
    }, 100 - level * 5);

    return () => {
      clearInterval(interval);
    };
  }, [snake, direction, food, gameOver, score, level, powerUps, multiplayer, player2]);

  const handleRestart = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setPowerUps([]);
    setMultiplayer(false);
    setPlayer2({ snake: [{ x: 5, y: 5 }], direction: 'LEFT' });
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
                : powerUps.some((powerUp) => powerUp.x === col && powerUp.y === row)
                ? `power-up`
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
