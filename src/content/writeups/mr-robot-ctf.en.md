---
title: "Mr Robot CTF"
description: "InfoGath Nmap : Port 80 Port 443 Dirsearch : Key 1 going into /fsocity.dic downloads a dictionary file called fsocity.dic going into /license.txt and we got something interesting."
lang: "en"
translationKey: "mr-robot-ctf"
category: "lab-writeups"
tags: ["Lab", "Wordpress", "SUID-Nmap", "Linux"]
publishDate: "2025-01-08"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "1755fca1-ed80-8030-ae43-d148ecbe3ee7"
notionUrl: "https://app.notion.com/p/Mr-Robot-CTF-1755fca1ed808030ae43d148ecbe3ee7"
notionLastEdited: "2025-02-12T14:19:00.000Z"
---

# InfoGath

Nmap :

![](/images/mr-robot-ctf/67e79c0dde13.png)

## Port 80

![](/images/mr-robot-ctf/189f3131385f.png)

## Port 443 

![](/images/mr-robot-ctf/8718a39bc3f8.png)

Dirsearch :

```bash
dirsearch -u https://10.10.120.0/ -x 403,404,400

OUTPUT :                                                               
[12:50:06] 200 -    0B  - /favicon.ico                                      
[12:50:28] 200 -  158B  - /license.txt                                      
[12:50:28] 200 -  158B  - /license                                          
[12:50:29] 200 -  504KB - /intro                                            
[12:51:06] 200 -   64B  - /readme                                           
[12:51:06] 200 -   64B  - /readme.html                                      
[12:51:09] 200 -   41B  - /robots.txt                                       
[12:51:17] 200 -    0B  - /sitemap                                          
[12:51:17] 200 -    0B  - /sitemap.xml
[12:51:17] 200 -    0B  - /sitemap.xml.gz
[12:51:46] 200 -   21B  - /wp-admin/admin-ajax.php                          
[12:51:46] 200 -    0B  - /wp-config.php                                    
[12:51:47] 200 -    0B  - /wp-content/                                      
[12:51:47] 200 -    0B  - /wp-content/plugins/google-sitemap-generator/sitemap-core.php                                                                                   
[12:51:48] 200 -    0B  - /wp-cron.php                                      
[12:51:48] 200 -    1KB - /wp-login                                         
[12:51:48] 200 -    1KB - /wp-login/
[12:51:48] 200 -    1KB - /wp-login.php

```

![](/images/mr-robot-ctf/642365b79eb5.png)

# Key 1

![](/images/mr-robot-ctf/0f9e0da60b74.png)


going into `/fsocity.dic` downloads a dictionary file called `fsocity.dic`

![](/images/mr-robot-ctf/2f821faae3ac.png)

going into `/license.txt` and we got something interesting.

![](/images/mr-robot-ctf/98db6e1c08b7.png)

![](/images/mr-robot-ctf/3356d8961697.png)

we got a credential `elliot:ER28-0652` let’s we use it for login on `wp-login.php` 

![](/images/mr-robot-ctf/051c6b14aac9.png)

![](/images/mr-robot-ctf/839a49974c86.png)

## Exploit Wordpress

go to appearance > editor > 404.php then edit the contain become our revshell like this.

![](/images/mr-robot-ctf/fb5d9e51194b.png)

and accessing the page for triggering our revshell.

![](/images/mr-robot-ctf/530c050e9bde.png)

then we got credential here of user `robot : abcdefghijklmnopqrstuvwxyz`

![](/images/mr-robot-ctf/9f70121baaa5.png)

![](/images/mr-robot-ctf/5a09d6266af2.png)

then we switch the user become robot and doing privilege escalation to become root user.

![](/images/mr-robot-ctf/a292046c0c7c.png)

# Key 2

![](/images/mr-robot-ctf/40c6dd950f86.png)

# LinPriv

looking for SUID File manually

![](/images/mr-robot-ctf/80ccd02d8d79.png)

![](/images/mr-robot-ctf/b1a3c600c4ed.png)

Ok, so let’s try the option b), by starting an interactive session on Nmap and trying to execute a shell.

# Key 3

![](/images/mr-robot-ctf/18a5f52be6bb.png)
