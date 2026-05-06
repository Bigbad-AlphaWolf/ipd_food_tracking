# IPD Food Tracking

Application web de suivi des repas au restaurant pour les employés IPD.

## Fonctionnalités

- **Suivi des repas** : Chaque employé enregistre quotidiennement s'il a mangé ou non au restaurant
- **Inscription** : Les nouveaux employés peuvent s'inscrire via leur numéro de téléphone
- **Rapport mensuel** : L'admin peut consulter et exporter le rapport du mois (jours × 750 XOF)
- **Interface mobile** : UX optimisée pour les appareils mobiles

## Stack technique

- **Frontend** : Angular 17 + Angular Material
- **Backend** : Firebase (Firestore) — Gratuit jusqu'à 1 Go de données

## Installation

### Prérequis

- Node.js >= 18
- Angular CLI : `npm install -g @angular/cli@17`
- Un projet Firebase (compte gratuit sur [firebase.google.com](https://firebase.google.com))

### Configuration Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activez **Firestore Database** (mode production)
3. Créez une application web dans les paramètres du projet
4. Configurez les variables d'environnement :

```bash
cd frontend
cp .env.example .env
# Modifiez .env avec vos vraies valeurs Firebase
```

Variables d'environnement requises dans `.env` :
```env
NG_APP_FIREBASE_API_KEY=your-firebase-api-key
NG_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NG_APP_FIREBASE_PROJECT_ID=your-project-id
NG_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NG_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
NG_APP_FIREBASE_APP_ID=1:123:web:abc123
NG_APP_ADMIN_PASSWORD=your-secure-admin-password
```

> 📋 **Sécurité** : Le fichier `.env` contient vos clés privées et ne doit jamais être committée dans Git.

5. Ajoutez les règles Firestore suivantes dans la console Firebase :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /employees/{document} {
      allow read, write: if true;
    }
    match /meals/{document} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ Ces règles sont ouvertes pour faciliter le démarrage. En production, configurez des règles d'accès appropriées.

### Lancement

```bash
cd frontend
npm install
ng serve
```

L'application sera disponible sur `http://localhost:4200`

### Build de production

```bash
cd frontend
npm run build:prod
```

Les fichiers de build seront dans `frontend/dist/frontend/`.

## Déploiement

### Netlify (Recommandé)

Voir le guide complet : [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md)

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build:prod
firebase deploy
```

## Structure de la base de données

### Collection `employees`
| Champ | Type | Description |
|-------|------|-------------|
| phoneNumber | string | Numéro de téléphone (identifiant unique) |
| fullName | string | Nom complet |
| createdAt | timestamp | Date d'inscription |

### Collection `meals`
| Champ | Type | Description |
|-------|------|-------------|
| employeeId | string | Référence vers l'employé |
| date | string | Date au format YYYY-MM-DD |
| ate | boolean | true si repas pris |
| createdAt | timestamp | Date d'enregistrement |

## Prix du repas

Chaque repas coûte **750 XOF**. Le rapport mensuel calcule automatiquement : `Jours mangés × 750 XOF`.

## Accès administrateur

- URL : `/admin/login`
- Mot de passe : configurable via `NG_APP_ADMIN_PASSWORD` dans `.env`

> 🔒 **Sécurité** : Utilisez un mot de passe fort pour la production. Générez-en un avec : `openssl rand -base64 32 | tr -d "=+/" | cut -c1-24`
