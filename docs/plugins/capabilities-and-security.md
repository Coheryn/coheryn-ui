# CoherynUI — Plugin Capabilities & Security Sandbox Architecture v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 15.2 & Section 15.3  
**Reference ADR:** [ADR-017: Public Plugin WIT ABI, Sandbox Capabilities, and Resource Budgets](../../rfcs/0017-sandboxed-wasm-plugin-runtime.md)

---

## 1. Zero Ambient Authority Principle

All plugins executed by CoherynUI are treated as untrusted bytecode. They are executed within an isolated WebAssembly sandbox adhering to the **Principle of Least Privilege**:

- **No Filesystem Access:** Plugins cannot open, read, or write to arbitrary host disk paths.
- **No Network Access:** Outbound HTTP/TCP sockets are completely disabled.
- **No Process Execution:** Plugins cannot spawn child processes or execute shell commands.
- **No Environment Access:** Host environment variables and secrets are hidden from the guest.

---

## 2. Resource Metering & Isolation Boundaries

To prevent infinite loops, memory leaks, and Denial-of-Service attacks from untrusted third-party plugins:

| Resource Constraint | Default Limit | Enforcement Mechanism |
|---|---|---|
| **Instruction Budget (Fuel)** | `1,000,000 instructions` | Wasmtime fuel consumption. Once exhausted, execution traps immediately (`CY5001`). |
| **Linear Memory Heap** | `32 MB` | Enforced virtual memory page boundaries. |
| **Execution Deadline** | `1000 ms` | Host watchdog timer terminates runaway guest threads. |
| **Recursion Depth** | Bounded stack depth | Protected against stack overflow attacks. |

---

## 3. CLI Management

```bash
# Add and verify plugin integrity
coherynui plugin add ./plugins/typography.wasm

# Inspect granted permissions
coherynui plugin permissions typography

# Verify byte integrity and magic header
coherynui plugin verify typography
```
