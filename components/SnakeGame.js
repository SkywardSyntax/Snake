import { useState, useEffect, useRef } from 'react';

const SnakeGame = ({ score, setScore, gameMode, level }) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [powerUps, setPowerUps] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // For Time Attack mode
  const [survivalDifficulty, setSurvivalDifficulty] = useState(1); // For Survival mode

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
    if (e.key === 'ArrowUp' && !isOppositeDirection('UP', direction)) {
      setDirection('UP');
    } else if (e.key === 'ArrowDown' && !isOppositeDirection('DOWN', direction)) {
      setDirection('DOWN');
    } else if (e.key === 'ArrowLeft' && !isOppositeDirection('LEFT', direction)) {
      setDirection('LEFT');
    } else if (e.key === 'ArrowRight' && !isOppositeDirection('RIGHT', direction)) {
      setDirection('RIGHT');
    }
  };

  const disableScroll = (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', disableScroll);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', disableScroll);
    };
  }, []);

  const moveSnake = (snake, direction) => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    const directionVector = {
      'UP': { x: 0, y: -1 },
      'DOWN': { x: 0, y: 1 },
      'LEFT': { x: -1, y: 0 },
      'RIGHT': { x: 1, y: 0 },
    }[direction];

    const newHead = {
      x: head.x + directionVector.x,
      y: head.y + directionVector.y,
    };

    if (gameMode === 'no-borders') {
      if (newHead.x < 0) newHead.x = 19;
      if (newHead.x >= 20) newHead.x = 0;
      if (newHead.y < 0) newHead.y = 19;
      if (newHead.y >= 20) newHead.y = 0;
    } else {
      if (newHead.x < 0 || newHead.x >= 20 || newHead.y < 0 || newHead.y >= 20) {
        setGameOver(true);
        return snake;
      }
    }

    newSnake.unshift(newHead);
    return newSnake;
  };

  const checkCollision = (head, snake) => {
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        setGameOver(true);
        return true;
      }
    }
    return false;
  };

  const handleFoodCollision = (head, food) => {
    if (head.x === food.x && head.y === food.y) {
      setFood({
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20),
      });
      setScore(score + 1);
      if (gameMode === 'time-attack') {
        setTimeLeft(timeLeft + 5); // Add 5 seconds for each food eaten
      } else if (gameMode === 'survival') {
        setSurvivalDifficulty(survivalDifficulty + 1); // Increase difficulty for each food eaten
      }
      return true;
    }
    return false;
  };

  const handlePowerUpCollision = (head, powerUps) => {
    for (let i = 0; i < powerUps.length; i++) {
      if (head.x === powerUps[i].x && head.y === powerUps[i].y) {
        // Handle power-up effect
        if (powerUps[i].type === 'speed') {
          setSpeedBoost(true);
          setTimeout(() => setSpeedBoost(false), 5000);
        }
        setPowerUps(powerUps.filter((_, index) => index !== i));
        return true;
      }
    }
    return false;
  };

  const handleObstacleCollision = (head, obstacles) => {
    for (let i = 0; i < obstacles.length; i++) {
      if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
        setGameOver(true);
        return true;
      }
    }
    return false;
  };

  const generatePowerUps = () => {
    const newPowerUps = [];
    for (let i = 0; i < level; i++) {
      newPowerUps.push({
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20),
        type: 'speed',
      });
    }
    setPowerUps(newPowerUps);
  };

  const generateObstacles = () => {
    const newObstacles = [];
    for (let i = 0; i < level; i++) {
      newObstacles.push({
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20),
        type: 'static',
      });
    }
    setObstacles(newObstacles);
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

      if (handlePowerUpCollision(head, powerUps)) {
        // Handle power-up effect
      }

      if (handleObstacleCollision(head, obstacles)) {
        setGameOver(true);
      } else if (checkCollision(head, newSnake)) {
        setGameOver(true);
      } else {
        setSnake(newSnake);
      }

      if (gameMode === 'time-attack') {
        setTimeLeft(timeLeft - 1);
        if (timeLeft <= 0) {
          setGameOver(true);
        }
      } else if (gameMode === 'survival') {
        // Increase difficulty over time
        setSurvivalDifficulty(survivalDifficulty + 0.01);
      }
    }, speedBoost ? 50 : gameMode === 'hardcore' ? 50 : 100);

    return () => {
      clearInterval(interval);
    };
  }, [snake, direction, food, gameMode, gameOver, score, powerUps, obstacles, speedBoost, timeLeft, survivalDifficulty]);

  const handleRestart = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setPowerUps([]);
    setObstacles([]);
    setTimeLeft(60); // Reset time for Time Attack mode
    setSurvivalDifficulty(1); // Reset difficulty for Survival mode
  };

  const handleNextLevel = () => {
    generatePowerUps();
    generateObstacles();
  };

  const renderGameOverScreen = () => (
    <div className="game-over-screen">
      <h2>Game Over</h2>
      <button onClick={handleRestart}>Restart</button>
      <button onClick={handleNextLevel}>Next Level</button>
      <div className="game-over-animation"></div>
    </div>
  );

  return (
    <div className="snake-game">
      <div className="score">Score: {score}</div>
      {gameMode === 'time-attack' && <div className="time-left">Time Left: {timeLeft}s</div>}
      {gameMode === 'survival' && <div className="difficulty">Difficulty: {survivalDifficulty.toFixed(2)}</div>}
      <canvas ref={canvasRef} width="400" height="400"></canvas>
      {gameOver && renderGameOverScreen()}
    </div>
  );
};

export default SnakeGame;
