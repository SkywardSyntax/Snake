# GitHub Codespaces ♥️ Next.js

Welcome to your shiny new Codespace running Next.js! We've got everything fired up and running for you to explore Next.js.

You've got a blank canvas to work on from a git perspective as well. There's a single initial commit with the what you're seeing right now - where you go from here is up to you!

Everything you do here is contained within this one codespace. There is no repository on GitHub yet. If and when you’re ready you can click "Publish Branch" and we’ll create your repository and push up your project. If you were just exploring then and have no further need for this code then you can simply delete your codespace and it's gone forever.

## Snake Game

This is a basic snake game implementation using React and Next.js.

### Features

- **Game Mode Selection**: Choose between the default game mode and the 'no Borders' game mode.
- **Default Game Mode**: A basic snake game that includes a game board, snake, food, and basic controls.
- **No Borders Game Mode**: A variation of the snake game where the snake comes through the opposing border instead of ending the game.
- **Consistent Game Field**: The game field appearance is consistent in both default and no borders versions.
- **Visually Appealing Game Selection Screen**: The game selection screen is visually appealing.
- **Snake Movement Logic**: The snake ignores commands to move in the opposite direction.

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

### How to Play

- Use the arrow keys to control the snake's movement.
- The objective is to eat the food that appears on the game board.
- The game ends if the snake collides with itself or the walls (in default game mode).
- In 'no Borders' game mode, the snake comes through the opposing border instead of ending the game.
- The snake ignores commands to move in the opposite direction.

### Contributing

If you would like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your forked repository.
5. Create a pull request to the main repository.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
