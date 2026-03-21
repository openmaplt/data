# OpenMap.lt Patrulis

„Patrulis“ – tai specializuotas OpenStreetMap (OSM) duomenų kokybės užtikrinimo ir stebėjimo įrankis, skirtas Lietuvos žemėlapio bendruomenei. 

Ši aplikacija leidžia bendruomenės moderatoriams realiu laiku stebėti naujausius OSM pakeitimus (Changesets), atliktus Lietuvos teritorijoje, įvertinti jų teisingumą ir juos patvirtinti arba atmesti. Detaliai pakeitimų analizei „Patrulis“ naudoja atskirą mikroservisą [OSMHistory](https://osmhistory.openmap.lt).

**Technologijų stekas:**
- **Karkasas:** Next.js (App Router) / React
- **Stilizavimas:** TailwindCSS
- **Duomenų bazė:** PostgreSQL

---

## Kaip paleisti „Patrulį“ lokaliai

Norint paleisti šį projektą savo kompiuteryje (development režimu), atlikite šiuos žingsnius:

### 1. Priklausomybių įdiegimas
Įsitikinkite, kad turite įdiegtą Node.js ir terminale paleiskite komandą:
```bash
npm install
```

### 2. Aplinkos kintamieji (Environment Variables)
Nukopijuokite pavyzdinį kintamųjų failą ir užpildykite reikiamus duomenis (pvz., duomenų bazės prisijungimą):
```bash
cp .env.example .env.local
```
*(Atsidarykite `.env.local` ir įrašykite savo duomenis)*

### 3. Duomenų bazės paruošimas
Įsitikinkite, kad jūsų `.env.local` faile įvestas teisingas prisijungimas prie atviro ar vietinio PostgreSQL serverio.

### 4. Aplikacijos paleidimas
Paleiskite lokalų serverį (dev aplinką):
```bash
npm run dev
```

Dabar galite atsidaryti naršyklę ir eiti adresu: [http://localhost:3000](http://localhost:3000)

---

## Diegimas (Deployment)

Projektas automatiškai publikuojamas produkciniame serveryje naudojant **GitHub Actions** (`.github/workflows/deploy.yml`). 
Kaskart sukūrus naują `v*.*.*` „release“ talpyklą (tag), Git sistema automatiškai sukuria Docker atvaizdą ir perkrauna serverį (Naudojant `docker-compose.prod.yml`).
