import mongoose from 'mongoose';
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import {
  cleanupDB,
  createUserInDB,
  createPetInDB,
  createAdoptionInDB,
  generateNonExistentObjectId,
  generateInvalidObjectId,
  adoptionExistsInDB,
  getAdoptionFromDB,
  getUserFromDB,
  getPetFromDB,
} from './helpers/test.helper.js';

const request = supertest(app);

describe('E2E Tests - Adoptions Router', () => {
  // Setup: Limpiar BD antes de cada test
  beforeEach(async () => {
    await cleanupDB();
  });

  // Cleanup: Limpiar BD despues de todos los tests
  after(async () => {
    await cleanupDB();
  });

  // ============================================
  // GET /api/adoptions - Obtener todas las adopciones
  // ============================================
  describe('GET /api/adoptions', () => {
    it('Debe retornar array vacio cuando no hay adopciones', async () => {
      const response = await request.get('/api/adoptions');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload).to.have.lengthOf(0);
    });

    it('Debe retornar todas las adopciones existentes', async () => {
      // Crear usuarios y mascotas para las adopciones
      const user1 = await createUserInDB();
      const user2 = await createUserInDB();
      const pet1 = await createPetInDB();
      const pet2 = await createPetInDB();

      // Crear 2 adopciones
      await createAdoptionInDB({ owner: user1._id, pet: pet1._id });
      await createAdoptionInDB({ owner: user2._id, pet: pet2._id });

      const response = await request.get('/api/adoptions');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload).to.have.lengthOf(2);
    });

    it('Debe retornar adopciones con estructura correcta (owner y pet)', async () => {
      const user = await createUserInDB();
      const pet = await createPetInDB();
      await createAdoptionInDB({ owner: user._id, pet: pet._id });

      const response = await request.get('/api/adoptions');
      const adoption = response.body.payload[0];

      expect(adoption).to.have.property('_id');
      expect(adoption).to.have.property('owner');
      expect(adoption).to.have.property('pet');
    });
  });

  // ============================================
  // GET /api/adoptions/:aid - Obtener adopcion por ID
  // ============================================
  describe('GET /api/adoptions/:aid', () => {
    it('Debe obtener una adopcion por ID valido', async () => {
      const user = await createUserInDB();
      const pet = await createPetInDB();
      const adoption = await createAdoptionInDB({ owner: user._id, pet: pet._id });

      const response = await request.get(`/api/adoptions/${adoption._id}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.have.property('_id');
      expect(response.body.payload).to.have.property('owner');
      expect(response.body.payload).to.have.property('pet');
    });

    it('Debe retornar 404 cuando la adopcion no existe', async () => {
      const nonExistentId = generateNonExistentObjectId();

      const response = await request.get(`/api/adoptions/${nonExistentId}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('Adoption not found');
    });

    it('Debe retornar 400 con ID de formato invalido', async () => {
      const invalidId = '123';

      const response = await request.get(`/api/adoptions/${invalidId}`);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
    });
  });

  // ============================================
  // POST /api/adoptions/:uid/:pid - Crear adopcion
  // ============================================
  describe('POST /api/adoptions/:uid/:pid', () => {
    it('Debe crear adopcion exitosamente', async () => {
      const user = await createUserInDB();
      const pet = await createPetInDB({ adopted: false });

      const response = await request.post(`/api/adoptions/${user._id}/${pet._id}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.equal('Pet adopted');
    });

    it('Debe retornar 404 si el usuario no existe', async () => {
      const nonExistentUserId = generateNonExistentObjectId();
      const pet = await createPetInDB();

      const response = await request.post(`/api/adoptions/${nonExistentUserId}/${pet._id}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('user Not found');
    });

    it('Debe retornar 404 si la mascota no existe', async () => {
      const user = await createUserInDB();
      const nonExistentPetId = generateNonExistentObjectId();

      const response = await request.post(`/api/adoptions/${user._id}/${nonExistentPetId}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('Pet not found');
    });

    it('Debe retornar 400 si la mascota ya esta adoptada', async () => {
      const user = await createUserInDB();
      const pet = await createPetInDB({ adopted: true }); // Ya adoptada

      const response = await request.post(`/api/adoptions/${user._id}/${pet._id}`);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('Pet is already adopted');
    });

    it('Debe agregar la mascota al array pets del usuario', async () => {
      const user = await createUserInDB({ pets: [] });
      const pet = await createPetInDB({ adopted: false });

      await request.post(`/api/adoptions/${user._id}/${pet._id}`);

      // Verificar que la mascota fue agregada al array pets del usuario
      const updatedUser = await getUserFromDB(user._id.toString());
      expect(updatedUser.pets).to.be.an('array');
      expect(updatedUser.pets).to.have.lengthOf(1);
      // El elemento puede ser un ObjectId o un objeto con _id
      const petIdInArray = updatedUser.pets[0]._id
        ? updatedUser.pets[0]._id.toString()
        : updatedUser.pets[0].toString();
      expect(petIdInArray).to.equal(pet._id.toString());
    });

    it('Debe cambiar adopted=true en la mascota', async () => {
      const user = await createUserInDB();
      const pet = await createPetInDB({ adopted: false });

      await request.post(`/api/adoptions/${user._id}/${pet._id}`);

      // Verificar que adopted cambio a true
      const updatedPet = await getPetFromDB(pet._id.toString());
      expect(updatedPet.adopted).to.be.true;
    });

    it('Debe asignar el owner en la mascota', async () => {
      const user = await createUserInDB();
      const pet = await createPetInDB({ adopted: false, owner: null });

      await request.post(`/api/adoptions/${user._id}/${pet._id}`);

      // Verificar que el owner fue asignado
      const updatedPet = await getPetFromDB(pet._id.toString());
      expect(updatedPet.owner).to.not.be.null;
      expect(updatedPet.owner.toString()).to.equal(user._id.toString());
    });
  });
});
