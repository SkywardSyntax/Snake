import { useRouter } from 'next/router';
import useSnakeGame from '../hooks/useSnakeGame';
import styled from 'styled-components';

const CELL_SIZE = 20;
const WIDTH = 600;
const HEIGHT = 600;

const Board = styled.div`
  position: relative;
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  background: #f0f0f0;
  border: 1px solid #333;
`;

const Cell = styled.div`
  position: absolute;
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background: ${(props) => (props.isSnake ? '#4caf50' : props.isFood ? '#ff5722' : '#fff')};
  left: ${(props) => props.x * CELL_SIZE}px;
  top: ${(props) => props.y * CELL_SIZE}px;
`;

const GameOverMessage = styled.div`
  text-align: center;
  font-size: 24px;
  color: red;
  margin-top: 20px;
`;

const Game = () => {
  const router = useRouter();
  const { mode } = router.query;
  const { snake, food, gameOver, score } = useSnakeGame(mode);

  return (
    <div>
      <h1>{mode === 'default' ? 'Default Game' : 'No Borders Game'}</h1>
      <div>Score: {score}</div>
      <Board>
        {snake.map((segment, index) => (
          <Cell key={index} x={segment.x} y={segment.y} isSnake />
        ))}
        <Cell x={food.x} y={food.y} isFood />
      </Board>
      {gameOver && <GameOverMessage>Game Over</GameOverMessage>}
    </div>
  );
};

export default Game;
