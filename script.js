// DOM Elements
const ageInput = document.getElementById("ageInput");
const sexInput = document.getElementById("sexInput");
const medicalBackground = document.getElementById("medicalBackground");
const allergiesInput = document.getElementById("allergiesInput");
const saveInfoButton = document.getElementById("saveInfoButton");
const clearInfoButton = document.getElementById("clearInfoButton");

const tabButtons = document.querySelectorAll(".tab-btn");
const uploadArea = document.getElementById("uploadArea");
const imageInput = document.getElementById("imageInput");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const previewContainer = document.getElementById("previewContainer");
const imagePreview = document.getElementById("imagePreview");
const removeImageBtn = document.getElementById("removeImageBtn");

const queryLabel = document.getElementById("queryLabel");
const userQuery = document.getElementById("userQuery");
const micBtn = document.getElementById("micBtn");
const micStatusText = document.getElementById("micStatusText");
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

let currentMode = "symptom"; // 'symptom' | 'medicine' | 'scan'
let isProfileEditing = false;
let currentBase64Image = null;
let currentImageMimeType = null;
let lastSpeechUtterance = null;
let isRecordingVoice = false;
let speechRecognition = null;

// --- 1. PATIENT PROFILE MANAGEMENT ---
window.addEventListener("DOMContentLoaded", () => {
    const savedInfo = JSON.parse(localStorage.getItem("medico_patient_profile"));
    if (savedInfo) {
        ageInput.value = savedInfo.age || "";
        sexInput.value = savedInfo.sex || "";
        medicalBackground.value = savedInfo.medicalBackground || "";
        if (allergiesInput) allergiesInput.value = savedInfo.allergies || "";
        disableProfileInputs();
        saveInfoButton.textContent = "Edit Profile";
        isProfileEditing = false;
    }

    const savedKey = localStorage.getItem("MEDICO_GEMINI_KEY");
    if (savedKey) {
        customApiKey.value = savedKey;
    }

    initSpeechRecognition();
});

saveInfoButton.addEventListener("click", () => {
    if (!isProfileEditing && saveInfoButton.textContent === "Edit Profile") {
        enableProfileInputs();
        saveInfoButton.textContent = "Save Profile";
        isProfileEditing = true;
    } else {
        if (!ageInput.value || !sexInput.value) {
            showToast("Please enter age and select gender in Patient Profile.");
            return;
        }

        const profileData = {
            age: ageInput.value,
            sex: sexInput.value,
            medicalBackground: medicalBackground.value,
            allergies: allergiesInput ? allergiesInput.value : ""
        };

        localStorage.setItem("medico_patient_profile", JSON.stringify(profileData));
        disableProfileInputs();
        saveInfoButton.textContent = "Edit Profile";
        isProfileEditing = false;
        showToast("Patient health profile saved!");
    }
});

clearInfoButton.addEventListener("click", () => {
    if (confirm("Clear your saved health profile?")) {
        localStorage.removeItem("medico_patient_profile");
        ageInput.value = "";
        sexInput.value = "";
        medicalBackground.value = "";
        if (allergiesInput) allergiesInput.value = "";
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
    if (allergiesInput) allergiesInput.disabled = true;
}

function enableProfileInputs() {
    ageInput.disabled = false;
    sexInput.disabled = false;
    medicalBackground.disabled = false;
    if (allergiesInput) allergiesInput.disabled = false;
}

// --- 2. MODE TABS SWITCHING ---
tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.getAttribute("data-mode");

        if (currentMode === "symptom") {
            uploadArea.classList.add("hidden");
            queryLabel.textContent = "Describe your symptoms or health query:";
            userQuery.placeholder = "e.g. I have a persistent dry cough and mild fever for 2 days, what could it be?";
        } else if (currentMode === "medicine") {
            uploadArea.classList.add("hidden");
            queryLabel.textContent = "Enter medicine name to check safety, uses & dosage:";
            userQuery.placeholder = "e.g. Rosuvas, Metformin 500mg, Paracetamol, Amoxicillin...";
        } else if (currentMode === "scan") {
            uploadArea.classList.remove("hidden");
            queryLabel.textContent = "Optional notes or questions about this prescription/report:";
            userQuery.placeholder = "e.g. Explain how to take these medications and check for any conflicts with my health history.";
        }
    });
});

// --- 3. VOICE INPUT (SPEECH-TO-TEXT) ---
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        speechRecognition = new SpeechRecognition();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;

        speechRecognition.onstart = () => {
            isRecordingVoice = true;
            micBtn.classList.add("recording");
            micStatusText.textContent = "Listening...";
            showToast("🎙️ Listening... Speak now.");
        };

        speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userQuery.value = (userQuery.value ? userQuery.value + " " : "") + transcript;
            showToast("Voice captured!");
        };

        speechRecognition.onerror = (event) => {
            console.warn("Speech recognition error:", event.error);
            showToast("Voice input error: " + event.error);
            stopVoiceRecording();
        };

        speechRecognition.onend = () => {
            stopVoiceRecording();
        };
    } else {
        micBtn.style.display = "none";
    }
}

