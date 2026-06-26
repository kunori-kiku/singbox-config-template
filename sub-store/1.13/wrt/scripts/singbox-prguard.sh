#!/bin/sh

PR_MARK="0x1"
PR_TABLE="100"
PR_PRIO="100"
PR_DEV="tun0"
PR_IPV6="1"  # 1 for enabling ipv6 support, 0 for ipv4-only

add_pr() {
    ip link show "$PR_DEV" >/dev/null 2>&1 || return 0

    # IPv4 logic
    ip rule show | grep -q "fwmark $PR_MARK lookup $PR_TABLE" || \
        ip rule add fwmark "$PR_MARK" lookup "$PR_TABLE" priority "$PR_PRIO"
    ip route show table "$PR_TABLE" | grep -q "^default dev $PR_DEV" || \
        ip route add default dev "$PR_DEV" table "$PR_TABLE"

    # IPv6 logic (optional)
    if [ "$PR_IPV6" = "1" ]; then
        ip -6 rule show | grep -q "fwmark $PR_MARK lookup $PR_TABLE" || \
            ip -6 rule add fwmark "$PR_MARK" lookup "$PR_TABLE" priority "$PR_PRIO"
        ip -6 route show table "$PR_TABLE" | grep -q "^default dev $PR_DEV" || \
            ip -6 route add default dev "$PR_DEV" table "$PR_TABLE"
    fi
}

del_pr() {
    # delete all matching ipv4 rules (idempotent)
    while ip rule show | grep -q "fwmark $PR_MARK lookup $PR_TABLE"; do
        ip rule del fwmark "$PR_MARK" lookup "$PR_TABLE"
    done
    ip route flush table "$PR_TABLE" >/dev/null 2>&1 || true

    # delete all ipv6 rules if ipv6 support is enabled
    if [ "$PR_IPV6" = "1" ]; then
        while ip -6 rule show | grep -q "fwmark $PR_MARK lookup $PR_TABLE"; do
            ip -6 rule del fwmark "$PR_MARK" lookup "$PR_TABLE"
        done
        ip -6 route flush table "$PR_TABLE" >/dev/null 2>&1 || true
    fi
}

while :; do
    # As long as the process is running and the tun device exists, ensure the policy routing rules are in place. If either condition is not met, clean up any existing rules.
    if pidof sing-box >/dev/null 2>&1 && ip link show "$PR_DEV" >/dev/null 2>&1; then
        add_pr
    else
        del_pr
    fi
    sleep 2
done