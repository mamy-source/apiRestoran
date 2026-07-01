Endpoints API

Authentification
Méthode	Endpoint	Description
POST	/api/auth/register	Inscription
POST	/api/auth/login	Connexion
POST	/api/auth/refresh-token	Rafraîchir token
POST	/api/auth/logout	Déconnexion
GET	/api/auth/profile	Profil

Utilisateurs
Méthode	Endpoint	Description	Auth
GET	/api/users/profile	Mon profil	
PUT	/api/users/profile	Mettre à jour profil	
DELETE	/api/users/profile/avatar	Supprimer avatar	
GET	/api/users	Lister utilisateurs	ADMIN
GET	/api/users/:id	Détail utilisateur	ADMIN
PUT	/api/users/:id/role	Changer rôle	ADMIN
DELETE	/api/users/:id	Supprimer	ADMIN

Catégories
Méthode	Endpoint	Description	Auth
GET	/api/categories	Lister	Public
GET	/api/categories/:id	Détail	Public
POST	/api/categories	Créer	ADMIN/MANAGER
PUT	/api/categories/:id	Modifier	ADMIN/MANAGER
DELETE	/api/categories/:id	Supprimer	ADMIN/MANAGER

Menus
Méthode	Endpoint	Description	Auth
GET	/api/menus	Lister	Public
GET	/api/menus/:id	Détail	Public
GET	/api/menus/category/:categoryId	Par catégorie	Public
POST	/api/menus	Créer	ADMIN/MANAGER
PUT	/api/menus/:id	Modifier	ADMIN/MANAGER
DELETE	/api/menus/:id	Supprimer	ADMIN/MANAGER

Commandes
Méthode	Endpoint	Description	Auth
POST	/api/orders	Créer	Optional
GET	/api/orders	Lister	WAITER+
GET	/api/orders/my-orders	Mes commandes	
GET	/api/orders/:id	Détail	
PATCH	/api/orders/:id/status	Changer statut	
POST	/api/orders/:id/cancel	Annuler	

Paiements
Méthode	Endpoint	Description	Auth
POST	/api/payments/order/:orderId	Créer paiement	
GET	/api/payments/order/:orderId	Par commande	
PATCH	/api/payments/:paymentId/process	Traiter	CASHIER+

Factures
Méthode	Endpoint	Description	Auth
POST	/api/invoices/order/:orderId	Générer	CASHIER+
GET	/api/invoices/order/:orderId	Par commande	
GET	/api/invoices/:id/download	Télécharger PDF	
GET	/api/invoices/order/:orderId/print	Imprimer direct	
Paramètres de requête:

text
?format=POS|THERMAL|A4|A5    # Format du PDF
&action=view|print|download  # Action souhaitée

Exports en Excel (ADMIN)
Méthode	Endpoint	Description
POST	/api/exports-excel/orders	Exporter commandes Excel
POST	/api/exports-excel/products	Exporter produits Excel
POST	/api/exports-excel/users	Exporter utilisateurs Excel
DELETE /api/exports-excel/:filename  Supprimer un fichier exporté
GET /api/exports-excel/download/:filename  Telecharger un fichier excel

Audit Logs (ADMIN)
Méthode	Endpoint	Description
GET	/api/audit-logs	Lister logs
GET	/api/audit-logs/statistics	Statistiques
GET	/api/audit-logs/clean	Nettoyer

Formats de facture
Format	Taille	Utilisation
POS	80mm	Imprimante thermique 80mm
THERMAL	58mm	Imprimante thermique 58mm
A4	210×297mm	Impression bureau
A5	148×210mm	Demi-page

Audit Logs
Le système enregistre automatiquement toutes les actions importantes.

Exemple de réponse:

json
{
  "id": "uuid",
  "user": {
    "fullName": "Jhane",
    "email": "admin@resto.com",
    "role": "ADMIN"
  },
  "action": "DELETE",
  "entity": "Category",
  "entityId": "uuid",
  "details": {
    "entityName": "Plats principaux"
  },
  "message": "Mie kely a supprimé Category \"Plats principaux\" (ID: uuid)",
  "createdAt": "2024-01-01T00:00:00.000Z"
}