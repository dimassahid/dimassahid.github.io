---
title: "SSRF"
description: "SSRF melalui Unduhan File Pertama, saya menemukan situs web seperti ini: ada fitur unduhan yang mengarah ke server secure-file-storage.com dan ada halaman admin yang hanya dapat diakses oleh..."
lang: "id"
translationKey: "ssrf"
category: "lab-writeups"
tags: []
publishDate: "2024-08-29"
draft: true
featured: false
sample: false
author: "Dimas Sahid Abdullah"
translationStatus: "machine"
sourceLang: "en"
notionId: "d4c0e64e-3362-4ebf-967a-ef431d19ff83"
notionUrl: "https://app.notion.com/p/SSRF-d4c0e64e33624ebf967aef431d19ff83"
notionLastEdited: "2024-08-29T05:12:00.000Z"
---

# SSRF melalui Unduh File

Awalnya saya mendapatkan situs web seperti ini, ada fitur unduhan yang mengarah ke server [secure-file-storage.com](http://secure-file-storage.com/) dan ada halaman admin yang hanya dapat diakses melalui localhost.

![](/images/ssrf/4c206ed97361.png)

![](/images/ssrf/909f280c0143.png)

Kemudian saya mencoba memanipulasi fitur unduhan agar mengarah ke laptop saya (tun0).

![](/images/ssrf/675e087ca8ad.png)

Seperti yang Anda lihat pada gambar di atas, permintaan server berhasil diarahkan ke laptop saya. Dengan memanfaatkan kerentanan ini, saya mencoba mengakses halaman admin dengan mengubah parameter `server` menjadi ini: [http://localhost:8087/admin%23&id=75482342](http://localhost:8087/admin%23&id=75482342)
Saya menggunakan %23(#) untuk mengescape parameter id agar tautan tetap berfungsi.

![](/images/ssrf/f2af3176f49b.png)

Viola, kita dapat benderanya.
