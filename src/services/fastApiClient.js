const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class FastApiClient {
    constructor() {
        this.baseUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 60000
        });
    }

    async analyzeVideo(videoPath, metadata = {}) {
        const form = new FormData();
        form.append('video', fs.createReadStream(videoPath));
        form.append('metadata', JSON.stringify(metadata));

        const response = await this.client.post('/ai/analyze-video', form, {
            headers: form.getHeaders()
        });
        return response.data;
    }

    async ingestDocument(filePath, filename) {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath), filename);

        const response = await this.client.post('/ai/upload-document', form, {
            headers: form.getHeaders()
        });
        return response.data;
    }

    async coachQuery(question) {
        try {
            const response = await this.client.post('/ai/coach-query', { question });
            return response.data;
        } catch (error) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    answer:
                        'AI coach service is currently offline. Start it with "npm run ai:service" and try again.',
                    sources: [],
                    fallback: true
                };
            }
            throw error;
        }
    }
}

module.exports = new FastApiClient();
