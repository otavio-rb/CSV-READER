# Unused

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from tabula import read_pdf
import pandas as pd
import json
from typing import List
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/extract-table/")
async def extract_table(file: UploadFile = File(...)):
    try:
        # Create a temporary file to store the uploaded PDF
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Read tables from PDF
        tables = read_pdf(temp_path, pages='all')
        
        # Convert tables to JSON
        json_tables = []
        for table in tables:
            json_tables.append(table.to_dict('records'))
            
        # Cleanup temporary file
        os.remove(temp_path)
        
        return {"success": True, "data": json_tables}
        
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
