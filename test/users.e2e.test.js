import mongoose from 'mongoose';
import supertest from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import {
  cleanupDB,
  createUserInDB,
  createMultipleUsersInDB,
  generateUserData,
  isValidObjectId,
  generateInvalidObjectId,
  generateNonExistentObjectId,
  userExistsInDB,
  getUserFromDB,
} from './helpers/test.helper.js';

const request = supertest(app);

describe('E2E Tests - Users Router', () => {
  // Setup: Limpiar BD antes de cada test
  beforeEach(async () => {
    await cleanupDB();
  });

  // Cleanup: Limpiar BD despues de todos los tests
  after(async () => {
    await cleanupDB();
  });

  // ============================================
  // GET /api/users - Obtener todos los usuarios
  // ============================================
  describe('GET /api/users', () => {
    it('Debe retornar array vacio cuando no hay usuarios', async () => {
      const response = await request.get('/api/users');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload).to.have.lengthOf(0);
    });

    it('Debe retornar todos los usuarios existentes', async () => {
      // Crear 3 usuarios en la BD
      await createMultipleUsersInDB(3);

      const response = await request.get('/api/users');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload).to.have.lengthOf(3);
    });

    it('Debe retornar usuarios con estructura correcta', async () => {
      await createUserInDB();

      const response = await request.get('/api/users');
      const user = response.body.payload[0];

      expect(user).to.have.property('first_name');
      expect(user).to.have.property('last_name');
      expect(user).to.have.property('email');
      expect(user).to.have.property('role');
      expect(user).to.have.property('pets');
      expect(user.pets).to.be.an('array');
    });

    it('Debe incluir campos basicos en los usuarios', async () => {
      await createUserInDB();

      const response = await request.get('/api/users');
      const user = response.body.payload[0];

      expect(user).to.have.property('_id');
      expect(user).to.have.property('email');
      expect(user).to.have.property('first_name');
      expect(user).to.have.property('last_name');
    });
  });

  // ============================================
  // GET /api/users/:uid - Obtener usuario por ID
  // ============================================
  describe('GET /api/users/:uid', () => {
    it('Debe obtener un usuario por ID valido', async () => {
      const createdUser = await createUserInDB({ first_name: 'Juan', last_name: 'Perez' });

      const response = await request.get(`/api/users/${createdUser._id}`);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.have.property('first_name', 'Juan');
      expect(response.body.payload).to.have.property('last_name', 'Perez');
    });

    it('Debe retornar 404 cuando el usuario no existe', async () => {
      const nonExistentId = generateNonExistentObjectId();

      const response = await request.get(`/api/users/${nonExistentId}`);

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('User not found');
    });

    it('Debe retornar 400 con ID de formato invalido', async () => {
      const invalidId = '123';

      const response = await request.get(`/api/users/${invalidId}`);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
    });
  });

  // ============================================
  // PUT /api/users/:uid - Actualizar usuario
  // ============================================
  describe('PUT /api/users/:uid', () => {
    it('Debe actualizar un usuario existente', async () => {
      const createdUser = await createUserInDB({ first_name: 'Original' });

      const response = await request
        .put(`/api/users/${createdUser._id}`)
        .send({ first_name: 'Actualizado' });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('User updated');

      // Verificar que se actualizo en la BD
      const updatedUser = await getUserFromDB(createdUser._id.toString());
      expect(updatedUser.first_name).to.equal('Actualizado');
    });

    it('Debe permitir actualizacion parcial (solo algunos campos)', async () => {
      const createdUser = await createUserInDB({
        first_name: 'Juan',
        last_name: 'Perez',
        email: 'juan@test.com'
      });

      // Solo actualizar el last_name
      const response = await request
        .put(`/api/users/${createdUser._id}`)
        .send({ last_name: 'Garcia' });

      expect(response.status).to.equal(200);

      // Verificar que solo se actualizo last_name
      const updatedUser = await getUserFromDB(createdUser._id.toString());
      expect(updatedUser.first_name).to.equal('Juan'); // No cambio
      expect(updatedUser.last_name).to.equal('Garcia'); // Cambio
    });

    it('Debe retornar 404 si el usuario no existe', async () => {
      const nonExistentId = generateNonExistentObjectId();

      const response = await request
        .put(`/api/users/${nonExistentId}`)
        .send({ first_name: 'Test' });

      expect(response.status).to.equal(404);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('User not found');
    });
  });

  // ============================================
  // DELETE /api/users/:uid - Eliminar usuario
  // ============================================
  describe('DELETE /api/users/:uid', () => {
    it('Debe eliminar un usuario existente', async () => {
      const createdUser = await createUserInDB();

      const response = await request.delete(`/api/users/${createdUser._id}`);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('User deleted');
    });

    it('Debe verificar que el usuario ya no existe en BD despues de eliminar', async () => {
      const createdUser = await createUserInDB();

      await request.delete(`/api/users/${createdUser._id}`);

      // Verificar que no existe en la BD
      const exists = await userExistsInDB(createdUser._id.toString());
      expect(exists).to.be.false;
    });
  });
});
