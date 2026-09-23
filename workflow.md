# Collaborative GitHub Workflow

This guide explains how multiple developers can work on the same GitHub repository without directly modifying the `main` branch.

## The Basic Workflow

```text
                GitHub Repository
                       │
                    main
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
     feature/auth   feature/ui   feature/api
          │            │            │
          ↓            ↓            ↓
        Push         Push         Push
          │            │            │
          └────────────┼────────────┘
                       ↓
                Pull Requests
                       ↓
                   Code Review
                       ↓
                    Merge
                       ↓
                     main
```

### Golden Rule

Do not work directly on `main`.

Each developer should create and work on their own branch.

---

# 1. Get Access to the Repository

The repository owner should add team members as collaborators.

On GitHub:

**Repository → Settings → Collaborators → Add people**

Each team member accepts the invitation.

After that, everyone can clone the same repository.

---

# 2. Clone the Repository

Each developer clones the repository once:

```bash
git clone https://github.com/USERNAME/REPOSITORY-NAME.git
```

Move into the project:

```bash
cd REPOSITORY-NAME
```

Check the available branches:

```bash
git branch
```

---

# 3. Always Start From an Updated `main`

Before creating a new branch, make sure your local `main` is up to date.

```bash
git checkout main
```

Then:

```bash
git pull origin main
```

Now your local `main` contains the latest changes from the team.

---

# 4. Create Your Own Branch

Create a branch for the task you're working on.

For example:

```bash
git checkout -b feature/login
```

Or:

```bash
git checkout -b feature/user-dashboard
```

Or:

```bash
git checkout -b fix/navbar
```

The general format is:

```text
feature/task-name
```

or:

```text
fix/problem-name
```

### Examples

```bash
git checkout -b feature/authentication
```

```bash
git checkout -b feature/product-api
```

```bash
git checkout -b fix/login-validation
```

---

# 5. Confirm Your Branch

Run:

```bash
git branch
```

You should see something like:

```text
* feature/login
  main
```

The `*` shows the branch you are currently working on.

---

# 6. Work on Your Task

Now write your code normally.

For example:

```text
feature/login
       ↓
Create login controller
       ↓
Create login route
       ↓
Add validation
       ↓
Test login
```

Your changes are isolated from `main`.

---

# 7. Check Your Changes

Before committing, run:

```bash
git status
```

You can also inspect your changes:

```bash
git diff
```

---

# 8. Commit Your Changes

Add your files:

```bash
git add .
```

Create a commit:

```bash
git commit -m "Add user login"
```

### Good commit messages

```text
Add user authentication
Create product controller
Fix login validation
Add user dashboard
Update API documentation
```

Avoid vague messages like:

```text
Update
Changes
Done
Fix stuff
```

---

# 9. Push Your Branch to GitHub

Push your branch:

```bash
git push -u origin feature/login
```

After the first push, you can usually use:

```bash
git push
```

Your branch will now appear on GitHub.

---

# 10. Create a Pull Request

Go to the GitHub repository.

GitHub will usually show:

`Compare & pull request`

Click it.

Make sure:

```text
base: main
compare: feature/login
```

Then:

1. Add a clear title.
2. Explain what you changed.
3. Mention anything the reviewer should test.
4. Create the Pull Request.

---

# 11. Review the Pull Request

Another team member should review the code.

They can:

* Read the changes
* Leave comments
* Request changes
* Approve the Pull Request

Avoid merging your own Pull Request immediately if your team requires code review.

---

# 12. Merge Into `main`

After the Pull Request has been reviewed and approved:

Click:

`Merge pull request`

Then:

`Confirm merge`

Your changes are now part of:
`main`

---

# 13. Delete the Branch

After merging, the feature branch is no longer needed.

GitHub provides a:

**Delete branch**

button.

You can also delete your local branch:

```bash
git checkout main
git branch -d feature/login
```

---

# 14. Start the Next Task

Before starting another task, update your local `main`:

```bash
git checkout main
git pull origin main
```

Then create a new branch:

```bash
git checkout -b feature/new-task
```

Work → commit → push → Pull Request → review → merge.

---

# Example: Two Developers Working Together

Imagine there are two developers:

### Developer A

Working on authentication:

```bash
git checkout main
git pull origin main

git checkout -b feature/authentication
```

They write their authentication code.

Then:

```bash
git add .
git commit -m "Add authentication"
git push -u origin feature/authentication
```

They create a Pull Request:

```text
feature/authentication → main
```

---

### Developer B

Working on the product API:

```bash
git checkout main
git pull origin main

git checkout -b feature/product-api
```

They write their API code.

Then:

```bash
git add .
git commit -m "Add product API"
git push -u origin feature/product-api
```

They create:

```text
feature/product-api → main
```

Both developers can work simultaneously without directly modifying `main`.

---

# Important: What If `main` Changes While You Are Working?

This is very common.

Suppose you created:

```text
feature/login
```

But another developer merged:

```text
feature/product-api
```

into `main`.

Your branch may now be behind `main`.

First save your work:

```bash
git add .
git commit -m "Complete login work"
```

Then update `main`:

```bash
git checkout main
git pull origin main
```

Return to your branch:

```bash
git checkout feature/login
```

Then bring the latest `main` changes into your branch:

```bash
git merge main
```

If there are conflicts, Git will tell you which files need attention.

After resolving the conflicts:

```bash
git add .
git commit -m "Resolve merge conflicts"
git push
```

Your Pull Request will then contain your updated branch.

---

# Recommended Branch Structure

For a typical backend project:

```text
main
│
├── feature/authentication
├── feature/user-profile
├── feature/product-api
├── feature/order-api
├── feature/payment
│
├── fix/login-error
└── fix/product-validation
```

Each branch should generally represent **one task or feature**.

---

# The Workflow You Should Memorize

Every time you receive a new task:

```bash
# 1. Go to main
git checkout main

# 2. Get the latest version
git pull origin main

# 3. Create your branch
git checkout -b feature/task-name

# 4. Write your code

# 5. Check your changes
git status

# 6. Stage changes
git add .

# 7. Commit
git commit -m "Describe your changes"

# 8. Push your branch
git push -u origin feature/task-name
```

Then on GitHub:

```text
Create Pull Request
        ↓
Code Review
        ↓
Approval
        ↓
Merge into main
        ↓
Delete feature branch
```

---

# ⚠️ Three Rules to Remember

### 1. Don't code directly on `main`

```text
❌ main → write code → push
```

Instead:

```text
✅ main → create branch → write code → push branch → Pull Request → merge
```

### 2. Pull before creating a new branch

Always:

```bash
git checkout main
git pull origin main
```

before starting your next task.

### 3. Keep branches focused

Instead of creating one giant branch:

```text
feature/everything
```

create smaller branches:

```text
feature/authentication
feature/products
feature/orders
feature/payment
```

This makes reviewing and merging much easier.

---

# Quick Cheat Sheet

```bash
# Update main
git checkout main
git pull origin main

# Create branch
git checkout -b feature/my-task

# Work...

# Save changes
git add .
git commit -m "Describe changes"

# Push branch
git push -u origin feature/my-task
```

Then:

```text
GitHub
  ↓
Pull Request
  ↓
Review
  ↓
Approve
  ↓
Merge into main
  ↓
Delete branch
```

**This is the basic collaborative GitHub workflow you should use for team projects.**
