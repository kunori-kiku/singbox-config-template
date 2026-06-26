#!/bin/sh

# 1. Delete the old table completely (suppress error if it doesn't exist)
nft delete table inet user 2>/dev/null

# 2. Reload the firewall
/etc/init.d/firewall reload