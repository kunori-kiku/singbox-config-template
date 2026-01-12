// Extract arguments passed to the script
const { type, name } = $arguments

// Parse URL request query parameters directly (e.g. your-url?no_v6=true)
// This avoids the complex $options JSON encoding
const params = $options?._req?.query || {};

// Extract specific parameters and convert them to boolean flags
const noV6 = params.no_v6 === 'true'; 
const noReject = params.no_reject === 'true'; 

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
// === Logic for no_v6 ===
if (noV6) {
  // 1. Add AAAA reject rule to the front of dns.rules
  config.dns.rules.unshift({ "query_type": "AAAA", "action": "reject" });

  // 2. Set default domain resolver strategy to ipv4_only
  config.route.default_domain_resolver.strategy = "ipv4_only";

  // 3. Add IPv6 reject rule after the specific proxy regex rule
  // We look for the exact object structure provided
  const targetIndex = config.route.rules.findIndex(r => 
    r.action === 'route' && 
    r.domain_regex === '.' && 
    r.outbound === 'proxy'
  );
  
  // Insert the new rule after the found index
  config.route.rules.splice(targetIndex + 1, 0, { 
    "ip_version": 6, 
    "action": "reject" 
  });
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

    // Remove if it is a reject rule AND it lacks both network and ip_version constraints
    const shouldRemove = isReject && hasNoNetwork && hasNoIpVersion;
    
    return !shouldRemove;
  });
}

// Serialize the modified config object back to a JSON string for the final output
$content = JSON.stringify(config, null, 2)

// Helper function to extract tags from the proxy list based on a regex
function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}