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

const SnakeGame = ({ score, setScore, gameMode }) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [pressedKeys, setPressedKeys] = useState({});
  const [gl, setGl] = useState(null);
  const [program, setProgram] = useState(null);

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
  }, [pressedKeys]);

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

    if (gameMode === 'no-borders') {
      if (head.x < 0) head.x = 19;
      if (head.x >= 20) head.x = 0;
      if (head.y < 0) head.y = 19;
      if (head.y >= 20) head.y = 0;
    }

    newSnake.unshift(head);
    return newSnake;
  };

  const checkCollision = (head, snake) => {
    if (gameMode === 'no-borders') {
      return snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y);
    }
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

    return () => {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
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
      let newDirection = direction;
      if (pressedKeys['ArrowUp'] && !isOppositeDirection('UP', direction)) {
        newDirection = 'UP';
      } else if (pressedKeys['ArrowDown'] && !isOppositeDirection('DOWN', direction)) {
        newDirection = 'DOWN';
      } else if (pressedKeys['ArrowLeft'] && !isOppositeDirection('LEFT', direction)) {
        newDirection = 'LEFT';
      } else if (pressedKeys['ArrowRight'] && !isOppositeDirection('RIGHT', direction)) {
        newDirection = 'RIGHT';
      }

      let newSnake = moveSnake(snake, newDirection);
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
        setDirection(newDirection);
      }
    }, gameMode === 'hardcore' ? 50 : 100);

    return () => {
      clearInterval(interval);
    };
  }, [snake, direction, food, gameMode, gameOver, score, pressedKeys]);

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
