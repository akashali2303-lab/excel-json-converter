let convertedData = null;

async function convertFile() {
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('status');
    const resultArea = document.getElementById('resultArea');
    const jsonOutput = document.getElementById('jsonOutput');

    if (fileInput.files.length === 0) {
        alert("Please select a file first!");
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
        
        // Pretty print JSON in the textarea
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

function copyToClipboard() {
    const jsonOutput = document.getElementById('jsonOutput');
    jsonOutput.select();
    document.execCommand('copy'); 
    alert("Copied to clipboard!");
}