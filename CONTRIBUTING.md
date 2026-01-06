# Contributing to E-Commerce App

Thank you for your interest in contributing to the E-Commerce App! We welcome contributions from the community.

## How to Contribute

### 1. Fork the Repository

Fork the repository to your own GitHub account by clicking the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/E-Commerce-App.git
cd E-Commerce-App
```

### 3. Create a New Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

or

```bash
git checkout -b fix/your-bug-fix-name
```

### 4. Set Up the Development Environment

#### Backend Setup

```bash
cd BackEnd
npm install
```

Create a `.env` file in the BackEnd directory (see `.env.example` for required variables).

#### Frontend Setup

```bash
cd FrontEnd
npm install
```

### 5. Make Your Changes

- Write clean, readable code that follows the existing code style
- Add comments where necessary to explain complex logic
- Test your changes thoroughly

### 6. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "Add: Brief description of your changes"
```

Commit message prefixes:
- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for updates to existing features
- `Refactor:` for code refactoring
- `Docs:` for documentation changes

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Submit a Pull Request

1. Go to the original repository on GitHub
2. Click "Pull Requests" and then "New Pull Request"
3. Click "compare across forks"
4. Select your fork and branch
5. Provide a clear title and description of your changes
6. Submit the pull request

## Code Style Guidelines

- Use meaningful variable and function names
- Follow consistent indentation (2 spaces for JavaScript)
- Add comments for complex logic
- Keep functions small and focused on a single task
- Use ES6+ features where appropriate

## Testing

- Test your changes locally before submitting
- Ensure existing functionality is not broken
- Add tests for new features when applicable

## Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, Node version, etc.)

## Feature Requests

We welcome feature requests! Please create an issue with:
- A clear, descriptive title
- Detailed description of the proposed feature
- Use cases and benefits
- Any relevant examples or mockups

## Questions?

If you have questions about contributing, feel free to open an issue or reach out to the maintainers.

Thank you for contributing to make this project better!
