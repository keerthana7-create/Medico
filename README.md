# PROJECT MEDICO:

💊 Medico - Personalized Healthcare Assistant
Medico is a web-based medical assistant that empowers users to get personalized AI-driven medical advice and tablet information using Optical Character Recognition (OCR). It’s designed with accessibility in mind — including multi-language voice output — to help even illiterate users understand medicine details clearly.

🚀 Features
-->👤 Patient Profile
Users can enter and save their age, sex, and medical background.

Personal information is stored locally in the browser using localStorage.

-->💬 Medical Query (AI Assistant)
Users ask health-related questions.

AI provides customized advice considering the user’s profile.

Responses include warnings, side effects, dosage, uses, and more.

-->📷 Tablet Scanner with OCR + AI
Users upload a picture of the backside of a medicine tablet.

Tesseract.js extracts the tablet name.

Gemini AI provides a short, safe summary of the medicine.

Info is spoken aloud in the selected language (Hindi, Tamil, Telugu, Bengali, or English).

-->🔊 Voice Output for Accessibility
Speaks responses using SpeechSynthesisUtterance.

Ideal for illiterate or visually impaired users.
-->🔗 **Live Demo:** [Click to View Medico AI](https://keerthana7-create.github.io/Medico/)


-->⚠️ Built-in Safety
Personalized warnings shown if a tablet is not suitable for a user's age/health.

Disclaimer messages always included.

-->🛠️ Built With
Frontend: HTML, CSS, JavaScript

AI Backend: Google Gemini API (gemini-2.0-flash)

OCR Engine: Tesseract.js

Voice API: Web Speech API (Browser-native)

-->📁 Project Structure
bash
Copy
Edit
├── index.html         # UI layout
├── style.css          # Responsive and clean styling
├── script.js          # Main logic (AI, OCR, voice, input handling)
Screenshots
(You can include screenshots here of the form, output, and OCR working.)

-->✅ Future Improvements (Suggestions)
Enable true multilingual OCR using dynamic language selection for Tesseract.js

Add offline support using service workers

Improve UI for mobile users

Add real medicine database validation

-->📜 License
This project is released under the MIT License.
Free to use, modify, and distribute.

-->👩‍⚕️ Disclaimer
Medico is not a certified medical diagnostic tool.
Information provided is for educational and informational purposes only.
Always consult a licensed healthcare provider before taking any medicine.



