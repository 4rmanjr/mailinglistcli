#!/bin/bash

# Warna untuk output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Memulai Instalasi Mailing List CLI (Auto-Fix Pip) ===${NC}"

# 1. Cek & Instal Pip jika belum ada
if ! python3 -m pip --version &> /dev/null; then
    echo -e "${BLUE}Pip tidak ditemukan. Mencoba menginstal python3-pip...${NC}"
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y python3-pip
    else
        echo -e "${RED}Gagal: Sistem tidak menggunakan 'apt'. Silakan instal 'python3-pip' secara manual.${NC}"
        exit 1
    fi
fi

# 2. Instal Library yang dibutuhkan
echo -e "${BLUE}Menginstal library (reportlab, pandas, openpyxl)...${NC}"
# Menggunakan --break-system-packages untuk distribusi Linux terbaru (Debian 12+/Ubuntu 23+)
python3 -m pip install reportlab pandas openpyxl --break-system-packages 2>/dev/null || python3 -m pip install reportlab pandas openpyxl

# 3. Pastikan script python executable
chmod +x mailing_list.py

# 4. Membuat Symlink Global
echo -e "${BLUE}Membuat symlink di /usr/local/bin/mailinglist...${NC}"
TARGET_PATH="/usr/local/bin/mailinglist"
SOURCE_PATH="$(pwd)/mailing_list.py"

if [ -L "$TARGET_PATH" ] || [ -f "$TARGET_PATH" ]; then
    sudo rm "$TARGET_PATH"
fi

sudo ln -s "$SOURCE_PATH" "$TARGET_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Symlink berhasil dibuat!${NC}"
else
    echo -e "${RED}Gagal membuat symlink. Pastikan Anda memiliki akses sudo.${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== Instalasi Selesai! ===${NC}"
echo -e "Sekarang Anda bisa mengetik: ${BLUE}mailinglist${NC}"
