
from pymongo import MongoClient
import pandas as pd
class DBService:
    def __init__(self, connection_string):
        self.client = MongoClient(connection_string)

    def retrieve_data(self):
        db = self.client["tas2"]
        forms = list(db["forms"].find())
        pages = list(db["pages"].find())
        sessions = list(db["sessions"].find())
        df_forms = pd.DataFrame(forms)
        df_pages = pd.DataFrame(pages)
        df_sessions = pd.DataFrame(sessions)
        for df in [df_forms, df_pages, df_sessions]:
          df.drop(columns=["_id", "__v"], inplace=True, errors="ignore")
        merged1 = pd.merge(df_pages, df_sessions, on=["sessionID"], suffixes=("", "_session"))
        merged2 = pd.merge(merged1, df_forms, on=["pageID", "sessionID"], suffixes=("", "_form"), how="left")
        df = merged2
        df.drop(columns=["records",'sessionID',"pageID","date", "formID",'createdAt', 'updatedAt', 'createdAt_session', 'updatedAt_session',"sessionStart"], inplace=True, errors="ignore")
        df_exploded = df.explode(['categories']).reset_index(drop=True)
        df_exploded = df_exploded.explode(['contents']).reset_index(drop=True)
        df = df_exploded
        df = self.preprocess_data(df)
        return df

    def preprocess_data(self, df):
        df = df.copy()
        df['max_price'] = df['max_price'].fillna(df['max_price'].median())
        df['min_price'] = df['min_price'].fillna(df['min_price'].median())
        df['gender'] = df['gender'].fillna("")
        df['message'] = df['message'].fillna("")
        df['comment'] = df['comment'].fillna("")
        df['deviceType'] = df['deviceType'].fillna("")
        df['categories'] = df['categories'].fillna("")
        df['contents'] = df['contents'].fillna("")
        return df
    
    def retrieve_messages_comments(self):
        df = self.retrieve_data()
        df = df[['message', 'comment']].dropna()
        text_df = pd.concat([
            df['message'].dropna(),
            df['comment'].dropna()
        ], ignore_index=True).to_frame(name='text')

        return text_df