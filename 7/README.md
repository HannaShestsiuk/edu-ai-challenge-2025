# Sea Battle (Modernized) 🚢

A fully modernized version of the classic Sea Battle (Battleship) game, refactored from legacy JavaScript to modern ES6+ standards with clean architecture and separation of concerns.

## ✨ Modernization Features

This version has been completely rewritten using modern JavaScript practices:

- **ES6+ Features**: Classes, modules, const/let, arrow functions, async/await
- **Clean Architecture**: Separation of concerns with distinct models, UI, and utilities
- **Object-Oriented Design**: Proper encapsulation and inheritance
- **Modern Error Handling**: Comprehensive error management and validation
- **Enhanced UI**: Improved display with emojis and better formatting
- **Maintainable Code**: Clear naming conventions, JSDoc documentation, and structured organization

## 🏗️ Architecture

The game is organized into several modules:

### Models
- **`Ship`**: Represents individual ships with hit tracking and placement logic
- **`Board`**: Manages the game board, ship placement, and guess processing  
- **`Player`**: Base player class with common functionality
- **`AIPlayer`**: Advanced AI opponent with hunt/target strategies

### UI
- **`GameDisplay`**: Handles all console output and formatting

### Utils
- **`GameUtils`**: Input validation and utility functions

### Core
- **`SeaBattleGame`**: Main game controller orchestrating all components

## 🎮 Gameplay

You play against an intelligent CPU opponent on a 10x10 grid. Both players have 3 ships of length 3. Players take turns guessing coordinates to hit opponent ships.

### Symbols
- `~` = Water (unknown)
- `S` = Your ships  
- `X` = Hit
- `O` = Miss

### AI Strategy
The CPU opponent uses a sophisticated two-mode strategy:
- **Hunt Mode**: Random searching for ships
- **Target Mode**: Systematic targeting of adjacent squares after a hit

## 🚀 How to Run

### Prerequisites
- **Node.js 14.0.0 or higher** - Download from [nodejs.org](https://nodejs.org/)

### Installation & Execution

1. **Clone or download** the project files
2. **Navigate to the project directory** in your terminal
3. **Run the game** using either method:

   ```bash
   # Method 1: Using npm script
   npm start
   
   # Method 2: Direct node execution  
   node main.js
   
   # Method 3: Development mode with auto-restart
   npm run dev
   ```

4. **Follow the prompts** to enter your guesses (e.g., `00` for top-left, `99` for bottom-right)

## 📁 Project Structure

```
sea-battle/
├── src/
│   ├── models/
│   │   ├── Ship.js          # Ship class with placement and hit logic
│   │   ├── Board.js         # Board management and operations
│   │   ├── Player.js        # Base player functionality
│   │   └── AIPlayer.js      # AI opponent with hunt/target modes
│   ├── ui/
│   │   └── GameDisplay.js   # All display and UI operations
│   ├── utils/
│   │   └── GameUtils.js     # Input validation and utilities
│   └── SeaBattleGame.js     # Main game controller
├── main.js                  # Entry point
├── package.json             # Project configuration
└── README.md               # This file
```

## 🔧 Technical Improvements

### From Legacy Code
- **Global Variables** → **Encapsulated State**: All state is properly contained within classes
- **`var` declarations** → **`const`/`let`**: Modern variable declarations with proper scoping
- **Procedural Functions** → **Classes & Methods**: Object-oriented design with clear responsibilities
- **Mixed Concerns** → **Separation of Concerns**: Display, game logic, and data management are separated
- **Callback Hell** → **Async/Await**: Modern asynchronous programming patterns
- **No Error Handling** → **Comprehensive Error Management**: Proper error handling throughout

### Code Quality
- **JSDoc Documentation**: Comprehensive function and class documentation
- **Consistent Naming**: Clear, descriptive variable and function names
- **Modular Design**: Easy to extend and maintain
- **Input Validation**: Robust input validation and error messages
- **Modern JavaScript**: Uses ES6+ features like destructuring, template literals, arrow functions

## 🎯 Game Features

- **Smart AI Opponent**: Uses hunt and target strategies for challenging gameplay
- **Input Validation**: Comprehensive validation with helpful error messages  
- **Enhanced Display**: Modern UI with emojis and clear formatting
- **Game Statistics**: Track remaining ships and game progress
- **Error Recovery**: Graceful handling of invalid inputs and edge cases
- **Extensible Design**: Easy to modify rules, board size, or add new features
- **Comprehensive Testing**: 95%+ test coverage on core modules with Jest

## 🧪 Testing

The project includes a comprehensive test suite with Jest:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- **Core Modules**: 95%+ coverage on all game logic
- **Ship Class**: 100% coverage (19 tests)
- **Board Class**: 100% coverage (16 tests) 
- **Player Classes**: 100% coverage (21 tests)
- **Utilities**: 97%+ coverage (20 tests)

See [TESTING.md](TESTING.md) for detailed testing documentation.

## 🛠️ Development

The codebase is designed for easy modification:

- **Change board size**: Modify `boardSize` in game configuration
- **Adjust ship count**: Change `numShips` parameter
- **Modify ship length**: Update `shipLength` setting
- **Add new ship types**: Extend the `Ship` class
- **Enhance AI**: Modify `AIPlayer` strategies
- **Custom UI**: Extend `GameDisplay` class

## 📝 License

MIT License - Feel free to use and modify as needed.

---

**Enjoy the modernized Sea Battle experience!** 🎮⚓ 