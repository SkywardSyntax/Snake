# GitHub Codespaces ♥️ Next.js

Welcome to your shiny new Codespace running Next.js! We've got everything fired up and running for you to explore Next.js.

You've got a blank canvas to work on from a git perspective as well. There's a single initial commit with the what you're seeing right now - where you go from here is up to you!

Everything you do here is contained within this one codespace. There is no repository on GitHub yet. If and when you’re ready you can click "Publish Branch" and we’ll create your repository and push up your project. If you were just exploring then and have no further need for this code then you can simply delete your codespace and it's gone forever.

## Snake Game

This is a basic implementation of the classic Snake game using React and Next.js.

### Features

- **Basic Snake Game**: Control the snake to collect food and grow in length.
- **WebGL Rendering**: Utilizes WebGL for rendering the game grid and snake.
- **GPU Computations**: Offloads snake movement and collision detection to the GPU using WebGL shaders.

### Installation

To run this application, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to see the application in action.

### WebGL Requirements

Ensure that your browser supports WebGL. Most modern browsers support WebGL, but it may be disabled or not supported on some older browsers or devices. You can check WebGL support [here](https://get.webgl.org/).

### How to Play

- Use the arrow keys to control the direction of the snake.
- Collect food to grow the snake and increase your score.
- Avoid colliding with the walls or the snake's own body.

### Contributing

If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your forked repository.
5. Create a pull request to the main repository.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

### Note

WebGL support may vary across different browsers and devices. If you encounter any issues with WebGL rendering, please ensure that your browser and graphics drivers are up to date.
