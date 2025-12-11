let convertedData = null;
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');

// --- Drag & Drop ---
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) updateThumbnail(fileInput.files[0]);
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone--over');
});

['dragleave', 'dragend'].forEach(type => {
    dropZone.addEventListener(type, () => dropZone.classList.remove('drop-zone--over'));
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone--over');
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        updateThumbnail(e.dataTransfer.files[0]);
    }
});

function updateThumbnail(file) {
    fileNameDisplay.textContent = "Selected: " + file.name;
}

// --- Conversion & Logic ---
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
    
    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            // Display the error from the backend (Level 2 Feature)
            throw new Error(result.error || "Conversion failed");
        }

        convertedData = result;
        jsonOutput.value = JSON.stringify(convertedData, null, 4);
        statusDiv.textContent = "Success!";
        resultArea.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        statusDiv.textContent = "Error: " + error.message;
        alert(error.message); // Popup for the user
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

function copyToClipboard() {
    const jsonOutput = document.getElementById('jsonOutput');
    const copyBtn = document.getElementById('copyBtn');
    jsonOutput.select();
    document.execCommand('copy'); 
    
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    copyBtn.classList.add("copy-success");
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove("copy-success");
    }, 2000);
}

// --- LEVEL 1 OPTION 3: Reset Function ---
function resetApp() {
    convertedData = null;
    fileInput.value = ""; // Clear file input
    fileNameDisplay.textContent = "";
    document.getElementById('status').textContent = "";
    document.getElementById('jsonOutput').value = "";
    document.getElementById('resultArea').classList.add('hidden');
}