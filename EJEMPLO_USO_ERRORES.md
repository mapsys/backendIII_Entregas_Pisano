# Guía de Uso - Mocking y Manejo de Errores

## 🎯 Endpoints de Mocking Disponibles

### 1. GET /api/mocks/mockingpets
Genera mascotas fake sin guardar en base de datos.

**Query Params:**
- `quantity` (opcional, default: 100) - Cantidad de mascotas a generar

**Ejemplo:**
```bash
curl http://localhost:8080/api/mocks/mockingpets?quantity=10
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": [
    {
      "name": "Golden Retriever",
      "specie": "dog",
      "birthDate": "2018-05-12T00:00:00.000Z",
      "adopted": false,
      "image": "https://loremflickr.com/640/480?lock=1234"
    }
  ],
  "count": 10
}
```

---

### 2. GET /api/mocks/mockingusers
Genera usuarios fake sin guardar en base de datos.

**Query Params:**
- `quantity` (opcional, default: 50) - Cantidad de usuarios a generar

**Ejemplo:**
```bash
curl http://localhost:8080/api/mocks/mockingusers?quantity=5
```

**Respuesta:**
```json
{
  "status": "success",
  "payload": [
    {
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan.perez@example.com",
      "password": "hashed_password_here",
      "role": "user",
      "pets": []
    }
  ],
  "count": 5
}
```

---

### 3. POST /api/mocks/generateData
Genera e INSERTA datos fake en la base de datos.

**Body:**
```json
{
  "users": 10,
  "pets": 50
}
```

**Ejemplo:**
```bash
curl -X POST http://localhost:8080/api/mocks/generateData \
  -H "Content-Type: application/json" \
  -d '{"users": 10, "pets": 50}'
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Data generated successfully",
  "payload": {
    "usersCreated": 10,
    "petsCreated": 50
  }
}
```

---

## 🛡️ Uso del Manejador de Errores

### Clases de Errores Disponibles

Importa desde `src/utils/errors.js`:

```javascript
import {
  NotFoundError,      // 404
  BadRequestError,    // 400
  UnauthorizedError,  // 401
  InternalServerError // 500
} from '../utils/errors.js';
```

### Ejemplo: Refactorizar adoptions.controller.js

**ANTES:**
```javascript
const createAdoption = async(req,res)=>{
    const {uid,pid} = req.params;
    const user = await usersService.getUserById(uid);
    if(!user) return res.status(404).send({status:"error", error:"user Not found"});
    const pet = await petsService.getBy({_id:pid});
    if(!pet) return res.status(404).send({status:"error",error:"Pet not found"});
    if(pet.adopted) return res.status(400).send({status:"error",error:"Pet is already adopted"});
    // ... resto del código
}
```

**DESPUÉS:**
```javascript
import { NotFoundError, BadRequestError } from '../utils/errors.js';

const createAdoption = async(req,res,next)=>{
    try {
        const {uid,pid} = req.params;
        const user = await usersService.getUserById(uid);
        if(!user) throw new NotFoundError("User not found");

        const pet = await petsService.getBy({_id:pid});
        if(!pet) throw new NotFoundError("Pet not found");

        if(pet.adopted) throw new BadRequestError("Pet is already adopted");

        user.pets.push(pet._id);
        await usersService.update(user._id,{pets:user.pets})
        await petsService.update(pet._id,{adopted:true,owner:user._id})
        await adoptionsService.create({owner:user._id,pet:pet._id})
        res.send({status:"success",message:"Pet adopted"})
    } catch (error) {
        next(error); // Pasa el error al middleware
    }
}
```

### Ventajas:
1. ✅ Código más limpio (sin múltiples `res.status().send()`)
2. ✅ Errores manejados centralizadamente
3. ✅ Formato consistente en todas las respuestas de error
4. ✅ Fácil de mantener y extender

---

## 🧪 Testing con Datos Fake

### Caso de Uso 1: Testear con muchos datos
```javascript
// Generar 1000 mascotas para probar performance
GET /api/mocks/mockingpets?quantity=1000

// Ver cómo responde la API con muchos datos
GET /api/pets
```

### Caso de Uso 2: Poblar BD de desarrollo
```javascript
// Crear datos de prueba para desarrollar
POST /api/mocks/generateData
{
  "users": 20,
  "pets": 100
}

// Ahora tenés 20 usuarios y 100 mascotas para probar adopciones
POST /api/adoptions/:uid/:pid
```

### Caso de Uso 3: Testing automatizado
```javascript
// En tus tests con Mocha/Chai
describe('Pets API', () => {
  it('should return mocked pets', async () => {
    const res = await request(app)
      .get('/api/mocks/mockingpets?quantity=10');

    expect(res.body.count).to.equal(10);
    expect(res.body.payload).to.be.an('array');
  });
});
```

---

## 📋 Checklist de Implementación

- [x] Instalar @faker-js/faker
- [x] Crear módulo de mocking (src/mocks/mocking.js)
- [x] Crear clases de errores (src/utils/errors.js)
- [x] Crear middleware de errores (src/middlewares/errorHandler.js)
- [x] Crear router de mocks (src/routes/mocks.router.js)
- [x] Integrar en app.js
- [ ] Configurar URL de MongoDB
- [ ] Refactorizar controllers existentes para usar errores personalizados
- [ ] Crear tests que usen los endpoints de mocking

---

## 🎓 Conceptos Aprendidos

1. **Mocking**: Generar datos falsos pero realistas para testing
2. **Faker**: Librería para crear datos aleatorios (nombres, emails, fechas, etc.)
3. **Error Handling Centralizado**: Un solo lugar para manejar todos los errores
4. **Custom Errors**: Crear clases de errores específicas para diferentes casos
5. **Middleware Pattern**: Usar middlewares de Express para funcionalidad transversal

---

## 🚀 Próximos Pasos

1. Configurá tu URL de MongoDB en `app.js`
2. Iniciá el servidor: `npm start`
3. Probá los endpoints de mocking con Postman o curl
4. Refactorizá tus controllers existentes para usar los errores personalizados
5. Creá tests que aprovechen los datos fake
