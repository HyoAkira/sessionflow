import json
import joblib
from flask import Flask, jsonify, request
from db import DBService
import pandas as pd
app = Flask(__name__)
from utils.shopping_util import kmeans_linear_shopping
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.cluster import KMeans 
from sklearn.decomposition import PCA
from collections import Counter

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
    df = dbs.retrieve_data(process=True)
    df = df[["comment", "message"]].copy()
 
    try:
        filtered_df = df[(df["comment"] != "NULL") | (df["message"] != "NULL")]
        texts = filtered_df["message"].replace("NULL", "").fillna("") + " " + filtered_df["comment"].replace("NULL", "").fillna("")
        predictions = lightgbmdepression.predict(texts)
        filtered_df["prediction"] = predictions

        expected_emotions = ['fear', 'sad', 'love', 'joy', 'suprise', 'anger', 'depression']
        counts = Counter(filtered_df["prediction"])
        result_dict = {emotion: counts.get(emotion, 0) for emotion in expected_emotions}
        return jsonify(result_dict), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/shopping', methods=['POST'])    
async def shoppingBehavior():
    expected_fields = ["decreasing", "increasing", "stable"]
    df = dbs.retrieve_data(process=False)
    try:
        result = kmeans_linear_shopping(df)
        output = {field: result.get(field, 0) for field in expected_fields}
        return jsonify(output), 200 
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/modelreload', methods=['POST'])
async def modelReload():
    df = dbs.retrieve_data()

    try:
        numerical_features = df.select_dtypes(include=['float64', 'int64']).columns

        categorical_features = df.select_dtypes(include=['object']).columns

        ss = StandardScaler()
        ohe = OneHotEncoder(handle_unknown='ignore')
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', ss, numerical_features),
                ('cat', ohe, categorical_features)
            ]
        )

        pca = PCA(n_components=2)


        for n_clusters in [2, 3, 5]:
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            pipeline = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('pca', pca),
                ('kmeans', kmeans)
            ])
            pipeline.fit(df)
            xpca = pipeline.named_steps['pca'].transform(
                pipeline.named_steps['preprocessor'].transform(df)
            )
            df[f"pca1_{n_clusters}"] = xpca[:, 0]
            df[f"pca2_{n_clusters}"] = xpca[:, 1]
            df[f'cluster_{n_clusters}'] = pipeline.predict(df)
            joblib.dump(pipeline, f'./models/kmeans_{n_clusters}segment.pkl')
        global kmeans2segment, kmeans3segment, kmeans5segment, lightgbmdepression
        kmeans2segment = joblib.load('./models/kmeans_2segment.pkl')
        kmeans3segment = joblib.load('./models/kmeans_3segment.pkl')
        kmeans5segment = joblib.load('./models/kmeans_5segment.pkl')
        lightgbmdepression = joblib.load('./models/lightgbm.pkl')
        return jsonify({'status': 'Models reloaded successfully'}), 200
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

