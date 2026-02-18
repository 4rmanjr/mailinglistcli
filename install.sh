#!/bin/bash

# Colors and styles
BOLD='\033[1m'
RESET='\033[0m'
CYAN='\033[1;36m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'

# Script paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_FILE="$SCRIPT_DIR/mailing_list.py"
TARGET_LINK="/usr/local/bin/mailinglist"
APP_NAME="Mailing List CLI"
APP_VERSION="1.0.0"

# Helper functions
print_header() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${CYAN}║${RESET}              ${YELLOW}📧 ${APP_NAME}${RESET} v${APP_VERSION}              ${CYAN}║${RESET}"
    echo -e "${CYAN}║${RESET}           ${GRAY}Installer & Setup Tool${RESET}                   ${CYAN}║${RESET}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${RESET}"
    echo
}

print_success() {
    echo -e "${GREEN}✅ $1${RESET}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${RESET}"
}

print_error() {
    echo -e "${RED}❌ $1${RESET}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${RESET}"
}

print_step() {
    echo -e "${CYAN}▶ $1${RESET}"
}

spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " ${GRAY}%c${RESET}" "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b"
    done
    printf "  \b\b"
}

run_with_spinner() {
    local msg="$1"
    shift
    echo -ne "${GRAY}  $msg...${RESET}"
    "$@" &
    local pid=$!
    spinner $pid
    wait $pid
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo -e " ${GREEN}✓${RESET}"
    else
        echo -e " ${RED}✗${RESET}"
    fi
    return $exit_code
}

# Check if running with --uninstall
if [ "$1" == "--uninstall" ] || [ "$1" == "-u" ]; then
    print_header
    print_step "Menghapus instalasi..."
    
    if [ -L "$TARGET_LINK" ]; then
        if sudo rm "$TARGET_LINK"; then
            print_success "Symlink berhasil dihapus"
        else
            print_error "Gagal menghapus symlink"
            exit 1
        fi
    else
        print_warning "Symlink tidak ditemukan"
    fi
    
    echo
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${CYAN}║${RESET}        ${YELLOW}👋 Uninstall selesai!${RESET}                        ${CYAN}║${RESET}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${RESET}"
    exit 0
fi

# Main installation
print_header

# Pre-flight checks
print_step "Melakukan pre-flight checks..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python3 tidak ditemukan. Silakan install Python3 terlebih dahulu."
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
print_success "Python3 ditemukan: $PYTHON_VERSION"

# Check source file
if [ ! -f "$SOURCE_FILE" ]; then
    print_error "mailing_list.py tidak ditemukan di: $SCRIPT_DIR"
    exit 1
fi
print_success "Source file ditemukan"

# Check for pip
if ! python3 -m pip --version &> /dev/null; then
    print_warning "Pip tidak ditemukan"
    print_step "Menginstal python3-pip..."
    
    if command -v apt &> /dev/null; then
        sudo apt update -qq && sudo apt install -y python3-pip
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y python3-pip
    elif command -v pacman &> /dev/null; then
        sudo pacman -S --noconfirm python-pip
    else
        print_error "Package manager tidak didukung. Install python3-pip manual."
        exit 1
    fi
fi
print_success "Pip tersedia"

echo

# Install dependencies
print_step "Menginstal dependencies..."
echo

DEPS="reportlab pandas openpyxl pillow"
for dep in $DEPS; do
    echo -ne "${GRAY}  Installing $dep...${RESET}"
    if python3 -m pip install -q $dep --break-system-packages 2>/dev/null || \
       python3 -m pip install -q $dep 2>/dev/null; then
        echo -e " ${GREEN}✓${RESET}"
    else
        echo -e " ${YELLOW}⚠${RESET}"
        print_warning "Gagal install $dep (mungkin sudah terinstall)"
    fi
done

echo
print_success "Dependencies terinstall"

# Make executable
chmod +x "$SOURCE_FILE"

# Create symlink
echo
print_step "Membuat symlink global..."

if [ -L "$TARGET_LINK" ] || [ -e "$TARGET_LINK" ]; then
    print_info "Menghapus symlink lama..."
    sudo rm "$TARGET_LINK"
fi

if sudo ln -s "$SOURCE_FILE" "$TARGET_LINK"; then
    print_success "Symlink dibuat: $TARGET_LINK"
else
    print_error "Gagal membuat symlink. Pastikan memiliki akses sudo."
    exit 1
fi

# Post-installation verification
echo
print_step "Verifikasi instalasi..."

if command -v mailinglist &> /dev/null; then
    print_success "Command 'mailinglist' tersedia di PATH"
    
    # Test import Python modules
    echo -ne "${GRAY}  Testing module imports...${RESET}"
    if python3 "$SOURCE_FILE" --help &> /dev/null || python3 -c "
import sys
sys.path.insert(0, '$SCRIPT_DIR')
from mailing_list import interactive_mode
" 2>/dev/null; then
        echo -e " ${GREEN}✓${RESET}"
        print_success "Module imports berfungsi"
    else
        echo -e " ${YELLOW}⚠${RESET}"
        print_warning "Beberapa module mungkin belum terinstall dengan sempurna"
    fi
else
    print_error "Command 'mailinglist' tidak ditemukan di PATH"
    exit 1
fi

# Final message
echo
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║${RESET}           ${GREEN}🎉 Instalasi Berhasil!${RESET}                     ${CYAN}║${RESET}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════╣${RESET}"
echo -e "${CYAN}║${RESET}  ${GRAY}Jalankan dengan:${RESET}                                     ${CYAN}║${RESET}"
echo -e "${CYAN}║${RESET}                                                      ${CYAN}║${RESET}"
echo -e "${CYAN}║${RESET}     ${BOLD}mailinglist${RESET}                                      ${CYAN}║${RESET}"
echo -e "${CYAN}║${RESET}                                                      ${CYAN}║${RESET}"
echo -e "${CYAN}║${RESET}  ${GRAY}atau dengan file:${RESET}                                  ${CYAN}║${RESET}"
echo -e "${CYAN}║${RESET}                                                      ${CYAN}║${RESET}"
echo -e "${CYAN}║${RESET}     ${BOLD}mailinglist file.xlsx${RESET}                          ${CYAN}║${RESET}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════╣${RESET}"
echo -e "${CYAN}║${RESET}  ${GRAY}Uninstall:${RESET}  ./install.sh --uninstall               ${CYAN}║${RESET}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${RESET}"
