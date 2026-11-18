---
title: "Attacking Kerberos"
description: "Introduction of Kerberos What is Kerberos? Kerberos is the default authentication service for Microsoft Windows domains. It is intended to be more \"secure\" than NTLM by using"
lang: "en"
translationKey: "attacking-kerberos"
category: "lab-writeups"
tags: ["Kerbrute", "Harvesting Ticket", "password spraying rubeus", "Kerberoasting", "AS-Rep Roasting", "pass-the-ticket", "Golden/Silver ticket", "Kerberos Backdoors", "Active Directory"]
publishDate: "2025-05-07"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "original"
notionId: "1ec5fca1-ed80-802a-b22d-d7609cf6ce2c"
notionUrl: "https://app.notion.com/p/Attacking-Kerberos-1ec5fca1ed80802ab22dd7609cf6ce2c"
notionLastEdited: "2025-05-18T22:53:00.000Z"
---

# Introduction of Kerberos

## **What is Kerberos?**

Kerberos is the default authentication service for Microsoft Windows domains. It is intended to be more "secure" than NTLM by using third party ticket authorization as well as stronger encryption. Even though NTLM has a lot more attack vectors to choose from Kerberos still has a handful of underlying vulnerabilities just like NTLM that we can use to our advantage.

**Common Terminology - **

- **Ticket Granting Ticket (TGT)** - A ticket-granting ticket is an authentication ticket used to request
service tickets from the TGS for specific resources from the domain.
- **Key Distribution Center (KDC)** - The Key Distribution Center is a service for issuing TGTs and service tickets that consist of the Authentication Service and the Ticket
Granting Service.
- **Authentication Service (AS)** - The Authentication Service issues TGTs to be used by the TGS in the domain to request access to other machines and service tickets.
- **Ticket Granting Service (TGS)** - The Ticket Granting Service takes the TGT and returns a ticket to a machine on the domain.
- **Service Principal Name (SPN)** - A Service Principal Name is an identifier given to a service instance to associate a service instance with a domain service account. Windows
requires that services have a domain service account which is why a
service needs an SPN set.
- **KDC Long Term Secret Key (KDC LT Key) **The KDC key is based on the KRBTGT service account. It is used to encrypt the TGT and sign the PAC.
- **Client Long Term Secret Key (Client LT Key) ** The client key is based on the computer or service account. It is used
to check the encrypted timestamp and encrypt the session key.
- **Service Long Term Secret Key (Service LT Key) ** The service key is based on the service account. It is used to encrypt
the service portion of the service ticket and sign the PAC.
- **Session Key** - Issued by the KDC when a TGT is issued. The user will provide the session key to the KDC along with the TGT when requesting a service ticket.
- **Privilege Attribute Certificate (PAC)** - The PAC holds all of the user's relevant information, it is sent along with the TGT to the KDC to be signed by the Target LT Key and the KDC LT Key in order to validate the user.
## **AS-REQ w/ Pre-Authentication In Detail** 

The AS-REQ step in Kerberos authentication starts when a user requests a TGT from the KDC. In order to validate the user and create a TGT for the user, the KDC must follow these exact steps. The first step is for the user to encrypt a timestamp NT hash and send it to the AS. The KDC attempts to decrypt the timestamp using the NT hash from the user, if successful the KDC will issue a TGT as well as a session key for the user.

## Ticket Granting Ticket Contents -

In order to understand how the service tickets get created and validated, we need to start with where the tickets come from; the TGT is provided by the user to the KDC, in return, the KDC validates the TGT and returns a service ticket.

![](/images/attacking-kerberos/a1ece0bc4991.png)

## Service Ticket Contents -

To understand how Kerberos authentication works you first need to understand what these tickets 
contain and how they're validated. A service ticket contains two portions: the service provided portion and the user-provided portion. I'll break it down into what each portion contains.

