from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.liquidation_heatmap import router as heatmap_router

app = FastAPI(title="Trading Dashboard Workers", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(heatmap_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001)
