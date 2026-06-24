# Restaurant Management API

> API RESTful complète pour la gestion d'un restaurant avec système de commandes, paiements, facturation et audit.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

##  Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [Endpoints API](#-endpoints-api)
- [Formats de facture](#-formats-de-facture)
- [Audit Logs](#-audit-logs)
- [Déploiement](#-déploiement)
- [Auteurs](#-auteurs)

---

##  Fonctionnalités

### Authentification & Sécurité
- Inscription / Connexion / Déconnexion
- JWT avec refresh token
- Système de rôles (ADMIN, MANAGER, WAITER, CHEF, CASHIER, CLIENT, GUEST)
- Rate limiting
- Audit logs complet

### Gestion du Restaurant
- CRUD Utilisateurs
- CRUD Catégories de menus
- CRUD Menus (avec images)
- CRUD Tables

### Commandes & Paiements
- Commandes en ligne et en restaurant
- Gestion des statuts (PENDING, PREPARING, READY, SERVED, PAID, CANCELLED)
- Paiements (Espèces, Carte, Mobile Money)
- Génération de factures PDF (4 formats)

### Media & Export
- Upload et compression d'images (Sharp)
- Export Excel (Commandes, Produits, Utilisateurs)
- Export PDF (Factures)

---

## Technologies

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **Node.js** | 22+ | Runtime |
| **Express.js** | 5.x | Framework API |
| **Prisma** | 7.x | ORM |
| **MySQL** | 8.x | Base de données |
| **JWT** | 9.x | Authentification |
| **Argon2** | 0.31.x | Hashage de mots de passe |
| **Puppeteer** | 23.x | Génération PDF |
| **Handlebars** | 4.x | Templates HTML |
| **Multer** | 1.x | Upload de fichiers |
| **Sharp** | 0.33.x | Optimisation d'images |
| **xlsx** | 0.18.x | Export Excel |
| **Zod** | 3.22.x | Validation |
| **Winston** | 3.11.x | Logging |

---

## Installation

### Prérequis

- Node.js 22+
- MySQL 8+
- PNPM (recommandé) ou NPM

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/votre-repo/api_resto.git
cd api_resto

# 2. Installer les dépendances
pnpm install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Configurer la base de données
# Modifier DATABASE_URL dans .env

# 5. Initialiser la base de données
pnpm prisma generate
pnpm prisma db push

# 6. Lancer le serveur en développement
pnpm run dev

👨‍💻 Auteurs
mamy-source - Développeur principal