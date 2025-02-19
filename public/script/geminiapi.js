// Replace with your actual Gemini API key
const GEMINI_API_KEY = 'AIzaSyDtfeb-zEdKRE9Zo5_3WjOv_OF89_fuxXM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

// Function to convert image file to base64
async function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// Function to analyze receipt using Gemini API
async function analyzeReceipt(imageBase64) {
    const requestBody = {
        contents: [{
            parts: [{
                text: `Analyze this receipt image and return only the following information in **valid JSON format**:
                {
                    "date": "Date of purchase",
                    "total": "Total amount spent",
                    "category": "Category based on items purchased"
                }`
            }, {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            }]
        }]
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Raw API Response:", data); // Debugging log

        if (!data.candidates || !data.candidates[0].content.parts[0].text) {
            throw new Error("Unexpected API response format");
        }

        let textResponse = data.candidates[0].content.parts[0].text;

        // Remove markdown formatting if present
        textResponse = textResponse.replace(/```json|```/g, '').trim();

        const jsonResponse = JSON.parse(textResponse);
        console.log("Parsed Receipt Data:", jsonResponse);

        return {
            success: true,
            analysis: jsonResponse
        };

    } catch (error) {
        console.error('Error analyzing receipt:', error);
        return { success: false, error: error.message };
    }
}

// Function to handle the scan process
async function handleScan(file) {
    if (!file) {
        console.error("No image provided");
        return;
    }

    try {
        const imageBase64 = await getBase64(file);
        return await analyzeReceipt(imageBase64);
    } catch (error) {
        console.error("Error processing image:", error);
    }
}

// Export the function
export { handleScan };
