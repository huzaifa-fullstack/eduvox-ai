# Contributing to EduVox AI

Thank you for your interest in contributing to **EduVox AI**! This document outlines the development workflow, branch protection policies, and contribution guidelines.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch from `main`
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

## 🛡️ Branch Protection & Workflow

### **Main Branch Protection**

The `main` branch is protected with strict rules to ensure code quality and stability:

#### **Required Status Checks** ✅

- **Code Quality & Build Check** - ESLint, TypeScript, and build verification
- **Security & Dependency Check** - Vulnerability scanning and dependency audit
- **All CI/CD pipeline jobs must pass** before merging

#### **Pull Request Requirements** 🔍

- **Require pull request reviews** before merging
- **Require branches to be up to date** before merging
- **Restrict direct pushes** to admins only
- **Automatic deletion** of head branches after merge

#### **Quality Standards** 📊

- Code must pass **ESLint** with zero errors
- **TypeScript** compilation must succeed
- **Build process** must complete successfully
- **Security audit** must pass with no high/critical vulnerabilities

## 🔄 Development Workflow

### **1. Setting Up Your Environment**

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/eduvox-ai.git
cd eduvox-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys and configuration
```

### **2. Creating a Feature Branch**

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### **3. Development Guidelines**

#### **Code Quality** ✨

- Follow **TypeScript** best practices
- Use **ESLint** and fix all warnings
- Write **clean, readable code** with proper comments
- Follow existing **code style** and patterns

#### **Commit Messages** 📝

Use conventional commit format:

```
feat: add new voice synthesis feature
fix: resolve authentication timeout issue
docs: update API documentation
style: fix code formatting
refactor: optimize database queries
test: add unit tests for companion creation
```

#### **Testing** 🧪

- Test your changes thoroughly
- Ensure **build process** works: `npm run build`
- Run **linting**: `npm run lint`
- Check **TypeScript**: `npx tsc --noEmit`

### **4. Submitting Changes**

#### **Before Submitting** 📋

- [ ] Code passes all **ESLint** checks
- [ ] **TypeScript** compiles without errors
- [ ] **Build** completes successfully
- [ ] Changes are **tested** and working
- [ ] **Commit messages** follow conventions

#### **Pull Request Process** 🔄

1. **Push** your branch to your fork
2. **Create** a pull request to `main` branch
3. **Fill out** the PR template completely
4. **Wait** for automated checks to pass
5. **Address** any review feedback
6. **Merge** once approved and checks pass

## 🔒 Branch Protection Setup

### **For Repository Administrators**

To configure branch protection rules:

1. Go to **Repository Settings** → **Branches**
2. **Add rule** for `main` branch
3. **Enable** "Require status checks to pass before merging"
4. **Select** the required checks:
   - `Code Quality & Build Check`
   - `Security & Dependency Check`
5. **Enable** "Require pull request reviews before merging"
6. **Enable** "Require branches to be up to date before merging"
7. **Save** changes

This ensures all code goes through proper **CI/CD validation** before reaching production.

## 🏗️ Development Environment

### **Required Tools** 🛠️

- **Node.js** 18+
- **npm** or **yarn**
- **Git**
- **VS Code** (recommended)

### **Environment Variables** 🔐

Required environment variables (add to `.env.local`):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_VAPI_WEB_TOKEN`
- `SENTRY_AUTH_TOKEN`

## 🚨 Security Guidelines

- **Never commit** sensitive information (API keys, passwords)
- **Use environment variables** for all secrets
- **Follow** security best practices
- **Report** security issues privately

## 📞 Getting Help

- **Issues** - Create a GitHub issue for bugs or feature requests
- **Discussions** - Use GitHub Discussions for questions
- **Documentation** - Check the README.md for setup instructions

## 📜 Code of Conduct

This project follows the **Contributor Covenant Code of Conduct**. Please be respectful and inclusive in all interactions.

---

Thank you for contributing to **EduVox AI**! Your contributions help make AI-powered education accessible to everyone. 🎓✨
