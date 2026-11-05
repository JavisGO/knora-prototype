(function () {
  "use strict";

  var DB_NAME = "knora-v3-html-editor";
  var STORE_NAME = "file-handles";

  function openDatabase() {
    return new Promise(function (resolve, reject) {
      var request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = function () {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
  }

  async function readHandle(key) {
    try {
      var db = await openDatabase();
      return await new Promise(function (resolve, reject) {
        var transaction = db.transaction(STORE_NAME, "readonly");
        var request = transaction.objectStore(STORE_NAME).get(key);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { reject(request.error); };
      });
    } catch (error) {
      return null;
    }
  }

  async function rememberHandle(key, handle) {
    try {
      var db = await openDatabase();
      await new Promise(function (resolve, reject) {
        var transaction = db.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).put(handle, key);
        transaction.oncomplete = function () { resolve(); };
        transaction.onerror = function () { reject(transaction.error); };
      });
    } catch (error) {
      // IndexedDB may be disabled. The current save can still continue.
    }
  }

  async function requestWritableHandle(fileName) {
    if (typeof window.showSaveFilePicker !== "function") return null;

    var storageKey = window.location.pathname || fileName;
    var handle = await readHandle(storageKey);
    if (handle) {
      try {
        var permission = await handle.queryPermission({ mode: "readwrite" });
        if (permission !== "granted") {
          permission = await handle.requestPermission({ mode: "readwrite" });
        }
        if (permission === "granted") return handle;
      } catch (error) {
        handle = null;
      }
    }

    handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{
        description: "HTML 文件",
        accept: { "text/html": [".html", ".htm"] }
      }]
    });
    await rememberHandle(storageKey, handle);
    return handle;
  }

  function encodeJsonForHtml(data) {
    return JSON.stringify(data, null, 2).replace(/<\/script/gi, "<\\/script");
  }

  function buildHtml(elementId, data) {
    var dataElement = document.getElementById(elementId);
    if (!dataElement) throw new Error("missing embedded data element");
    dataElement.textContent = encodeJsonForHtml(data);

    var clone = document.documentElement.cloneNode(true);
    var clonedData = clone.querySelector("#" + elementId);
    if (clonedData) clonedData.textContent = encodeJsonForHtml(data);
    var clonedStatus = clone.querySelector("#save-status");
    if (clonedStatus) clonedStatus.textContent = "";
    var clonedBody = clone.querySelector("body");
    if (clonedBody) clonedBody.classList.remove("is-editing");
    clone.querySelectorAll("[contenteditable]").forEach(function (element) {
      element.removeAttribute("contenteditable");
      element.removeAttribute("spellcheck");
    });
    clone.querySelectorAll("button[disabled]").forEach(function (button) {
      button.removeAttribute("disabled");
    });
    return "<!doctype html>\n" + clone.outerHTML + "\n";
  }

  function downloadFallback(fileName, html) {
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 0);
  }

  async function save(options) {
    var html = buildHtml(options.elementId, options.data);
    var handle = await requestWritableHandle(options.fileName);
    if (!handle) {
      downloadFallback(options.fileName, html);
      return { mode: "download", fileName: options.fileName };
    }
    var writable = await handle.createWritable();
    await writable.write(html);
    await writable.close();
    return { mode: "file", fileName: handle.name || options.fileName };
  }

  window.KnoraHtmlFileStore = { save: save };
})();
