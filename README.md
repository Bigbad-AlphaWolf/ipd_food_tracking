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
4. Copiez la configuration Firebase dans `frontend/src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'VOTRE_API_KEY',
    authDomain: 'VOTRE_PROJECT_ID.firebaseapp.com',
    projectId: 'VOTRE_PROJECT_ID',
    storageBucket: 'VOTRE_PROJECT_ID.appspot.com',
    messagingSenderId: 'VOTRE_MESSAGING_SENDER_ID',
    appId: 'VOTRE_APP_ID',
  },
  adminPassword: 'votre_mot_de_passe_admin',
};
```

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
ng build --configuration=production
```

Les fichiers de build seront dans `frontend/dist/frontend/`.

## Déploiement sur Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
ng build --configuration=production
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
- Mot de passe par défaut : `admin123` (à modifier dans `environment.ts`)
