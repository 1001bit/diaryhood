import os
import shutil
import sys

def copy_directory(src, dest):
    # Copy source directory to destination directory, excluding 'copyto.txt'
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest, ignore=shutil.ignore_patterns('copyto.txt'))
    # Add 'NOEDIT.txt' to the destination directory
    with open(os.path.join(dest, 'NOEDIT.txt'), 'w') as f:
        f.write("This directory was copied and its contents should not be edited.")

def process_directory(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if 'copyto.txt' in filenames:
            current_dir_name = os.path.basename(dirpath)
            copyto_path = os.path.join(dirpath, 'copyto.txt')

            # Read directories from copyto.txt
            with open(copyto_path, 'r') as f:
                target_dirs = [line.strip() for line in f.readlines()]

            for target_dir in target_dirs:
                if os.path.isdir(target_dir):
                    # Create "shared" directory inside the target directory
                    shared_subdir = os.path.join(target_dir, 'shared')
                    os.makedirs(shared_subdir, exist_ok=True)
                    target_shared_subdir = os.path.join(shared_subdir, current_dir_name)
                    # Remove existing directory if present
                    if os.path.exists(target_shared_subdir):
                        shutil.rmtree(target_shared_subdir)
                    # Copy current directory to the target shared directory, excluding copyto.txt and adding NOEDIT.txt
                    copy_directory(dirpath, target_shared_subdir)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 script.py <dir>")
        sys.exit(1)

    root_directory = sys.argv[1]

    if not os.path.isdir(root_directory):
        print(f"Error: {root_directory} is not a valid directory.")
        sys.exit(1)

    process_directory(root_directory)
    print("Operation completed.")