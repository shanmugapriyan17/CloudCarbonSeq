import os
import json
import joblib

def init():
    global model
    # AZUREML_MODEL_DIR is an environment variable created during deployment.
    # It points to the folder where your model ('biomass_model.pkl') is extracted.
    model_path = os.path.join(os.getenv('AZUREML_MODEL_DIR'), 'biomass-estimator', 'biomass_model.pkl')
    
    # In some deployment structures, it might just be directly inside the dir
    if not os.path.exists(model_path):
        model_path = os.path.join(os.getenv('AZUREML_MODEL_DIR'), 'biomass_model.pkl')
        
    model = joblib.load(model_path)

def run(raw_data):
    try:
        # Expecting JSON data with a "data" key containing a 2D array of features
        data = json.loads(raw_data)["data"]
        
        # Make predictions using the loaded model
        predictions = model.predict(data)
        
        return predictions.tolist()
    except Exception as e:
        error = str(e)
        return error
