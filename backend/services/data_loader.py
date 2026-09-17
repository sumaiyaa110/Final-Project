import pandas as pd
import os


DATA_PATH = os.path.join(
    "data",
    "final_feature_store.csv"
)


df = pd.read_csv(DATA_PATH)


print(
    "Dataset loaded:",
    df.shape
)



def get_transactions():

    return df