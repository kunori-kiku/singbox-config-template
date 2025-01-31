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
  if (/^(?!.*(?:DT|IEPL|VPC|Alice-Home))/.test(proxy.tag)) {
    proxy.detour = "transfer-detour";
  }
  if (/.*(Alice-Home).*/.test(proxy.tag)) {
    proxy.detour = "HK-Alice-Free";
  }
});

config.outbounds.push(...proxies)

config.outbounds.map(i => {
  if (['hk', 'HK', '🇭🇰HK'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW)).*(港|🇭🇰|HK|hk|Hongkong).*/))
  }
  if (['tw', 'TW', '🇼🇸TW'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW)).*(台|🇹🇼|TW|tw|Taiwan).*/))
  }
  if (['jp', 'JP', '🇯🇵JP'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW)).*(日|🇯🇵|JP|jp|Japan).*/))
  }
  if (['sg', 'SG', '🇸🇬SG'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW)).*(新|🇸🇬|SG|sg|Singapore).*/))
  }
  if (['us', 'US', '🇺🇸US'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW)).*(美|🇺🇸|US|us|United States).*/))
  }
  if (['transfer-detour'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /.*(IEPL|VPC).*/))
  }
  if (['other-nodes'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(港|台|日|新|美|🇭🇰|HK|hk|Hongkong|🇹🇼|TW|tw|Taiwan|🇸🇬|SG|sg|Singapore|🇺🇸|US|us|United States|🇯🇵|JP|jp|Japan)).*/))
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