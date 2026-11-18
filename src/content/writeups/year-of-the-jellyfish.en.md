---
title: "year of the jellyfish"
description: "Enum Port 80 & 443 - http & https when accessing port 80 we always being forced redirected into domain which using https which is 443, so let’s we register that domain into our"
lang: "en"
translationKey: "year-of-the-jellyfish"
category: "lab-writeups"
tags: ["Lab", "monitor 1.7.6m", "Sub Domain Enum", "dirty_sock_CVE_2019_7304", "snap SUID exploit", "Pwnkit_CVE-2021-4034", "Linux", "Hard"]
publishDate: "2025-09-09"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2695fca1-ed80-803c-9735-fb2784a020b9"
notionUrl: "https://app.notion.com/p/year-of-the-jellyfish-2695fca1ed80803c9735fb2784a020b9"
notionLastEdited: "2025-10-13T16:07:00.000Z"
---

# Enum

```bash
nmap -sCV <IP>
```

![](/images/year-of-the-jellyfish/f773b0e5239a.png)

![](/images/year-of-the-jellyfish/f7ec52f74d1a.png)

## Port 80 & 443 - http & https

when accessing port 80 we always being forced redirected into domain [https://robyns-petshop.thm/](https://robyns-petshop.thm/) which using https which is 443, so let’s we register that domain into our /etc/hosts

![](/images/year-of-the-jellyfish/09261bf77eba.png)

after registering the domain in /etc/hosts we gonna got the actual website.

![](/images/year-of-the-jellyfish/6e7aae4de1bb.png)

![](/images/year-of-the-jellyfish/e40dfa5fe89b.png)

after strolling around and doing dirsearch I can’t got interesting thing it’s just a static website, so I notice that we got subdomain information from nmap scanning. 

![](/images/year-of-the-jellyfish/c1612d38bfcc.png)

then register all those subdomain into /etc/hosts and check it one by one.

![](/images/year-of-the-jellyfish/9af5446b60ac.png)

![](/images/year-of-the-jellyfish/cf737f744417.png)

![](/images/year-of-the-jellyfish/4cf9a46c8235.png)

![](/images/year-of-the-jellyfish/2144cbb8a9b6.png)

subdomain beta is under construction, subdomain dev seems exactly like the main domain, so only monitor subdomain which give us different apps and also we can capture the exactly version of the apps which is **monitor 1.7.6m** so let’s we looking for the exploitation which is relate to that version. 

![](/images/year-of-the-jellyfish/6c3387538266.png)

between those 2 exploit scripts we choose RCE which can bring us into revshell. let’s examine the script and running it

![](/images/year-of-the-jellyfish/eaa371c77aec.png)

![](/images/year-of-the-jellyfish/32bada7553c0.png)

when running the script we got an SSL error cause our script doesn’t handle secure connection (https) whereas our target using https. so let’s modify our script to handle secure connections and rerun the script.

![](/images/year-of-the-jellyfish/ed180aa8f487.png)

![](/images/year-of-the-jellyfish/e495444faa16.png)

It says “A shell script should be uploaded.” according the exploit code, the file should have been uploaded in this path: “***/assets/data/usrimg****”*. oh, nothing uploaded:

![](/images/year-of-the-jellyfish/d89a37a3d249.png)

Let’s print the response code to see what happened:

![](/images/year-of-the-jellyfish/a559ad04b0fa.png)

Something track us and prevents this exploit from running:

![](/images/year-of-the-jellyfish/c198663a38ce.png)

check the browser for for cookies. there is a cookie called “**isHuman”: “1”**

![](/images/year-of-the-jellyfish/c55e0623b7ce.png)

Add this cookie to post and get requests:

![](/images/year-of-the-jellyfish/388be1593a65.png)

rerun the script:

![](/images/year-of-the-jellyfish/b37a7f98602d.png)

the uploaded file is detected not an image so let’s we try to bypass this protection by using common skenario by making double extension on the file (.gif.php)

![](/images/year-of-the-jellyfish/d6cf98c0fb58.png)

![](/images/year-of-the-jellyfish/f3f460ba8098.png)

it still doesn’t work, let’s we try whether application implement casesensitive detection or not by changing the extension become .gif.pHp

![](/images/year-of-the-jellyfish/72028d312172.png)

![](/images/year-of-the-jellyfish/c19bea960cea.png)

we success to upload our revshell file but failed to establish revshell from our script so let’s we establish the revshell manually by accessing the file we’ve uploaded.

![](/images/year-of-the-jellyfish/ca5e2edbe9a2.png)

voila we succed to get revshell. for noting, if you using another port like 4444 or etc the revshell will not establish, perhaps it happens because firewall or something so the better way establish our revshell using common port like 443, or 80 which is used by the application.

![](/images/year-of-the-jellyfish/05e50e0ae6fa.png)

# LinPriv

output from [https://github.com/The-Z-Labs/linux-exploit-suggester/blob/master/linux-exploit-suggester.sh](https://github.com/The-Z-Labs/linux-exploit-suggester/blob/master/linux-exploit-suggester.sh) :

![](/images/year-of-the-jellyfish/2cc1c1771e6e.png)

output from linpeas:

![](/images/year-of-the-jellyfish/766c0ede2a27.png)

then we check the version of the snap

![](/images/year-of-the-jellyfish/4b1a7a082752.png)

looking for the exploit which is related with installed snap version

![](/images/year-of-the-jellyfish/7606d0e3c78f.png)

then I check one by one, when using script [46361.py](http://46361.py/) I got prompt to input username and key, because I don’t have those thing I skiped the script, then I continue with [4636](http://46361.py/)2.py.

running script [46362.py](http://46361.py/) will give the output like the following.

![](/images/year-of-the-jellyfish/e2eb7a987f96.png)

after the script has been done, then switch into dirty_sock user then running sudo su and voila we got root access.

![](/images/year-of-the-jellyfish/7cfcf3baf5b5.png)

## Unintended

linpeas:

![](/images/year-of-the-jellyfish/a9e28825b954.png)

running the exploit script pwnkit.py

![](/images/year-of-the-jellyfish/39fa200d47b6.png)

voila we got root access
