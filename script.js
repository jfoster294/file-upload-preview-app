const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const chooseFilesButton = document.getElementById("chooseFilesButton");
const previewGrid = document.getElementById("previewGrid");
const emptyState = document.getElementById("emptyState");
const errorBox = document.getElementById("errorBox");
const clearAllButton = document.getElementById("clearAllButton");
const previewMessage = document.getElementById("previewMessage");

const totalFiles = document.getElementById("totalFiles");
const imageFiles = document.getElementById("imageFiles");
const totalSize = document.getElementById("totalSize");
const rejectedFiles = document.getElementById("rejectedFiles");

const maxFileSize = 5 * 1024 * 1024;

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

let selectedFiles = [];
let rejectedCount = 0;

chooseFilesButton.addEventListener("click", function () {
  fileInput.click();
});

fileInput.addEventListener("change", function () {
  handleFiles(fileInput.files);
  fileInput.value = "";
});

dropZone.addEventListener("dragover", function (event) {
  event.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", function () {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", function (event) {
  event.preventDefault();
  dropZone.classList.remove("drag-over");

  handleFiles(event.dataTransfer.files);
});

clearAllButton.addEventListener("click", function () {
  selectedFiles = [];
  rejectedCount = 0;
  renderFiles();
  showError("");
});

function handleFiles(fileList) {
  const files = Array.from(fileList);
  const errors = [];

  files.forEach(function (file) {
    const isAllowedType = allowedTypes.includes(file.type);
    const isAllowedSize = file.size <= maxFileSize;
    const alreadyAdded = selectedFiles.some(function (item) {
      return item.name === file.name && item.size === file.size;
    });

    if (!isAllowedType) {
      rejectedCount++;
      errors.push(`${file.name} was rejected because the file type is not supported.`);
      return;
    }

    if (!isAllowedSize) {
      rejectedCount++;
      errors.push(`${file.name} was rejected because it is larger than 5 MB.`);
      return;
    }

    if (alreadyAdded) {
      rejectedCount++;
      errors.push(`${file.name} was rejected because it is already selected.`);
      return;
    }

    selectedFiles.push({
      id: crypto.randomUUID(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    });
  });

  if (errors.length > 0) {
    showError(errors.join("<br>"));
  } else {
    showError("");
  }

  renderFiles();
}

function renderFiles() {
  previewGrid.innerHTML = "";

  selectedFiles.forEach(function (item) {
    const card = document.createElement("article");
    card.className = "file-card";

    const previewContent = item.previewUrl
      ? `<img src="${item.previewUrl}" alt="${escapeHTML(item.name)} preview" />`
      : `<span class="file-icon">${getFileIcon(item.type)}</span>`;

    card.innerHTML = `
      <div class="file-preview">
        ${previewContent}
      </div>

      <div class="file-info">
        <p class="file-name">${escapeHTML(item.name)}</p>
        <p class="file-detail">Size: ${formatFileSize(item.size)}</p>
        <p class="file-detail">Type: ${item.type || "Unknown"}</p>
        <span class="file-type">${getFileLabel(item.type)}</span>
        <button class="remove-button" data-id="${item.id}" type="button">Remove</button>
      </div>
    `;

    previewGrid.appendChild(card);
  });

  document.querySelectorAll(".remove-button").forEach(function (button) {
    button.addEventListener("click", function () {
      removeFile(button.dataset.id);
    });
  });

  updateStats();
  updateEmptyState();
}

function removeFile(id) {
  const fileToRemove = selectedFiles.find(function (item) {
    return item.id === id;
  });

  if (fileToRemove && fileToRemove.previewUrl) {
    URL.revokeObjectURL(fileToRemove.previewUrl);
  }

  selectedFiles = selectedFiles.filter(function (item) {
    return item.id !== id;
  });

  renderFiles();
}

function updateStats() {
  totalFiles.textContent = selectedFiles.length;

  imageFiles.textContent = selectedFiles.filter(function (item) {
    return item.type.startsWith("image/");
  }).length;

  const totalBytes = selectedFiles.reduce(function (sum, item) {
    return sum + item.size;
  }, 0);

  totalSize.textContent = formatFileSize(totalBytes);
  rejectedFiles.textContent = rejectedCount;

  if (selectedFiles.length === 0) {
    previewMessage.textContent = "No files selected yet.";
  } else {
    previewMessage.textContent = `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} ready for preview.`;
  }
}

function updateEmptyState() {
  if (selectedFiles.length === 0) {
    emptyState.classList.add("show");
  } else {
    emptyState.classList.remove("show");
  }
}

function showError(message) {
  if (!message) {
    errorBox.classList.add("hidden");
    errorBox.innerHTML = "";
    return;
  }

  errorBox.classList.remove("hidden");
  errorBox.innerHTML = message;
}

function formatFileSize(bytes) {
  if (bytes === 0) {
    return "0 MB";
  }

  const megabytes = bytes / (1024 * 1024);

  if (megabytes < 1) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${megabytes.toFixed(2)} MB`;
}

function getFileIcon(type) {
  if (type === "application/pdf") {
    return "📕";
  }

  if (type === "text/plain") {
    return "📄";
  }

  if (type.includes("wordprocessing") || type.includes("msword")) {
    return "📝";
  }

  return "📁";
}

function getFileLabel(type) {
  if (type.startsWith("image/")) {
    return "Image";
  }

  if (type === "application/pdf") {
    return "PDF";
  }

  if (type === "text/plain") {
    return "Text";
  }

  if (type.includes("wordprocessing") || type.includes("msword")) {
    return "Word Doc";
  }

  return "File";
}

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

renderFiles();
