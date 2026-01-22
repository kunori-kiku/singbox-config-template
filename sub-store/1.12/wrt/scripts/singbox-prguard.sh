#!/bin/sh

PR_MARK="0x1"
PR_TABLE="100"
PR_PRIO="100"
PR_DEV="tun0"

add_pr() {
    ip link show "$PR_DEV" >/dev/null 2>&1 || return 0

    ip rule show | grep -q "fwmark $PR_MARK lookup $PR_TABLE" || \
        ip rule add fwmark "$PR_MARK" lookup "$PR_TABLE" priority "$PR_PRIO"

    ip route show table "$PR_TABLE" | grep -q "^default dev $PR_DEV" || \
        ip route add default dev "$PR_DEV" table "$PR_TABLE"
}

del_pr() {
    while ip rule show | grep -q "fwmark $PR_MARK lookup $PR_TABLE"; do
        ip rule del fwmark "$PR_MARK" lookup "$PR_TABLE"
    done
    ip route flush table "$PR_TABLE" >/dev/null 2>&1 || true
}

while :; do
    if pidof sing-box >/dev/null 2>&1 && ip link show "$PR_DEV" >/dev/null 2>&1; then
        add_pr
    else
        del_pr
    fi
    sleep 2
done