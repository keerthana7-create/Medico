// DOM Elements
const ageInput = document.getElementById("ageInput");
const sexInput = document.getElementById("sexInput");
const medicalBackground = document.getElementById("medicalBackground");
const saveInfoButton = document.getElementById("saveInfoButton");
const clearInfoButton = document.getElementById("clearInfoButton");

const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const previewContainer = document.getElementById("previewContainer");
const imagePreview = document.getElementById("imagePreview");
const removeImageBtn = document.getElementById("removeImageBtn");

const userQuery = document.getElementById("userQuery");
const languageSelect = document.getElementById("languageSelect");
const analyzeButton = document.getElementById("analyzeButton");

const resultCard = document.getElementById("resultCard");
const loadingContainer = document.getElementById("loadingContainer");
const loadingStatusText = document.getElementById("loadingStatusText");
const outputContent = document.getElementById("outputContent");
const speechBtn = document.getElementById("speechBtn");
const copyBtn = document.getElementById("copyBtn");

const apiModal = document.getElementById("apiModal");
const apiKeyModalBtn = document.getElementById("apiKeyModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const customApiKey = document.getElementById("customApiKey");
const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");
const clearApiKeyBtn = document.getElementById("clearApiKeyBtn");

let isProfileEditing = false;
let currentBase64Image = null;
let currentImageMimeType = null;
let lastSpeechUtterance = null;

// --- 1. PATIENT PROFILE MANAGEMENT ---
window.addEventListener("DOMContentLoaded", () => {
    const savedInfo = JSON.parse(localStorage.getItem("medico_patient_profile"));
    if (savedInfo) {
        ageInput.value = savedInfo.age || "";
        sexInput.value = savedInfo.sex || "";
        medicalBackground.value = savedInfo.medicalBackground || "";
        disableProfileInputs();
        saveInfoButton.textContent = "Edit Profile";
        isProfileEditing = false;
    }

    const savedKey = localStorage.getItem("MEDICO_GEMINI_KEY");
    if (savedKey) {
        customApiKey.value = savedKey;
    }
});

saveInfoButton.addEventListener("click", () => {
    if (!isProfileEditing && saveInfoButton.textContent === "Edit Profile") {
        enableProfileInputs();
        saveInfoButton.textContent = "Save Profile";
        isProfileEditing = true;
    } else {
        if (!ageInput.value || !sexInput.value) {
            showToast("Please enter your age and select your sex.");
            return;
        }

        const profileData = {
            age: ageInput.value,
            sex: sexInput.value,
            medicalBackground: medicalBackground.value
        };

        localStorage.setItem("medico_patient_profile", JSON.stringify(profileData));
        disableProfileInputs();
        saveInfoButton.textContent = "Edit Profile";
        isProfileEditing = false;
        showToast("Patient profile saved!");
    }
});

clearInfoButton.addEventListener("click", () => {
    if (confirm("Clear saved patient profile?")) {
        localStorage.removeItem("medico_patient_profile");
        ageInput.value = "";
        sexInput.value = "";
        medicalBackground.value = "";
        enableProfileInputs();
        saveInfoButton.textContent = "Save Profile";
        isProfileEditing = true;
        showToast("Profile cleared.");
    }
});

function disableProfileInputs() {
    ageInput.disabled = true;
    sexInput.disabled = true;
    medicalBackground.disabled = true;
}

function enableProfileInputs() {
    ageInput.disabled = false;
    sexInput.disabled = false;
    medicalBackground.disabled = false;
}

// --- 2. IMAGE UPLOAD & BASE64 CONVERSION ---
imageInput.addEventListener("change", handleImageUpload);

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    currentImageMimeType = file.type;
    const reader = new FileReader();

    reader.onload = function (event) {
        const fullBase64 = event.target.result;
        imagePreview.src = fullBase64;
        
        // Extract raw base64 string without data:image/png;base64, header
        currentBase64Image = fullBase64.split(',')[1];

        uploadPlaceholder.classList.add("hidden");
        previewContainer.classList.remove("hidden");
        showToast("Prescription image loaded.");
    };

    reader.readAsDataURL(file);
}

removeImageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    imageInput.value = "";
    currentBase64Image = null;
    currentImageMimeType = null;
    imagePreview.src = "";
    previewContainer.classList.add("hidden");
    uploadPlaceholder.classList.remove("hidden");
});

// --- 3. API KEY MODAL LOGIC ---
apiKeyModalBtn.addEventListener("click", () => apiModal.classList.remove("hidden"));
closeModalBtn.addEventListener("click", () => apiModal.classList.add("hidden"));

saveApiKeyBtn.addEventListener("click", () => {
    const key = customApiKey.value.trim();
    if (key) {
        localStorage.setItem("MEDICO_GEMINI_KEY", key);
        showToast("Gemini API key saved to browser.");
        apiModal.classList.add("hidden");
    } else {
        showToast("Please enter a valid key.");
    }
});

clearApiKeyBtn.addEventListener("click", () => {
    localStorage.removeItem("MEDICO_GEMINI_KEY");
    customApiKey.value = "";
    showToast("API key removed.");
    apiModal.classList.add("hidden");
});

