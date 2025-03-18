const { type, name } = $arguments
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatible
let config = JSON.parse($files[0])
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

proxies.forEach(proxy => {
  if (/.*(warped).*/.test(proxy.tag)) {
    proxy.detour = "warp";
  }
});

config.outbounds.push(...proxies)

config.outbounds.map(i => {
  if (['proxy-cn'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /.*(warped).*/))
  }
  if (['proxy-others'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:warped))/))
  }
})

config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound)
      compatible = true
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2)

function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}