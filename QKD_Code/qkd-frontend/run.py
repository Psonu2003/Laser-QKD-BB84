import subprocess
import os
import platform


script_dir = os.path.abspath(os.path.dirname(__file__))


def escape(command):
    return command.replace('"', '\\"')


system = platform.system()

if system == "Darwin":  # macOS
    command1 = f'cd "{script_dir}"; source ~/.zshrc; source ./qkd_venv/bin/activate && uvicorn main:app --reload'
    command2 = f'cd "{script_dir}"; npm run dev'

    escaped_command1 = escape(command1)
    escaped_command2 = escape(command2)

    apple_script = f'''
    tell application "Terminal"
        activate
        do script "{escaped_command1}"
        delay 1
        do script "{escaped_command2}" in (do script "")
    end tell
    '''

    process = subprocess.Popen(["osascript"], stdin=subprocess.PIPE, text=True)
    stdout, stderr = process.communicate(apple_script)

    if process.returncode != 0:
        print("AppleScript failed:")
        print(stderr)
    else:
        print("Success! Terminals launched.")

elif system == "Windows":
    command1 = f'cmd /k "cd /d {script_dir} && qkd_venv\\Scripts\\activate && uvicorn main:app --reload"'
    command2 = f'cmd /k "cd /d {script_dir} && npm run dev"'

    subprocess.Popen(command1, shell=True)
    subprocess.Popen(command2, shell=True)
    print("Success! Command prompts launched.")

elif system == "Linux":
    command1 = f'cd "{script_dir}"; source ./qkd_venv/bin/activate && uvicorn main:app --reload'
    command2 = f'cd "{script_dir}"; npm run dev'

    # Try gnome-terminal, fallback to x-terminal-emulator if needed
    try:
        subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', f'{command1}; exec bash'])
        subprocess.Popen(['gnome-terminal', '--', 'bash', '-c', f'{command2}; exec bash'])
    except FileNotFoundError:
        try:
            subprocess.Popen(['x-terminal-emulator', '-e', f'bash -c "{command1}; exec bash"'])
            subprocess.Popen(['x-terminal-emulator', '-e', f'bash -c "{command2}; exec bash"'])
        except FileNotFoundError:
            print("No supported terminal emulator found (gnome-terminal or x-terminal-emulator)")
else:
    print(f"Unsupported OS: {system}")
