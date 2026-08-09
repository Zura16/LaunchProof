#!/bin/bash
# LaunchProof Automated Daily 15% Commit Pusher

COMMITS=(
  "0f68e83" # Day 1: Project structure, configs, dependencies (15%) - PUSHED
  "958f527" # Day 2: Prisma schema, database client, seed data (15%)
  "aa6acc8" # Day 3: Auth.js NextAuth v5 configuration & route handlers (15%)
  "99db63a" # Day 4: Mobbin-style sidebar, header, and dashboard layout (15%)
  "a8a6877" # Day 5: Readiness overview, impact actions & market quick bar (15%)
  "2f16241" # Day 6: Target jobs, market insights, evidence graph, and project roadmap (15%)
  "e59796f" # Day 7: Applications tracker, resume workspace, proof profile, settings & extension (15%)
)

echo "🚀 LaunchProof Daily 15% Pusher"
echo "Remote: https://github.com/Zura16/LaunchProof.git"

# Check current remote head commit
REMOTE_HEAD=$(git rev-parse origin/main 2>/dev/null)
echo "Current Remote Head: $REMOTE_HEAD"

# Find next commit to push
NEXT_COMMIT=""
for c in "${COMMITS[@]}"; do
  if ! git merge-base --is-ancestor "$c" origin/main 2>/dev/null; then
    NEXT_COMMIT="$c"
    break
  fi
done

if [ -z "$NEXT_COMMIT" ]; then
  echo "✅ All 7 commits (100% of codebase) have already been pushed to GitHub!"
  exit 0
fi

echo "Pushing next 15% chunk ($NEXT_COMMIT) to origin/main..."
git push origin "$NEXT_COMMIT:refs/heads/main"

if [ $? -eq 0 ]; then
  echo "🎉 Successfully pushed 15% commit chunk ($NEXT_COMMIT) to https://github.com/Zura16/LaunchProof.git!"
else
  echo "❌ Push failed. Please check your GitHub credentials or remote permissions."
fi
