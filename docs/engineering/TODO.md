# 5G SDR Engineering TODO

## Audit

- [ ] Mark rollback inventory documentation completed after all documents are generated and reviewed.
- [x] Add config tree snapshot.
- [x] Add SHA-256 snapshot.

## Rollback

- [ ] Identify the authoritative Lab01 baseline.
- [ ] Back up active configurations before modification.
- [ ] Restore `enb.conf` `sib_config` to normal `sib.conf`.
- [ ] Disable active eMBMS configuration.
- [ ] Review UE MBMS service settings.
- [ ] Decide whether MAC PCAP remains enabled.
- [ ] Verify scheduler, expert, and PHY overrides.

## ZeroMQ

- [ ] Verify Linux1 and Linux2 `device_args`.
- [ ] Verify addresses `192.168.250.11` and `192.168.250.12`.
- [ ] Verify TX/RX port direction.

## Validation

- [ ] Minimal EPC/eNB/UE attach.
- [ ] Downlink and uplink ICMP.
- [ ] Downlink and uplink TCP.
- [ ] NAT and Internet route validation.
- [ ] S1-MME observation.
- [ ] S1-U observation.
- [ ] SGi observation.

## Governance

- [ ] Review Codex Remote Agent Policy v0.1-draft.
- [ ] Add repository-specific host inventory without credentials.
- [ ] Define configuration backup location.
- [ ] Define approval and rollback report templates.

## Deferred

- [ ] Lab02 eMBMS and SIB13.
- [ ] B210 OTA.
- [ ] 2x2 MIMO.
- [ ] RF and PHY observability.
- [ ] Lab03 URLLC.
- [ ] 6G LEO and NTN research.
