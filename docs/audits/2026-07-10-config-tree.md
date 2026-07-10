# 5G SDR Remote Configuration Inventory

Audit date: 2026-07-10. This is a metadata-only inventory of regular files directly under `/etc/srsran`; it contains no file bodies, passwords, or `user_db.csv` contents.

## Linux1 — EPC and eNB

| File | Mode | Owner:group | Size (bytes) | Modification time (UTC+08:00) |
| --- | ---: | --- | ---: | --- |
| `rr.conf` | 644 | user:user | 3031 | 2026-04-21 17:02:57 |
| `sib.conf` | 644 | user:user | 11396 | 2026-04-28 17:30:29 |
| `rb.conf` | 644 | user:user | 3386 | 2026-03-08 13:57:32 |
| `sib.conf.mbsfn` | 644 | root:root | 5647 | 2026-05-10 15:11:20 |
| `epc.conf` | 644 | user:user | 3796 | 2026-04-21 17:08:35 |
| `user_db.csv` | metadata unavailable | metadata unavailable | metadata unavailable | Linux1 became unreachable before this metadata-only query; contents were not accessed |
| `ue.conf` | 644 | user:user | 19453 | 2026-03-08 13:57:32 |
| `enb.conf` | 644 | user:user | 20078 | 2026-05-10 14:26:58 |
| `sib.conf.mbsfn~` | 644 | root:root | 5646 | 2026-04-14 17:32:16 |
| `mbms.conf` | 644 | user:user | 1688 | 2026-04-21 17:09:31 |

## Linux2 — UE

| File | Mode | Owner:group | Size (bytes) | Modification time (UTC+08:00) |
| --- | ---: | --- | ---: | --- |
| `rb.conf` | 644 | user:user | 3386 | 2026-03-08 15:21:21 |
| `sib.conf` | 644 | user:user | 10583 | 2026-03-08 15:21:21 |
| `mbms.conf` | 644 | user:user | 1688 | 2026-03-08 15:21:21 |
| `rr.conf` | 644 | user:user | 3031 | 2026-03-08 15:21:21 |
| `epc.conf` | 644 | user:user | 3796 | 2026-03-08 15:21:21 |
| `ue.conf` | 644 | user:user | 19608 | 2026-05-10 16:06:50 |
| `user_db.csv` | 644 | user:user | 1275 | 2026-03-08 15:21:21 |
| `enb.conf` | 644 | user:user | 19933 | 2026-03-08 15:21:21 |

## Active-role interpretation

Linux1 is audited in its EPC/eNB role and Linux2 in its UE role. The active configuration selections evidenced by targeted searches are recorded in the rollback inventory. A file's presence on a host does not establish that it is an active runtime file, and this document makes no runtime-state assertion.
