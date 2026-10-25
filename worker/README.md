# Lift Log AI Worker

Replace the deployed Worker's code with `src/index.mjs`, then deploy. Keep the existing Workers AI binding named `AI` and private secret `APP_TOKEN`.

This version adds authenticated `POST /transcribe`, `POST /describe-meal` and `POST /coach` endpoints. `/coach` accepts `next-workout` and `nutrition` modes. Existing photo identification, food search and workout reviews keep their routes and response formats. `GET /health` now also returns capabilities so the app can identify older deployments.

Voice meals use `@cf/openai/whisper-large-v3-turbo` with English transcription, followed by the existing Llama model for ingredient extraction. The app records up to 30 seconds, keeps audio only in memory, sends it after Stop and automatically extracts foods from the transcription, and releases microphone tracks on cancellation, closing or leaving the app. The Worker stores no recordings. A typed, editable description is also supported; changes are analyzed after a short pause. Model-generated food values remain editable estimates.

Next-workout proposals address only existing exercises with completed history and no current manual entries. Increasing a load is allowed only after completing the planned set count at the top of the rep range with at least two reps in reserve. Loads are limited to one equipment increment around the latest load; proposals are checked again when applied. Completed workouts and changed plans reject stale proposals.

Nutrition suggestions use the selected diary day's targets, consumed macros, logged food names and favorite names. They are shown as a plain text list with suggested portions, based on foods already logged and remaining daily targets; there are no meal-editor actions. The weekly review includes the previous training week and completed work on replaced exercises.

## Local checks

Run `node --test --test-isolation=none tests/ai-features.test.mjs tests/meal-composer.test.mjs` from the repository root. Tests use model responses and microphone mocks; they do not call Cloudflare or consume AI credits. A real microphone recording and the deployed model responses still require a check in the HTTPS app, preferably on the target iPhone/browser.

Next-workout and nutrition ideas refresh automatically when their screen or underlying data changes. Unchanged coaching results are cached locally for six hours, and failed automatic attempts have a one-minute cooldown. Nutrition ideas are collapsed by default and load automatically when opened; they remain text-only advice. Program insights load when expanded; Refresh remains available. Saving meals and applying loads always require a user action.

## Meal composer and photo analysis

The meal editor uses one selectable grid for photo recognition, spoken/typed meals, favorites and search. Clear AI results are selected automatically; uncertain foods appear unchecked with To confirm. Only selected items are saved, and selection flags are not included in diary entries. Single-food queries search the catalogue; meal descriptions and voice recordings use AI.

POST /identify keeps its existing request shape and adds the optional boolean requiresConfirmation to each food. The updated prompt inventories the full meal, separates visible components without counting the dish twice, and uses cooked/prepared nutrition consistently. Generic or ambiguous food identities require confirmation; hidden ingredients are not invented. Each submitted photo makes one model call, including failures. Try again is explicit. The app accepts older responses without this field, using low confidence as a fallback. Photo preparation caps the longest side at 1536 pixels and keeps the existing 4 MB limit.
