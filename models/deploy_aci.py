import os
from azureml.core import Workspace, Environment, Model
from azureml.core.webservice import AciWebservice
from azureml.core.model import InferenceConfig
import logging

logging.basicConfig(level=logging.INFO)

print("Connecting to workspace...")
ws = Workspace(
    subscription_id='18af0d1b-72c9-468a-9423-c7614bfc1d92', 
    resource_group='carbonseq-project-rg', 
    workspace_name='carbonseq-ml-workspace'
)

print("Fetching registered model...")
model = Model(ws, "biomass-estimator")

print("Setting up Environment and Inference Config...")
env = Environment.from_conda_specification(
    name="biomass-env",
    file_path="d:/HOST/CloudCarbonSeq/models/conda.yml"
)

inference_config = InferenceConfig(
    entry_script="d:/HOST/CloudCarbonSeq/models/score.py", 
    environment=env
)

print("Configuring ACI Deployment for Student Subscription...")
# Minimum requirements for student quota
deployment_config = AciWebservice.deploy_configuration(
    cpu_cores=1, 
    memory_gb=1,
    description="ACI Endpoint for Biomass Estimation"
)

print("Deploying API Endpoint... This will take ~5-10 minutes to provision the container.")
service = Model.deploy(
    workspace=ws, 
    name="biomass-aci-endpoint", 
    models=[model], 
    inference_config=inference_config, 
    deployment_config=deployment_config,
    overwrite=True
)

service.wait_for_deployment(show_output=True)

print("Endpoint Deployment Complete!")
print("Scoring URI:", service.scoring_uri)
print("Swagger URI:", service.swagger_uri)
print("State:", service.state)
