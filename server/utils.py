import numpy as np
import pandas as pd
import xgboost as xgb


def load_data(file):
    data = pd.read_csv(file)
    column_mapping = {
        "dst_port": "Dst Port",
        "totlen_fwd_pkts": "TotLen Fwd Pkts",
        "flow_iat_mean": "Flow IAT Mean",
        "flow_iat_max": "Flow IAT Max",
        "fwd_iat_tot": "Fwd IAT Tot",
        "fwd_iat_mean": "Fwd IAT Mean",
        "fwd_iat_max": "Fwd IAT Max",
        "fwd_iat_min": "Fwd IAT Min",
        "fwd_header_len": "Fwd Header Len",
        "fwd_pkts_s": "Fwd Pkts/s",
        "bwd_pkts_s": "Bwd Pkts/s",
        "subflow_fwd_byts": "Subflow Fwd Byts",
        "init_fwd_win_byts": "Init Fwd Win Byts",
        "init_bwd_win_byts": "Init Bwd Win Byts",
        "timestamp": "Timestamp",
    }
    data = data.rename(columns=column_mapping)
    return data


def split_data_time(df):
    df["Timestamp"] = pd.to_datetime(
        df["Timestamp"], format="%Y-%m-%d %H:%M:%S"
    )
    df["Date"] = df["Timestamp"].dt.date.apply(
        lambda x: int(x.strftime("%Y%m%d"))
    )
    df["Time"] = df["Timestamp"].dt.time.apply(
        lambda x: int(x.strftime("%H%M%S"))
    )
    df = df.drop(columns=["Timestamp"])
    return df


def get_model(model_name):
    model = xgb.Booster()
    model.load_model(model_name)
    return model


def predict(model, data):
    data = data[model.feature_names]
    data = xgb.DMatrix(data)
    predictions = model.predict(data)
    prediction_labels = np.argmax(predictions, axis=1)
    return prediction_labels


def get_conclusion(file):
    data = load_data(file)
    data = split_data_time(data)
    model = get_model("xgb-model.json")
    predictions = predict(model, data)
    result = {
        "Benign": np.sum(predictions == 0),
        "Bot": np.sum(predictions == 1),
        "Brute Force": np.sum(predictions == 2),
        "DoS": np.sum(predictions == 3),
        "Infiltration": np.sum(predictions == 4),
        "SQL Injection": np.sum(predictions == 5),
    }
    return result


def compress_data(data):
    if len(data) > 100:
        indices = np.linspace(0, len(data) - 1, 100).astype(int)
        data = data.iloc[indices].reset_index(drop=True)
    return data


def get_data(file):
    data = load_data(file)
    data = compress_data(data)

    result = {}

    column_mappings = {
        "packetRates": {
            "Timestamp": "Timestamp",
            "Fwd Pkts/s": "Forward Packets",
            "Bwd Pkts/s": "Backward Packets",
        },
        "latency": {
            "Timestamp": "Timestamp",
            "Fwd IAT Mean": "Mean IAT Forward",
            "Fwd IAT Max": "Max IAT Forward",
            "Fwd IAT Min": "Min IAT Forward",
        },
        "dataTransfer": {
            "Timestamp": "Timestamp",
            "Subflow Fwd Byts": "Subflow Forward Bytes",
            "TotLen Fwd Pkts": "Total Length Forward Packets",
        },
    }

    for key, columns in column_mappings.items():
        subset = data[list(columns.keys())]
        subset.columns = list(columns.values())
        subset = subset.round(2)
        result[key] = subset.to_dict(orient="records")

    return result


def main():
    # data = load_data("dump/data.csv")
    # data = split_data_time(data)
    # model = get_model("xgb-model.json")
    # predictions = predict(model, data)
    # print(predictions)
    file = "dump/data.csv"
    result = get_data(file)
    print(result)


if __name__ == "__main__":
    main()
