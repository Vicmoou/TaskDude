const LOCAL_AI_ENDPOINT = 'http://localhost:8080/v1';

class LocalAIClient {
    constructor() {
        this.modelReady = false;
        this.initModel();
    }

    async initModel() {
        try {
            const response = await fetch(`${LOCAL_AI_ENDPOINT}/models`);
            if (response.ok) {
                this.modelReady = true;
                document.getElementById('modelStatus').textContent = 'Local AI Ready';
                document.getElementById('modelIndicator').classList.add('ready');
            }
        } catch (error) {
            document.getElementById('modelStatus').textContent = 'Error loading Local AI';
            document.getElementById('modelIndicator').classList.add('error');
        }
    }

    async processMessage(message) {
        if (!this.modelReady) {
            return "Local AI is not ready yet. Please wait...";
        }
        
        try {
            const response = await fetch(`${LOCAL_AI_ENDPOINT}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: message }]
                })
            });
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            return "Error processing message locally";
        }
    }
}

window.localAI = new LocalAIClient();
