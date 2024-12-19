# Singbox Config Template
[中文文档](README_CN.md)

Configuration file templates that can be used without much modification.

This repository uses MIT license.

---
## File structure and naming rules
**Branches**
- `master`: Rulesets within it be directly accessed in Mainland China, so it is the default choice for anyone who intend to bypass GFW
- `no-proxy`: Original configuration without any reverse proxies been configured. It cannot be used directly but can be used to debug when there are already rulesets cached locally.
- `roaming`: Configurations within it are intended to provide templates for whom intends to use liability-free roaming services in Mainland China.

---
## Recommended practice
The template offers streamlined process if you follow the recommended usage.

### 0. Preparation
Build your own singbox subscription converter according to [this repository](https://github.com/Toperlock/sing-box-subscribe), and your link should be somewhat similar to the following:

`https://xxx.vercel.app`
This tutorial will use the above url as demostration.

### 1. Preprocessing nodes
#### 1.1. Format nodes
Put your v2ray-stylish share URLs in a text file, and separate them using newlines. Demostration as follows
```
vless://dGlhbmFubWVuIHNxdWFyZSBtYXNzYWNyZSA4OTY0#Node-HK
vless://eGlqaW5waW5nIHRoZSBkZW1vY3JhY3kgc3RlYWxlciBhbmQgdGhlIGVtcGVyb3I=#Node-US
vmess://b2ZmIHRoZSBjY3AgbG9uZ2xpdmUgc3VuIHlldCBzZW4gbG9uZyBsaXZlIGRlbW9jcmFjeQ==#Node-TW
```

It is **recommended** to include country codes (or simply phrases) in each line of your node. The converter will automatically categorize your nodes in groups by their geolocation.

It is not recommended to include non-English characters in your node names as it may be troublesome.

#### 1.2. Patching and uploading nodes
You may upload your nodes in a **private repository** then copy the **raw content url**(this may expire, but easier to maintain) or save the nodes in **private gist**(this may not expire, and safer, but you will have to use a new link every time you make modifications to your nodes).

For whom uploads their nodes in a **private repository**, you will have a raw file link such as:
`https://github.com/path/to/node/node.txt?token=MVhJOUpJTjhQSU5HOVRJQU42QU40TUVO`

For whom uploads their nodes in a **private gist**, you will have a raw file link such as:
`https://gist.github.com/some-path/of-gist/gist.txt`

**Make sure to copy the full link**, and save them **safely**.

### 2. Format request link
#### 2.1. Choose a  