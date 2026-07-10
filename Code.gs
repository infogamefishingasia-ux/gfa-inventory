// ════════════════════════════════════════════════════════════════
//  GFA / Aqua Creed — Inventory API  (Google Apps Script v2)
//  Serves JSON data to the GitHub Pages PWA via fetch()
// ════════════════════════════════════════════════════════════════

const FOLDER_ID = '1xnG5qunxsKewsaGxy_IivW-M2vCKC0EE';
const DATA_FILE  = 'GFA_Inventory_Data.json';

// ── GET  /?action=getData  ────────────────────────────────────
function doGet(e) {
  const action = (e.parameter && e.parameter.action) || '';

  if (action === 'getData') {
    try {
      const data = readDriveFile_();
      return jsonResponse_({ success: true, data: data });
    } catch (err) {
      return jsonResponse_({ success: false, error: err.message });
    }
  }

  // Root hit — confirm API is live
  return jsonResponse_({
    app: 'GFA Inventory API',
    version: '2.0',
    status: 'ok',
    usage: 'GET ?action=getData  |  POST {action:"saveData", data:"<json>"}'
  });
}

// ── POST  {action:"saveData", data:"<json>"}  ─────────────────
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'saveData' && body.data) {
      writeDriveFile_(body.data);
      return jsonResponse_({ success: true });
    }
    return jsonResponse_({ success: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse_({ success: false, error: err.message });
  }
}

// ── Drive helpers ─────────────────────────────────────────────
function readDriveFile_() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files  = folder.getFilesByName(DATA_FILE);
  if (files.hasNext()) return files.next().getBlob().getDataAsString();
  return '';   // first run — app will seed from built-in snapshot
}

function writeDriveFile_(json) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files  = folder.getFilesByName(DATA_FILE);
  if (files.hasNext()) {
    files.next().setContent(json);
  } else {
    folder.createFile(DATA_FILE, json, MimeType.PLAIN_TEXT);
  }
}

// ── JSON output helper ────────────────────────────────────────
function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
