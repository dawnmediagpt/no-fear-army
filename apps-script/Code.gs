/**
 * #NoFearArmy - Email Capture
 *
 * Bound to the Google Sheet "No Fear Army — Email List"
 *   id 1D3x-10max5XMTEg-jULdVw-TOWEWWhIOiXZFsNEhGQQ
 *   OWNED BY dollavant@gmail.com  (NOT doll@aquagenuity.com)
 *
 * This is the /exec endpoint that BOTH Netlify functions post to:
 *   netlify/functions/capture-email.js   {firstName, email, podcast?, source?}
 *   netlify/functions/capture-detox.js   {source, tag, event, type, ...}
 *
 * Sheet columns: Time Stamp | First Name | Email | Podcast | Source
 *
 * Podcast is normalised to "yes"/"no" rather than passed through, so the
 * column is always one of two values and can drive the Beehiiv custom field
 * directly. Only capture-email's private-feed button sends podcast:"yes";
 * everything else is legitimately "no".
 *
 * Rows written before 2026-08-02 have blank Podcast/Source. They were not
 * backfilled — the data was never captured, and guessing it would be worse
 * than leaving it empty.
 *
 * ── DEPLOYMENT — READ BEFORE YOU TOUCH THIS ──────────────────────────────
 * Editing the code does NOT change what the live URL runs. You must publish
 * a new VERSION of the EXISTING deployment:
 *
 *   Deploy ▸ Manage deployments ▸ (pencil) ▸ Version: New version ▸ Deploy
 *
 * NEVER use "New deployment". That mints a NEW /exec URL and instantly
 * breaks both Netlify functions, which have the old URL hardcoded.
 *
 * Active deployment: "email capture v3 - adds podcast + source columns"
 *   Deployment ID AKfycbzrvCS6Rbncw7dxGIUdYkQMjbCVBLlpfGy7_P6rKHP2ZrMAjUkExENsztfiiz-XNW8p_A
 *   v1 Jun 22 2026 · v2 Aug 2 2026 (URL rotation) · v3 Aug 2 2026 (this file)
 *
 * The pre-rotation deployment is ARCHIVED, which is what actually revoked the
 * leaked URL — archiving is the revocation step, not creating a replacement.
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.firstName || "",
    data.email || "",
    data.podcast === "yes" ? "yes" : "no",
    data.source || ""
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
