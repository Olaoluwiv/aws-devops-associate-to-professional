\# Day 24 — AWS Hybrid Cloud Site-to-Site VPN



\## Project Overview



This project demonstrates how to connect an AWS VPC to an on-premises network using \*\*AWS Site-to-Site VPN\*\*.



Because I do not have access to a physical on-premises VPN appliance or an external public IP address for a real organization network, I simulated the on-premises environment using a second AWS VPC and an Ubuntu EC2 instance running \*\*StrongSwan\*\*.



This creates a practical hybrid-cloud learning environment that demonstrates the same core networking concepts used when connecting an AWS environment to an external on-premises network.



> \*\*Lab note:\*\* The on-premises environment in this project is simulated inside AWS. It is intended for learning and does not represent a production physical on-premises deployment.



\---



\## Architecture



```text

&#x20;                        AWS CLOUD

&#x20;                 ┌─────────────────────┐

&#x20;                 │     Hybrid-VPC      │

&#x20;                 │     10.0.0.0/16     │

&#x20;                 │                     │

&#x20;                 │  Private Subnet     │

&#x20;                 │   10.0.2.0/24       │

&#x20;                 │         │            │

&#x20;                 │         ▼            │

&#x20;                 │  AWS Test Server    │

&#x20;                 │    10.0.2.183       │

&#x20;                 │                     │

&#x20;                 │         │            │

&#x20;                 │         ▼            │

&#x20;                 │   Virtual Private   │

&#x20;                 │      Gateway        │

&#x20;                 └─────────┬───────────┘

&#x20;                           │

&#x20;                    AWS Site-to-Site

&#x20;                        VPN Tunnel

&#x20;                           │

&#x20;                           │

&#x20;                 ┌─────────▼───────────┐

&#x20;                 │   On-Premises       │

&#x20;                 │   Simulation VPC    │

&#x20;                 │   192.168.1.0/24    │

&#x20;                 │                     │

&#x20;                 │  Ubuntu VPN Router  │

&#x20;                 │   192.168.1.209     │

&#x20;                 │   StrongSwan        │

&#x20;                 └─────────────────────┘

```



\---



\## Technologies Used



\* Amazon VPC

\* Amazon EC2

\* AWS Site-to-Site VPN

\* Virtual Private Gateway

\* Customer Gateway

\* StrongSwan

\* Ubuntu Server 24.04 LTS

\* Linux IP forwarding

\* Linux policy routing

\* VTI interface

\* Security Groups

\* Network ACLs

\* Static routing

\* ICMP testing

\* SSH

\* PowerShell



\---



\# 1. Network Design



\## AWS Network



\### VPC



| Resource | Value         |

| -------- | ------------- |

| VPC Name | Hybrid-VPC    |

| CIDR     | `10.0.0.0/16` |

| Region   | `us-east-1`   |



\### Public Subnet



| Resource          | Value                |

| ----------------- | -------------------- |

| Name              | Hybrid-Public-Subnet |

| CIDR              | `10.0.1.0/24`        |

| Availability Zone | `us-east-1a`         |



\### Private Subnet



| Resource          | Value                 |

| ----------------- | --------------------- |

| Name              | Hybrid-Private-Subnet |

| CIDR              | `10.0.2.0/24`         |

| Availability Zone | `us-east-1a`          |



\### AWS Test Server



| Resource   | Value                  |

| ---------- | ---------------------- |

| Name       | Hybrid-AWS-Test-Server |

| Private IP | `10.0.2.183`           |

| Subnet     | Hybrid-Private-Subnet  |



\---



\# 2. Simulated On-Premises Network



The on-premises network was simulated using a separate AWS VPC.



\### VPC



| Resource | Value            |

| -------- | ---------------- |

| Name     | On-Prem-VPC      |

| CIDR     | `192.168.1.0/24` |



\### VPN Router



An Ubuntu EC2 instance was deployed to act as the simulated on-premises VPN router.



| Resource         | Value                   |

| ---------------- | ----------------------- |

| Name             | On-Prem-VPN-Router      |

| Operating System | Ubuntu Server 24.04 LTS |

