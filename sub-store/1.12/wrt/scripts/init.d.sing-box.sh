#!/bin/sh /etc/rc.common

USE_PROCD=1
START=99

script=$(readlink "$initscript")
NAME="$(basename ${script:-$initscript})"
PROG="/usr/bin/sing-box"

# --- policy routing constants (adjust here if needed) ---
PR_MARK="0x1"
PR_TABLE="100"
PR_PRIO="100"
PR_DEV="tun0"

add_pr() {
        # only add if tun exists (avoid adding a dead route)
        ip link show "$PR_DEV" >/dev/null 2>&1 || return 0

        ip rule show | grep -q "fwmark $PR_MARK lookup $PR_TABLE" || \
                ip rule add fwmark "$PR_MARK" lookup "$PR_TABLE" priority "$PR_PRIO"

        ip route show table "$PR_TABLE" | grep -q "^default dev $PR_DEV" || \
                ip route add default dev "$PR_DEV" table "$PR_TABLE"
}

del_pr() {
        # delete all matching rules (idempotent)
        while ip rule show | grep -q "fwmark $PR_MARK lookup $PR_TABLE"; do
                ip rule del fwmark "$PR_MARK" lookup "$PR_TABLE"
        done
        ip route flush table "$PR_TABLE" >/dev/null 2>&1 || true
}

start_service() {
        config_load "$NAME"

        local enabled user group conffile workdir ifaces
        local log_stdout log_stderr
        config_get_bool enabled "main" "enabled" "0"
        [ "$enabled" -eq "1" ] || return 0

        config_get user "main" "user" "root"
        config_get conffile "main" "conffile"
        config_get ifaces "main" "ifaces"
        config_get workdir "main" "workdir" "/usr/share/sing-box"
        config_get_bool log_stdout "main" "log_stdout" "0"
        config_get_bool log_stderr "main" "log_stderr" "1"

        mkdir -p "$workdir"
        local group="$(id -ng $user)"
        chown $user:$group "$workdir"

        # --- main sing-box instance ---
        procd_open_instance "$NAME.main"
        procd_set_param command "$PROG" run -c "$conffile" -D "$workdir"

        # Use root user if you want to use the TUN mode.
        procd_set_param user "$user"
        procd_set_param file "$conffile"
        [ -z "$ifaces" ] || procd_set_param netdev $ifaces
        procd_set_param stdout "$log_stdout"
        procd_set_param stderr "$log_stderr"
        procd_set_param limits core="unlimited"
        procd_set_param limits nofile="1000000 1000000"

        # respawn: (threshold, timeout, retry)  -> keep default if you like
        # procd_set_param respawn 5 5 0
        procd_set_param respawn

        procd_close_instance

        # --- guard instance: keep policy routing in sync with process liveness ---
        # Logic:
        #   - if sing-box is running and tun0 exists -> ensure PR rules exist
        #   - else -> remove PR rules (avoid blackholing marked traffic)
        procd_open_instance "$NAME.prguard"
        procd_set_param command /usr/libexec/singbox-prguard.sh
        procd_set_param respawn
        procd_set_param stdout 0
        procd_set_param stderr 1
        procd_close_instance
}

stop_service() {
        # best-effort cleanup on explicit stop/restart
        del_pr
}

service_triggers() {
        local ifaces
        config_load "$NAME"
        config_get ifaces "main" "ifaces"
        procd_open_trigger
        for iface in $ifaces; do
                procd_add_interface_trigger "interface.*.up" $iface /etc/init.d/$NAME restart
        done
        procd_close_trigger
        procd_add_reload_trigger "$NAME"
}