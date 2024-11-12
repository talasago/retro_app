from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from mangum import Mangum

app = FastAPI()


@app.post("/test")
def test():
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"message": "test", "create_data": "data"},
    )

handler = Mangum(app)
