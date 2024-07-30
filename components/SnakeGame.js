import { useState, useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;
  }
`;

const snakeMovementShaderSource = `
  precision mediump float;
  uniform vec2 u_snakeHead;
  uniform vec2 u_direction;
  uniform vec2 u_gridSize;
  void main() {
    vec2 newHead = u_snakeHead + u_direction;
    if (newHead.x < 0.0) newHead.x = u_gridSize.x - 1.0;
    if (newHead.x >= u_gridSize.x) newHead.x = 0.0;
    if (newHead.y < 0.0) newHead.y = u_gridSize.y - 1.0;
    if (newHead.y >= u_gridSize.y) newHead.y = 0.0;
    gl_FragColor = vec4(newHead, 0.0, 1.0);
  }
`;

const collisionDetectionShaderSource = `
  precision mediump float;
  uniform vec2 u_snakeHead;
  uniform vec2 u_snakeSegment;
  void main() {
    if (u_snakeHead == u_snakeSegment) {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
  }
`;

const SnakeGame = ({ score, setScore, gameMode }) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [gl, setGl] = useState(null);
  const [program, setProgram] = useState(null);
  const [snakeMovementProgram, setSnakeMovementProgram] = useState(null);
  const [collisionDetectionProgram, setCollisionDetectionProgram] = useState(null);

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

    const newHead = calculateNewHeadPosition(head, directionVector);

    if (gameMode === 'no-borders') {
      if (newHead.x < 0) newHead.x = 19;
      if (newHead.x >= 20) newHead.x = 0;
      if (newHead.y < 0) newHead.y = 19;
      if (newHead.y >= 20) newHead.y = 0;
    }

    newSnake.unshift(newHead);
    return newSnake;
  };

  const calculateNewHeadPosition = (head, directionVector) => {
    const newHead = { ...head };
    if (!gl) {
      console.error('WebGL context is null');
      return newHead;
    }
    const snakeHeadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, snakeHeadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([head.x, head.y]), gl.STATIC_DRAW);

    const directionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, directionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([directionVector.x, directionVector.y]), gl.STATIC_DRAW);

    gl.useProgram(snakeMovementProgram);

    const snakeHeadLocation = gl.getUniformLocation(snakeMovementProgram, 'u_snakeHead');
    const directionLocation = gl.getUniformLocation(snakeMovementProgram, 'u_direction');
    const gridSizeLocation = gl.getUniformLocation(snakeMovementProgram, 'u_gridSize');

    gl.uniform2f(snakeHeadLocation, head.x, head.y);
    gl.uniform2f(directionLocation, directionVector.x, directionVector.y);
    gl.uniform2f(gridSizeLocation, 20, 20);

    gl.drawArrays(gl.POINTS, 0, 1);

    const newHeadPosition = new Float32Array(2);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, newHeadPosition);

    newHead.x = newHeadPosition[0];
    newHead.y = newHeadPosition[1];

    return newHead;
  };

  const checkCollision = (head, snake) => {
    if (!gl) {
      console.error('WebGL context is null');
      return false;
    }
    const collisionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, collisionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([head.x, head.y]), gl.STATIC_DRAW);

    gl.useProgram(collisionDetectionProgram);

    const snakeHeadLocation = gl.getUniformLocation(collisionDetectionProgram, 'u_snakeHead');
    const snakeSegmentLocation = gl.getUniformLocation(collisionDetectionProgram, 'u_snakeSegment');

    gl.uniform2f(snakeHeadLocation, head.x, head.y);

    for (let i = 1; i < snake.length; i++) {
      const segment = snake[i];
      gl.uniform2f(snakeSegmentLocation, segment.x, segment.y);
      gl.drawArrays(gl.POINTS, 0, 1);

      const collisionResult = new Float32Array(4);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, collisionResult);

      if (collisionResult[0] === 1.0) {
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
      return true;
    }
    return false;
  };

  const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  };

  const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    setGl(gl);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    setProgram(program);

    const snakeMovementShader = createShader(gl, gl.FRAGMENT_SHADER, snakeMovementShaderSource);
    const snakeMovementProgram = createProgram(gl, vertexShader, snakeMovementShader);
    setSnakeMovementProgram(snakeMovementProgram);

    const collisionDetectionShader = createShader(gl, gl.FRAGMENT_SHADER, collisionDetectionShaderSource);
    const collisionDetectionProgram = createProgram(gl, vertexShader, collisionDetectionShader);
    setCollisionDetectionProgram(collisionDetectionProgram);

    return () => {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
      gl.deleteShader(snakeMovementShader);
      gl.deleteProgram(snakeMovementProgram);
      gl.deleteShader(collisionDetectionShader);
      gl.deleteProgram(collisionDetectionProgram);
    };
  }, []);

  useEffect(() => {
    if (!gl || !program) return;

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const colorUniformLocation = gl.getUniformLocation(program, 'u_color');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
      0, 0,
      20, 0,
      0, 20,
      0, 20,
      20, 0,
      20, 20,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    const drawSnake = () => {
      snake.forEach(segment => {
        gl.uniform4f(colorUniformLocation, 0, 1, 0, 1);
        const x1 = segment.x * 20;
        const y1 = segment.y * 20;
        const x2 = x1 + 20;
        const y2 = y1 + 20;
        const positions = [
          x1, y1,
          x2, y1,
          x1, y2,
          x1, y2,
          x2, y1,
          x2, y2,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      });
    };

    const drawFood = () => {
      gl.uniform4f(colorUniformLocation, 1, 0, 0, 1);
      const x1 = food.x * 20;
      const y1 = food.y * 20;
      const x2 = x1 + 20;
      const y2 = y1 + 20;
      const positions = [
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
      ];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const render = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      drawSnake();
      drawFood();
    };

    render();
  }, [gl, program, snake, food]);

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
    }, gameMode === 'hardcore' ? 50 : 100);

    return () => {
      clearInterval(interval);
    };
  }, [snake, direction, food, gameMode, gameOver, score]);

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

  return (
    <div className="snake-game">
      <div className="score">Score: {score}</div>
      <canvas ref={canvasRef} width="400" height="400"></canvas>
      {gameOver && renderGameOverScreen()}
    </div>
  );
};

export default SnakeGame;
