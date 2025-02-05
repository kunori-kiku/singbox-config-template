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
  if (/^(?!.*(?:DT|IEPL|VPC|Alice-Home)).*(港|🇭🇰|HK|hk|Hongkong).*/.test(proxy.tag)) {
    proxy.detour = "🇭🇰HK-detour";
  }
  if (/^(?!.*(?:DT|IEPL|VPC|Alice-Home)).*(台|🇹🇼|🇼🇸|TW|tw|Taiwan).*/.test(proxy.tag)) {
    proxy.detour = "🇼🇸TW-detour";
  }
  if (/^(?!.*(?:DT|IEPL|VPC|Alice-Home)).*(日|🇯🇵|JP|jp|Japan).*/.test(proxy.tag)) {
    proxy.detour = "🇯🇵JP-detour";
  }
  if (/^(?!.*(?:DT|IEPL|VPC|Alice-Home)).*(新|🇸🇬|SG|sg|Singapore).*/.test(proxy.tag)) {
    proxy.detour = "🇸🇬SG-detour";
  }
  if (/^(?!.*(?:DT|IEPL|VPC|Alice-Home)).*(美|🇺🇸|US|us|United States).*/.test(proxy.tag)) {
    proxy.detour = "🇺🇸US-detour";
  }
  if (/^(?!.*(?:DT|IEPL|VPC|Alice-Home|港|台|日|新|美|🇭🇰|HK|hk|Hongkong|🇹🇼|🇼🇸|TW|tw|Taiwan|🇸🇬|SG|sg|Singapore|🇺🇸|US|us|United States|🇯🇵|JP|jp|Japan))/.test(proxy.tag)) {
    proxy.detour = "other-detour";
  }
  if (/.*(Alice-Home).*/.test(proxy.tag)) {
    proxy.detour = "HK-Alice-Free";
  }
});

config.outbounds.push(...proxies)

config.outbounds.map(i => {
  if (['hk', 'HK', '🇭🇰HK'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW|IEPL|VPC)).*(港|🇭🇰|HK|hk|Hongkong).*/))
  }
  if (['tw', 'TW', '🇼🇸TW'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW|IEPL|VPC)).*(台|🇹🇼|🇼🇸|TW|tw|Taiwan).*/))
  }
  if (['jp', 'JP', '🇯🇵JP'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW|IEPL|VPC)).*(日|🇯🇵|JP|jp|Japan).*/))
  }
  if (['sg', 'SG', '🇸🇬SG'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW|IEPL|VPC)).*(新|🇸🇬|SG|sg|Singapore).*/))
  }
  if (['us', 'US', '🇺🇸US'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW|IEPL|VPC)).*(美|🇺🇸|US|us|United States).*/))
  }
  if (['general-detour', '🇭🇰HK-detour', '🇼🇸TW-detour', '🇯🇵JP-detour', '🇸🇬SG-detour', '🇺🇸US-detour', 'other-detour'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /.*(IEPL|VPC).*/))
  }
  if (['other'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:RAW|IEPL|VPC|港|台|日|新|美|🇭🇰|HK|hk|Hongkong|🇹🇼|TW|tw|Taiwan|🇸🇬|SG|sg|Singapore|🇺🇸|US|us|United States|🇯🇵|JP|jp|Japan)).*/))
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