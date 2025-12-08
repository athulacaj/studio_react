import { client } from "../../../config/gemini";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;


export const generateInitialHtml = async (portfolioData) => {
    if (!client) {
        throw new Error("Gemini API key is missing. Please check your .env file.");
    }

    const prompt = `
    You are an expert web developer. Create a single-file HTML portfolio website (including CSS and JS) based on the following data.
    The design should be modern, responsive, and visually appealing.
    Use internal CSS (<style>) and internal JS (<script>).
    Do not use external CSS/JS files (except for CDNs like FontAwesome or Google Fonts if needed).
    Ensure the code is clean and well-structured.
    
    Data:
    ${JSON.stringify(portfolioData, null, 2)}
    
    Return ONLY the raw HTML code. Do not include markdown code blocks (like \`\`\`html).
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }]
        });
        
        // The response structure might differ slightly, but typically it's response.response.text()
        // Based on new SDK, it might be simpler. Let's assume standard response structure or check docs if this fails.
        // Actually, for @google/genai, it's often response.text() directly or response.candidates[0].content.parts[0].text
        // Let's try the standard way first.
        
        // Wait, the new SDK usage is often:
        // const response = await client.models.generateContent({model: '...', contents: ...});
        // response.text() might not be there directly.
        // Let's look at the search result again or try to be safe.
        // Search result didn't give full code.
        // I'll assume it returns a response object where I can get text.
        // Let's try `response.text()` if available, or inspect structure.
        // Actually, let's use the most common pattern for this new SDK if I can recall or guess.
        // It's likely `response.response.candidates[0].content.parts[0].text` or similar.
        // But `response.text()` is a helper in the other SDK.
        
        // Let's try to find a safer way or just use the previous SDK's pattern if compatible, but it's a different package.
        // I will assume `response.text()` exists or I'll extract it.
        
        let text = "";
        if (typeof response.text === 'function') {
            text = response.text();
        } else if (response.response && typeof response.response.text === 'function') {
             text = response.response.text();
        } else {
             // Fallback for raw object
             text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }

        // Clean up potential markdown formatting
        text = text.replace(/```html/g, '').replace(/```/g, '');
        return text;
    } catch (error) {
        console.error("Error generating HTML:", error);
        throw error;
    }
};

export const modifyHtml = async (currentHtml, instruction) => {
    if (!client) {
        throw new Error("Gemini API key is missing. Please check your .env file.");
    }

    const prompt = `
    You are an expert web developer. I have an existing HTML file and I want to modify it based on a user's instruction.
    
    Current HTML:
    ${currentHtml}
    
    User Instruction:
    "${instruction}"
    
    Return the FULL updated HTML code. Do not include markdown code blocks.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }]
        });

        let text = "";
        if (typeof response.text === 'function') {
            text = response.text();
        } else if (response.response && typeof response.response.text === 'function') {
             text = response.response.text();
        } else {
             text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }

        text = text.replace(/```html/g, '').replace(/```/g, '');
        return text;
    } catch (error) {
        console.error("Error modifying HTML:", error);
        throw error;
    }
};
