
// Handle Query Button
const saveInfoButton = document.getElementById("saveInfoButton");
const clearInfoButton = document.getElementById("clearInfoButton");
const ageInput = document.getElementById("ageInput");
const sexInput = document.getElementById("sexInput");
const medicalBackground = document.getElementById("medicalBackground");
let isEditing = false;

// Load saved user info on page load
window.addEventListener("DOMContentLoaded", () => {
    const savedInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (savedInfo) {
        ageInput.value = savedInfo.age;
        sexInput.value = savedInfo.sex;
        medicalBackground.value = savedInfo.medicalBackground;
        disableInputs();
        saveInfoButton.textContent = "Edit Info";
        isEditing = false;
    }
});

saveInfoButton.addEventListener("click", () => {
    if (!isEditing) {
        enableInputs();
        saveInfoButton.textContent = "Save Info";
        isEditing = true;
    } else {
        if (!ageInput.value || !sexInput.value) {
            showToast("Please enter your age and select your sex.");
            return;
        }

        const userInfo = {
            age: ageInput.value,
            sex: sexInput.value,
            medicalBackground: medicalBackground.value
        };

        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        disableInputs();
        saveInfoButton.textContent = "Edit Info";
        isEditing = false;
        showToast("Your info has been saved!");
    }
});

clearInfoButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your saved info?")) {
        localStorage.removeItem("userInfo");
        ageInput.value = "";
        sexInput.value = "";
        medicalBackground.value = "";
        enableInputs();
        saveInfoButton.textContent = "Save Info";
        isEditing = true;
        showToast("Your info has been cleared!");
    }
});

function disableInputs() {
    ageInput.disabled = true;
    sexInput.disabled = true;
    medicalBackground.disabled = true;
}

function enableInputs() {
    ageInput.disabled = false;
    sexInput.disabled = false;
    medicalBackground.disabled = false;
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "show";
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

// Handle Medical Query

document.getElementById("queryButton").addEventListener("click", handleQuery);

async function handleQuery() {
    const query = document.getElementById("queryInput").value;
    const savedInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    const age = savedInfo.age || ageInput.value;
    const sex = savedInfo.sex || sexInput.value;
    const medicalBackgroundValue = savedInfo.medicalBackground || medicalBackground.value;

    if (!query) {
        showToast("Please enter a medical query.");
        return;
    }

    if (!age || !sex) {
        showToast("Please save your age and sex info first.");
        return;
    }

    document.getElementById("responseContainer").innerHTML = "Fetching personalized medical advice...";

    try {
        const prompt = `You are Medico AI – a personalized healthcare assistant.

User Profile:
- Age: ${age}
- Sex: ${sex}
- Medical Background: ${medicalBackgroundValue || "None provided"}

Medical Query: ${query}

Instructions:
- If the medicine is NOT recommended based on the user's profile (age, sex, background), FIRST display:
  "<div class='warning'>⚠️ This medicine is NOT recommended based on your health profile. Please consult a healthcare professional.</div>"
- AFTER the warning, STILL provide the following detailed information clearly marked as GENERAL INFORMATION ONLY:
  1. **Uses**: Purpose of the medicine.
  2. **Recommended Dosage per Day with Time Period**: Standard info (not personalized).
  3. **Side Effects if Heavy Dosage Taken**: Main risks.
  4. **Price per Tablet**: Approximate price.
  5. **Disclaimer if Required**: Strong caution about consulting a doctor.

Other Rules:
- Highlight that any usage should be under doctor supervision.
- Summarize the response within 700 words maximum.
- Maintain a professional yet friendly tone.
- Adjust based on age groups and medical risks.

Always prioritize patient safety and show warning visibly first if required.`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyACu_boK013_ndQhZ3bI_w0PkEywPuztZ8`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 700 }
            }),
        });

        const data = await res.json();
        document.getElementById("responseContainer").innerHTML = formatResponse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.");
    } catch (error) {
        console.error(error);
        document.getElementById("responseContainer").innerHTML = "Error fetching data. Please try again.";
    }
}

function formatResponse(response) {
    if (!response) return "No response received.";
    return response.replace(/\n/g, "<br>");
}

// Handle Scan Tablet Button

document.getElementById("scanButton").addEventListener("click", async () => {
    const file = document.getElementById("imageInput").files[0];
    const language = document.getElementById("languageSelect").value;

    if (!file) return showToast("Please upload an image of the tablet.");
    document.getElementById("ocrResult").innerHTML = "Reading image...";

    const reader = new FileReader();
    reader.onload = async function () {
        const { data: { text } } = await Tesseract.recognize(reader.result, 'eng');
        const prompt = `Give simple medical info for this tablet: ${text.trim()}.`;

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyACu_boK013_ndQhZ3bI_w0PkEywPuztZ8`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: 250 }
                }),
            });

            const data = await res.json();
            const info = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No information found.";
            document.getElementById("ocrResult").innerHTML += `<br><br><strong>Info:</strong> ${info.replace(/\n/g, "<br>")}`;
            speak(info, language);
        } catch (error) {
            document.getElementById("ocrResult").innerHTML += "<br>Error fetching data.";
        }
    };
    reader.readAsDataURL(file);
});

function speak(text, lang) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    synth.speak(utterance);
}
