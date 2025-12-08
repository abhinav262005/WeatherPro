# Contributing to WeatherPro

Thank you for considering contributing to WeatherPro! We welcome contributions from everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node version)

### Suggesting Features

We love new ideas! Please create an issue with:
- Clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of your changes"
   ```
   Use conventional commit messages:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots for UI changes

## Development Setup

1. Clone your fork
   ```bash
   git clone https://github.com/abhinav262005/WeatherPro.git
   cd WeatherPro
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure
   ```bash
   cp .env.example .env
   ```

4. Setup database
   ```bash
   mysql -u root -p < database.sql
   ```

5. Start development server
   ```bash
   npm run dev
   ```

## Code Style Guidelines

### JavaScript
- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Use template literals for strings
- Add semicolons
- Use meaningful variable names

### CSS
- Use CSS custom properties for colors
- Follow BEM naming convention where applicable
- Keep selectors specific but not overly nested
- Group related properties together

### HTML
- Use semantic HTML5 elements
- Keep markup clean and readable
- Add appropriate ARIA labels for accessibility

## Testing

Before submitting a PR:
- Test all functionality manually
- Check console for errors
- Test on different browsers
- Test responsive design on mobile

## Database Changes

If your changes require database modifications:
1. Create a new SQL migration file
2. Document the changes in your PR
3. Ensure backward compatibility when possible

## Security

- Never commit sensitive data (API keys, passwords)
- Always use parameterized queries
- Validate and sanitize user input
- Follow security best practices

## Questions?

Feel free to create an issue for any questions or reach out to the maintainers.

Thank you for contributing! 🌤️
