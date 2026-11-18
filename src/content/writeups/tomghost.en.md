---
title: "tomghost"
description: "Enum Port 8080 - Http Dirsearch we don’t got any interesting thing inside this port so we move to another port Port 8009 - ajp13 look for related exploit with the keyword ajp"
lang: "en"
translationKey: "tomghost"
category: "lab-writeups"
tags: ["Lab", "tomghost", "ajp", "crack PGP", "crack asc", "sudo zip", "Linux", "Easy"]
publishDate: "2025-08-16"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "2515fca1-ed80-8012-939c-cab761291762"
notionUrl: "https://app.notion.com/p/tomghost-2515fca1ed808012939ccab761291762"
notionLastEdited: "2025-08-18T23:59:00.000Z"
---

# Enum

![](/images/tomghost/7577721805f9.png)

## Port 8080 - Http

![](/images/tomghost/801e19ef9bd1.png)

**Dirsearch**

![](/images/tomghost/928822afda86.png)

we don’t got any interesting thing inside this port so we move to another port

## Port 8009 - ajp13

look for related exploit with the keyword **ajp** service and copy the exploit script in local.

![](/images/tomghost/8e372fe2e257.png)

![](/images/tomghost/3cc5600316e0.png)

after examine the exploit script we run the script using python2 and the output is a credential which we can use for later

![](/images/tomghost/f517534dc3a6.png)

then we use the credential (`skyfuck:8730281lkjlkjdqlksalks`) for login ssh voila we got user.txt

![](/images/tomghost/5cee50c87f52.png)

# LinPriv

## Horizontal PrivEsc

after running linpeas we can’t find something interesting 

![](/images/tomghost/505309791c43.png)

so I looking for the other possibilities and found out there is .pgp & .asc file inside skyfuck directory

credential.pgp is not readable format and tryhackme.asc contains PGP private key so we move both file into our local.

![](/images/tomghost/efa1809ecbd4.png)

![](/images/tomghost/37d719390823.png)

to understand how to use both file we found something on internet which tell us to do something like this [https://superuser.com/questions/46461/decrypt-pgp-file-using-asc-key](https://superuser.com/questions/46461/decrypt-pgp-file-using-asc-key). So, we can try to do the same by first importing the ASC key and then decrypting the PGP file. 

![](/images/tomghost/435063e8a14b.png)

So, here we have imported the `tryhakme.asc` key and next thing we  decrypt the `credential.pgp` file, But here it asks for a passphrase that we don't know. So, we need to find a file to extract the passphrase from either of the two `ASC` or `PGP` files.

After some googling, I came around [this article](https://www.ubuntuvibes.com/2012/10/recover-your-gpg-passphrase-using-john.html) where it has explained how we can extract the passphrase from an `ASC` key by first converting it to a hash understandable by `john` and then extracting the passphrase from that hash using `john`.
run `gpg2john` on the ASC file and convert it to a hash understandable by `john`.

```bash
#Convert tryhackme.asc become john format encrypt
gpg2john tryhackme.asc > hash

#crack tryhackme.asc using john
john --format=gpg --wordlist=/usr/share/wordlists/seclists/Passwords/darkc0de.txt hash
```

![](/images/tomghost/233c6fae2beb.png)

So, `john` has provided us the passphrase using which we can decrypt the `credential.pgp` file. Now, we can head back to the target machine and decrypt the PGP file

![](/images/tomghost/39f63d2f77ec.png)

oke now we got a new credential that was credential of user merlin, `merlin:asuyusdoiuqoilkda312j31k2j123j1g23g12k3g12kj3gk12jg3k12j3kj123j` . Move into user merlin then we find out that user merlin has sudo access for using zip. it can be use to become root user.

![](/images/tomghost/e3fea45c4110.png)

## Vertical PrivEsc

GtfoBin:

![](/images/tomghost/dd326dd212df.png)

execute the command, then voila got root user and flag:

```bash
sudo zip mktemp -u /etc/hosts -T -TT 'sh #'
```

![](/images/tomghost/4cfaaf93ca74.png)

Referensi:

- [https://superuser.com/questions/46461/decrypt-pgp-file-using-asc-key](https://superuser.com/questions/46461/decrypt-pgp-file-using-asc-key)
