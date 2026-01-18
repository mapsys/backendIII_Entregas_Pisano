# API de Adopcion de Mascotas

API REST para gestionar usuarios, mascotas y adopciones. Proyecto desarrollado como parte del curso de Backend III.

## Tecnologias

- **Node.js** - Entorno de ejecucion
- **Express** - Framework web
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticacion
- **Bcrypt** - Encriptacion de passwords
- **Swagger** - Documentacion de API
- **Mocha + Chai + Supertest** - Testing
- **Docker** - Contenedorizacion

## Instalacion Local

1. Clonar el repositorio:
```bash
git clone <url-del-repo>
cd backendIII_Entregas_Pisano
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` en la raiz con las variables de entorno:
```env
MONGO_URL=mongodb://localhost:27017/adoptme
PORT=8080
```

4. Iniciar el servidor:
```bash
npm start
```

El servidor estara disponible en `http://localhost:8080`

## Documentacion Swagger

La documentacion interactiva de la API esta disponible en:

```
http://localhost:8080/docs
```

Modulos documentados:
- Sessions (registro, login, usuario actual)
- Users (CRUD de usuarios)
- Pets (CRUD de mascotas)
- Adoptions (gestion de adopciones)

## Endpoints Principales

### Users
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/users | Obtener todos los usuarios |
| GET | /api/users/:uid | Obtener usuario por ID |
| PUT | /api/users/:uid | Actualizar usuario |
| DELETE | /api/users/:uid | Eliminar usuario |

### Pets
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/pets | Obtener todas las mascotas |
| POST | /api/pets | Crear mascota |
| POST | /api/pets/withimage | Crear mascota con imagen |
| PUT | /api/pets/:pid | Actualizar mascota |
| DELETE | /api/pets/:pid | Eliminar mascota |

### Adoptions
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/adoptions | Obtener todas las adopciones |
| GET | /api/adoptions/:aid | Obtener adopcion por ID |
| POST | /api/adoptions/:uid/:pid | Crear adopcion |

## Tests

El proyecto incluye tests E2E para validar el funcionamiento de los endpoints.

### Ejecutar todos los tests:
```bash
npm run test:all
```

### Ejecutar tests por modulo:
```bash
npm run test:users      # Tests de usuarios
npm run test:pets       # Tests de mascotas
npm run test:adoptions  # Tests de adopciones
npm run test:mocks      # Tests de mocking
```

---

# Docker

## Imagen en DockerHub

La imagen del proyecto esta disponible en DockerHub:

**[mapsys/adoptme-api](https://hub.docker.com/r/mapsys/adoptme-api)**


## Construir la imagen localmente

```bash
docker build -t adoptme-api .
```

## Ejecutar el contenedor

Para ejecutar necesitas tener MongoDB disponible. Podes usar la red host o configurar la URL de MongoDB:

### Opcion 1: Usando red host (conecta a MongoDB local)
```bash
docker run -p 8080:8080 --env MONGO_URL=mongodb://host.docker.internal:27017/adoptme adoptme-api
```

### Opcion 2: Usando docker-compose (recomendado)

Crear archivo `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - MONGO_URL=mongodb://mongo:27017/adoptme
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

Ejecutar:
```bash
docker-compose up
```

## Subir imagen a DockerHub

1. Iniciar sesion en DockerHub:
```bash
docker login
```

2. Etiquetar la imagen:
```bash
docker tag adoptme-api TU_USUARIO/adoptme-api:latest
```

3. Subir la imagen:
```bash
docker push TU_USUARIO/adoptme-api:latest
```

## Descargar y ejecutar desde DockerHub

```bash
docker pull mapsys/adoptme-api:latest
docker run -p 8080:8080 --env MONGO_URL=<tu-mongo-url> mapsys/adoptme-api:latest
```

---

## Estructura del Proyecto

```
├── src/
│   ├── controllers/     # Controladores de rutas
│   ├── dao/             # Data Access Objects
│   ├── docs/            # Documentacion Swagger (YAML)
│   ├── middlewares/     # Middlewares personalizados
│   ├── mocks/           # Generadores de datos mock
│   ├── repository/      # Capa de repositorio
│   ├── routes/          # Definicion de rutas
│   ├── services/        # Capa de servicios
│   └── app.js           # Punto de entrada
├── test/
│   ├── helpers/         # Funciones auxiliares para tests
│   ├── users.e2e.test.js
│   ├── pets.e2e.test.js
│   ├── adoptions.e2e.test.js
│   └── mocks.e2e.test.js
├── Dockerfile
├── .dockerignore
└── package.json
```

## Autor

Proyecto desarrollado para el curso de Backend III - Coderhouse por Mariano Pisano
