# AI Upgrade: Production-Oriented Extension

## Added Architecture

```text
ai-services/
  main.py
  services/
    rag_service.py
    analysis_service.py
  data/
src/
  ai-services/
    rules/
      evaluationRules.json
  controllers/
    aiController.js
  routes/
    aiRoutes.js
  services/
    aiOrchestrationService.js
    fastApiClient.js
    ruleEngineService.js
    intelligentAgentService.js
    trainingRecommendationService.js
  models/
    PerformanceLog.js
    TrainingPlan.js
    Document.js
```

## New API Endpoints

- `POST /ai/analyze-video`
- `POST /ai/upload-document`
- `POST /ai/coach-query`
- `GET /ai/training-plan/:athleteId`

## Setup

1. Install Node dependencies:
   - `npm install`
2. Install Python dependencies:
   - `pip install -r requirements.txt`
3. Configure environment:
   - Copy `env.example` to `.env`
   - Set `FASTAPI_URL` and `OPENAI_API_KEY` (optional but recommended for RAG quality)
4. Run FastAPI AI service:
   - `npm run ai:service`
5. Run Node backend:
   - `npm run dev`

## Notes

- If `OPENAI_API_KEY` is not configured, RAG still works with HuggingFace embeddings and a lightweight fallback answer generator.
- Existing routes remain unchanged; this is an additive extension layer.
