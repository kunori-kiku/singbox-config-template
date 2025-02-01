# Singbox Config Template
[中文文档](README_CN.md)

Sing-box configurations tailored for kunori-kiku (and possibly someone else)

This repository uses MIT license.

**Notice**: sing-box-subscribe version of template is now **DEPRECATED**

---

# Features

- Templates and js script for sub-store
- Flexible detour management for nodes
- Supports automatically processing the free home-bandwidth provided by AliceNetworks
- **(Core)** Provides with routing rules in transparent-proxy (TUN) mode, including fakeip and realip mode, and ipv6 versions are made
- **(Core)** Supports fakeip on-demand dns resolving **even for 1.10 sing-box**, i.e. any domain that fails to match routing rules will be resolved and matched according to IP rules
- **Completely resolved DNS leakage issue**, i.e. a ready-to-use anti-DNS-leak package, and it will not affect the speed of proxy.
- Mannually maintained Github-proxy URL, in case the proxy-rule sites get censored.

# Usage
Without specification, please refer the following tutorial to be performed under 1.11 templates
## Sub-store practice (recommended)
### Preprocessing nodes
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

### Using sub-store
**Install sub-store on one of your machines**, you may refer to docker guide [here](https://ztdocs.top/project/sub-store/tutorial/self/)

**Create a node in the `node` section**, paste your URI scheme or whatsoever according to the UI and **DO NOTHING TO THE NODE YOU JUST CREATED**(I got confused for a long time there)
- e.g.: `https://url-of-sub.com/token=abcdefg` in `remote` or `ss://ADKHGADHFKJASGH@1.1.1.1:1111#some-node` in `local`
- **MEMORIZE THE NODE NAME YOU JUST CREATED**, e.g.: `my-nodes`

**Create a file in the `file` section**(NOTICE, FILE SECTION!!!!), paste the URL of raw file into the node place
- e.g.: `https://raw.githubusercontent.com/kunori-kiku/singbox-config-template/refs/heads/master/sub-store/1.11/tun_fakeip_noquic.json` in `remote`
- Then scroll down to `Script Operation` section, fill in the link like this: `https://raw.githubusercontent.com/kunori-kiku/singbox-config-template/refs/heads/master/sing-box-1.11.js#type=2&name=my-nodes`
  - **Note**:
    - `type=2` refers to single subscription. If you have a group subscription, use `type=1`
    - `name=my-nodes` here the name **must** be your subscription's name, **and that is the reason why I asked you to memorize your node's name**
- Click **save** then **preview** to see if it works

### Using sing-box
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

## Sing-box-subscibe practice (DEPRECATED, will not be maintained in the future)
Not introduced here

# Known bug
Not yet

# Future improvements (to be continued)
- (Mid-prioritized) Will provide with completed roaming rules in `roaming` branch
- (Low-prioritized) Will provide with templates without github proxy in `no_proxy` branch
- (Low-prioritized) Will improve script so that users can refer to their own github proxy URL
