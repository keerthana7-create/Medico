# PROJECT MEDICO:

Medico is a lightweight, web-based medical assistance tool that helps users get simple and easy-to-understand medical advice. It also allows users to scan the backside of a medicine tablet and fetch medical information using OCR (Optical Character Recognition) and AI.

✨ Features
Medical Query AI:
Enter a health-related question and get AI-generated simple advice.

Scan Medicine Tablet (OCR):
Upload a picture of the tablet’s backside, extract the text (medicine name), and receive relevant medical information including use cases, side effects, and precautions.

Multi-language Support for Voice Output:
After scanning a tablet, the extracted information is spoken aloud in your selected language (English, Hindi, Tamil, Telugu, Bengali).

🛠️ Built With
Frontend: HTML, CSS, JavaScript

OCR Library: Tesseract.js

AI Backend: Google Gemini AI API (v1beta - Flash Model)

Text-to-Speech API: Web Speech API

📦 Project Structure
cpp
Copy
Edit
├── index.html   // Main HTML file
├── style.css    // Styling for the project
├── script.js    // JavaScript logic (query handling, OCR, AI integration, voice output)
⚙️ How to Run Locally
Clone or download this repository.

Open the index.html file in any modern web browser (Chrome, Edge, Firefox).

Make sure you have a valid Google AI Studio API key (update it in script.js at the API_KEY variable).

Start using Medico for medical queries and tablet scanning!

📸 Screenshots
Add screenshots here if needed to show how the tool looks in action!

🤝 Contributing
Feel free to fork the repository and submit pull requests for improvements like:

Adding more language support.

Enhancing UI/UX.

Improving medical data fetching reliability.

📄 License
This project is licensed under the MIT License.

