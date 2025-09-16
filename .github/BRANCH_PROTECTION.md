# 🛡️ Branch Protection Rules

## Main Branch Protection

The `main` branch is protected with the following rules:

### Required Status Checks

- ✅ Code Quality & Build Check
- ✅ Security & Dependency Check
- ✅ All CI/CD pipeline jobs must pass

### Pull Request Requirements

- 🔍 Require pull request reviews before merging
- 🔄 Require branches to be up to date before merging
- 🚫 Restrict pushes to admins only

### Automatic Actions

- 🗑️ Automatically delete head branches after merge
- 🔄 Require signed commits (optional)

## How to Set Up Branch Protection

1. Go to Repository Settings → Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select the required checks:
   - `Code Quality & Build Check`
   - `Security & Dependency Check`
5. Enable "Require pull request reviews before merging"
6. Save changes

This ensures all code goes through proper CI/CD validation before reaching production.
