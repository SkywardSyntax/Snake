import { useRouter } from 'next/router';
import useSnakeGame from '../hooks/useSnakeGame';
import styled, { keyframes } from 'styled-components';

const CELL_SIZE = 20;
const WIDTH = 600;
const HEIGHT = 600;

const frostedGlass = `
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  border-radius: 10px;
`;

const Board = styled.div`
  position: relative;
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  ${frostedGlass}
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
`;

const Cell = styled.div`
  position: absolute;
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background: ${(props) => (props.isSnake ? '#4caf50' : props.isFood ? '#ff5722' : '#fff')};
  left: ${(props) => props.x * CELL_SIZE}px;
  top: ${(props) => props.y * CELL_SIZE}px;
  transition: transform 0.2s ease-in-out;
`;

const GameOverMessage = styled.div`
  text-align: center;
  font-size: 24px;
  color: red;
  margin-top: 20px;
`;

const BackButton = styled.button`
  ${frostedGlass}
  padding: 10px 20px;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Game = () => {
  const router = useRouter();
  const { mode } = router.query;
  const { snake, food, gameOver, score } = useSnakeGame(mode);

  const isWithinBounds = (x, y) => {
    return x >= 0 && x < WIDTH / CELL_SIZE && y >= 0 && y < HEIGHT / CELL_SIZE;
  };

  const handleBackButtonClick = () => {
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>{mode === 'default' ? 'Default Game' : 'No Borders Game'}</h1>
      <div>Score: {score}</div>
      <Board>
        {snake.map((segment, index) => (
          <Cell key={index} x={segment.x} y={segment.y} isSnake />
        ))}
        {isWithinBounds(food.x, food.y) && <Cell x={food.x} y={food.y} isFood />}
      </Board>
      {gameOver && <GameOverMessage>Game Over</GameOverMessage>}
      <BackButton onClick={handleBackButtonClick}>Back to Game Mode Selection</BackButton>
    </div>
  );
};

export default Game;
