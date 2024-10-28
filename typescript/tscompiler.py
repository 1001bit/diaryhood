import subprocess
import concurrent.futures
from pathlib import Path

def execute_tsc_in(path):
    # Construct the path to the tsconfig.json file
    tsconfig_path = Path(path) / "tsconfig.json"
    if not tsconfig_path.exists():
        return

    app = "tsc"
    flag = "-p"

    try:
        # Run the TypeScript compiler command with the specified path
        subprocess.run([app, flag, str(tsconfig_path)], capture_output=True, text=True, check=True)
        print("Compiled typescript from", path)
    except subprocess.CalledProcessError as e:
        print(f"Error compiling typescript in {path}: {e.stderr}")

def recursive_compile_in(root_path):
    # Create a ThreadPoolExecutor to handle concurrent execution of tasks
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        # Recursively find all directories inside the root path
        for path in Path(root_path).rglob("*"):
            # If the path is a directory and not the root directory itself, add a task to compile TypeScript
            if path.is_dir() and path != Path(root_path):
                futures.append(executor.submit(execute_tsc_in, path))

        # Wait for all tasks to complete
        concurrent.futures.wait(futures)

def main():
    import sys
    # Get the list of paths from command line arguments
    paths = sys.argv[1:]
    # Create a ThreadPoolExecutor to handle concurrent execution of compilation for each path
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(recursive_compile_in, path) for path in paths]
        # Wait for all tasks to complete
        concurrent.futures.wait(futures)

if __name__ == "__main__":
    main()
