import mongoose from 'mongoose';
import supertest from 'supertest';
import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../src/app.js';
import {
  cleanupDB,
  createPetInDB,
  createMultiplePetsInDB,
  generatePetData,
  isValidObjectId,
  generateInvalidObjectId,
  generateNonExistentObjectId,
  petExistsInDB,
  getPetFromDB,
  createUserInDB,
} from './helpers/test.helper.js';

const request = supertest(app);

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('E2E Tests - Pets Router', () => {
  // Setup: Limpiar BD antes de cada test
  beforeEach(async () => {
    await cleanupDB();
  });

  // Cleanup: Limpiar BD despues de todos los tests
  after(async () => {
    await cleanupDB();
  });

  // ============================================
  // GET /api/pets - Obtener todas las mascotas
  // ============================================
  describe('GET /api/pets', () => {
    it('Debe retornar array vacio cuando no hay mascotas', async () => {
      const response = await request.get('/api/pets');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload).to.have.lengthOf(0);
    });

    it('Debe retornar todas las mascotas existentes', async () => {
      // Crear 3 mascotas en la BD
      await createMultiplePetsInDB(3);

      const response = await request.get('/api/pets');

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.be.an('array');
      expect(response.body.payload).to.have.lengthOf(3);
    });

    it('Debe retornar mascotas con estructura correcta', async () => {
      await createPetInDB({ name: 'Firulais', specie: 'Perro' });

      const response = await request.get('/api/pets');
      const pet = response.body.payload[0];

      expect(pet).to.have.property('_id');
      expect(pet).to.have.property('name');
      expect(pet).to.have.property('specie');
      expect(pet).to.have.property('adopted');
    });
  });

  // ============================================
  // POST /api/pets - Crear mascota
  // ============================================
  describe('POST /api/pets', () => {
    it('Debe crear mascota con datos completos', async () => {
      const petData = {
        name: 'Firulais',
        specie: 'Perro',
        birthDate: '2020-01-15'
      };

      const response = await request
        .post('/api/pets')
        .send(petData);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.have.property('_id');
      expect(response.body.payload).to.have.property('name', 'Firulais');
      expect(response.body.payload).to.have.property('specie', 'Perro');
    });

    it('Debe retornar error "Incomplete values" si falta name', async () => {
      const petData = {
        specie: 'Perro',
        birthDate: '2020-01-15'
      };

      const response = await request
        .post('/api/pets')
        .send(petData);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('Incomplete values');
    });

    it('Debe retornar error "Incomplete values" si falta specie', async () => {
      const petData = {
        name: 'Firulais',
        birthDate: '2020-01-15'
      };

      const response = await request
        .post('/api/pets')
        .send(petData);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('Incomplete values');
    });

    it('Debe retornar error "Incomplete values" si falta birthDate', async () => {
      const petData = {
        name: 'Firulais',
        specie: 'Perro'
      };

      const response = await request
        .post('/api/pets')
        .send(petData);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('Incomplete values');
    });

    it('Debe crear mascota con adopted=false por defecto', async () => {
      const petData = generatePetData();

      const response = await request
        .post('/api/pets')
        .send(petData);

      expect(response.status).to.equal(200);
      expect(response.body.payload).to.have.property('adopted', false);
    });

    it('Debe crear mascota sin owner asignado por defecto', async () => {
      const petData = generatePetData();

      const response = await request
        .post('/api/pets')
        .send(petData);

      expect(response.status).to.equal(200);
      // El owner puede ser null o no estar presente en la respuesta
      if (response.body.payload.hasOwnProperty('owner')) {
        expect(response.body.payload.owner).to.be.null;
      }
    });
  });

  // ============================================
  // POST /api/pets/withimage - Crear mascota con imagen
  // ============================================
  describe('POST /api/pets/withimage', () => {
    // Crear una imagen de prueba antes de los tests de este bloque
    const testImagePath = path.join(__dirname, 'test-image.png');

    before(() => {
      // Crear un archivo de imagen simple para testing (PNG minimo valido)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
        0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
        0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
        0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngBuffer);
    });

    after(() => {
      // Eliminar la imagen de prueba
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it('Debe crear mascota con imagen correctamente', async () => {
      const response = await request
        .post('/api/pets/withimage')
        .field('name', 'Michi')
        .field('specie', 'Gato')
        .field('birthDate', '2021-06-15')
        .attach('image', testImagePath);

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.payload).to.have.property('_id');
      expect(response.body.payload).to.have.property('name', 'Michi');
      expect(response.body.payload).to.have.property('specie', 'Gato');
    });

    it('Debe guardar la ruta de la imagen en el campo image', async () => {
      const response = await request
        .post('/api/pets/withimage')
        .field('name', 'Firulais')
        .field('specie', 'Perro')
        .field('birthDate', '2020-03-20')
        .attach('image', testImagePath);

      expect(response.status).to.equal(200);
      expect(response.body.payload).to.have.property('image');
      expect(response.body.payload.image).to.be.a('string');
      expect(response.body.payload.image).to.not.be.empty;
    });

    it('Debe retornar error si faltan campos obligatorios', async () => {
      const response = await request
        .post('/api/pets/withimage')
        .field('name', 'Firulais')
        // Falta specie y birthDate
        .attach('image', testImagePath);

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal('error');
      expect(response.body.error).to.equal('Incomplete values');
    });
  });

  // ============================================
  // PUT /api/pets/:pid - Actualizar mascota
  // ============================================
  describe('PUT /api/pets/:pid', () => {
    it('Debe actualizar una mascota existente', async () => {
      const createdPet = await createPetInDB({ name: 'Original' });

      const response = await request
        .put(`/api/pets/${createdPet._id}`)
        .send({ name: 'Actualizado' });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('pet updated');

      // Verificar que se actualizo en la BD
      const updatedPet = await getPetFromDB(createdPet._id.toString());
      expect(updatedPet.name).to.equal('Actualizado');
    });

    it('Debe permitir cambiar adopted de false a true', async () => {
      const createdPet = await createPetInDB({ adopted: false });

      const response = await request
        .put(`/api/pets/${createdPet._id}`)
        .send({ adopted: true });

      expect(response.status).to.equal(200);

      // Verificar en BD
      const updatedPet = await getPetFromDB(createdPet._id.toString());
      expect(updatedPet.adopted).to.be.true;
    });

    it('Debe permitir asignar un owner', async () => {
      const user = await createUserInDB();
      const createdPet = await createPetInDB();

      const response = await request
        .put(`/api/pets/${createdPet._id}`)
        .send({ owner: user._id.toString() });

      expect(response.status).to.equal(200);

      // Verificar en BD
      const updatedPet = await getPetFromDB(createdPet._id.toString());
      expect(updatedPet.owner.toString()).to.equal(user._id.toString());
    });
  });

  // ============================================
  // DELETE /api/pets/:pid - Eliminar mascota
  // ============================================
  describe('DELETE /api/pets/:pid', () => {
    it('Debe eliminar una mascota existente', async () => {
      const createdPet = await createPetInDB();

      const response = await request.delete(`/api/pets/${createdPet._id}`);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('pet deleted');
    });

    it('Debe verificar que la mascota ya no existe en BD despues de eliminar', async () => {
      const createdPet = await createPetInDB();

      await request.delete(`/api/pets/${createdPet._id}`);

      // Verificar que no existe en la BD
      const exists = await petExistsInDB(createdPet._id.toString());
      expect(exists).to.be.false;
    });
  });
});
