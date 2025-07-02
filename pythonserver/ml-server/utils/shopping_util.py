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
    df['max_price'] = df['max_price'].fillna(df['max_price'].median())
    df['min_price'] = df['min_price'].fillna(df['min_price'].median())
    df['gender'] = df['gender'].fillna("NULL")
    df['message'] = df['message'].fillna("NULL")
    df['comment'] = df['comment'].fillna("NULL")
    df['deviceType'] = df['deviceType'].fillna("NULL")
    df['categories'] = df['categories'].fillna("NULL")
    df['contents'] = df['contents'].fillna("NULL")


    def prepare_trend_summary(df):

        def prepare_time_features(df):
        
            df['createdAt_form'] = pd.to_datetime(df['createdAt_form'])
            df = df.sort_values('createdAt_form')

            df['timestamp'] = (df['createdAt_form'] - df['createdAt_form'].min()).dt.total_seconds() / (60 * 60 * 24)
            df['avg_price'] = df[['min_price', 'max_price']].mean(axis=1)
            df['price_range'] = df['max_price'] - df['min_price']
            return df

        prepare_fn = FunctionTransformer(prepare_time_features)


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
                        trend = 'durağan'
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
        df['createdAt_form'] = pd.date_range("2024-01-01", periods=len(df), freq='D')



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

    def use_kmeans_linear():

        trend_summary = prepare_trend_summary(df)
        numerical_features = trend_summary.select_dtypes(include=['float64', 'int64']).columns
        X = trend_summary[numerical_features].copy()

        kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
        ss = StandardScaler()
        ohe = OneHotEncoder(handle_unknown='ignore')
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', ss, numerical_features)
            ]
        )
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('clusterer', kmeans)
        ])
        trend_summary['cluster'] = pipeline.fit_predict(X)


        return trend_summary['cluster'].value_counts().sort_index().to_dict()

    return use_kmeans_linear() 