\# Day 24 — AWS Hybrid Cloud Site-to-Site VPN Troubleshooting



\## Overview



This document records the major problems encountered while building the AWS Hybrid Cloud Site-to-Site VPN lab and the steps used to troubleshoot them.



The purpose is to preserve the troubleshooting process for future reference.



\---



\# Issue 1 — StrongSwan `ipsec` Command Was Not Available



\## Problem



After installing StrongSwan, the expected `ipsec` command was not immediately available.



\## Investigation



The installed packages were checked and the StrongSwan starter package was installed.



\## Solution



```bash

sudo apt install strongswan-starter -y

```



Then:



```bash

ipsec version

```



The command became available and StrongSwan was confirmed to be installed.



\---



\# Issue 2 — Incorrect `/etc/ipsec.secrets`



\## Problem



The StrongSwan secrets file was accidentally populated with configuration content instead of the expected secret format.



StrongSwan returned an error similar to:



```text

malformed secret: missing second delimiter

```



\## Cause



The following files have different purposes:



```text

/etc/ipsec.conf

/etc/ipsec.secrets

```



`ipsec.conf` contains VPN connection configuration.



`ipsec.secrets` contains authentication secrets.



\## Solution



The secrets file was corrected and verified without exposing the actual secret.



A sanitized version is included in:



```text

configuration/ipsec.secrets.example

```



\---



\# Issue 3 — VPN Tunnel Established but Traffic Failed



\## Problem



StrongSwan reported that the VPN tunnel was established:



```text

ESTABLISHED

```



However:



```bash

ping -c 4 10.0.2.183

```



initially failed.



\## Important Lesson



An established VPN tunnel does not automatically guarantee that traffic will be correctly routed.



The investigation therefore moved from tunnel authentication to the data path.



\---



\# Issue 4 — Incorrect Linux Routing Decision



\## Investigation



The routing decision was checked using:



```bash

ip route get 10.0.2.183

```



Traffic was not initially being sent through the VTI interface as expected.



Linux policy routing was also inspected:



```bash

ip rule

```



The system was using routing table:



```text

220

```



for part of the traffic evaluation.



\## Solution



A route for the AWS network was added to table 220:



```bash

sudo ip route add 10.0.0.0/16 dev Tunnel1 table 220

```



The route was then corrected to use the on-premises router address as the source:



```bash

sudo ip route replace 10.0.0.0/16 \\

&#x20;   dev Tunnel1 \\

&#x20;   src 192.168.1.209 \\

&#x20;   table 220

```



\---



\# Issue 5 — Policy Routing Rule Missing



\## Problem



The routing table contained the correct route, but Linux was not consistently using it.



\## Investigation



The routing rules were checked:



```bash

ip rule

```



The required policy rule was missing.



\## Solution



The rule was added:



```bash

sudo ip rule add \\

&#x20;   to 10.0.0.0/16 \\

&#x20;   lookup 220 \\

&#x20;   priority 100

```



Verification:



```bash

ip rule

```



The resulting rule included:



```text

100: from all to 10.0.0.0/16 lookup 220

```



\---



\# Issue 6 — Wrong Source Address Through the VTI



\## Problem



During packet capture, traffic entering the VTI was observed using the VPN inside address rather than the expected simulated on-premises network address.



This caused connectivity problems.



\## Investigation



The VTI interface was inspected:



```bash

ip -br addr

```



Traffic was also observed using `tcpdump`.



\## Test



An explicit source address was used:



```bash

ping -I 192.168.1.209 -c 4 10.0.2.183

```



This test succeeded.



\## Solution



The routing configuration was corrected so that the AWS network route used:



```text

src 192.168.1.209

```



The final routing decision became:



```text

10.0.2.183 dev Tunnel1 table 220 src 192.168.1.209

```



After this correction, normal ping without `-I` also succeeded.



\---



\# Issue 7 — Missing AWS VPN Static Route



\## Problem



The AWS Site-to-Site VPN initially showed no static route for the simulated on-premises network.



\## Missing Network



```text

192.168.1.0/24

```



\## Solution



The static route:



```text

192.168.1.0/24

```



was added to the AWS VPN connection.



The AWS private subnet route table was also configured to send:



```text

192.168.1.0/24

```



through the Virtual Private Gateway.



\## Lesson



Both sides of a routed VPN need to understand where the remote network exists.



\---



\# Issue 8 — IPsec Counters Showed Outbound Traffic but No Return Data



\## Investigation



IPsec state was checked using:



```bash

sudo ip -s xfrm state

```



