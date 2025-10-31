# File Recovery Plan

## Investigation Summary
- Main branch has 971 tracked files.
- Current branch (recover/stash-3-proper) has 979 tracked files.
- Approximately 17 non-cache files are missing compared to main.
- Total files in stashes: ~1621 across 8 stashes.
- Previous recoveries: stash@{1} (309 files), stash@{3} (1 file).

## Recovery Steps
- [ ] Stash current working directory changes to avoid conflicts: `git stash push -m "recovery progress"`
- [ ] Apply stash@{7} (528 files): `git stash apply stash@{7}`
- [ ] Commit applied changes: `git add . && git commit -m "chore(recovery): restore files from stash@{7}"`
- [ ] Apply stash@{5} (309 files): `git stash apply stash@{5}`
- [ ] Commit applied changes: `git add . && git commit -m "chore(recovery): restore files from stash@{5}"`
- [ ] Apply stash@{4} (309 files): `git stash apply stash@{4}`
- [ ] Commit applied changes: `git add . && git commit -m "chore(recovery): restore files from stash@{4}"`
- [ ] Apply stash@{2} (160 files): `git stash apply stash@{2}`
- [ ] Commit applied changes: `git add . && git commit -m "chore(recovery): restore files from stash@{2}"`
- [ ] Apply stash@{0} (4 files): `git stash apply stash@{0}`
- [ ] Commit applied changes: `git add . && git commit -m "chore(recovery): restore files from stash@{0}"`
- [ ] Apply stash@{6} (1 file): `git stash apply stash@{6}`
- [ ] Commit applied changes: `git add . && git commit -m "chore(recovery): restore files from stash@{6}"`
- [ ] Restore current changes: `git stash pop`
- [ ] Resolve any merge conflicts if they occur
- [ ] Verify all files are present: `git ls-files | wc -l` should be close to main + stashed
- [ ] Test the project: run builds/tests to ensure functionality
- [ ] Push recovery branch: `git push origin recover/stash-3-proper`
- [ ] Clean up stashes if no longer needed: `git stash drop` for applied ones

## Notes
- If conflicts occur during apply, resolve them manually before committing.
- The dist/ and .nx/cache files are build artifacts and may not need restoration.
- Monitor for any overwritten important changes.
