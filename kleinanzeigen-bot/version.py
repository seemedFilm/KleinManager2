import os, subprocess

def get_version():
    commit_hash = os.getenv("GIT_COMMIT")
    if not commit_hash or commit_hash == "unknown":
        try:
            commit_hash = subprocess.check_output(
                ["git", "rev-parse", "--short", "HEAD"]
            ).decode().strip()
        except Exception:
            commit_hash = "unknown"
    return commit_hash
