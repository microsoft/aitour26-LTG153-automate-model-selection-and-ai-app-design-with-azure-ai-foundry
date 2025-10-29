# backend/config.py
import os
from dotenv import load_dotenv
from common_utils import get_keyvault_secret

load_dotenv()

# determine which keyvault to get secrets from
if os.getenv("ENVIRONMENT") == "development":
    environment = "development"
    azure_secrets_keyvault = "https://<keyvauldev>.vault.azure.net/"
if os.getenv("ENVIRONMENT") == "production":
    environment = "production"
    azure_secrets_keyvault = "https://<kevaultproduction>.vault.azure.net/"

# Azure Blob Storage files for the generated clinical handover PDFs
example_value = get_keyvault_secret(
    azure_secrets_keyvault, "example-value"
)
