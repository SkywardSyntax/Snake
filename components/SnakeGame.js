import { useState, useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec3 a_normal;
  uniform vec2 u_resolution;
  uniform mat4 u_modelViewMatrix;
  uniform mat4 u_projectionMatrix;
  varying vec3 v_normal;
  void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(clipSpace * vec2(1, -1), 0, 1);
    v_normal = a_normal;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  uniform vec3 u_lightDirection;
  varying vec3 v_normal;
  void main() {
    float light = dot(normalize(v_normal), normalize(u_lightDirection));
    gl_FragColor = u_color * light;
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
  const previousTimestampRef = useRef(null);
  const [frameRate, setFrameRate] = useState(0);

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
    const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    const lightDirectionUniformLocation = gl.getUniformLocation(program, 'u_lightDirection');
    const modelViewMatrixUniformLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
    const projectionMatrixUniformLocation = gl.getUniformLocation(program, 'u_projectionMatrix');

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

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    const normals = [
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform3f(lightDirectionUniformLocation, 0.5, 0.7, 1);

    const modelViewMatrix = mat4.create();
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, gl.canvas.width / gl.canvas.height, 0.1, 100);
    mat4.translate(modelViewMatrix, modelViewMatrix, [-1.0, -1.0, -2.0]);
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

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

    const render = (timestamp) => {
      if (previousTimestampRef.current !== null) {
        const delta = timestamp - previousTimestampRef.current;
        const fps = 1000 / delta;
        setFrameRate(fps.toFixed(2));
      }
      previousTimestampRef.current = timestamp;

      gl.clear(gl.COLOR_BUFFER_BIT);
      drawSnake();
      drawFood();
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
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
      <div className="frame-rate">FPS: {frameRate}</div>
      <canvas ref={canvasRef} width="400" height="400"></canvas>
      {gameOver && renderGameOverScreen()}
    </div>
  );
};

export default SnakeGame;
