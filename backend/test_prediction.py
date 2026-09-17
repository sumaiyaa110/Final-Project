from services.predictor import predict_transaction


sample_transaction = {

    "amount":50000,

    "channel":"P2P",

    "txn_hour":23,

    "new_device_flag":1

}


result = predict_transaction(
    sample_transaction
)


print(result)