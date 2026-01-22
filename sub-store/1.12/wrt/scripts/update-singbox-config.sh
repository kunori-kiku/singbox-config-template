#!/bin/sh

# Usage: ./update-singbox-config.sh <URL>

URL="$1"
CONFIG_FILE="/etc/sing-box/config.json"
TEMP_FILE="/tmp/singbox_new_config.json"

# Find sing-box binary
SINGBOX_BIN="sing-box"
if [ -x "/usr/bin/sing-box" ]; then
    SINGBOX_BIN="/usr/bin/sing-box"
elif [ -x "/usr/sbin/sing-box" ]; then
    SINGBOX_BIN="/usr/sbin/sing-box"
fi

if [ -z "$URL" ]; then
    echo "$(date): Error: No URL provided."
    exit 1
fi

echo "$(date): Starting update..."

# Download the file
# Try curl first, then wget
if command -v curl >/dev/null 2>&1; then
    if ! curl -sL -o "$TEMP_FILE" "$URL"; then
         echo "$(date): Error: Download failed (curl)."
         exit 1
    fi
elif command -v wget >/dev/null 2>&1; then
    if ! wget -qO "$TEMP_FILE" "$URL"; then
         echo "$(date): Error: Download failed (wget)."
         exit 1
    fi
else
    echo "$(date): Error: Neither curl nor wget found."
    exit 1
fi

# Validate the config using sing-box
if ! "$SINGBOX_BIN" check -c "$TEMP_FILE"; then
    echo "$(date): Error: Config validation failed. Aborting update."
    rm -f "$TEMP_FILE"
    exit 1
fi

# Replace the configuration
mv "$TEMP_FILE" "$CONFIG_FILE"
echo "$(date): Config replaced successfully."

# Reload the service if the init script exists
if [ -x "/etc/init.d/sing-box" ]; then
    if /etc/init.d/sing-box reload; then
        echo "$(date): Service reloaded."
    else
        echo "$(date): Warning: Failed to reload service."
    fi
else
    echo "$(date): Init script not found, service not reloaded."
fi
