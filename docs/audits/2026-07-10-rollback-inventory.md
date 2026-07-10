# 5G SDR Lab01 Rollback Inventory Audit

## Date and scope

- Audit date: 2026-07-10
- Scope: read-only inspection of `/etc/srsran` on Linux1 (EPC + eNB) and Linux2 (UE).
- Purpose: identify evidence of Lab02 eMBMS configuration that may need a later, approved rollback to an authoritative Lab01 baseline.

## Audit method

The auditor connected using interactive SSH authentication and used only non-mutating inventory, metadata, hash, and targeted text-search commands. Configuration files were not copied into this repository; only extracted evidence and SHA-256 digests were recorded. `user_db.csv` was neither read nor hashed.

## Safety boundaries

No `sudo` command was used. No remote file, service, route, firewall, interface, NetworkManager, runtime process, or SDR/RF state was changed. No password, subscriber data, private key, or configuration-file body is recorded here.

## Host roles

- Linux1 — EPC and eNB configuration host.
- Linux2 — UE configuration host.

## Rollback Checklist v0.1.1

### CONFIRMED

- Linux1 `enb.conf` selects `sib_config = /etc/srsran/sib.conf.mbsfn`.
- Linux1 has an active `[embms]` section with `enable = true`; its active M1-U values are `239.255.0.1` and `127.0.1.1`.
- Linux1 `sib.conf.mbsfn` exists and contains SIB13 and MBSFN references.
- Linux1 `mbms.conf` exists and contains active `sgi_mb` and M1-U references.
- Linux1 scheduler has active overrides: `pusch_max_mcs = 16`, `min_nof_ctrl_symbols = 2`, and `max_nof_ctrl_symbols = 2`.
- Linux1 has `nof_phy_threads = 1` in `[expert]`.
- Linux2 has active `mbms_service_id = 0` and `mbms_service_port = 4321`.
- Linux2 enables MAC packet capture (`enable = mac`).
- Linux2 has no `pipe` or `named` reference in `ue.conf`.
- Linux2 has active PHY values `snr_estim_alg = empty`, `nof_phy_threads = 1`, and `interpolate_subframe_enabled = true`.

### CONFIRMED LAB02 RESIDUES

- Linux1 active eMBMS enablement and M1-U multicast settings.
- Linux1 active selection of the MBSFN SIB configuration, which includes SIB13/MBSFN settings.
- Linux1 MBMS-GW configuration with `sgi_mb` and M1-U references.
- Linux2 active MBMS service ID and service port.

### LAB01 COMPONENTS — NOT RESIDUES

- ZeroMQ is a Lab01 baseline component, not a Lab02 residue.
- Linux1 active RF transport is `device_name = zmq` with eNB identifier and TCP ports 2000/2001.
- Linux2 active RF transport is `device_name = zmq` with UE identifier and TCP ports 2001/2000.

### TO VERIFY

- Verify the Linux1 and Linux2 ZeroMQ peer addresses against the intended Lab01 topology (`192.168.250.11` and `192.168.250.12`).
- Verify the required ZeroMQ TX/RX port direction for the Lab01 baseline.
- Compare scheduler, expert, and UE PHY overrides with an authoritative Lab01 baseline before classifying any of them as rollback changes.
- Decide whether Linux2 MAC PCAP is retained in the Lab01 operating profile.

### UNKNOWN

- The authoritative Lab01 baseline configuration and change history were not supplied; the original purpose of scheduler, expert, and PHY overrides cannot be proven from this audit.
- Existing files alone do not prove that a file is selected by a running process.

### DEFERRED ACTION

No rollback or configuration change has been attempted. Any future change requires explicit approval, a backup, a reviewed diff, a rollback plan, and a validation plan.

## Evidence summary

- Both hosts expose `/etc/srsran` configuration trees; file metadata and selected non-secret hashes are captured in companion audit documents.
- `epc.conf` had no matching eMBMS, MBMS, MBSFN, SIB13, M1-U, SGi-mb, ZeroMQ, or device-argument search terms.
- Linux1 `sib.conf` also contains SIB13/MBSFN references, but the active target is `sib.conf.mbsfn`.
- No remote system state was changed during this audit.
