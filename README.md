# Development

I added the `nodemon` package as a `devDependency` and added a run script: `npm run dev`. This provided a hot-reloading environment during development.

> ⚠️ Note: I added server-side validation for event creation to verify that the userId exists before hitting the external API. This was done in case modifying the mock server was not intended. I implemented this in the branch `feat/refactored-stores`, which I merged into `main`.

# Mock service

## Stores (user, event)

Key changes:

| Change | Explanation |
| - | - |
| Fixed typo | `addEventTouUser` -> `addEventToUser` |
| Unique entity IDs | Generate user & event IDs via node `crypto` module |
| Consistency in store keys & entity IDs | `eventStore.events` stored event IDs as integers, keyed existing events as strings unrelated to the internal event IDs, and accepted new event IDs specified as part of the API request body. I enforced consistency by generating event IDs in the `addEvent(...)` method, preventing overwrites and duplicate keys |
| Validation | Enforce validation rules for adding entities, preventing `undefined` errors and internal conflicts |

<br>

I implemented `userStore` and `eventStore` to mimic realistic backend behavior while preserving the mock-server's initial structure. Key decisions include:

**Unique IDs**<br>All users and events are assigned unique IDs using the `crypto` module's `randomUUID()` utility. This ensures that every record is distinct and prevents accidental overwrites.

**Validation**<br>Prevents duplicate records and avoids relational entity confusion. Adding a user requires a unique email and username. Adding an event verifies that the associated user exists. These checks preserve the integrity of the stores and reduce the likelihood of inconsistent state.

**Error handling & Logging:**<br>Operations that fail return `null` and log an error. This provides visibility into problems while allowing the service to continue running.

# Services layer

## Route handlers

Key changes:

| Change | Explanation |
| - | - |
| Error handling | Each HTTP route handler now catches errors and hands them off to Fastify |
| Simplified `fetch` implementation | Node `fetch(...)` implementations now utilize their `Promise` functions |
| Correct headers in requests | Specify `Content-Type` headers in `POST` requests |
| Efficiency optimization | When processing multiple requests, perform them concurrently instead of one at a time |
| Resilience | Ensure rate-limits are not exceeded by implementing a resiliency utility |

## Resilience utility
The `/addEvent` endpoint now uses a custom resilience utility to handle transient external API failures. The `Resilience` class tracks external API failures and manages backoff/retry behavior.

**Failure tracking:**<br>Tracks HTTP 503 responses from the `/addEvent` endpoint

**Detection of consistent failures:**<br>Identify patterns of 3+ failures within 30 seconds

**Automatic backoff:**<br>Requests are temporarily blocked if failures exceed thresholds

**Retry eligibility:**<br>Requests are gradually permitted after exponentially increasing intervals

**Gradual recovery:**<br>Successful requests reset the failure tracking

**Meaningful feedback:**<br>Deliver proper 503 responses to clients during periods of failure

Ensures the system does not overwhelm the external API during high load while providing clients with meaningful feedback.

# Remaining steps before production

- Unit testing for `userStore` and `eventStore`
- Integration testing for API endpoints
- End-to-end testing to verify API behavior against mock server
- Test coverage reporting
- Input validation & sanitization (schema validation for request bodies)
- Security (OAuth 2.0 + middleware)
- Move config values to ENV variables (e.g. Resilience class' `DELAY` and `MAX_DELAY`, Fastify `port`)
- Pagination for lists of entities (`users`, `events`)
- Caching for repeated lookups
