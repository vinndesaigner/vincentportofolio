import os
import subprocess
import time
import psutil

# Daftar target nama file exe & keyword proses
TARGET_EXES = [
    "whatsapp.exe",
    "whatsapp.root.exe",
    "whatsapphost.exe",
    "whatsappnative.exe",
    "telegram.exe"
]

def kill_apps():
    # 1. Pindai nama file proses
    for proc in psutil.process_iter(['name']):
        try:
            name = proc.info['name']
            if name:
                name_clean = name.lower()
                # Jika nama proses cocok atau mengandung kata 'whatsapp'/'telegram'
                if name_clean in TARGET_EXES or "whatsapp" in name_clean or "telegram" in name_clean:
                    subprocess.run(
                        ["taskkill", "/F", "/T", "/IM", name],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                    print(f"[BLOCKED] Menutup proses: {name}")
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

    # 2. Paksa kill langsung via taskkill wildcard Windows
    for pattern in ["*whatsapp*", "*telegram*"]:
        subprocess.run(
            f"taskkill /F /T /FI \"IMAGENAME eq {pattern}\"",
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

if __name__ == "__main__":
    print("App Guard aktif. Menjaga Telegram & WhatsApp tetap tertutup...")
    while True:
        kill_apps()
        time.sleep(0.3)