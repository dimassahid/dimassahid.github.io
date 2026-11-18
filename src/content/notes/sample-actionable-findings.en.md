---
title: "Writing Findings Engineering Can Act On"
description: "A structure for security findings that emphasises reproducible evidence, business-language impact, and clear remediation steps."
lang: "en"
translationKey: "sample-actionable-findings"
category: "application-security"
tags: ["reporting", "communication", "remediation"]
publishDate: 2025-07-08
sample: true
translationStatus: "machine"
sourceLang: "id"
author: "YOUR NAME"
---

## A report is not a score list

A good report answers three reader questions: what can happen, how easily can it happen,
and what is the next step. Severity scores are only useful once those questions are
answered.

## The structure I use

1. **Summary** - one paragraph without jargon.
2. **Impact** - who is affected and which data is at risk.
3. **Reproduction** - the minimum steps that prove the finding.
4. **Root cause** - the technical cause, not the symptom.
5. **Recommendations** - short-term and long-term fixes.

## An example of a weak summary

> IDOR found on the invoice endpoint.

## A stronger summary

> An authenticated user can read another user's invoices by changing the invoice number
> in the API request. Exposed data includes billing names and email addresses. The fix can
> be applied at the query layer without changing the UI.

The difference is not length; it is clarity about the action to take.

## Writing evidence

Evidence must be reproducible by an engineer who did not attend the testing session.
I limit evidence to the minimum request, mask sensitive data, and state environment
assumptions (versions, roles, special configuration).

```http
GET /api/v1/invoices/1043 HTTP/1.1
Authorization: Bearer <token-user-a>
```

## Lessons

- Write for a busy reader who was not present during testing.
- Separate symptoms from root cause.
- Include fix verification, not just instructions.
- Avoid dramatisation; real risk is usually convincing enough.
