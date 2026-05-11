
from fastapi import FastAPI
from pydantic import BaseModel
import os, time

app = FastAPI()

# Telemetry (optional)
AI_CONN = os.getenv('AI_CONNECTION_STRING')
if AI_CONN:
    from opencensus.ext.azure.trace_exporter import AzureExporter
    from opencensus.trace.tracer import Tracer
    exporter = AzureExporter(connection_string=AI_CONN)
    tracer = Tracer(exporter=exporter)
else:
    tracer = None

class PredictIn(BaseModel):
    features: dict

@app.get("/healthz")
async def health():
    return {"status": "ok"}

@app.post("/v1/predict")
async def predict(req: PredictIn):
    start = time.time()
    vals = [float(v) for v in req.features.values()] if req.features else [0.1]
    raw = sum(vals) / (len(vals) * 10.0)
    score = max(0.0, min(1.0, raw))
    shap_map = {k: (float(v)/100.0) for k,v in req.features.items()}
    top = sorted(shap_map.items(), key=lambda kv: abs(kv[1]), reverse=True)[:8]
    bucket = 'HIGH' if score>=0.7 else 'MEDIUM' if score>=0.4 else 'LOW'
    if tracer:
        with tracer.span(name="predict") as span:
            span.add_annotation("prediction", attributes={"count_features": len(req.features), "score": score})
    return {
        "risk_score": score,
        "risk_bucket": bucket,
        "shap": shap_map,
        "top_features": [{"name": k, "impact": v} for k,v in top],
        "model_version": "mock-0.0.2"
    }
