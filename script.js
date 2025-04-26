document.getElementById("queryButton").addEventListener("click", handleQuery);

const API_KEY = "AIzaSyBLCtjJzoTAQJe2WnkWEEy6TjKBSTUc-gc"; // Replace with your Google AI Key

async function handleQuery() {
    const query = document.getElementById("queryInput").value;
    const medicalBackground = document.getElementById("medicalBackground").value; // Get medical background

    if (!query) {
        alert("Please enter a medical query.");
        return;
    }

    document.getElementById("responseContainer").innerHTML = "Fetching medical advice...";

    try {
        let prompt = `Provide a simple medical response for: ${query}.`;

        // Include medical background if provided
        if (medicalBackground) {
            prompt += ` Consider the following medical background: ${medicalBackground}.`;
        }

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }], // Use the constructed prompt
                generationConfig: { maxOutputTokens: 250 }
            }),
        });

        const data = await res.json();
        document.getElementById("responseContainer").innerHTML = formatResponse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.");
    } catch (error) {
        document.getElementById("responseContainer").innerHTML = "Error fetching data. Please try again.";
    }
}

function formatResponse(response) {
    if (!response) return "No response received.";
    return response.replace(/\n/g, "<br>");
}
document.getElementById("scanButton").addEventListener("click", async () => {
    const file = document.getElementById("imageInput").files[0];
    const language = document.getElementById("languageSelect").value;

    if (!file) return alert("Please upload an image of the tablet.");
    document.getElementById("ocrResult").innerHTML = "Reading image...";

    const reader = new FileReader();
    reader.onload = async function () {
        const { data: { text } } = await Tesseract.recognize(reader.result, 'eng');
        const prompt = `Give simple medical info for this tablet name: ${text.trim()}. Include use cases, side effects on overdose, and who should avoid it.`;

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
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
