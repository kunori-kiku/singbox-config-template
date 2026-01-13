# Singbox Config Template
[中文文档](README_CN.md)

Sing-box configurations tailored for kunori-kiku (and possibly someone else)

This repository uses MIT license.

**Notice**: 
- **RECOMMENDED**: Use `sing-box-1.12-simplified.js` with version 1.12 templates for the latest features and URL parameters support.
- All former templates and scripts (1.11 and earlier versions) are **DEPRECATED** and not recommended for use.
- The sing-box-subscribe version of template is now **DEPRECATED**.

---

# Features

- Templates and js script for sub-store
- Flexible detour management for nodes
- Supports automatically processing the free home-bandwidth provided by AliceNetworks
- **(Core)** Provides with routing rules in transparent-proxy (TUN) mode, including fakeip and realip mode
- **(Core)** Supports fakeip on-demand dns resolving, i.e. any domain that fails to match routing rules will be resolved and matched according to IP rules
- **Completely resolved DNS leakage issue**, i.e. a ready-to-use anti-DNS-leak package, and it will not affect the speed of proxy
- Mannually maintained Github-proxy URL, in case the proxy-rule sites get censored
- **URL Parameters Support**: Customize configuration behavior via URL query parameters

# Usage

## Sub-store practice (recommended)

### Prerequisites
**Install sub-store on one of your machines**, you may refer to docker guide [here](https://ztdocs.top/project/sub-store/tutorial/self/)

### Step 1: Create a subscription node
**Create a node in the `node` section**, paste your URI scheme or subscription URL and **DO NOTHING TO THE NODE YOU JUST CREATED**
- Example: `https://url-of-sub.com/token=abcdefg` in `remote` or `ss://ADKHGADHFKJASGH@1.1.1.1:1111#some-node` in `local`
- **MEMORIZE THE NODE NAME YOU JUST CREATED**, e.g.: `my-nodes`

### Step 2: Create a file with template and script
**Create a file in the `file` section** (NOTICE, FILE SECTION!!!!):
1. Paste the URL of raw template file into the file field:
   - For sing-box 1.12: `https://raw.githubusercontent.com/kunori-kiku/singbox-config-template/refs/heads/master/sub-store/1.12/tun-fakeip-noquic.json`
   
2. Scroll down to `Script Operation` section and fill in the script URL:
   - Basic usage: `https://raw.githubusercontent.com/kunori-kiku/singbox-config-template/refs/heads/master/sing-box-1.12-simplified.js#type=2&name=my-nodes`
   - With URL parameters (see below): `...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_v6=true&no_doh=true`

3. **Note**:
   - `type=2` refers to single subscription. If you have a group subscription, use `type=1`
   - `name=my-nodes` here the name **must** be your subscription's name

4. Click **save** then **preview** to see if it works

### URL Parameters

You can customize the configuration by adding URL parameters to the script URL. Multiple parameters can be combined.

#### Available Parameters:

| Parameter | Values | Description | Effects |
|-----------|--------|-------------|---------|
| `type` | `1` or `2` | **Required**. Subscription type | `1` = collection, `2` = single subscription |
| `name` | string | **Required**. Your subscription name | Must match the node name you created |
| `no_v6` | `true` | Disable IPv6 | 1. Reject AAAA DNS queries<br>2. Set DNS strategy to `ipv4_only`<br>3. Reject IPv6 traffic in routing rules |
| `no_reject` | `true` | Disable ad blocking | 1. Remove ad-block DNS rules (fakeip reject rules)<br>2. Remove reject routing rules without network/ip_version constraints |
| `no_doh` | `true` | Disable DNS over HTTPS | 1. Change `route.default_domain_resolver.server` from `dns_direct` to `dns_local`<br>2. Change all DNS rules with `dns_direct` to `dns_local` |

#### Usage Examples:

```
# Basic usage (required parameters only)
...sing-box-1.12-simplified.js#type=2&name=my-nodes

# Disable IPv6
...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_v6=true

# Disable ad blocking
...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_reject=true

# Disable DNS over HTTPS (use local DNS resolver)
...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_doh=true

# Combine multiple parameters
...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_v6=true&no_reject=true&no_doh=true
```

### Preprocessing nodes

**Note**: The following node preprocessing rules apply to all subscription types.

**Direct Transfer Nodes**: Nodes that are used passing GFW directly, will be catagorized into node selectors.
- Add `DT` and regional keyword in nodes, e.g.: `🇭🇰DT-Claw` will be put in `🇭🇰HK`

**Virtual Private Cloud**: Nodes through VPCs(IEPL/IPLC/Tunnels), will be catagorized into node detours.
- Add `VPC` or `IEPL`(DEPRECATED) and regional keyword in nodes, e.g.: `🇭🇰VPC-DMIT` will be put in `🇭🇰HK-Detour`

**Exit Node**: Nodes that are used to visit destination websites, will be catagorized into node selectors.
- Add regional keyword **only** in nodes, e.g.: `🇭🇰DMIT` will be put in `🇭🇰HK`
- It will also match a regional detour, e.g.: `🇭🇰DMIT` will be added a `🇭🇰HK-detour` detour as relay proxy.

(Special, not necessary)**AliceNetworks Free Home-Bandwidth**: Nodes that are provided by AliceNetworks as peripherals for possessing Free machines, will be catagorized into node selectors
- Let your relay proxy, i.e. nodes on AliceNetworks Free machines be named `HK-Alice-Free`
- Let the free nodes to include `Alice-Home`, e.g.: `🇭🇰HK-Alice-Home` will be put in `🇭🇰HK`

## Using sing-box

**Basic Logic**
- **Change country for overall**:
  - Change the coordinating node section, e.g.: Change to `TW-Hinet` in `TW` section
  - Change the country selection in `proxy`, e.g.: Change to `TW` in `proxy` section
- **Change node for specific routing**
  - Similarly, specific routings are determined by its selections
  - If you were to change to `TW-Hinet` for `stream` section
    - `stream` contains `TW`, `TW-detour`, but `TW-detour` does not include `TW-Hinet`
    - Then change to `TW` in `stream`, and change to `TW-Hinet` in `TW`

**Advanced functionalities**
- **Use different detour for different countries**
  - An example: You want to use `VPC-HK` for `TW` and `VPC-JP` for `US`
  - In `TW-detour`, change to `VPC-HK`
  - Similarly, in `US-detour`, change to `VPC-JP`
- **Using `VPC-HK` for `proxy`, using `VPC-HK` as the detour of `HK-HKT` but also using `HK-HKT` for `stream`**
  - In `proxy`, change to `HK-detour`
  - In `HK-detour`, change to `VPC-HK`
  - In `stream`, change to `HK`
  - In `HK`, change to `HK-HKT`

---

## Legacy Templates (DEPRECATED)

### Sing-box-subscribe practice
**DEPRECATED** - Not recommended for use. Will not be maintained in the future.

### Version 1.11 and earlier templates
**DEPRECATED** - Not recommended for use. Please migrate to version 1.12 templates with `sing-box-1.12-simplified.js` script for the latest features and URL parameters support.

---

# Known bug
Not yet

# Future improvements (to be continued)
- (Mid-prioritized) Will provide with completed roaming rules in `roaming` branch
- (Low-prioritized) Will provide with templates without github proxy in `no_proxy` branch
- (Low-prioritized) Will improve script so that users can refer to their own github proxy URL