// --- 4. ANALYZE & REGIONAL TRANSLATION LOGIC ---
analyzeButton.addEventListener("click", async () => {
    const age = ageInput.value;
    const sex = sexInput.value;
    const background = medicalBackground.value;
    const queryText = userQuery.value.trim();
    const selectedLang = languageSelect.value;

    if (!age || !sex) {
        showToast("Please complete Step 1: Patient Profile (Age & Sex).");
        return;
    }

    if (!currentBase64Image && !queryText) {
        showToast("Please either upload a prescription/report photo or type a health question.");
        return;
    }

    // Show loading UI
    resultCard.classList.remove("hidden");
    loadingContainer.classList.remove("hidden");
    outputContent.innerHTML = "";
    loadingStatusText.textContent = `Analyzing medical document & generating response in ${selectedLang}...`;
    resultCard.scrollIntoView({ behavior: "smooth" });

    // Prepare Multimodal Payload
    const promptInstructions = `
You are Medico, an expert medical AI assistant.
Patient Information:
- Age: ${age}
- Sex: ${sex}
- Medical Background/Allergies: ${background || "None specified"}

User Query/Notes: ${queryText || "Extract details from the attached prescription/report photo."}

CRITICAL TASK:
1. Examine the provided patient profile and attached prescription/lab report image (if provided).
2. Identify medications, dosages, purpose, diagnostic findings, key precautions, and dietary advice.
3. Translate and format your entire response clearly in the selected language: **${selectedLang}**.
4. Organize the output cleanly into easy-to-read sections using Markdown formatting with clear bullet points.
    `;

    const contentsArray = [];
    const partsArray = [{ text: promptInstructions }];

    if (currentBase64Image) {
        partsArray.push({
            inlineData: {
                mimeType: currentImageMimeType || "image/jpeg",
                data: currentBase64Image
            }
        });
    }

    contentsArray.push({ parts: partsArray });

    try {
        const responseData = await callGeminiAPI(contentsArray);
        
        loadingContainer.classList.add("hidden");

        if (responseData && responseData.candidates && responseData.candidates[0].content.parts[0].text) {
            const rawMarkdown = responseData.candidates[0].content.parts[0].text;
            outputContent.innerHTML = formatMarkdownToHTML(rawMarkdown);
            showToast("Analysis complete!");
        } else {
            outputContent.innerHTML = `<p class="error-msg">⚠️ Unable to extract information. Please check image clarity or try again.</p>`;
        }
    } catch (error) {
        loadingContainer.classList.add("hidden");
        outputContent.innerHTML = `<p class="error-msg">❌ Error: ${error.message}. Please click 'API Settings' to enter a valid key if hosting on GitHub Pages.</p>`;
    }
});

// Dispatch request to Vercel Serverless proxy OR direct Gemini API
async function callGeminiAPI(contentsArray) {
    // 1. Try Vercel Serverless Function Proxy first
    try {
        const proxyRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: contentsArray })
        });

        if (proxyRes.ok) {
            return await proxyRes.json();
        }
    } catch (e) {
        console.log("Serverless proxy not available, checking client-side key...");
    }

    // 2. Fallback to client-side API Key stored in localStorage
    let userKey = localStorage.getItem("MEDICO_GEMINI_KEY");
    if (!userKey) {
        apiModal.classList.remove("hidden");
        throw new Error("API Key missing. Please save your Gemini API key in the modal");
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userKey}`;

    const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: contentsArray })
    });

    if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || "Gemini API request failed.");
    }

    return await res.json();
}

// --- 5. TEXT-TO-SPEECH (REGIONAL VOICE READOUT) ---
speechBtn.addEventListener("click", () => {
    const textToRead = outputContent.innerText;
    if (!textToRead) return;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any existing speech

        lastSpeechUtterance = new SpeechSynthesisUtterance(textToRead);
        
        // Select accent based on selected language
        const voices = window.speechSynthesis.getVoices();
        const selectedLang = languageSelect.value;

        if (selectedLang.includes("Hindi")) lastSpeechUtterance.lang = "hi-IN";
        else if (selectedLang.includes("Tamil")) lastSpeechUtterance.lang = "ta-IN";
        else if (selectedLang.includes("Telugu")) lastSpeechUtterance.lang = "te-IN";
        else if (selectedLang.includes("Bengali")) lastSpeechUtterance.lang = "bn-IN";
        else if (selectedLang.includes("Marathi")) lastSpeechUtterance.lang = "mr-IN";
        else if (selectedLang.includes("Gujarati")) lastSpeechUtterance.lang = "gu-IN";
        else if (selectedLang.includes("Spanish")) lastSpeechUtterance.lang = "es-ES";
        else lastSpeechUtterance.lang = "en-IN";

        window.speechSynthesis.speak(lastSpeechUtterance);
        showToast("Reading aloud in " + selectedLang + "...");
    } else {
        showToast("Text-to-speech not supported in this browser.");
    }
});

// Copy Output
copyBtn.addEventListener("click", () => {
    const text = outputContent.innerText;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        showToast("Report copied to clipboard!");
    });
});

// Simple Markdown to HTML Formatter
function formatMarkdownToHTML(md) {
    let html = md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.* vast)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/g, '<br><br>');

    return html;
}

// Toast Helper
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}
