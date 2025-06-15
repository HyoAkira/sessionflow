import json
import joblib
from flask import Flask, jsonify, request
from db import DBService
import pandas as pd
app = Flask(__name__)

# models
kmeans2segment = joblib.load('./models/kmeans_2segment.pkl')
kmeans3segment = joblib.load('./models/kmeans_3segment.pkl')
kmeans5segment = joblib.load('./models/kmeans_5segment.pkl')
lightgbmdepression = joblib.load('./models/lightgbm.pkl')
# DB connection
dbs = DBService("mongodb://admin:admin123@localhost:27017/")
@app.route('/segment2', methods=['POST'])
async def segment2():
    df =  dbs.retrieve_data()
 
    try:
        result = kmeans2segment.predict(df)
        segment_json = await modelProcess(df,result)
        return jsonify(segment_json), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/segment3', methods=['POST'])    
async def segment3():
    df =  dbs.retrieve_data()
 
    try:
        result = kmeans3segment.predict(df)
        segment_json = await modelProcess(df,result)
        return jsonify(segment_json), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/segment5', methods=['POST'])    
async def segment5():
    df =  dbs.retrieve_data()
 
    try:
        result = kmeans5segment.predict(df)
        segment_json = await modelProcess(df,result)
        return jsonify(segment_json), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/depression', methods=['POST'])    
async def depression():
    df = dbs.retrieve_messages_comments()
 
    try:
        result = lightgbmdepression.predict(df["text"])
        df["predict"] = result
        segment_json = df["predict"].value_counts().sort_index().to_dict()
        return jsonify(segment_json), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    




async def modelProcess(df,result):
    df["segment"] = result
    crosstab_df = pd.DataFrame(index=sorted(df['segment'].unique()))
    cols = ["deviceType", "gender"]
    for col in cols:
        ct = pd.crosstab(df['segment'], df[col], normalize='index')
        ct.columns = [f"{col}_{val}" for val in ct.columns]
        crosstab_df = crosstab_df.join(ct, how='outer')
    crosstab_df = (crosstab_df * 100).round(2)
    crosstab_df = crosstab_df.reset_index().rename(columns={'index': 'segment'})
    numerical_features = df.select_dtypes(include=['float64', 'int64']).columns
    segment_summary_numeric = df.groupby('segment')[numerical_features].mean().round(2)
    segment_summary_numeric = segment_summary_numeric.reset_index()
    merged_df = pd.merge(segment_summary_numeric, crosstab_df, on='segment')
    segment_json = merged_df.to_dict(orient='records')
    return segment_json

