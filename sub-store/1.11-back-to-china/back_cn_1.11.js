const { type, sub_name, endpoint_name } = $arguments;
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatible;
let config = JSON.parse($files[0]);
let proxies = await produceArtifact({
  sub_name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
});

// Getting endpoints
let endpoints_file = await produceArtifact({
  endpoint_name,
  type: 'file',
});
let endpoints = JSON.parse(endpoints_file).endpoints;

// Updating warped outbounds
proxies.forEach(proxy => {
  if (/.*(warped).*/.test(proxy.tag)) {
    proxy.detour = "warp";
  }
});
endpoints.forEach(endpoint => {
  if (/.*(warped).*/.test(endpoint.tag)) {
    endpoint.detour = "warp";
  }
});

// Pushing outbounds and endpoints onto configuration
config.outbounds.push(...proxies);
config.endpoints.push(...endpoints);

// Grouping outbounds by their tags
config.outbounds.map(i => {
  if (['proxy-cn'].includes(i.tag)) {
    i.outbounds.push(...getTags(endpoints, /warp/i));
    i.outbounds.push(...getTags(proxies, /^(🇨🇳|CN|🇭🇰|HK).*/i));
    i.outbounds.push(...getTags(endpoints, /^(🇨🇳|CN|🇭🇰|HK).*/i));
  }
  if (['proxy-others'].includes(i.tag)) {
    i.outbounds.push(...getTags(endpoints, /warp/i));
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:🇨🇳|CN))/i));
    i.outbounds.push(...getTags(endpoints, /^(?!.*(?:🇨🇳|CN))/i));
  }
})

// Adding compatible outbound to empty outbounds to prevent errors from generating
config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound);
      compatible = true;
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

// Return the content
$content = JSON.stringify(config, null, 2);

// Helper function
function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag);
}
