# Singbox 配置模板
[English](README.md)

为 kunori-kiku（也可能适用于其他人）量身定制的 Sing-box 配置

本仓库采用 MIT 许可证。

**注意**：
- **推荐**：使用 `sing-box-1.12-simplified.js` 配合 1.12 版本模板，以获得最新功能和 URL 参数支持。
- 所有旧版模板和脚本（1.11 及更早版本）已**弃用**，不建议使用。
- sing-box-subscribe 版本的模板现已**弃用**。

---

# 功能特性

- 适用于 sub-store 的模板和 js 脚本
- 灵活的节点落地管理
- 支持自动处理 AliceNetworks 提供的免费家宽
- **（核心）** 提供透明代理（TUN）模式下的路由规则，包括 fakeip 和 realip 模式
- **（核心）** 支持 fakeip 按需 DNS 解析，即任何未匹配路由规则的域名将被解析并根据 IP 规则进行匹配
- **完全解决 DNS 泄露问题**，即开箱即用的防 DNS 泄露方案，且不会影响代理速度
- 手动维护的 Github 代理 URL，以防规则站点被墙
- **URL 参数支持**：通过 URL 查询参数自定义配置行为

# 使用方法

## Sub-store 实践（推荐）

### 前置条件
**在你的任意一台机器上安装 sub-store**，可以参考 [Docker 部署指南](https://ztdocs.top/project/sub-store/tutorial/self/)

### 步骤一：创建订阅节点
**在 `节点` 部分创建一个节点**，粘贴你的 URI 或订阅 URL，**不要对刚创建的节点做任何其他操作**
- 示例：在 `远程` 中填入 `https://url-of-sub.com/token=abcdefg`，或在 `本地` 中填入 `ss://ADKHGADHFKJASGH@1.1.1.1:1111#some-node`
- **记住你刚创建的节点名称**，例如：`my-nodes`

### 步骤二：使用模板和脚本创建文件
**在 `文件` 部分创建一个文件**（注意，是文件部分！！！！）：
1. 将原始模板文件的 URL 粘贴到文件字段中：
   - 对于 sing-box 1.12：`https://raw.githubusercontent.com/kunori-kiku/singbox-config-template/refs/heads/master/sub-store/1.12/tun-fakeip-noquic.json`
   
2. 向下滚动到 `脚本操作` 部分，填入脚本 URL：
   - 基本用法：`https://raw.githubusercontent.com/kunori-kiku/singbox-config-template/refs/heads/master/sing-box-1.12-simplified.js#type=2&name=my-nodes`
   - 带 URL 参数（见下文）：`...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_v6=true&no_doh=true`

3. **注意**：
   - `type=2` 表示单个订阅。如果你有组合订阅，请使用 `type=1`
   - `name=my-nodes` 中的名称**必须**与你的订阅名称一致

4. 点击**保存**然后**预览**，查看是否正常工作

### URL 参数

你可以通过在脚本 URL 中添加 URL 参数来自定义配置。多个参数可以组合使用。

#### 可用参数：

| 参数 | 值 | 说明 | 效果 |
|------|-----|------|------|
| `type` | `1` 或 `2` | **必需**。订阅类型 | `1` = 组合订阅，`2` = 单个订阅 |
| `name` | 字符串 | **必需**。你的订阅名称 | 必须与你创建的节点名称一致 |
| `no_v6` | `true` | 禁用 IPv6 | 1. 拒绝 AAAA DNS 查询<br>2. 将 DNS 策略设为 `ipv4_only`<br>3. 在路由规则中拒绝 IPv6 流量 |
| `no_reject` | `true` | 禁用广告拦截 | 1. 移除广告拦截 DNS 规则（fakeip 拒绝规则）<br>2. 移除不含 network/ip_version 约束的拒绝路由规则 |
| `no_doh` | `true` | 禁用 DNS over HTTPS | 1. 将 `route.default_domain_resolver.server` 从 `dns_direct` 改为 `dns_local`<br>2. 将所有使用 `dns_direct` 的 DNS 规则改为 `dns_local`<br>3. 将 `dns.final` 从 `dns_direct` 改为 `dns_local` |

#### 使用示例：

```
# 基本用法（仅必需参数）
...sing-box-1.12-simplified.js#type=2&name=my-nodes

# 禁用 IPv6
...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_v6=true

# 禁用广告拦截
...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_reject=true

# 禁用 DNS over HTTPS（使用本地 DNS 解析器）
...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_doh=true

# 组合多个参数
...sing-box-1.12-simplified.js#type=2&name=my-nodes&no_v6=true&no_reject=true&no_doh=true
```

### 节点预处理

**注意**：以下节点预处理规则适用于所有订阅类型。

**直连节点（DT）**：用于直接穿越 GFW 的节点，将被归类到节点选择器中。
- 在节点名称中添加 `DT` 和地区关键词，例如：`🇭🇰DT-Claw` 将被放入 `🇭🇰HK`

**专线节点（VPC）**：通过专线（IEPL/IPLC/隧道）的节点，将被归类到节点落地中。
- 在节点名称中添加 `VPC` 或 `IEPL`（已弃用）和地区关键词，例如：`🇭🇰VPC-DMIT` 将被放入 `🇭🇰HK-Detour`

**落地节点**：用于访问目标网站的节点，将被归类到节点选择器中。
- 在节点名称中**仅**添加地区关键词，例如：`🇭🇰DMIT` 将被放入 `🇭🇰HK`
- 同时会匹配对应的地区落地，例如：`🇭🇰DMIT` 会自动添加 `🇭🇰HK-detour` 作为中继代理。

（特殊，非必需）**AliceNetworks 免费家宽**：AliceNetworks 作为免费机器附属品提供的节点，将被归类到节点选择器中
- 将你的中继代理（即 AliceNetworks 免费机器上的节点）命名为 `HK-Alice-Free`
- 让免费节点包含 `Alice-Home`，例如：`🇭🇰HK-Alice-Home` 将被放入 `🇭🇰HK`

## 使用 sing-box

**基本逻辑**
- **切换整体出口国家**：
  - 更改对应的节点部分，例如：在 `TW` 部分中切换到 `TW-Hinet`
  - 在 `proxy` 中更改国家选择，例如：在 `proxy` 部分中切换到 `TW`
- **为特定路由更改节点**
  - 类似地，特定路由由其选择决定
  - 如果你要为 `stream` 部分切换到 `TW-Hinet`
    - `stream` 包含 `TW`、`TW-detour`，但 `TW-detour` 不包含 `TW-Hinet`
    - 那么在 `stream` 中切换到 `TW`，并在 `TW` 中切换到 `TW-Hinet`

**进阶功能**
- **为不同国家使用不同的落地**
  - 示例：你想为 `TW` 使用 `VPC-HK`，为 `US` 使用 `VPC-JP`
  - 在 `TW-detour` 中切换到 `VPC-HK`
  - 类似地，在 `US-detour` 中切换到 `VPC-JP`
- **`proxy` 使用 `VPC-HK`，同时将 `VPC-HK` 作为 `HK-HKT` 的落地，但 `stream` 使用 `HK-HKT`**
  - 在 `proxy` 中切换到 `HK-detour`
  - 在 `HK-detour` 中切换到 `VPC-HK`
  - 在 `stream` 中切换到 `HK`
  - 在 `HK` 中切换到 `HK-HKT`

## OpenWrt 部署（1.12+）

位于 `sub-store/1.12/wrt/` 的文件专为 OpenWrt 路由器定制：

- **模板**：`tun-fakeip-noquic.json` – 针对路由器资源优化的精简配置。
- **配置**：`config/` – 包含 UCI 配置（`/etc/config/sing-box`）和防火墙集成。
- **Nftables**：`nftables/` – 透明代理（TProxy/TUN）和 DNS 重定向的专用规则。
- **脚本**：`scripts/` – 服务管理（`init.d`）和维护工具（如配置自动更新）。

---

## 旧版模板（已弃用）

### Sing-box-subscribe 实践
**已弃用** - 不建议使用。未来将不再维护。

### 1.11 及更早版本的模板
**已弃用** - 不建议使用。请迁移到 1.12 版本模板并配合 `sing-box-1.12-simplified.js` 脚本，以获得最新功能和 URL 参数支持。

---

# 已知问题
暂无

# 未来改进（待续）
- （中优先级）将在 `roaming` 分支提供完整的漫游规则
- （低优先级）将在 `no_proxy` 分支提供不含 github 代理的模板
- （低优先级）将改进脚本，使用户可以引用自己的 github 代理 URL
