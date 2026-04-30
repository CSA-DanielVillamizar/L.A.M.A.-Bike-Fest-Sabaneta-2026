# L.A.M.A. Bike Fest Sabaneta 2026

Sitio web oficial del **L.A.M.A. Bike Fest Sabaneta 2026**, el festival internacional de motociclismo que se celebra el **27 de junio de 2026** en Sabaneta, Antioquia, Colombia.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 16](https://nextjs.org) — App Router + TypeScript |
| Estilos | [Tailwind CSS 4](https://tailwindcss.com) |
| Animaciones | [Framer Motion 12](https://www.framer-motion.com) |
| ORM | [Prisma 7](https://prisma.io) |
| Base de datos | Azure SQL Database (SQL Server) |
| Hosting | Azure Static Web Apps |
| Deploy | Azure Developer CLI (`azd`) |

---

## Estructura del proyecto

```
├── public/
│   └── images/              # Assets estáticos (logos, video hero, poster)
├── prisma/
│   └── schema.prisma        # Modelos ClubRegistration y SponsorRegistration
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── register/
│   │   │       ├── club/route.ts      # POST /api/register/club
│   │   │       └── sponsor/route.ts   # POST /api/register/sponsor
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── sections/
│   │       ├── HeroSection.tsx       # Video de fondo + countdown
│   │       ├── CountdownTimer.tsx    # Contador regresivo en tiempo real
│   │       ├── InfoSections.tsx      # Secciones informativas del evento
│   │       ├── SponsorsSection.tsx   # Logos de patrocinadores
│   │       ├── RegistrationForms.tsx # Formularios de registro (club / sponsor)
│   │       └── AgendaSection.tsx     # Agenda del evento
│   └── lib/
│       └── prisma.ts                 # Singleton del cliente Prisma
├── .azure/
│   └── deployment-plan.md   # Plan de despliegue en Azure
├── .env.example             # Plantilla de variables de entorno
├── azure.yaml               # Configuración Azure Developer CLI
└── swa-cli.config.json      # Configuración Azure Static Web Apps CLI
```

---

## Requisitos previos

- [Node.js 20+](https://nodejs.org)
- [npm 10+](https://npmjs.com)
- Una instancia de **Azure SQL Database** con acceso de escritura (o cualquier SQL Server compatible)
- (Opcional para despliegue) [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd)

---

## Variables de entorno

Copia el archivo `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión a Azure SQL (formato SQL Server) |

---

## Instalación y desarrollo local

```bash
# Instalar dependencias
npm install

# Generar el cliente de Prisma
npx prisma generate

# Crear tablas en la base de datos configurada
npx prisma db push

# Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción local |
| `npm run lint` | Análisis estático con ESLint |
| `npx prisma generate` | Regenerar el cliente Prisma |
| `npx prisma db push` | Sincronizar el esquema con la base de datos |
| `npx prisma studio` | Explorador visual de la base de datos |

---

## Secciones del sitio

| Sección | ID de ancla | Descripción |
|---------|-------------|-------------|
| Hero | `#inicio` | Video de fondo, título y countdown al evento |
| Info | — | Información sobre exhibición y ambiente del evento |
| Patrocinadores | `#patrocinadores` | Logos de patrocinadores confirmados y slots disponibles |
| Registro | `#registro` | Formularios de registro para clubes y marcas |
| Agenda | `#agenda` | Programa detallado del 27 de junio de 2026 |

---

## Modelos de base de datos

```prisma
model ClubRegistration {
  id                 String   @id @default(uuid())
  clubName           String
  presidentName      String
  motorcycleType     String
  estimatedAttendees Int
  originCity         String
  createdAt          DateTime @default(now())
}

model SponsorRegistration {
  id           String   @id @default(uuid())
  companyName  String
  category     String
  interests    String   // Valores separados por comas
  contactEmail String
  contactPhone String
  createdAt    DateTime @default(now())
}
```

---

## API Endpoints

### `POST /api/register/club`

Registra un club de motociclismo como asistente al evento.

**Body:**

```json
{
  "nombreClub": "string",
  "delegado": "string",
  "ciudad": "string",
  "asistentes": "number",
  "tipoMoto": "string"
}
```

### `POST /api/register/sponsor`

Registra una empresa como patrocinadora del evento.

**Body:**

```json
{
  "empresa": "string",
  "email": "string",
  "telefono": "string",
  "categoria": "string",
  "intereses": ["string"]
}
```

---

## Despliegue en Azure

El proyecto está configurado para desplegarse en:

- **Azure Static Web Apps** (SKU Free) — hosting del sitio
- **Azure SQL Database** — persistencia de registros
- **Resource Group:** `RG-ANIVERSARIOMED2026-PROD`
- **Región:** `East US 2`

Consulta [`.azure/deployment-plan.md`](.azure/deployment-plan.md) para el plan detallado de despliegue.

---

## Patrocinadores confirmados

- Alcaldía de Sabaneta
- Fonda La Molienda Rincón Equino

---

## Evento

**27 de junio de 2026 · Sabaneta, Antioquia, Colombia**

Exhibición · Stands · Música · Hermandad
