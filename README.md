# 💊 Medico - Personalized Healthcare & Prescription Assistant

Medico is an AI-powered medical assistant that scans prescription images or reports, analyzes patient profiles, and translates medical explanations into regional languages with voice audio readout.

---

## 🌟 Key Features

1. **Multimodal Prescription & Report Scanner**: Upload photos of prescriptions or lab reports for automatic analysis using Gemini 1.5 Flash Vision.
2. **Regional Language Support**: Get detailed medical explanations, dosage instructions, and precautions in **Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Spanish, or English**.
3. **Voice Audio Assistant**: Listen to the report read aloud in your native regional accent using Web Speech synthesis.
4. **Patient Profile Storage**: Save your age, sex, and medical history locally in your browser.
5. **Secure API Key Handling**:
   - **Vercel Serverless Function Proxy (`/api/extract`)**: Hides your API key in environment variables so GitHub never revokes it.
   - **GitHub Pages Fallback**: Includes a built-in API Settings modal to input your API key directly in browser `localStorage`.

---

## 🚀 How to Deploy to Vercel (Recommended Permanent Fix)

1. Push this code to your GitHub repository ([`keerthana7-create/Medico`](https://github.com/keerthana7-create/Medico)).
2. Go to [Vercel](https://vercel.com) and import your `Medico` repository.
3. Add an Environment Variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: *(Your free Google AI Studio API key)*
4. Click **Deploy**.

---

## 💻 How to Run Locally

You can open `index.html` directly in any web browser!

```bash
# Or start a quick local HTTP server
npx serve .
```