micBtn.addEventListener("click", () => {
    if (!speechRecognition) {
        showToast("Voice recognition not supported in your browser.");
        return;
    }

    if (isRecordingVoice) {
        speechRecognition.stop();
        stopVoiceRecording();
    } else {
        // Set speech recognition language based on dropdown
        const selectedLang = languageSelect.value;
        if (selectedLang.includes("Telugu")) speechRecognition.lang = "te-IN";
        else if (selectedLang.includes("Hindi")) speechRecognition.lang = "hi-IN";
        else if (selectedLang.includes("Tamil")) speechRecognition.lang = "ta-IN";
        else if (selectedLang.includes("Kannada")) speechRecognition.lang = "kn-IN";
        else if (selectedLang.includes("Malayalam")) speechRecognition.lang = "ml-IN";
        else if (selectedLang.includes("Bengali")) speechRecognition.lang = "bn-IN";
        else if (selectedLang.includes("Marathi")) speechRecognition.lang = "mr-IN";
        else if (selectedLang.includes("Gujarati")) speechRecognition.lang = "gu-IN";
        else if (selectedLang.includes("Spanish")) speechRecognition.lang = "es-ES";
        else speechRecognition.lang = "en-IN";

        speechRecognition.start();
    }
});

function stopVoiceRecording() {
    isRecordingVoice = false;
    micBtn.classList.remove("recording");
    micStatusText.textContent = "Voice Input";
}

// --- 4. IMAGE UPLOAD (PRESCRIPTION SCANNER) ---
imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    currentImageMimeType = file.type;
    const reader = new FileReader();

    reader.onload = function (event) {
        const fullBase64 = event.target.result;
        imagePreview.src = fullBase64;
        currentBase64Image = fullBase64.split(',')[1];

        uploadPlaceholder.classList.add("hidden");
        previewContainer.classList.remove("hidden");
        showToast("Prescription/report image loaded.");
    };

    reader.readAsDataURL(file);
});

removeImageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    imageInput.value = "";
    currentBase64Image = null;
    currentImageMimeType = null;
    imagePreview.src = "";
    previewContainer.classList.add("hidden");
    uploadPlaceholder.classList.remove("hidden");
});

// --- 5. API KEY MODAL LOGIC ---
apiKeyModalBtn.addEventListener("click", () => apiModal.classList.remove("hidden"));
closeModalBtn.addEventListener("click", () => apiModal.classList.add("hidden"));

