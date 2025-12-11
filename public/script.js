let convertedData = null;

// --- Drag and Drop Logic ---
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');

// Clicking the box triggers the hidden input
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// When file is selected via click
fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        updateThumbnail(fileInput.files[0]);
    }
});

// Drag over animation
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone--over');
});

// Drag leave animation
['dragleave', 'dragend'].forEach(type => {
    dropZone.addEventListener(type, () => {
        dropZone.classList.remove('drop-zone--over');
    });
});

// Drop event
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone--over');

    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files; // Assign dropped files to input
        updateThumbnail(e.dataTransfer.files[0]);
    }
});

function updateThumbnail(file) {
    fileNameDisplay.textContent = "Selected: " + file.name;
}

// --- Conversion Logic ---
async function convertFile() {
    const statusDiv = document.getElementById('status');
    const resultArea = document.getElementById('resultArea');
    const jsonOutput = document.getElementById('jsonOutput');

    if (fileInput.files.length === 0) {
        alert("Please select or drop a file first!");
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    statusDiv.textContent = "Converting...";
    resultArea.classList.add('hidden');

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Conversion failed");

        convertedData = await response.json();
        
        jsonOutput.value = JSON.stringify(convertedData, null, 4);
        statusDiv.textContent = "Success!";
        resultArea.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        statusDiv.textContent = "Error: " + error.message;
    }
}

function downloadJson() {
    if (!convertedData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(convertedData, null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "converted_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// --- Improved Copy Logic ---
function copyToClipboard() {
    const jsonOutput = document.getElementById('jsonOutput');
    const copyBtn = document.getElementById('copyBtn');

    jsonOutput.select();
    document.execCommand('copy'); 
    
    // Visual Feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copy-success");

    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove("copy-success");
    }, 2000);
}