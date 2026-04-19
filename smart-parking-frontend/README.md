# 🎨 Smart Parking Frontend — React + Vite

Interface utilisateur moderne pour le Smart Parking Management System.

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js >= 18
- Le **backend** doit tourner sur `http://localhost:3000`

### Installation & lancement

```bash
cd smart-parking-frontend
npm install
npm run dev
```

Ouvrez **http://localhost:3001**

---

## 🔗 Connexion au backend

Le frontend proxy toutes les requêtes `/api` vers `http://localhost:3000` via Vite.
Assurez-vous que le backend tourne **avant** de démarrer le frontend.

---

## 🔐 Comptes de test

| Rôle  | Email             | Mot de passe |
|-------|-------------------|--------------|
| Admin | admin@parking.com | admin123     |
| User  | user@parking.com  | user123      |

---

## 📦 Stack

- **React 18** + **Vite**
- **Redux Toolkit** (state management)
- **React Router v6** (navigation)
- **Axios** (API calls avec JWT interceptor)
- **Socket.io-client** (temps réel)
- **Tailwind CSS** (styling)
- **Recharts** (graphiques dashboard)
- **React Hot Toast** (notifications)
- **Lucide React** (icônes)
- **date-fns** (dates)

---

## 🗂️ Pages

| Page          | Route           | Accès     |
|---------------|-----------------|-----------|
| Login         | /login          | Public    |
| Register      | /register       | Public    |
| Dashboard     | /dashboard      | Connecté  |
| Places        | /spots          | Connecté  |
| Réservations  | /reservations   | Connecté  |
| Abonnements   | /subscriptions  | Connecté  |
| Paiements     | /payments       | Connecté  |
| Profil        | /profile        | Connecté  |
| Utilisateurs  | /users          | Admin     |
