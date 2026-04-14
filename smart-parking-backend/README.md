# 🅿️ Smart Parking Management System — Backend API

API REST complète pour la gestion intelligente de parking.
**Node.js + Express + PostgreSQL + Socket.io + Swagger**

---

## 🚀 Démarrage rapide

### 1. Prérequis
- Node.js >= 18
- PostgreSQL (via pgAdmin 4)

### 2. Installation

```bash
cd smart-parking-backend
npm install
```

### 3. Configuration PostgreSQL (pgAdmin 4)

1. Ouvrez **pgAdmin 4**
2. Créez une nouvelle base de données : `smart_parking`
3. Clic droit sur `smart_parking` → **Query Tool**
4. Ouvrez et exécutez le fichier : `database/schema.sql`
5. Vérifiez que les tables sont créées ✅

### 4. Variables d'environnement

Copiez `.env.example` vers `.env` et ajustez :

```bash
cp .env.example .env
```

Modifiez dans `.env` :
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_parking
DB_USER=postgres
DB_PASSWORD=VOTRE_MOT_DE_PASSE_POSTGRES
JWT_SECRET=une_cle_secrete_longue_et_complexe
```

### 5. Démarrer le serveur

```bash
# Développement (avec rechargement automatique)
npm run dev

# Production
npm start
```

---

## 📚 Swagger UI

Une fois le serveur démarré, ouvrez :

👉 **http://localhost:3000/api-docs**

### Comment tester avec Swagger :

1. **Register** → `POST /api/auth/register` avec vos données
2. **Login** → `POST /api/auth/login` → copiez le `token`
3. Cliquez sur **Authorize** 🔒 (en haut à droite)
4. Entrez : `Bearer <votre_token>`
5. Testez tous les endpoints !

### Comptes de test (créés par le seed SQL) :

| Rôle  | Email               | Mot de passe |
|-------|---------------------|--------------|
| Admin | admin@parking.com   | admin123     |
| User  | user@parking.com    | user123      |

---

## 🔗 Endpoints API

| Module          | Endpoint                        | Méthode | Auth  |
|-----------------|---------------------------------|---------|-------|
| **Auth**        | /api/auth/register              | POST    | Non   |
|                 | /api/auth/login                 | POST    | Non   |
|                 | /api/auth/me                    | GET     | Oui   |
|                 | /api/auth/change-password       | POST    | Oui   |
| **Users**       | /api/users                      | GET     | Admin |
|                 | /api/users/:id                  | GET/PUT/DELETE | Oui |
| **Spots**       | /api/spots                      | GET     | Oui   |
|                 | /api/spots                      | POST    | Admin |
|                 | /api/spots/:id                  | GET/PUT/DELETE | Admin |
| **Reservations**| /api/reservations               | GET/POST | Oui  |
|                 | /api/reservations/:id           | GET     | Oui   |
|                 | /api/reservations/:id/end       | PUT     | Oui   |
|                 | /api/reservations/:id           | DELETE  | Oui   |
| **Subscriptions**| /api/subscriptions             | GET/POST | Oui  |
|                 | /api/subscriptions/:id/renew    | POST    | Oui   |
| **Payments**    | /api/payments                   | GET/POST | Oui  |
|                 | /api/payments/:id/refund        | PUT     | Admin |
| **Dashboard**   | /api/dashboard/stats            | GET     | Admin |
|                 | /api/dashboard/occupancy        | GET     | Admin |
|                 | /api/dashboard/revenue          | GET     | Admin |

---

## 🔄 Socket.io — Événements temps réel

Connectez-vous à `ws://localhost:3000` pour recevoir :

| Événement            | Déclencheur                        |
|----------------------|------------------------------------|
| `spot-updated`       | Statut d'une place modifié         |
| `spot-created`       | Nouvelle place ajoutée             |
| `spot-deleted`       | Place supprimée                    |
| `spot-available`     | Place libérée après réservation    |
| `reservation-created`| Nouvelle réservation               |

---

## 🗂️ Structure du projet

```
smart-parking-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Connexion PostgreSQL
│   │   └── swagger.js       # Config Swagger
│   ├── controllers/         # Logique API
│   ├── middlewares/         # Auth, validation, erreurs
│   ├── models/              # Modèles Sequelize
│   ├── routes/              # Routes + JSDoc Swagger
│   ├── sockets/             # Socket.io events
│   └── app.js               # App Express
├── database/
│   └── schema.sql           # Schéma + seed PostgreSQL
├── server.js                # Point d'entrée
├── .env.example
└── package.json
```

---

## 🔐 Sécurité

- JWT Authentication (7 jours par défaut)
- Passwords hashés avec bcrypt (12 rounds)
- Rate limiting (200 req/15min, 20 req/15min pour l'auth)
- Helmet (headers HTTP sécurisés)
- CORS configuré
- Validation des inputs (express-validator)
- RBAC (admin / user)
