from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import StreamingResponse
import pandas as pd
from io import BytesIO
import zipfile
from .helpers import read_file, column_checker, reindex_well, write_conversion_rate, write_conversion_pressure, write_conversion_completion

app = FastAPI()

@app.post("/convert/rate")
async def convert_rate(
    file: UploadFile = File(...), 
    time_domain: str = Form(...),
    fluids_list: str = Form(...)):
    
    # read the file
    dict_result = await read_file(file)
    df = next(iter(dict_result.values()))

    # make uniform
    fluids_list = [f.upper() for f in fluids_list.split(',')]

    # column check and data preprocessing
    required_cols = ['UWI','DATE']+fluids_list
    df = column_checker(df, required_cols)

    # group by 
    df_final = df.groupby('UWI', group_keys=False).apply(reindex_well)
    df_final = df_final.reset_index(drop=True)

    output = write_conversion_rate(df_final, time_domain, fluids_list)
        
    return StreamingResponse (
        output,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=converted_rate.vol"
        }
    )

@app.post("/convert/pressure")
async def convert_pressure(
    file: UploadFile = File(...), 
    method: str = Form(...)):

    # read the file
    dfs = await read_file(file)

    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, "w") as zipfolder:
        for sheet_name, df in dfs.items():

            # column check and data preprocessing
            required_cols = ['UWI','DATE','PRESS']
            df = column_checker(df, required_cols, sheet_name)

            if method == 'average':
                df_final = df.groupby(['UWI','DATE'], as_index=False)['PRESS'].mean()
            elif method == 'max':
                df_final = df.groupby(['UWI','DATE'], as_index=False)['PRESS'].max()
            elif method == 'min':
                df_final = df.groupby(['UWI','DATE'], as_index=False)['PRESS'].min()
            
            output = write_conversion_pressure(df_final)
            
            # move the cursor back to the first
            zipfolder.writestr(f"Preesure {sheet_name}.vol", output.getvalue())
    
    zip_buffer.seek(0)
                
    return StreamingResponse (
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=converted_pressure.zip"
        }
    )

@app.post("/convert/completion")
async def convert_completion(
    file: UploadFile = File(...)):
    
    # read the file
    dict_result = await read_file(file)
    df = next(iter(dict_result.values()))

    # column check and data preprocessing
    required_cols = ['UWI','DATE', 'COMPLETION', 'TOP', 'BOTTOM']
    df = column_checker(df, required_cols, perforation=True)

    df['EXTRA'] = df['COMPLETION'].apply(
    lambda x: f"0.625\t0\t0\t0" if x.lower() == "perforation" else "\t\t\t")

    output = write_conversion_completion(df)

    return StreamingResponse (
        output,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=converted_completion.ev"
        }
    )