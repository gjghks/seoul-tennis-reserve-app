#!/usr/bin/env bash
# One-time server setup on a fresh Ubuntu 24.04 (Oracle A1). Run as the default 'ubuntu' user with sudo.
set -euo pipefail
REPO=https://github.com/gjghks/seoul-tennis-reserve-app.git
APP_DIR=/opt/seoul-tennis

sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ca-certificates curl git unattended-upgrades fail2ban
# Docker Engine (official convenience script pins to the stable channel)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
sudo systemctl enable --now docker

# Security: automatic security updates, SSH key-only, fail2ban on sshd
sudo dpkg-reconfigure -f noninteractive unattended-upgrades
sudo sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload ssh
sudo systemctl enable --now fail2ban

# 4 GB swap so `next build` never OOMs on the smaller 6 GB shape
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

sudo mkdir -p "$APP_DIR" && sudo chown "$USER:$USER" "$APP_DIR"
[ -d "$APP_DIR/.git" ] || git clone --quiet "$REPO" "$APP_DIR"
echo "bootstrap done. Next: place .env.production and .env.tunnel in $APP_DIR, then run deploy/deploy.sh"