- Service Portion: User Details, Session Key, Encrypts the ticket with the service account NTLM hash.
- User Portion: Validity Timestamp, Session Key, Encrypts with the TGT session key.
![](/images/attacking-kerberos/6b68e6f0c1d7.png)

## Kerberos Authentication Overview

![](/images/attacking-kerberos/ddcc0fbd375f.png)

AS-REQ - 1.) The client requests an Authentication Ticket or Ticket Granting Ticket (TGT).

AS-REP - 2.) The Key Distribution Center verifies the client and sends back an encrypted TGT.

TGS-REQ - 3.) The client sends the encrypted TGT to the Ticket Granting Server (TGS) with the Service Principal Name (SPN) of the service the client wants to access.

TGS-REP - 4.) The Key Distribution Center (KDC) verifies the TGT of the user and that the user has access to the service, then sends a valid session key for the service to the client.

AP-REQ - 5.) The client requests the service and sends the valid session key to prove the user has access.

AP-REP - 6.) The service grants access

## Kerberos Tickets Overview -

The main ticket you will receive is a ticket-granting ticket (TGT). These can come in various forms, such as a .kirbi for Rubeus and. ccache for Impacket. A ticket is typically base64 encoded and can be 
used for multiple attacks.

The ticket-granting ticket is only used to get service tickets from the KDC. When requesting a TGT from the KDC, the user will authenticate with their credentials to the KDC and request a ticket. The server will validate the credentials, create a TGT and encrypt it using the krbtgt key. The encrypted TGT and a session key will be sent to the user.

When the user needs to request a service ticket, they will send the TGT and the session key to the KDC, along with the service principal name (SPN) of the service they wish to access. The KDC will validate the TGT and session key. If they are correct, the KDC will grant the user a service ticket, which can be used to authenticate to the corresponding service.

## Attack Privilege Requirements

- Kerbrute Enumeration - No domain access required
- Pass the Ticket - Access as a user to the domain required
- Kerberoasting - Access as any user required
- AS-REP Roasting - Access as any user required
- Golden Ticket - Full domain compromise (domain admin) required
- Silver Ticket - Service hash required
- Skeleton Key - Full domain compromise (domain admin) required
# Enumeration with Kerbrute

![](/images/attacking-kerberos/bd013f683da0.png)

![](/images/attacking-kerberos/6ef675d8aa20.png)

# Harvesting & Brute-Forcing Tickets w/ Rubeus

## **Harvesting Tickets w/ Rubeus**

```bash
Rubeus.exe harvest /interval:30
```

![](/images/attacking-kerberos/2e748ba82d8f.png)

## **Brute-Forcing / Password-Spraying w/ Rubeus**

Rubeus can both brute force passwords as well as password spray user accounts. When brute-forcing passwords you use a single user account and a wordlist of passwords to see which password 
works for that given user account. In password spraying, you give a single password such as Password1 and "spray" against all found user accounts in the domain to find which one may have that password.

This attack will take a given Kerberos-based password and spray it against all found users and give a .kirbi ticket. This ticket is a TGT that can be used in order to get service tickets from the KDC as well as to be used in attacks like the pass the ticket attack.

Before password spraying with Rubeus, you need to add the domain controller domain name to the windows host file. You can add the IP and domain name to the hosts file from the machine by using the echo command:

`echo 10.10.78.105 CONTROLLER.local >> C:\Windows\System32\drivers\etc\hosts`

1.) `cd Downloads` - navigate to the directory Rubeus is in

2.) `Rubeus.exe brute /password:Password1 /noticket` - This will take a given password and "spray" it against all found users then give the .kirbi TGT for that user

![](/images/attacking-kerberos/ab3751de06ab.png)

we successfully got the .kirbi from user machine1 but when I  try using the latest version of rubeus, I can’t got the .kirbi like the following. I don’t know why

![](/images/attacking-kerberos/1a98279b8871.png)

# Kerberoasting w/ Rubeus & Impacket

