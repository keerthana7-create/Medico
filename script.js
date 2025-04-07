document.getElementById("queryButton").addEventListener("click", handleQuery);

const API_KEY = "AIzaSyCk1G5FfHqOmt5z23MKiDx3zDIUS3kjd10"; // Replace with your Google AI Key

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