| Instance Type    | `t3.micro`              |

| Private IP       | `192.168.1.209`         |

| VPN Software     | StrongSwan              |



The router also has a public/Internet-facing address so that AWS can establish the Site-to-Site VPN tunnels to it.



\---



\# 3. AWS Site-to-Site VPN



The AWS Site-to-Site VPN was configured using:



\* Virtual Private Gateway

\* Customer Gateway

\* VPN Connection

\* Static routing



\### Virtual Private Gateway



\*\*Name:\*\*



`Hybrid-VGW`



The Virtual Private Gateway was attached to:



`Hybrid-VPC`



\### Customer Gateway



\*\*Name:\*\*



`OnPrem-CGW`



The Customer Gateway represents the simulated on-premises VPN router.



\### VPN Connection



\*\*Name:\*\*



`Hybrid-VPN`



The VPN connection connects:



```text

AWS Virtual Private Gateway

&#x20;       │

&#x20;       │

&#x20;  Hybrid-VPN

&#x20;       │

&#x20;       │

Customer Gateway

&#x20;       │

&#x20;       ▼

StrongSwan VPN Router

```



\---



\# 4. StrongSwan Configuration



StrongSwan was installed on the Ubuntu VPN router.



The required packages included:



```bash

sudo apt update

sudo apt install strongswan -y

sudo apt install strongswan-starter -y

```



The installed version was verified with:



```bash

ipsec version

```



\---



\# 5. Enable Linux IP Forwarding



The Ubuntu router needs to forward traffic between the on-premises network and the VPN tunnel.



IP forwarding was enabled with:



```bash

sudo sysctl -w net.ipv4.ip\_forward=1

```



Verification:



```bash

sysctl net.ipv4.ip\_forward

```



Expected result:



```text

net.ipv4.ip\_forward = 1

```



The setting was also persisted using:



```text

/etc/sysctl.d/99-vpn-router.conf

```



with:



```text

net.ipv4.ip\_forward = 1

```



\---



\# 6. StrongSwan VPN Tunnel



The AWS-generated VPN configuration was used as the basis for the StrongSwan configuration.



The actual VPN pre-shared keys are \*\*not stored in this repository\*\*.



Sensitive values must always remain outside GitHub.



The project uses an example configuration file:



```text

configuration/ipsec.conf.example

```



and a safe secrets example:



```text

configuration/ipsec.secrets.example

```



Never commit the real:



```text

/etc/ipsec.secrets

```



file.



\---



\# 7. VPN Tunnel Verification



The VPN tunnel was successfully established.



The StrongSwan status was verified using:



```bash

sudo ipsec statusall

```



The important result was:



```text

ESTABLISHED

```



and:



```text

INSTALLED, TUNNEL

```



This confirmed that the first VPN tunnel was successfully established between the simulated on-premises router and AWS.



\---



\# 8. VTI Configuration



A Virtual Tunnel Interface was created for the VPN tunnel.



Example:



```bash

sudo ip link add Tunnel1 type vti local 192.168.1.209 remote <AWS\_TUNNEL\_OUTSIDE\_IP> key 100

```



The inside tunnel addresses were configured using the AWS-provided tunnel configuration.



The interface was then brought online.



Verification:



```bash

ip -br addr

```



The VTI interface appeared as:



```text

Tunnel1

```



with the VPN inside addresses.



\---



\# 9. Routing



The AWS network uses:



```text

10.0.0.0/16

```



The simulated on-premises network uses:



```text

192.168.1.0/24

```



The AWS VPN connection therefore needs to know that:



```text

192.168.1.0/24

```



is reachable through the VPN.



A static route for:



```text

192.168.1.0/24

```



was added to the AWS VPN configuration.



The AWS private subnet route table also contains:



```text

192.168.1.0/24 → Virtual Private Gateway

```



\---



\# 10. Linux Policy Routing



During troubleshooting, normal Linux routing did not initially send traffic through the VTI interface.



The routing lookup showed that traffic was being evaluated against routing table `220`.



The route was therefore added to table `220`:



```bash

sudo ip route add 10.0.0.0/16 dev Tunnel1 table 220

```