Traffic counters initially showed outbound packets without corresponding inbound data.



This indicated that the VPN was negotiating successfully but the data path was not yet working correctly.



\## Next Steps



The following tools were used:



```bash

ip route

```



```bash

ip rule

```



```bash

ip route get 10.0.2.183

```



and:



```bash

sudo tcpdump -ni Tunnel1

```



These helped identify the routing/source-address problem.



\---



\# Issue 9 — AWS Private Instance Could Not Be Accessed Easily



\## Problem



The AWS test server was deployed in the private subnet.



Browser-based access through EC2 Instance Connect was unsuccessful.



Systems Manager Session Manager was also unavailable because the instance was not connected to SSM.



\## Important Lesson



This was an instance-management/access issue, not proof that the VPN was broken.



The VPN connectivity itself had already been successfully demonstrated from the simulated on-premises router.



The AWS server's private IP was reachable:



```text

10.0.2.183

```



from:



```text

192.168.1.209

```



\---



\# Issue 10 — Private Subnet and Public IP Confusion



The AWS test server had a public IP associated with it, but it was deployed in a private subnet without a normal Internet Gateway route for Internet-bound traffic.



Therefore, having a public IP did not automatically make the instance directly reachable from the Internet.



\## Lesson



A public IP alone does not make an EC2 instance effectively Internet-accessible.



Subnet routing, route tables, security groups, network ACLs, and the instance's network configuration all matter.



\---



\# Final Verification



After correcting the routing configuration:



```bash

ip route get 10.0.2.183

```



returned:



```text

10.0.2.183 dev Tunnel1 table 220 src 192.168.1.209

```



Then:



```bash

ping -c 4 10.0.2.183

```



returned:



```text

4 packets transmitted

4 packets received

0% packet loss

```



This was the final successful end-to-end connectivity test.



\---



\# Troubleshooting Method Used



The troubleshooting process followed this general order:



```text

1\. Check VPN status

&#x20;      ↓

2\. Check IPsec Security Associations

&#x20;      ↓

3\. Check VTI interface

&#x20;      ↓

4\. Check Linux routing

&#x20;      ↓

5\. Check Linux policy rules

&#x20;      ↓

6\. Check routing decision

&#x20;      ↓

7\. Capture traffic with tcpdump

&#x20;      ↓

8\. Check AWS VPN routes

&#x20;      ↓

9\. Check Security Groups

&#x20;      ↓

10\. Test connectivity again

```



\---



\# Most Useful Commands



\## StrongSwan status



```bash

sudo ipsec statusall

```



\## IP addresses



```bash

ip -br addr

```



\## Routes



```bash

ip route

```



\## Policy routing



```bash

ip rule

```



\## Specific route decision



```bash

ip route get 10.0.2.183

```



\## VPN state



```bash

sudo ip -s xfrm state

```



\## VTI traffic capture



```bash

sudo tcpdump -ni Tunnel1

```



\## External interface traffic capture



```bash

sudo tcpdump -ni ens5

```



\## Connectivity test



```bash

ping -c 4 10.0.2.183

```



\---



\# Key Lessons Learned



\### 1. Tunnel status is not enough



A tunnel can show:



```text

ESTABLISHED

```



while application traffic still fails.



Always verify the data path.



\### 2. Routing is critical



VPN connectivity depends on correct routing on both sides.



\### 3. `ip route get` is extremely useful



Instead of guessing which route Linux will use, ask Linux directly:



```bash

ip route get <destination>

```



\### 4. Policy routing can change the expected route



When multiple routing tables are involved, always inspect:



```bash

ip rule

```



as well as:



```bash

ip route

```



\### 5. Packet capture helps identify where traffic stops



`tcpdump` was useful for determining whether packets were entering the VTI and whether encrypted traffic was leaving the external interface.



\### 6. AWS routing must match the remote network



The AWS VPN needed a route for:



```text

192.168.1.0/24

```



so AWS could identify the simulated on-premises network.



\---



\# Current Status



The primary VPN connectivity test is successful.



```text

Simulated On-Premises

192.168.1.209

&#x20;       │

&#x20;       ▼

&#x20;   Tunnel1

&#x20;       │

&#x20;       ▼

&#x20;AWS Site-to-Site VPN

&#x20;       │

&#x20;       ▼

AWS Private Network

&#x20;       │

&#x20;       ▼

10.0.2.183

```



Result:



```text

4 packets transmitted

4 received

0% packet loss

```



The remaining improvements are mainly persistence, reverse-direction testing, Tunnel 2 redundancy, and production hardening.



