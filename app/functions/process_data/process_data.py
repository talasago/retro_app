def lambda_handler(event, context):
    # Get the data from the event
    print(f"Received data: {event}")
    return "hoge"
