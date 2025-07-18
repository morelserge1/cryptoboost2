# CryptoBoost

CryptoBoost est une application de trading automatisé de cryptomonnaies avec intelligence artificielle, offrant une interface moderne et sécurisée pour les investisseurs.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités Développées
- **Authentification Complète** : Inscription, connexion avec Supabase
- **Tableau de Bord** : Vue d'ensemble des investissements et profits
- **Gestion de Portefeuille** : Dépôts, retraits, historique des transactions
- **Plans d'Investissement** : Starter, Pro, Expert avec calculs automatiques
- **Panneau Administrateur** : Gestion complète des utilisateurs et fonds
- **Interface Moderne** : UI/UX responsive avec animations

### ⚠️ En Cours de Développement
- Migration complète vers Supabase (base de données persistante)
- Calculs de gains côté serveur
- Notifications en temps réel
- Tests unitaires et d'intégration

## 🛠️ Technologies Utilisées

- **Frontend** : React 18, Vite, TailwindCSS, Framer Motion
- **Backend** : Supabase (PostgreSQL, Auth, Realtime)
- **UI Components** : Radix UI, Shadcn/ui
- **Icons** : Lucide React
- **Hosting** : Replit

## 📦 Installation

1. **Cloner le projet**
```bash
git clone https://github.com/morelserge1/CryptoBoost.git
cd CryptoBoost
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**
   - Créer un projet sur [Supabase](https://supabase.com)
   - Copier les clés dans `.env.local` :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

4. **Initialiser la base de données**
   - Exécuter le script `supabase_schema.sql` dans l'éditeur SQL de Supabase
   - Créer un utilisateur admin par défaut

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🏗️ Architecture

```
src/
├── components/          # Composants UI réutilisables
│   ├── ui/             # Composants de base (shadcn/ui)
│   ├── CryptoWallet.jsx
│   ├── AdminPanel.jsx
│   └── ...
├── contexts/           # Contextes React
│   └── SupabaseAuthContext.jsx
├── hooks/              # Hooks personnalisés
├── lib/                # Utilitaires et clients
│   ├── customSupabaseClient.js
│   └── utils.js
├── screens/            # Pages principales
│   ├── LandingScreen.jsx
│   ├── Dashboard.jsx
│   └── LoginScreen.jsx
└── App.jsx
```

## 🗄️ Base de Données (Supabase)

### Tables Principales
- **users** : Données utilisateurs, rôles, balances
- **transactions** : Historique de toutes les transactions
- **investments** : Plans d'investissement actifs
- **deposits** : Demandes de dépôt
- **withdrawals** : Demandes de retrait
- **settings** : Configuration de l'application

### Sécurité
- Row Level Security (RLS) activé
- Politiques d'accès par rôle (client/admin)
- Authentification sécurisée avec JWT

## 🔧 Configuration de Production

### Variables d'Environnement
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
VITE_SUPABASE_SERVICE_ROLE_KEY=votre-cle-service
```

### Déploiement sur Replit
1. Configurer les variables d'environnement dans les Secrets
2. Utiliser le bouton "Deploy" pour un déploiement statique
3. Configurer les commandes :
   - **Build** : `npm run build`
   - **Start** : `npm run preview`

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Telegram** : [@cryptoboost_support](https://t.me/cryptoboost_support)
- **Email** : support@cryptoboost.com
- **Documentation** : [docs.cryptoboost.com](https://docs.cryptoboost.com)

## 🔐 Sécurité

- Authentification avec Supabase Auth
- Chiffrement des données sensibles
- Validation côté serveur
- Audit des transactions
- Monitoring en temps réel

---

**Version** : 1.0.0 MVP  
**Dernière mise à jour** : Juillet 2025