The route was then corrected to use the on-premises source address:



```bash

sudo ip route replace 10.0.0.0/16 dev Tunnel1 src 192.168.1.209 table 220

```



A policy rule was added:



```bash

sudo ip rule add to 10.0.0.0/16 lookup 220 priority 100

```



Verification:



```bash

ip rule

```



Expected relevant rule:



```text

100: from all to 10.0.0.0/16 lookup 220

```



The routing decision was verified with:



```bash

ip route get 10.0.2.183

```



The successful result was:



```text

10.0.2.183 dev Tunnel1 table 220 src 192.168.1.209

```



This confirmed that traffic destined for the AWS private network was being sent through the VPN tunnel.



\---



\# 11. VPN Connectivity Test



The final end-to-end test was performed from the simulated on-premises VPN router.



Command:



```bash

ping -c 4 10.0.2.183

```



Result:



```text

4 packets transmitted

4 packets received

0% packet loss

```



Average latency was approximately:



```text

2.291 ms

```



This successfully demonstrated connectivity from:



```text

192.168.1.209

```



to:



```text

10.0.2.183

```



through the AWS Site-to-Site VPN.



\---



\# 12. Troubleshooting Journey



This project involved several real networking problems.



\## Problem 1 — StrongSwan command unavailable



Initially, installing the main StrongSwan package did not provide the expected `ipsec` command.



The additional package was installed:



```bash

sudo apt install strongswan-starter -y

```



After installation:



```bash

ipsec version

```



worked successfully.



\---



\## Problem 2 — Incorrect `/etc/ipsec.secrets`



At one point, the VPN configuration content was accidentally placed in:



```text

/etc/ipsec.secrets

```



StrongSwan reported a malformed secret error.



The file was corrected so that only the appropriate VPN authentication secret configuration remained there.



This reinforced the importance of keeping:



```text

ipsec.conf

```



and:



```text

ipsec.secrets

```



as separate configuration files.



\---



\## Problem 3 — VPN tunnel established but traffic failed



The VPN tunnel showed:



```text

ESTABLISHED

```



but normal ping traffic initially failed.



This demonstrated an important networking concept:



> A VPN tunnel being established does not automatically mean that application traffic is correctly routed through the tunnel.



The next step was to inspect:



```bash

ip route

```



and:



```bash

ip rule

```



\---



\## Problem 4 — Traffic was using the wrong route



The routing table showed that traffic to the AWS network was not always using the VTI interface.



The command:



```bash

ip route get 10.0.2.183

```



was used to determine the actual routing decision.



The route was eventually corrected to:



```text

10.0.2.183 dev Tunnel1 table 220 src 192.168.1.209

```



\---



\## Problem 5 — Incorrect source address



A packet capture showed traffic entering the VTI with the VPN inside address rather than the expected on-premises network address.



An explicit test was performed:



```bash

ping -I 192.168.1.209 -c 4 10.0.2.183

```



This succeeded.



The routing policy was then corrected so that normal ping traffic also used:



```text

192.168.1.209

```



as the source.



\---



\## Problem 6 — Missing AWS VPN static route



The AWS VPN initially showed no static route for the simulated on-premises network.



The missing route:



```text

192.168.1.0/24

```



was added to the VPN connection.



This was necessary so AWS knew that the on-premises network was reachable through the VPN.



\---



\## Problem 7 — Private AWS instance access



The AWS test server was intentionally placed in a private subnet.



Attempts to use browser-based access through EC2 Instance Connect and Systems Manager were unsuccessful during the lab.



This did not invalidate the VPN test because the successful ICMP test from the simulated on-premises router already demonstrated connectivity to the AWS private IP.



\---



\# 13. Security Considerations



Sensitive information must never be committed to GitHub.



Do not commit:



\* VPN pre-shared keys

\* AWS access keys

\* passwords

\* private SSH keys

\* database credentials

\* Secrets Manager values

\* personal tokens

\* private certificates



The repository therefore contains only safe example configuration.



For example:



```text

YOUR\_TUNNEL\_PRESHARED\_KEY

```



should be used instead of the real key.



\---



