def lambda_hundler(event, context):
    # Get the data from the event
    data = event["data"]
    print(f"Received data: {data}")
