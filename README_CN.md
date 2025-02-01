# Sing-box-templates
[English Documentation](README.md)

为 kunori-kiku（大概可能也许还有其他人？）定制的 Sing-box 配置

本仓库采用 MIT 许可证。

**注意**：sing-box-subscribe 版本的模板已经 **弃用**

---

# 功能亮点

- 提供sub-store模板和 js 脚本  
- 灵活的前置-落地机管理功能
- 支持自动处理 AliceNetworks 提供的免费家宽落地节点
- **（核心功能）** 提供透明代理（TUN 模式）下的路由规则，包括 fakeip 和 realip 模式，并且支持 IPv6 版本  
- **（核心功能）** 即使是 1.10 版本的 sing-box，也支持按需的 fakeip DNS 解析——也就是说，任何没有匹配到路由规则的域名，都会根据 IP 规则被解析并匹配  
- **彻底解决 DNS 泄漏问题**，提供一个现成的防 DNS 泄漏方案，而且不影响代理速度  
- 手动维护的 Github-proxy URL，以防代理规则网站被封锁

# 使用指南  
如果没有特别说明，下面的教程适用于 1.11 模板

## sub-store使用（推荐方法）  
### 节点预处理  
**直连节点**：用来直接穿越 GFW 的节点，归类入选择器(`selector`)
- 在节点中添加 `DT` 和区域关键词，例如：`🇭🇰DT-Claw` 会被放入 `🇭🇰HK`  

**虚拟专用云（VPC）节点**：通过 VPC（IEPL/IPLC/隧道）连接的节点，归类入转发节点(`detour`)  
- 在节点中添加 `VPC` 或 `IEPL`（已弃用）和区域关键词，例如：`🇭🇰VPC-DMIT` 会被放入 `🇭🇰HK-Detour`

**出口节点**：用于访问目标网站的节点，归类入选择器(`selector`)  
- 在节点中只加上国家关键词，例如：`🇭🇰DMIT` 会被放入 `🇭🇰HK`  
- 同时，这个节点也会匹配到地区的转发节点，例如：`🇭🇰DMIT` 会自动被添加一个 `🇭🇰HK-detour` 作为中继代理。

**（特殊，并非必要）**处理 AliceNetworks 的免费家宽落地：AliceNetworks 提供的免费机器上的节点，会被归类入选择器(`selector`)
- 将你的中继代理节点，即在 AliceNetworks 免费机器上的节点命名为 `HK-Alice-Free`  
- 提供的免费节点要加上 `Alice-Home`的关键字，例如：`🇭🇰HK-Alice-Home` 会被放入 `🇭🇰HK`

### 使用sub-store  
**在你的机器上安装sub-store**，可以参考 [这篇 Docker 安装指南](https://ztdocs.top/project/sub-store/tutorial/self/)

**在 `订阅管理` 部分创建一个节点**，根据界面粘贴你的 URI 或其他格式 **然后千万别再乱动了**（我之前就卡在这里很久）  
- 例如：`https://url-of-sub.com/token=abcdefg` 粘贴到 `remote` 部分，或者 `ss://ADKHGADHFKJASGH@1.1.1.1:1111#some-node` 粘贴到 `local` 部分  
- **记住你刚创建的节点名称**，例如：`my-nodes`

**在 `文件管理` 部分创建一个文件**（注意，是文件管理！！！），粘贴模板的 raw URL 到节点位置
- 例如：`https://raw.githubusercontent.com/kunori-kiku/singbox-config-template/refs/heads/master/sub-store/1.11/tun_fakeip_noquic.json` 放在 `remote`  
- 然后滚动到 `脚本操作` 部分，像这样填写链接：`https://raw.githubusercontent.com/kunori-kiku/singbox-config-template/refs/heads/master/sing-box-1.11.js#type=2&name=my-nodes`  
  - **注意**：  
    - `type=2` 表示单一订阅。如果你有群组订阅，请使用 `type=1`  
    - `name=my-nodes` 这里的名称 **必须** 和你刚才记住的节点名称一致，这就是我让你记住节点名称的原因  
- 点击 **保存**，然后 **预览** 检查是否生效

### 使用 Sing-box 的教程
**基本逻辑**  
- **如果你要更改整体国家设置**：  
  - 修改协调节点部分，例如：将 `TW-Hinet` 改为 `TW` 部分  
  - 修改代理部分的国家选择，例如：将 `proxy` 部分改为 `TW`  
- **如果你要为特定路由更改节点**  
  - 路由是通过选择决定的
  - 比如，想在 `stream` 部分使用 `TW-Hinet`：
    - `stream` 包含 `TW` 和 `TW-detour`，但是 `TW-detour` 不包括 `TW-Hinet`
    - 那么就把 `stream` 部分改为 `TW`，并把 `TW` 部分改为 `TW-Hinet`

**高级功能**  
- **如果你要为不同国家使用不同的转发节点**  
  - 比如，你希望 `TW` 使用 `VPC-HK`，而 `US` 使用 `VPC-JP`  
  - 在 `TW-detour` 中，改为 `VPC-HK`  
  - 同样，在 `US-detour` 中，改为 `VPC-JP`
- **如果你要在 `proxy` 部分使用 `VPC-HK`，同时在 `HK-HKT` 的绕行中也使用 `VPC-HK`，但是在 `stream` 部分使用 `HK-HKT`**  
  - 在 `proxy` 部分，改为 `HK-detour`  
  - 在 `HK-detour` 部分，改为 `VPC-HK`  
  - 在 `stream` 部分，改为 `HK`  
  - 在 `HK` 部分，改为 `HK-HKT`

## Sing-box-subscribe 使用（弃用，未来不再维护）  
此部分不再介绍

# 已知问题  
暂时没有

# 未来改进（持续进行中）  
- （中优先级）将在 `roaming` 分支提供完整的漫游规则  
- （低优先级）将在 `no_proxy` 分支提供不带 Github proxy的模板  
- （低优先级）会改进脚本，让用户可以使用自己的 Github proxy URL