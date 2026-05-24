# Database Schema

## Overview

LogFlow uses MongoDB with three Mongoose models. The relationships are:

```
Developer ─── owns ──→ Application ─── has many ──→ Log
```

Each `Developer` can own many `Application`s. Each `Application` can accumulate many `Log` entries. Logs reference their parent application by ObjectId, and applications reference their owner developer by ObjectId.

## Developer Model

**Collection:** `developers`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `username` | String | Required, unique, trimmed | Display name for the developer |
| `email` | String | Required, unique, lowercased | Used for login |
| `password` | String | Required, min length 6 | Stored as bcrypt hash |
| `apiKey` | String | Required, unique | UUID generated at registration; used to authenticate SDK calls |
| `createdAt` | Date | Auto | Mongoose `timestamps: true` |
| `updatedAt` | Date | Auto | Mongoose `timestamps: true` |

The `password` field is excluded from all query results by default via `select: false`. The `apiKey` is generated once at registration and never changes.

## Application Model

**Collection:** `applications`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `name` | String | Required, unique, trimmed | Must match `/^\S+$/` — no whitespace allowed |
| `owner` | ObjectId (ref: Developer) | Required | Foreign key to the owning developer |
| `createdAt` | Date | Auto | Mongoose `timestamps: true` |
| `updatedAt` | Date | Auto | Mongoose `timestamps: true` |

The `name` field has a regex validator that rejects any value containing whitespace. It also carries a unique index so names are globally unique across all developers — no two applications on the platform can share a name.

## Log Model

**Collection:** `logs`

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `message` | String | Required | The log message text |
| `level` | String | Required, enum: `INFO`, `WARN`, `ERROR` | Severity level |
| `count` | Number | Default: `1` | Incremented on each duplicate occurrence |
| `application` | ObjectId (ref: Application) | Required | Foreign key to the parent application |
| `createdAt` | Date | Set manually on first insert | Immutable — records first occurrence |
| `updatedAt` | Date | Set manually on each upsert | Records most recent occurrence |

**`timestamps: false`** — Mongoose automatic timestamps are disabled on this model. `createdAt` and `updatedAt` are managed manually to enforce the upsert semantics: `createdAt` is set only on `$setOnInsert` and `updatedAt` is always updated. This ensures `createdAt` is truly immutable after the first insertion.

**Compound unique index:** `{ message: 1, level: 1, application: 1 }` — this index powers the upsert query and guarantees deduplication. Two log entries with the same message, level, and application are always collapsed into a single document with an incrementing `count`.

## Relations

| From | Relation | To | Via Field |
|---|---|---|---|
| `Application` | belongs to | `Developer` | `Application.owner → Developer._id` |
| `Log` | belongs to | `Application` | `Log.application → Application._id` |
| `Developer` | has many | `Application` | (reverse of above) |
| `Application` | has many | `Log` | (reverse of above) |

## Indexes

| Collection | Index | Type | Purpose |
|---|---|---|---|
| `developers` | `email` | Unique | Fast login lookup; prevents duplicate accounts |
| `developers` | `username` | Unique | Prevents duplicate usernames |
| `developers` | `apiKey` | Unique | Fast API key lookup in `apiKey.js` middleware |
| `applications` | `name` | Unique | Global uniqueness; fast lookup by name in routes |
| `logs` | `{ message, level, application }` | Compound Unique | Powers upsert deduplication; prevents duplicate log documents |
| `logs` | `application` | Standard | Fast log listing queries filtered by application |
