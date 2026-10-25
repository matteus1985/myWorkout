# Lift Log AI Worker

Replace the deployed Worker's code with `src/index.mjs`, then deploy. Keep the existing Workers AI binding named `AI` and private secret `APP_TOKEN`.

This version adds authenticated `POST /transcribe`, `POST /describe-meal` and `POST /coach` endpoints. `/coach` accepts `next-workout` and `nutrition` modes. Photo identification v2 returns identities without model-generated nutrition; the updated app resolves nutrition separately. Food search and workout review routes remain compatible. `GET /health` returns version `2026-10-25-photo-v2` and capabilities `photo-identities-v2` and `photo-diagnostics-v1`, alongside existing features. Deploy the app first; it accepts both old and new photo responses.

Voice meals use `@cf/openai/whisper-large-v3-turbo` with English transcription, followed by the existing Llama model for ingredient extraction. The app records up to 30 seconds, keeps audio only in memory, sends it after Stop and automatically extracts foods from the transcription, and releases microphone tracks on cancellation, closing or leaving the app. The Worker stores no recordings. A typed, editable description is also supported; analysis starts only after tapping the submit arrow or pressing Enter. Model-generated food values remain editable estimates.

Next-workout proposals address only existing exercises with completed history and no current manual entries. Increasing a load is allowed only after completing the planned set count at the top of the rep range with at least two reps in reserve. Loads are limited to one equipment increment around the latest load; proposals are checked again when applied. Completed workouts and changed plans reject stale proposals.

Nutrition suggestions use the selected diary day's targets, consumed macros, logged food names and favorite names. They are shown as a plain text list with suggested portions, based on foods already logged and remaining daily targets; there are no meal-editor actions. The weekly review includes the previous training week and completed work on replaced exercises.

## Local checks

Run `node --test --test-isolation=none tests/ai-features.test.mjs tests/meal-composer.test.mjs` from the repository root. Tests use model responses and microphone mocks; they do not call Cloudflare or consume AI credits. A real microphone recording and the deployed model responses still require a check in the HTTPS app, preferably on the target iPhone/browser.

Next-workout and nutrition ideas refresh automatically when their screen or underlying data changes. Unchanged coaching results are cached locally for six hours, and failed automatic attempts have a one-minute cooldown. Nutrition ideas are collapsed by default and load automatically when opened; they remain text-only advice. Program insights load when expanded; Refresh remains available. Saving meals and applying loads always require a user action.

## Meal composer and photo analysis

The meal editor uses one selectable grid for photo recognition, spoken/typed meals, favorites and search. Clear AI results are selected automatically; uncertain foods appear unchecked with To confirm. Only selected items are saved, and selection flags are not included in diary entries. Single-food queries search the catalogue; meal descriptions and voice recordings use AI.

POST /identify accepts the existing mode, mimeType and imageBase64 fields, plus an optional UUID requestId. In meal mode, one Llama 4 Scout request returns up to eight identities with name, searchName, preparation, grams, confidence and requiresConfirmation; it does not generate nutrients. Missing portions become 150 g and require confirmation. Product-label mode keeps printed-nutrient extraction and conversions.

The app first matches exact food names and synonyms in its local catalog, respecting raw/cooked state. When no unique local match exists it calls POST /foods-search with source: "usda" (no second inference and no Open Food Facts lookup). USDA candidates are cached on the device for seven days, up to 80 searches. Ambiguous matches require a user choice. Failed nutrient lookup never removes a recognized food: it stays unchecked with Nutrition needed, candidates, Find nutrition and editable portion nutrient fields. All four nutrient values must be entered before an unresolved item can be selected. Only selected, resolved items contribute to totals or saving. Explicit matches preserve the estimated grams. Retries preserve existing edits and do not add the same recognition twice.

Each photo response includes workerVersion, requestId, diagnostics (stage, durationMs, returned and accepted counts), code, mode and foods when available. Partial valid results are retained. Error codes distinguish authentication/configuration, invalid image/request, AI quota, capacity, timeout, model availability, empty/malformed response and incomplete food data. Only explicit Cloudflare error 3036 or its documented allowance message is classified as exhausted quota; other 429 errors are not. The Worker logs only those diagnostic fields, never images, tokens, prompts or full model output. The app shows safe English messages and collapsible Technical details, retains the photo and meal after failure, ignores stale results, and offers explicit retry or settings access.

Images remain capped at 1536 pixels on the longest side, without upscaling, and 4 MB. Food diary titles derive from selected ingredients without an extra AI call; existing custom titles remain and visible titles use at most two lines.

## Deployment and verification

Upload the updated single file src/index.mjs to the existing Cloudflare Worker, retaining AI and APP_TOKEN, then Deploy. In the updated app choose Settings → AI food photo setup → Test connection: it should report version 2026-10-25-photo-v2. The app shows a warning for an older Worker and continues accepting its valid nutrient responses.

The local test suite mocks inference and external catalogs, covers text/structured responses, partial data, cooked/dry matches, caching, offline failures and stale responses, and consumes no AI credits. Actual recognition quality and timing must still be compared on the same real photos after deploying the Worker; no real-photo recall improvement is claimed from mocked tests. Responsive browser checks on the target iPhone remain required.

Request and provider error formats were checked against [Cloudflare model documentation](https://developers.cloudflare.com/workers-ai/models/llama-4-scout-17b-16e-instruct/) and [Cloudflare AI error codes](https://developers.cloudflare.com/workers-ai/platform/errors/). Multimodal messages use image_url with a data URI. No automatic inference retry or paid provider fallback is added.
