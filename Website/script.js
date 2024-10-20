document.addEventListener("DOMContentLoaded", function() {

    const apiKey = ""; <!-- Put API Key here-->

    document.getElementById("sendBtn").addEventListener("click", async () => {
        const userInput = document.getElementById("userInput").value;
        if (userInput.trim()) {
            
            addMessageToChat("User", userInput);
            document.getElementById("userInput").value = "";

            const botResponse = await getOpenAIResponse(userInput);
            addMessageToChat("Bot", botResponse);
        }
    });
  
    function addMessageToChat(sender, message) {
        const chatbox = document.getElementById("chatbox");
        const messageElement = document.createElement("div");
        messageElement.className = "message";
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight; 
    }

    async function getOpenAIResponse(userMessage) {
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: userMessage }]
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("Error:", error);
            return "Sorry, something went wrong. Please try again.";
        }
    }
});
