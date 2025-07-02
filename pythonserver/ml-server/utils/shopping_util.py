import pandas as pd
import joblib
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import FunctionTransformer, StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.cluster import KMeans

def kmeans_linear_shopping(df):
    df = df[df["formID"].notnull()].copy()
    if 'max_price' in df.columns:
        df['max_price'] = df['max_price'].fillna(df['max_price'].median())
    if 'min_price' in df.columns:
        df['min_price'] = df['min_price'].fillna(df['min_price'].median())
    if 'gender' in df.columns:
        df['gender'] = df['gender'].fillna("NULL")
    if 'message' in df.columns:
        df['message'] = df['message'].fillna("NULL")
    if 'comment' in df.columns:
        df['comment'] = df['comment'].fillna("NULL")
    if 'deviceType' in df.columns:
        df['deviceType'] = df['deviceType'].fillna("NULL")
    if 'categories' in df.columns:
        df['categories'] = df['categories'].fillna("NULL")
    if 'contents' in df.columns:
        df['contents'] = df['contents'].fillna("NULL")

   
    def prepare_trend_summary(df):

        def prepare_time_features(df):
        
            df['createdAt_form'] = pd.to_datetime(df['createdAt_form'])
            df = df.sort_values('createdAt_form')

            df['timestamp'] = (df['createdAt_form'] - df['createdAt_form'].min()).dt.total_seconds() / (60 * 60 * 24)
            df['avg_price'] = df[['min_price', 'max_price']].mean(axis=1)
            df['price_range'] = df['max_price'] - df['min_price']
            return df

    


        class TrendExtractor(BaseEstimator, TransformerMixin):
            def __init__(self, value_column, time_column='timestamp', threshold=0.01):
                self.value_column = value_column
                self.time_column = time_column
                self.threshold = threshold

            def fit(self, X, y=None):
                return self

            def transform(self, X):
                results = []
                for session_id, group in X.groupby('sessionID'):
                    group = group.sort_values(self.time_column)
                    if len(group) < 2:
                        slope = 0
                        trend = 'stable'
                    else:
                        X_t = group[self.time_column].values.reshape(-1, 1)
                        y_t = group[self.value_column].values
                        model = LinearRegression().fit(X_t, y_t)
                        slope = model.coef_[0]
                        if slope > self.threshold:
                            trend = 'increasing'
                        elif slope < -self.threshold:
                            trend = 'decreasing'
                        else:
                            trend = 'stable'

                    results.append({
                        'sessionID': session_id,
                        f'{self.value_column}_slope': slope,
                        f'{self.value_column}_trend': trend
                    })
                return pd.DataFrame(results)



        min_trend = TrendExtractor('min_price')
        max_trend = TrendExtractor('max_price')
        avg_trend = TrendExtractor('avg_price')
        range_trend = TrendExtractor('price_range')

        df = df.copy()
        



        df_ready = prepare_time_features(df)

        results = [
            min_trend.transform(df_ready),
            max_trend.transform(df_ready),
            avg_trend.transform(df_ready),
            range_trend.transform(df_ready)
        ]

        from functools import reduce
        trend_summary = reduce(lambda left, right: pd.merge(left, right, on='sessionID'), results)
        return trend_summary

    def summarize_trends():
            trend_summary = prepare_trend_summary(df)

            # Ortalama trendi baz al
            trend_counts = trend_summary[f'avg_price_trend'].value_counts().to_dict()

            return trend_counts

    return summarize_trends()
