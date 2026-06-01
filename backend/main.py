from fastapi import FastAPI
from app.api.routes import router

app = FastAPI(
    title="Weather Analytics API"
)

# Register routes
app.include_router(router)