in this task we'll be covering one of the most popular Kerberos attacks - Kerberoasting. Kerberoasting allows a user to request a service ticket for any service with a registered SPN then use that ticket to crack the service password. If the service has a registered SPN then it can be Kerberoastable however the success of the attack depends on how strong the password is and if it is trackable as well as the privileges of the cracked service account. To enumerate Kerberoastable accounts I would suggest a tool like BloodHound to find all Kerberoastable accounts, it will allow you to see what kind of accounts you can kerberoast if they are domain admins, and what kind of 
connections they have to the rest of the domain. That is a bit out of scope for this room but it is a great tool for finding accounts to target.

In order to perform the attack, we'll be using both Rubeus as well as Impacket so you understand the various tools out there for Kerberoasting. There are other tools out there such a kekeo and 
Invoke-Kerberoast but I'll leave you to do your own research on those tools.

## **Kerberoasting w/ Rubeus**

we got 2 services which is kerberostable which are SQLService and HTTPService

![](/images/attacking-kerberos/95f014818e6b.png)

Then copy the hash onto your attacker machine and put it into a .txt file so we can crack it with hashcat

## **Kerberoasting w/ Impacket**

![](/images/attacking-kerberos/e57677832b74.png)

then crack it using hashcat

```bash
hashcat -m 13100 kerberoast.txt Downloads/Pass.txt
```

![](/images/attacking-kerberos/9f3856a65d73.png)

# AS-REP Roasting W/ Impacket

```bash
impacket-GetNPUsers CONTROLLER.local/Machine1:Password1 -request -format hashcat -outputfile try
```

![](/images/attacking-kerberos/57a46f0eceb9.png)

Then let’s we crack the hash using hashcat

![](/images/attacking-kerberos/756344a481ad.png)

# Pass the Ticket w/ mimikatz

## **Pass the Ticket Overview -**

Pass the ticket works by dumping the TGT from the LSASS memory of the machine. The Local Security Authority Subsystem Service (LSASS) is a memory process that stores credentials on an active directory server and can store Kerberos ticket along with other credential types to act as the gatekeeper and accept or reject the credentials provided. You can dump the Kerberos Tickets from the LSASS memory just like you can dump hashes. When you dump the tickets with mimikatz it will give us a .kirbi ticket which can be used to gain domain admin if a domain admin ticket is in the LSASS memory. 

This attack is great for privilege escalation and lateral movement if there are unsecured domain service account tickets laying around. The attack allows you to escalate to domain admin if you dump a domain admin's ticket and then impersonate that ticket using mimikatz PTT attack allowing you to act as that domain admin. You can think of a pass the ticket attack like reusing an existing ticket were not creating or destroying any tickets here were simply reusing an existing ticket from another user on the domain and impersonating that ticket.

![](/images/attacking-kerberos/1209f0e8f016.png)

## **Prepare Mimikatz & Dump Tickets**

`privilege::debug` - Ensure this outputs [output '20' OK] if it does not that means you do
not have the administrator privileges to properly run mimikatz

![](/images/attacking-kerberos/b4e1280ad7b0.png)

`sekurlsa::tickets /export` - Dump the ticket

![](/images/attacking-kerberos/ccdaa9c60756.png)

hasil dari dump ticket tersebut

![](/images/attacking-kerberos/fd8edd792561.png)

When looking for which ticket to impersonate I would recommend looking for an administrator ticket from the krbtgt just like the one outlined in red above.

## Pass the Ticket w/ Mimikatz

Now that we have our ticket ready we can now perform a pass the ticket attack to gain domain admin privileges.

1.) `kerberos::ptt <ticket>` - run this command inside of mimikatz with the ticket that you harvested from earlier. It will cache and impersonate the given ticket

![](/images/attacking-kerberos/969e7c623817.png)

2.) `klist` - Here were just verifying that we successfully impersonated the ticket by listing our cached tickets. We will not be using mimikatz for the rest of the attack.