saveApiKeyBtn.addEventListener("click", () => {
    const key = customApiKey.value.trim();
    if (key) {
        localStorage.setItem("MEDICO_GEMINI_KEY", key);
        showToast("Gemini API key saved.");
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

// --- 6. AI ANALYSIS & SAFETY CHECK LOGIC ---
analyzeButton.addEventListener("click", async () => {
    const age = ageInput.value.trim();
    const sex = sexInput.value.trim();
    const background = medicalBackground.value.trim();
    const allergies = allergiesInput ? allergiesInput.value.trim() : "";
    const queryText = userQuery.value.trim();
    const selectedLang = languageSelect.value;

    if (!age || !sex) {
        showToast("Please fill in your Patient Profile (Age & Gender) first.");
        return;
    }

    if (!queryText && !currentBase64Image) {
        showToast("Please enter symptoms/medicine or upload a prescription image.");
        return;
    }

    // Show loading UI
    resultCard.classList.remove("hidden");
    loadingContainer.classList.remove("hidden");
    outputContent.innerHTML = "";
    loadingStatusText.textContent = `Evaluating safety for ${sex} (${age} yrs) & translating to ${selectedLang}...`;
    resultCard.scrollIntoView({ behavior: "smooth" });

    // Comprehensive Structured Medical Prompt
    const promptInstructions = `
You are MEDICO, an advanced AI Clinical Healthcare & Pharmacological Safety Assistant.

PATIENT PROFILE:
- Age: ${age}
- Gender: ${sex}
- Medical History / Existing Conditions: ${background || "None declared"}
- Known Drug Allergies / Sensitivities: ${allergies || "None declared"}

MODE: ${currentMode.toUpperCase()}
USER QUERY / MEDICINE / SYMPTOMS: "${queryText || "Extract and analyze prescription image."}"

CRITICAL SAFETY & MEDICAL INSTRUCTIONS:
1. **CRITICAL HEALTH & SAFETY AUDIT (MANDATORY)**:
   - Carefully evaluate if the searched medicine or symptoms present any **SEVERE RISKS, CONTRAINDICATIONS, OR HARMFUL DRUG INTERACTIONS** with the patient's existing background (e.g., Hypertension, Diabetes, Heart Stroke, Asthma, Kidney issues) or allergies.
   - If there is a potential risk or conflict, display a **PROMINENT WARNING MESSAGE** right at the top.

2. **COMPREHENSIVE STRUCTURED BREAKDOWN**:
   - 🩺 **Clinical Overview / Diagnosis Guidance**: What the symptoms/medicine indicates.
   - 💊 **Medicine Details (if medicine query or prescription)**:
     - **Primary Uses & Mechanism**
     - **Timing & Gap Between Doses** (e.g. interval hours, before/after meals, food/beverage restrictions).
     - **Dosage Guidelines & Limits**
     - **Side Effects & Red Flags** (Common vs Emergency symptoms).
     - **Approximate Price Range & Generic Alternatives** (e.g. India generic vs branded pricing where applicable).
   - 🌿 **Lifestyle & Home Care Guidance**
   - 🚨 **When to See an Emergency Doctor**

3. **LANGUAGE TRANSLATION (STRICT)**:
   - Provide the ENTIRE detailed assessment translated accurately into **${selectedLang}**.
   - Use clean Markdown formatting with clear headers, bold keys, and bullet points.
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
            showToast("Medical analysis complete!");
        } else {
            outputContent.innerHTML = `<p class="health-alert-warning">⚠️ No assessment generated. Please check your query or image clarity and try again.</p>`;
        }
    } catch (error) {
        loadingContainer.classList.add("hidden");
        outputContent.innerHTML = `
            <div class="health-alert-danger">
                ${error.message}
            </div>
        `;
    }
});

// Multi-Model Dispatcher
async function callGeminiAPI(contentsArray) {
    // 1. Try Vercel Serverless Proxy
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
        // Proxy not running on GitHub Pages
    }

    // 2. Client-side Key from LocalStorage
    let userKey = localStorage.getItem("MEDICO_GEMINI_KEY");
    if (!userKey) {
        apiModal.classList.remove("hidden");
        throw new Error("🔑 Gemini API key missing. Please paste your free key in the API Settings modal above.");
    }

    const candidateModels = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ];

    let lastErrorMessage = "";

    for (const model of candidateModels) {
        try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userKey}`;
            const res = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: contentsArray })
            });

            const resJson = await res.json();
            if (res.ok && resJson.candidates) {
                return resJson;
            } else {
                lastErrorMessage = resJson.error?.message || `Model ${model} failed`;
                if (resJson.error?.status === "UNAUTHENTICATED" || resJson.error?.message?.includes("API key")) {
                    localStorage.removeItem("MEDICO_GEMINI_KEY");
                    customApiKey.value = "";
                    apiModal.classList.remove("hidden");
                    throw new Error("🔑 Saved API key is invalid or expired. Please paste a fresh free key from Google AI Studio in the modal above.");
                }
            }
        } catch (err) {
            lastErrorMessage = err.message;
            if (err.message.includes("API key") || err.message.includes("Saved API key")) throw err;
        }
    }

    localStorage.removeItem("MEDICO_GEMINI_KEY");
    customApiKey.value = "";
    apiModal.classList.remove("hidden");
    throw new Error("🔑 Saved API key is expired or invalid. Please paste a fresh free API key from Google AI Studio into the API Settings modal.");
}

// --- 7. TEXT-TO-SPEECH (REGIONAL VOICE READOUT) ---
speechBtn.addEventListener("click", () => {
    const textToRead = outputContent.innerText;
    if (!textToRead) return;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();

        lastSpeechUtterance = new SpeechSynthesisUtterance(textToRead);
        const selectedLang = languageSelect.value;

        if (selectedLang.includes("Telugu")) lastSpeechUtterance.lang = "te-IN";
        else if (selectedLang.includes("Hindi")) lastSpeechUtterance.lang = "hi-IN";
        else if (selectedLang.includes("Tamil")) lastSpeechUtterance.lang = "ta-IN";
        else if (selectedLang.includes("Kannada")) lastSpeechUtterance.lang = "kn-IN";
        else if (selectedLang.includes("Malayalam")) lastSpeechUtterance.lang = "ml-IN";
        else if (selectedLang.includes("Bengali")) lastSpeechUtterance.lang = "bn-IN";
        else if (selectedLang.includes("Marathi")) lastSpeechUtterance.lang = "mr-IN";
        else if (selectedLang.includes("Gujarati")) lastSpeechUtterance.lang = "gu-IN";
        else if (selectedLang.includes("Spanish")) lastSpeechUtterance.lang = "es-ES";
        else lastSpeechUtterance.lang = "en-IN";

        window.speechSynthesis.speak(lastSpeechUtterance);
        showToast("🔊 Reading report aloud in " + selectedLang + "...");
    } else {
        showToast("Text-to-speech not supported in this browser.");
    }
});

// Copy Output
copyBtn.addEventListener("click", () => {
    const text = outputContent.innerText;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        showToast("Assessment copied to clipboard!");
    });
});

// Markdown Formatter
function formatMarkdownToHTML(md) {
    let html = md
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/g, '<br><br>');

    // Wrap list items
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    return html;
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}
