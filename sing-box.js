const { type, name } = $arguments
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatible
let config = JSON.parse($files[0])
let proxies = produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

config.outbounds.push(...proxies)

config.outbounds.map(i => {
  if (['hk', 'HK'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:IEPL|DT)).*(港|🇭🇰|HK|hk|Hongkong)/i))
  }
  if (['tw', 'TW'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:IEPL|DT)).*(台|🇹🇼|TW|tw|Taiwan)/i))
  }
  if (['jp', 'JP'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:IEPL|DT)).*(日|🇯🇵|JP|jp|Japan)/i))
  }
  if (['sg', 'SG'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:IEPL|DT)).*(新|🇸🇬|SG|sg|Singapore)/i))
  }
  if (['us', 'US'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:IEPL|DT)).*(美|🇺🇸|US|us|United States)/i))
  }
  if (['transfer-detour'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /IEPL|DT/i))
  }
  if (['Alice-Free'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /HK-Alice-II/i))
  }
  if (['other-nodes'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:港|台|日|新|美|🇭🇰|HK|hk|Hongkong|🇹🇼|TW|tw|Taiwan|🇸🇬|SG|sg|Singapore|🇺🇸|US|us|United States|🇯🇵|JP|jp|Japan)).*/i))
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