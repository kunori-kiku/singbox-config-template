// Sub-Store producer script for sing-box 1.13.
//
// 1.13 shares 1.12's configuration syntax (the migration guide has no 1.13 section).
// It is kept as a separate, explicitly-named file purely for clarity. The DNS routing
// uses the legacy form (no evaluate/match_response).
//
// IPv6 is now handled automatically inside the template: an AAAA->NOERROR DNS rule and
// an ip_version:6 drop route rule, both gated on the default interface lacking a global
// `2000::/3` address (default_interface_address requires sing-box 1.13+). So there is no
// longer a no_v6 parameter. The optional `proxy_ip` parameter routes a comma-separated
// list of destination IP CIDRs through `proxy`.

// Extract arguments passed to the script
const { type, name } = $arguments

// Parse URL request query parameters directly (e.g. your-url?no_v6=true)
// This avoids the complex $options JSON encoding
const params = $options?._req?.query || {};

// Extract specific parameters and convert them to boolean flags
const noReject = params.no_reject === 'true';
const noDoh = params.no_doh === 'true';
// proxy_ip: comma-separated destination IP CIDRs to route through proxy
// (e.g. ?proxy_ip=1.2.3.0/24,5.6.7.8/32)
const proxyIp = params.proxy_ip;

// Parse the template file content (usually passed as the first file in the arguments)
let config = JSON.parse($files[0])

// Produce proxies from Sub-Store based on the arguments
let proxies = await produceArtifact({
  name,
  // Determine if it is a collection or a single subscription
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal', // Return object/array instead of string
})

// Append the generated proxies to the config's outbounds list
config.outbounds.push(...proxies)

// Add the new proxies to specific selector groups (e.g., the group named 'proxy')
config.outbounds.map(i => {
  if (['proxy'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /./))
  }
})

// == Additional logic section with URL parameter handling ==
// === Logic for proxy_ip (force specific destination IP CIDRs through proxy) ===
if (proxyIp) {
  // Accept a comma-separated list; always emit ip_cidr as an array.
  const cidrs = String(proxyIp).split(',').map(s => s.trim()).filter(Boolean);
  if (cidrs.length) {
    // Insert right after the catch-all `domain_regex "." -> proxy` rule, so it only
    // catches destination IPs that arrive without a recovered domain.
    const targetIndex = config.route.rules.findIndex(r =>
      r.action === 'route' &&
      r.domain_regex === '.' &&
      r.outbound === 'proxy'
    );
    if (targetIndex !== -1) {
      config.route.rules.splice(targetIndex + 1, 0, {
        "ip_cidr": cidrs,
        "action": "route",
        "outbound": "proxy"
      });
    }
  }
}

// === Logic for no_reject ===
if (noReject) {
  // 1. Filter out the specific DNS rule (AdBlock via fakeip)
  // Matching literally based on the specific rule_set content and server provided
  config.dns.rules = config.dns.rules.filter(rule => {
    const isTarget =
      rule.server === 'fakeip' &&
      rule.action === 'route' &&
      Array.isArray(rule.rule_set) &&
      rule.rule_set.includes('reject_non_ip') &&
      rule.rule_set.includes('reject_supplement');

    return !isTarget; // Keep rule if it is NOT the target
  });

  // 2. Filter out Route rules with action="reject" that do NOT specify network OR ip_version
  // "Without specifying network or ip_version" -> Missing network AND Missing ip_version
  config.route.rules = config.route.rules.filter(rule => {
    const isReject = rule.action === 'reject';
    const hasNoNetwork = rule.network === undefined;
    const hasNoIpVersion = rule.ip_version === undefined;

    // Remove if it is a reject rule AND it lacks both network and ip_version constraints.
    // Spare logical reject rules (the automatic-v6 ip_version:6 drop): that is v6
    // handling, not ad/abuse blocking, and must survive no_reject.
    const shouldRemove = isReject && hasNoNetwork && hasNoIpVersion && rule.type !== 'logical';

    return !shouldRemove;
  });
}

// === Logic for no_doh ===
if (noDoh) {
  // 1. Change default domain resolver server from "dns_direct" to "dns_local"
  if (config.route?.default_domain_resolver?.server === 'dns_direct') {
    config.route.default_domain_resolver.server = 'dns_local';
  }

  // 2. Iterate through all DNS rules and change "dns_direct" to "dns_local"
  config.dns.rules.forEach(rule => {
    if (rule.server === 'dns_direct') {
      rule.server = 'dns_local';
    }
  });

  // 3. Change DNS final server from "dns_direct" to "dns_local"
  if (config.dns?.final === 'dns_direct') {
    config.dns.final = 'dns_local';
  }
}

// Serialize the modified config object back to a JSON string for the final output
$content = JSON.stringify(config, null, 2)

// Helper function to extract tags from the proxy list based on a regex
function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}
