---
title: "Zeno"
description: "Enum Port 12340 - http Dirsearch: kami menemukan aplikasi restoran di halaman /rms, jadi mari kita cari eksploitasi terkait dengan sistem manajemen restoran, kami menemukan eksploitasi RCE jadi"
lang: "id"
translationKey: "zeno"
category: "lab-writeups"
tags: ["Lab", "restaurant_management_system_exploit", "database_enum", "credentail_in_fstab/mtab", "privesc_service_linux", "sudo_reboot_permission", "Pwnkit_CVE-2021-4034", "Linux", "Medium"]
publishDate: "2025-08-24"
draft: false
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "2595fca1-ed80-806f-9e12-ff757e5b540e"
notionUrl: "https://app.notion.com/p/Zeno-2595fca1ed80806f9e12ff757e5b540e"
notionLastEdited: "2025-08-25T16:22:00.000Z"
---

# Enum

![](/images/zeno/1c088f1cddfa.png)

## Port 12340 - http

![](/images/zeno/dcf923d0b896.png)

Dirsearch:

![](/images/zeno/0812b4036b43.png)

![](/images/zeno/04f834d3befd.png)

Kami menemukan aplikasi restoran di halaman /rms, jadi mari kita cari celah keamanan terkait dengan sistem manajemen restoran.

![](/images/zeno/b8c0f1b85059.png)

Kami menemukan celah keamanan RCE, jadi mari kita periksa skrip dan melakukan penyesuaian sesuai kebutuhan untuk menyelesaikan tantangan ini. Di sini saya memperbaiki beberapa kode kesalahan dan menambahkan revshell saya langsung ke dalam skrip, bukan hanya mengunggah RCE menggunakan parameter cmd seperti skrip default sebelumnya.

![](/images/zeno/9944a403a381.png)

![](/images/zeno/3c9c78349e8a.png)

Sekarang mengakses skrip untuk memicu revshell.

![](/images/zeno/82933c5b55ee.png)

# LinPriv

### Enumerasi Basis Data

Kacang polong:
Sekarang kita sudah masuk ke dalam mesin dan saya memutuskan untuk melihat `config.php` di dalam folder `connection`. yang memberi saya nama pengguna dan kata sandi untuk mengakses basis data:

![](/images/zeno/976fff183cb9.png)

Kemudian saya mencoba terhubung ke database menggunakan kredensial dari file terakhir. Dan saya menemukan beberapa **Hash Kata Sandi** di dalam tabel `members`:

![](/images/zeno/202f9c274e9f.png)

![](/images/zeno/f22cd7769bc0.png)

![](/images/zeno/6beef3b4b6dc.png)

Sayangnya kami tidak bisa membobol kata sandi Edward, jadi saya mencari cara lain untuk masuk sebagai Edward. Di Linpeas, saya menemukan sesuatu seperti kata sandi di segmen inisialisasi izin.

![](/images/zeno/ef92a8d5e4e7.png)

Mari kita coba menggunakannya untuk masuk ke akun Edward.

![](/images/zeno/6067f582856c.png)

Yeay, kita berhasil login sebagai Edward, jadi mari kita lakukan enumerasi pada pengguna Edward.

![](/images/zeno/fe63a2cdcd32.png)

![](/images/zeno/60d56b393a3d.png)

![](/images/zeno/7c188e34daaf.png)

Seperti yang kita lihat pada pengguna edward, kita memiliki akses untuk me-reboot sistem menggunakan sudo, dan kita mendapatkan layanan yang rentan. Mari kita periksa layanan yang rentan tersebut.

![](/images/zeno/5d633e88b3bb.png)

Seperti yang kita lihat, kita memiliki akses tulis ke file `/etc/systemd/system/zeno-monitoring.service`, yang lainnya hanya berupa symlink, jadi mari kita ubah parameter `ExecStart` untuk menjalankan perintah berikut agar mendapatkan pengguna root setelah me-reboot sistem.

```bash
#boleh pakek ini
/bin/bash -c 'echo "edward ALL=(root) NOPASSWD: ALL" > /etc/sudoers'

#saya pakai ini karna lebih pendek
/usr/bin/chmod +x /bin/bash
```

![](/images/zeno/2b35be6ca7d6.png)

Setelah memodifikasi layanan, mari kita reboot sistem, dan voila, kita mendapatkan pengguna root.

![](/images/zeno/5cb8ccb9331d.png)

### Tidak disengaja

Kacang polong:

![](/images/zeno/98787eb3a8da.png)

Eksploitasi Pwnkit (CVE-2021-4034):

![](/images/zeno/723f7b9757e9.png)
