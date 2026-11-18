---
title: "A Small Burp Suite Extension for Capturing Findings"
description: "Engineering notes on building a small Burp Suite extension to flag requests, store quick notes, and export evidence without leaving the testing flow."
lang: "en"
translationKey: "sample-burp-notes-extension"
category: "security-tools"
tags: ["burp-suite", "tooling", "java", "notes"]
publishDate: 2025-08-19
sample: true
translationStatus: "machine"
sourceLang: "id"
author: "YOUR NAME"
---

## A small recurring problem

During testing I often flag an interesting request and later forget why it mattered.
Switching to a note-taking app breaks the testing flow. The interim solution: a small
extension that stores notes right next to the request.

## Deliberately limited scope

- Flag a request with one click.
- Store a short note and a confidence level.
- Export all notes to JSON at the end of a session.

No automated reporting features, no server integration. The smaller the scope, the
sooner the extension is finished and the smaller the risk of bugs.

## Data structure

```java
record FindingNote(
    String host,
    String path,
    String note,
    Confidence confidence,
    Instant createdAt
) {}
```

Notes live in memory for the duration of the session and are written to disk on export.
This avoids ambiguous state between sessions.

## Burp integration point

```java
@Override
public void registerExtenderCallbacks(IBurpExtenderCallbacks callbacks) {
    this.callbacks = callbacks;
    callbacks.setExtensionName("Finding Notes");
    callbacks.registerContextMenuFactory(new NoteContextMenuFactory(this));
}
```

The context menu appears on requests in Proxy history and Repeater, so the testing flow
stays unchanged.

## Lessons

1. Keep notes as close as possible to the original evidence.
2. Limit features; internal tooling does not need to be perfect.
3. A simple export format is more useful than a complicated integration.

## Next steps

Ideas not yet implemented: searching notes by host, and automatically flagging requests
with suspicious parameters. Both are intentionally deferred until real usage creates a
genuine need.
