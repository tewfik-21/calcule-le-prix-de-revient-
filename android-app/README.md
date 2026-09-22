# Application Android - Calculateur de Prix de Revient Carrière

Cette application Android est développée en **Kotlin** avec **Jetpack Compose** pour l'interface utilisateur et **Retrofit** pour la communication réseau. Elle se connecte à l'API locale sécurisée de votre calculateur de prix de revient pour récupérer les modèles, calculer les coûts à la volée et générer des audits intelligents grâce à Gemini.

## Comment importer et exécuter dans Android Studio

1. **Ouvrir le projet** :
   - Ouvrez **Android Studio**.
   - Sélectionnez **Open** et choisissez le dossier `android-app/` situé à la racine de ce projet.
   - Attendez que Gradle synchronise et télécharge toutes les dépendances (Retrofit, Compose, etc.).

2. **Démarrer le serveur de production (Hôte)** :
   - Assurez-vous que le serveur local de l'application Web est démarré sur votre ordinateur (via le lanceur `.bat` ou en exécutant `npm start` sur le port `3000`).

3. **Lancer sur Émulateur ou Appareil Réel** :
   - **Émulateur Android** : L'adresse IP configurée par défaut dans `RetrofitClient` est **`10.0.2.2`**, ce qui correspond à l'adresse spéciale pour rediriger vers le `localhost:3000` de l'ordinateur hôte. Cela fonctionnera donc immédiatement !
   - **Appareil Réel** : Si vous testez sur un vrai téléphone connecté au même réseau Wi-Fi :
     - Modifiez l'adresse IP `10.0.2.2` par l'adresse IP de votre ordinateur (ex: `192.168.1.X`) dans le fichier `app/src/main/java/com/quarry/calculator/api/QuarryApiService.kt`.

4. **Compiler et Exécuter** :
   - Cliquez sur le bouton de lecture vert (**Run**) dans Android Studio.

## Architecture de l'application

- `MainActivity.kt` : L'interface utilisateur réactive développée en Jetpack Compose, structurée sous forme d'onglets (Tableau de Bord, Entreprise, Audit IA).
- `QuarryViewModel.kt` : Gère les états de chargement, de calculs, de rapports IA et pilote les requêtes asynchrones en arrière-plan.
- `QuarryApiService.kt` : Définit les endpoints Retrofit et instancie le client HTTP.
- `Models.kt` : Contient l'équivalent exact en Kotlin des structures de données TypeScript.
