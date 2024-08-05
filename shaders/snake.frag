precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_snakeHead;
uniform vec2 u_snakeBody[100];
uniform int u_snakeLength;
uniform vec2 u_food;
uniform vec4 u_snakeColor;
uniform vec4 u_foodColor;
uniform vec4 u_backgroundColor;

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;

  vec4 color = u_backgroundColor;

  // Check if the fragment is part of the snake head
  if (distance(st, u_snakeHead / u_resolution) < 0.02) {
    color = u_snakeColor;
  }

  // Check if the fragment is part of the snake body
  for (int i = 0; i < u_snakeLength; i++) {
    if (distance(st, u_snakeBody[i] / u_resolution) < 0.02) {
      color = u_snakeColor;
    }
  }

  // Check if the fragment is part of the food
  if (distance(st, u_food / u_resolution) < 0.02) {
    color = u_foodColor;
  }

  gl_FragColor = color;
}
