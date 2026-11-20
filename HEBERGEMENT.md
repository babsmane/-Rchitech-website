# Hébergement OVH — architech.sn

> Ce fichier n'est pas servi par le site : le `.htaccess` renvoie une erreur 404 pour les fichiers `.md`.

Ce fichier décrit comment le site vitrine et les applications web partagent l'hébergement OVH, et comment ajouter une nouvelle application.

- **Hébergement** : OVH Web Cloud, offre Pro.
- **Service** : `inqbwzm.cluster130.hosting.ovh.net`.

## Architecture

**Un sous-domaine par application.** Chaque application a son propre dossier, son propre certificat SSL et son propre `.htaccess`. Le site vitrine et les applications ne se marchent donc jamais dessus.

| Adresse | Dossier OVH | Contenu | Déploiement |
|---|---|---|---|
| `https://architech.sn` | `www/` | Site vitrine (ce dépôt) | Git OVH, branche `main` |
| `https://www.architech.sn` | `www/` | Redirigé (301) vers `architech.sn` | — |
| `https://stock.architech.sn` | `apps/stock-portal/` | Front-end Stock Portal (Angular) | Script `deploy-ovh.sh` du dépôt stock-portal |
| `https://patient.architech.sn` | `apps/patient-portal/` | Front-end Patient Tracking (Angular) | Script `deploy-ovh.sh` du dépôt patient-tracking_portal |
| `https://<app>.architech.sn` | `apps/<app>/` | Applications suivantes | — |

Les API ne sont pas sur cet hébergement : `api.architech.sn` (Stock Management) et `patient-api.architech.sn` (Patient Tracking) pointent vers le serveur Docker décrit dans le dépôt [architech-infra](https://github.com/babsmane/architech-infra).

> ⚠️ **Ne jamais déposer une application dans `www/`.** Ce dossier est synchronisé avec ce dépôt par le déploiement Git d'OVH : tout fichier qui n'est pas dans le dépôt risque d'être écrasé.

### Le `.htaccess` du site vitrine

Le fichier [`.htaccess`](.htaccess) à la racine de ce dépôt est déployé dans `www/`. Il :

- **impose l'adresse unique `https://architech.sn`** : le HTTP et `www.` sont redirigés en une seule redirection 301 ;
- **bloque les fichiers cachés** (`.git`, `.env`…) et le listing des dossiers ;
- **ajoute les en-têtes de sécurité** : HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` ;
- **règle le cache** (HTML toujours revalidé ; CSS, JS et images pendant 1 mois) **et la compression**.

## Ajouter une nouvelle application

Exemple : une application nommée `crm`, à publier sur `crm.architech.sn`.

### 1. Déclarer le sous-domaine (manager OVH)

1. Ouvrir **Web Cloud** → **Hébergements** → `inqbwzm.cluster130.hosting.ovh.net` → **Mes sites** → **Ajouter un site**.
2. Choisir **Associer un domaine OVHcloud existant**, puis le domaine `architech.sn`.
3. Cocher **Créer un sous-domaine** et saisir `crm`.
4. Activer **Configuration avancée** et saisir le dossier racine **`apps/crm`**. Taper la valeur : le texte grisé n'est qu'un exemple.
5. Laisser **DNS : configuration automatique**, qui crée les enregistrements A et AAAA.
6. Une fois le site ajouté, activer le **SSL** sur la ligne `crm.architech.sn`.
7. Dans l'onglet **Certificats SSL**, cliquer sur **Régénérer**.

Compter quelques minutes pour l'association, puis jusqu'à une heure pour que le certificat soit servi partout.

### 2. Ajouter un `.htaccess` à l'application

- **Application monopage** (Angular, React, Vue) : partir de celui de stock-portal, `public/.htaccess` dans le dépôt [stock-portal](https://github.com/babsmane/stock-portal). Il :
  - force le HTTPS ;
  - renvoie les routes vers `index.html` ;
  - met en cache les fichiers du build pendant 1 an et revalide toujours `index.html` ;
  - ajoute les en-têtes de sécurité.
- **Site statique** : partir du `.htaccess` de ce dépôt, en retirant la redirection vers `architech.sn`.

### 3. Déployer les fichiers

Copier le build dans `apps/crm/` :
- soit par SSH/rsync (offre Pro), sur le modèle de `scripts/deploy-ovh.sh` du dépôt stock-portal ;
- soit par FTP/SFTP.

### 4. Vérifier

```bash
curl -I http://crm.architech.sn          # 301 vers https://
curl -I https://crm.architech.sn         # 200
curl -I https://crm.architech.sn/une/route  # 200 (index.html) pour une SPA
```

## Points d'attention

- **Back-ends Java, Node…** : l'hébergement web OVH n'exécute que du PHP et des fichiers statiques. Les API, comme celle de Stock Management en Spring Boot, doivent être hébergées ailleurs (VPS, Public Cloud…), par exemple sur `api.architech.sn`. L'origine du front doit alors être autorisée dans leur configuration CORS.
- **Certificats** : OVH renouvelle automatiquement les certificats Let's Encrypt. Après l'ajout d'un domaine, il faut cependant cliquer une fois sur **Régénérer**.
- **Fichier `.ovhconfig`** : non utilisé. Il n'est nécessaire que pour changer de version de PHP.
