import pandas as pd
from fastapi import HTTPException
from typing import List
from io import StringIO, BytesIO
from datetime import datetime

async def read_file(file):
    filename = file.filename
    content = await file.read()

    if filename.endswith('.csv'):
        return {
            "Sheet1": pd.read_csv(StringIO(content.decode("utf-8")))
        }
    elif filename.endswith('.xlsx') or filename.endswith('.xls'):
        return pd.read_excel(BytesIO(content), sheet_name=None)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a CSV or Excel file.")

def column_checker(df, required_cols: List[str], sheet_name=None, perforation = None):

    # data chcking before processing
    df.columns = df.columns.str.strip().str.upper()

    # find missing required columns
    missing=[]
    item_columns={}
    for item in required_cols:
        col = next((col for col in df.columns if item in col), None)
        if col is None:
            missing.append(item)
        else:
            item_columns[col] = item

    if missing:
        if sheet_name:
            raise HTTPException(status_code=400, detail=f"Please provide {", ".join(missing)} columns on {sheet_name}!")
        else:
            raise HTTPException(status_code=400, detail=f"Please provide {", ".join(missing)} columns!")

    df = data_preprocessing(df, item_columns, perforation)

    return df

def data_preprocessing(df, rename_dict: dict, perforation = None):

    df = df.rename(columns=rename_dict)

    # fill missing values
    df = df.fillna(0)

    # ensure datetime on DATE column
    df['DATE'] = pd.to_datetime(df['DATE'])

    # sorting the data based on well and date
    if perforation:
        df = df.sort_values(by=['UWI', 'COMPLETION', 'DATE']).reset_index(drop=True)
    else:
        df = df.sort_values(by=['UWI', 'DATE']).reset_index(drop=True)

    return df

def reindex_well(df):
    # ensure DATE is datetime
    df['DATE'] = pd.to_datetime(df['DATE'])

    # create full monthly range using the first day of the month
    full_dates = pd.date_range(
        start=df['DATE'].min(),
        end=df['DATE'].max(),
        freq='MS'
    )

    # round the original dates to the first day of the month
    df['DATE'] = df['DATE'].apply(lambda x: x.replace(day=1))

    # set DATE as index
    df = df.set_index('DATE')

    # reindex to full_dates and fill missing rows with 0
    df = df.reindex(full_dates, fill_value=0)

    # reset index and rename back to DATE
    df = df.reset_index().rename(columns={'index': 'DATE'})

    # restore UWI
    df['UWI'] = df['UWI'].iloc[0]

    return df

def write_conversion_rate(df, time_domain, fluids_list):

    # Create output in memory
    output = StringIO()

    fluid_header = "\t".join(f"*{fluid}" for fluid in fluids_list)

    output.write(
        f"*FIELD\n"
        f"*{time_domain}\n"
        f"*IGNORE_MISSING\n"
        f"*UPTIME_FRACTIONS\n"
        f"*UUCRATES\n"
        f"*MISSING_VALUE -9999\n"
        f"*DAY\t*MONTH\t*YEAR\t{fluid_header}\t\n"
    )

    for i in df.index :

        if i == 0:
            output.write(f"*NAME\t{df['UWI'][i]}")
        
        output.write(f'\n{df["DATE"][i].day}\t{df["DATE"][i].month}\t{df["DATE"][i].year}\t')

        for fluid in fluids_list:
            output.write(f"{df[fluid][i]}\t")
        
        if i == (len(df.index)-1):
            break

        if str(df["UWI"][i]) != str(df["UWI"][i+1]) :
            output.write(f'\n\n*NAME\t{df["UWI"][i+1]}')
    
    # move the cursor back to the first
    output.seek(0)

    return output

def write_conversion_pressure(df):

    # Create output in memory
    output = StringIO()

    output.write(
        f"*FIELD\n"
        f"*DAY\t*MONTH\t*YEAR\t*PRESS\t\n"
        f"*NAME\t{df['UWI'].iloc[0]}\n"
    )

    for _, row in df.iterrows():
        output.write(f"{row['DATE'].day}\t{row['DATE'].month}\t{row['DATE'].year}\t{row['PRESS']}\n")

    return output

def write_conversion_completion(df):
    
    # special treatment for DATE column
    df['DATE'] = df['DATE'].dt.strftime("%d/%m/%Y")

    output = StringIO()

    output.write('UNITS FIELD\n\n')

    for i in df.index:
        
        if i == 0:
            output.write(f"WELLNAME\t{df['UWI'][i]}\n")

        output.write(f"{df['DATE'][i]}\t{df['COMPLETION'][i]}\t{df['TOP'][i]}\t{df['BOTTOM'][i]}\t{df['EXTRA'][i]}\n")

        if i == (len(df.index)-1):
            break

        if df['UWI'][i] == df['UWI'][i+1]:

            if df['COMPLETION'][i] != df['COMPLETION'][i+1]:
                output.write("\n")

        elif str(df['UWI'][i]) != str(df['UWI'][i+1]):
            output.write(f"\nWELLNAME\t{df['UWI'][i+1]}\n")

    output.seek(0)

    return output