![](/images/attacking-kerberos/d47e79d5d1b0.png)

3.) You now have impersonated the ticket giving you the same rights as the TGT you're impersonating. To verify this we can look at the admin share.

**Before pass the ticket**

![](/images/attacking-kerberos/84ef37abb26b.png)

After pass the ticket, we have an access

![](/images/attacking-kerberos/c608d6f604ef.png)

# Golden/Silver Ticket Attacks w/ mimikatz

## **Dump the krbtgt hash**

```bash
lsadump::lsa /inject /name:krbtgt
```

This will dump the hash as well as the security identifier needed to create a Golden Ticket. To create a silver ticket you need to change the /name: to dump the hash of either a domain admin account or a service account such as the SQLService account.

![](/images/attacking-kerberos/0fe904c673e2.png)

## **Create a Golden/Silver Ticket**

```bash
Kerberos::golden /user:Administrator /domain:controller.local /sid: /krbtgt: /id:
```

This is the command for creating a golden ticket to create a silver ticket simply put a service NTLM hash into the krbtgt slot, the sid of the service account into sid, and change the id to 1103.

I'll show you a demo of creating a golden ticket it is up to you to create a silver ticket.

![](/images/attacking-kerberos/17d34ec38373.png)

## **Use the Golden/Silver Ticket to access other machines**

`misc::cmd` - this will open a new elevated command prompt with the given ticket in mimikatz.

![](/images/attacking-kerberos/611871ed32c6.png)

Access machines that you want, what you can access will depend on the privileges of the user that you decided to take the ticket from however if you took the ticket from krbtgt you have access to the ENTIRE network hence the name golden ticket; however, silver tickets only have access to those that the user has access to if it is a domain admin it can almost access the entire network however it is slightly less elevated from a golden ticket.

![](/images/attacking-kerberos/7589be212a7a.png)

This attack will not work without other machines on the domain however I challenge you to configure this on your own network and try out these attacks.

# Kerberos Backdoors w/ mimikatz

Along with maintaining access using golden and silver tickets mimikatz has one other trick up its sleeves when it comes to attacking Kerberos. Unlike the golden and silver ticket attacks a Kerberos backdoor is much more subtle because it acts similar to a rootkit by implanting itself into the memory of the domain forest allowing itself access to any of the machines with a master password.

The Kerberos backdoor works by implanting a skeleton key that abuses the way that the AS-REQ validates encrypted timestamps. A skeleton key only works using Kerberos RC4 encryption.

The default hash for a mimikatz skeleton key is  *60BA4FCADC466C7A033C178194C03DF6* which makes the password -"*mimikatz*"

This will only be an overview section and will not require you to do anything on the machine however I encourage you to continue yourself and add other machines and test using skeleton keys with mimikatz.

## Skeleton Key Overview -

The skeleton key works by abusing the AS-REQ encrypted timestamps as I said above, the timestamp is encrypted with the users NT hash. The domain controller then tries to decrypt this timestamp with the users NT hash, once a skeleton key is implanted the domain controller tries to decrypt the timestamp using both the user NT hash and the skeleton key NT hash allowing you access to the domain forest.

## **Installing the Skeleton Key w/ mimikatz**

`misc::skeleton` - Yes! that's it but don't underestimate this small command it is very powerful

![](/images/attacking-kerberos/865e9d1e644f.png)

## Accessing the forest

The default credentials will be: "*mimikatz*"

example: `net use c:\\DOMAIN-CONTROLLER\admin$ /user:Administrator mimikatz` - The share will now be accessible without the need for the Administrators password

example: `dir \\Desktop-1\c$ /user:Machine1 mimikatz` - access the directory of Desktop-1 without ever knowing what users have access to Desktop-1

The skeleton key will not persist by itself because it runs in the memory, it can be scripted or persisted using other tools and techniques however that is out of scope for this room.
