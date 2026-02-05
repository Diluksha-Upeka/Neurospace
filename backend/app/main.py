from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect()
    yield
    db.close()


app = FastAPI(title="NeuroSpace API", lifespan=lifespan)


@app.get("/")
def health_check():
    return {"status": "active", "system": "NeuroSpace Graph Engine"}