\# 14. Important AWS Resources



\### AWS VPC



```text

Hybrid-VPC

10.0.0.0/16

```



\### AWS Private Subnet



```text

Hybrid-Private-Subnet

10.0.2.0/24

```



\### AWS Test Server



```text

Hybrid-AWS-Test-Server

10.0.2.183

```



\### Virtual Private Gateway



```text

Hybrid-VGW

```



\### Customer Gateway



```text

OnPrem-CGW

```



\### VPN Connection



```text

Hybrid-VPN

```



\### Simulated On-Premises VPC



```text

On-Prem-VPC

192.168.1.0/24

```



\### Simulated On-Premises Router



```text

On-Prem-VPN-Router

192.168.1.209

```



\---



\# 15. Lessons Learned



This project provided practical experience with:



1\. AWS Site-to-Site VPN architecture.

2\. Virtual Private Gateways.

3\. Customer Gateways.

4\. Static VPN routing.

5\. StrongSwan.

6\. Linux IP forwarding.

7\. Linux policy routing.

8\. VTI interfaces.

9\. Security Groups.

10\. Network ACLs.

11\. Private subnet connectivity.

12\. Troubleshooting VPN traffic.

13\. Using `ip route get` to diagnose routing.

14\. Using `ip rule` and multiple routing tables.

15\. Understanding the difference between tunnel establishment and actual data-plane connectivity.



One of the most important lessons was:



> \*\*A VPN tunnel can be UP while network traffic is still failing because routing, security rules, or packet handling are incorrect.\*\*



\---



\# 16. Current Project Status



\### Completed



\* \[x] AWS VPC created

\* \[x] AWS public subnet created

\* \[x] AWS private subnet created

\* \[x] Internet Gateway configured

\* \[x] Route tables configured

\* \[x] Virtual Private Gateway created

\* \[x] Simulated on-premises VPC created

\* \[x] Ubuntu VPN router deployed

\* \[x] StrongSwan installed

\* \[x] IP forwarding enabled

\* \[x] Customer Gateway created

\* \[x] AWS Site-to-Site VPN created

\* \[x] Tunnel 1 established

\* \[x] VTI configured

\* \[x] AWS static route configured

\* \[x] Linux policy routing configured

\* \[x] End-to-end VPN connectivity verified

\* \[x] Troubleshooting documented



\### Optional Future Improvements



\* \[ ] Configure Tunnel 2 for redundancy

\* \[ ] Make VTI configuration persistent across reboot

\* \[ ] Make Linux policy-routing rules persistent

\* \[ ] Test AWS-to-on-premises traffic

\* \[ ] Test SSH across the VPN

\* \[ ] Add monitoring and CloudWatch alerts

\* \[ ] Test VPN tunnel failover

\* \[ ] Replace the simulated on-premises environment with a real external network/device

\* \[ ] Add infrastructure diagrams

\* \[ ] Automate the infrastructure with Terraform or CloudFormation



\---



\# 17. Future Reference



If returning to this project later, start by reviewing:



```text

README.md

```



Then review:



```text

configuration/

```



and:



```text

troubleshooting/

```



The most important verification commands are:



```bash

sudo ipsec statusall

```



```bash

ip rule

```



```bash

ip route

```



```bash

ip route get 10.0.2.183

```



```bash

ping -c 4 10.0.2.183

```



A successful routing lookup should show:



```text

10.0.2.183 dev Tunnel1 table 220 src 192.168.1.209

```



A successful connectivity test should show:



```text

4 packets transmitted

4 received

0% packet loss

```



\---



\# Conclusion



This Day 24 project demonstrates a practical AWS hybrid-cloud networking architecture using AWS Site-to-Site VPN and StrongSwan.



The project successfully established VPN connectivity between:



```text

Simulated On-Premises

192.168.1.0/24

```



and:



```text

AWS VPC

10.0.0.0/16

```



The final connectivity test successfully reached the AWS private server:



```text

10.0.2.183

```



with:



```text

0% packet loss

```



This project provided hands-on experience with AWS networking, VPN architecture, Linux routing, security controls, and real-world troubleshooting.



