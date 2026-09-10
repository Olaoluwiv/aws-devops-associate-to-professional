\# VPN Routing Configuration



\## Day 24 — AWS Hybrid Cloud Site-to-Site VPN



This document records the routing configuration used to send traffic between the simulated on-premises network and the AWS VPC.



\---



\## Network Prefixes



\### Simulated On-Premises Network



```text

192.168.1.0/24

```



VPN router:



```text

192.168.1.209

```



\### AWS Network



```text

10.0.0.0/16

```



AWS private test server:



```text

10.0.2.183

```



\---



\# 1. AWS Route Table



The AWS private subnet needs to know that the simulated on-premises network is reachable through the Virtual Private Gateway.



Route:



```text

192.168.1.0/24 → Virtual Private Gateway

```



The local AWS route remains:



```text

10.0.0.0/16 → local

```



\---



\# 2. AWS VPN Static Route



The Site-to-Site VPN was configured for static routing.



The on-premises network was added as:



```text

192.168.1.0/24

```



This tells AWS that the simulated on-premises network exists behind the Customer Gateway.



\---



\# 3. Enable Linux IP Forwarding



The StrongSwan router needs to forward packets between interfaces.



Enable forwarding:



```bash

sudo sysctl -w net.ipv4.ip\_forward=1

```



Verify:



```bash

sysctl net.ipv4.ip\_forward

```



Expected:



```text

net.ipv4.ip\_forward = 1

```



The setting was persisted in:



```text

/etc/sysctl.d/99-vpn-router.conf

```



with:



```text

net.ipv4.ip\_forward = 1

```



\---



\# 4. Create the VTI Interface



The VPN used a Virtual Tunnel Interface named:



```text

Tunnel1

```



Example:



```bash

sudo ip link add Tunnel1 type vti \\

&#x20;   local <ON\_PREM\_PRIVATE\_IP> \\

&#x20;   remote <AWS\_TUNNEL\_1\_OUTSIDE\_IP> \\

&#x20;   key 100

```



The VPN inside addresses were then assigned to the VTI.



Example:



```bash

sudo ip addr add <LOCAL\_VTI\_IP>/30 \\

&#x20;   remote <AWS\_VTI\_IP>/30 \\

&#x20;   dev Tunnel1

```



The interface was brought online:



```bash

sudo ip link set Tunnel1 up mtu 1419

```



\---



\# 5. Routing Table 220



During troubleshooting, Linux was using policy routing.



The AWS network route was added to routing table `220`:



```bash

sudo ip route add 10.0.0.0/16 dev Tunnel1 table 220

```



The route was then corrected to use the on-premises router's network address as the source:



```bash

sudo ip route replace 10.0.0.0/16 \\

&#x20;   dev Tunnel1 \\

&#x20;   src 192.168.1.209 \\

&#x20;   table 220

```



\---



\# 6. Policy Routing Rule



A policy rule was added to direct AWS-bound traffic to table `220`:



```bash

sudo ip rule add \\

&#x20;   to 10.0.0.0/16 \\

&#x20;   lookup 220 \\

&#x20;   priority 100

```



Verify:



```bash

ip rule

```



Expected:



```text

100: from all to 10.0.0.0/16 lookup 220

```



\---



\# 7. Verify the Routing Decision



The most useful troubleshooting command was:



```bash

ip route get 10.0.2.183

```



The successful result was:



```text

10.0.2.183 dev Tunnel1 table 220 src 192.168.1.209

```



This confirmed:



\* Destination: `10.0.2.183`

\* Interface: `Tunnel1`

\* Routing table: `220`

\* Source IP: `192.168.1.209`



Therefore, AWS-bound traffic was being sent through the VPN tunnel.



\---



\# 8. Connectivity Test



Test the AWS private server:



```bash

ping -c 4 10.0.2.183

```



Successful result:



```text

4 packets transmitted

4 packets received

0% packet loss

```



The average latency during testing was approximately:



```text

2.291 ms

```



\---



\# 9. Troubleshooting Lesson



Initially, the VPN tunnel was established, but traffic was not successfully reaching the AWS server.



This demonstrated an important distinction:



```text

VPN tunnel established

&#x20;       ≠

Application/network traffic automatically working

```



The tunnel can be operational while routing is still incorrect.



The investigation therefore focused on:



```text

ip route

ip rule

ip route get

```



rather than repeatedly changing the VPN credentials.



\---



\# 10. Important Routing Relationship



The complete routing relationship is:



```text

On-Premises

192.168.1.0/24

&#x20;      │

&#x20;      ▼

192.168.1.209

&#x20;      │

&#x20;      ▼

Tunnel1

&#x20;      │

&#x20;      ▼

AWS VPN

&#x20;      │

&#x20;      ▼

10.0.0.0/16

```



For the return path:



```text

10.0.0.0/16

&#x20;      │

&#x20;      ▼

AWS Route Table

&#x20;      │

&#x20;      ▼

Virtual Private Gateway

&#x20;      │

&#x20;      ▼

AWS Site-to-Site VPN

&#x20;      │

&#x20;      ▼

192.168.1.0/24

```



\---



\# 11. Persistence Warning



The VTI interface and policy-routing commands used during this lab were created manually.



Before treating this as a production configuration, the following should be made persistent:



\* VTI interface

\* VTI addresses

\* VTI MTU

\* Routing table 220

\* Policy routing rule

\* StrongSwan startup configuration



This is listed as a future improvement in the main README.



\---



\# 12. Useful Troubleshooting Commands



\### Check IP addresses



```bash

ip -br addr

```



\### Check routes



```bash

ip route

```



\### Check policy rules



```bash

ip rule

```



\### Check a specific routing decision



```bash

ip route get 10.0.2.183

```



\### Check StrongSwan



```bash

sudo ipsec statusall

```



\### Test AWS connectivity



```bash

ping -c 4 10.0.2.183

```



\### Check IPsec state



```bash

sudo ip -s xfrm state

```



\### Capture VPN traffic



```bash

sudo tcpdump -ni Tunnel1

```



\### Capture Internet-facing VPN traffic



```bash

sudo tcpdump -ni ens5

```



\---



\## Final Verified Routing State



The final working routing decision was:



```text

10.0.2.183 dev Tunnel1 table 220 src 192.168.1.209

```



and the connectivity test returned:



```text

4 packets transmitted

4 packets received

0% packet loss

```



This confirms that traffic from the simulated on-premises router was successfully routed through the AWS Site-to-Site VPN to the AWS private network.



