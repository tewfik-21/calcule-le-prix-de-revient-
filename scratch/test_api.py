import requests
import json

# URL locale du serveur Python Flask ou Node.js
BASE_URL = "http://localhost:3000"

# 1. Tester la connexion (Health Check)
print("--- TEST DE CONNEXION ---")
try:
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Statut : {response.status_code}")
    print(response.json())
except Exception as e:
    print(f"Erreur de connexion : {e}")
    print("Assurez-vous que le serveur est démarré avec 'python app.py'")
    exit(1)

# 2. Récupérer le modèle de scénario par défaut
print("\n--- RÉCUPÉRATION DU TEMPLATE ---")
response = requests.get(f"{BASE_URL}/api/scenarios/templates")
data = response.json()
default_scenario = data["defaultScenario"]
print(f"Modèle récupéré : {default_scenario['nom']}")

# 3. Envoyer des données pour calcul
print("\n--- ENVOI DE DONNÉES POUR CALCUL ---")
payload = {"scenario": default_scenario}
response = requests.post(f"{BASE_URL}/api/calculate", json=payload)
if response.status_code == 200:
    results = response.json()
    print(f"Coût Total : {results['totalGlobal']:,} {default_scenario['devise']}")
    print(f"Coût par tonne : {results['coutParTonneGlobal']:.2f} {default_scenario['devise']}/T")
    print(f"Marge Bénéficiaire : {results['margeGlobale']:,} {default_scenario['devise']} ({results['margePourcent']:.1f}%)")
else:
    print(f"Erreur de calcul : {response.text}")
