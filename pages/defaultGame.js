import { useState, useEffect } from 'react';

const DefaultGame = () => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
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
          setFood({
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
          });
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
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 200);

    return () => {
      clearInterval(interval);
    };
  }, [direction, food, gameOver]);

  return (
    <div>
      <h1>Default Game</h1>
      <div className="board">
        {Array.from({ length: 20 }).map((_, rowIndex) => (
          <div key={rowIndex} className="row">
            {Array.from({ length: 20 }).map((_, colIndex) => {
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

export default DefaultGame;
