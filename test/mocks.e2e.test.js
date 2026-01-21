import supertest from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { cleanupDB } from './helpers/test.helper.js';

const request = supertest(app);

describe('Mocks API - E2E Tests', function() {
    this.timeout(10000);

    let initialUsersCount = 0;
    let initialPetsCount = 0;

    // Test 1: GET /api/mocks/mockingpets
    describe('GET /api/mocks/mockingpets', () => {
        it('Deberia generar 100 mascotas por defecto', async () => {
            const res = await request
                .get('/api/mocks/mockingpets')
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('payload');
            expect(res.body.payload).to.be.an('array');
            expect(res.body.payload).to.have.lengthOf(100);
            expect(res.body).to.have.property('count', 100);

            // Verificar estructura de una mascota
            const pet = res.body.payload[0];
            expect(pet).to.have.property('_id');
            expect(pet._id).to.be.a('string');
            expect(pet).to.have.property('name');
            expect(pet).to.have.property('specie');
            expect(pet).to.have.property('birthDate');
            expect(pet).to.have.property('adopted', false);
            expect(pet).to.have.property('image');
        });

        it('Deberia generar cantidad personalizada de mascotas', async () => {
            const res = await request
                .get('/api/mocks/mockingpets?quantity=25')
                .expect(200);

            expect(res.body.payload).to.have.lengthOf(25);
            expect(res.body.count).to.equal(25);
        });
    });

    // Test 2: GET /api/mocks/mockingusers
    describe('GET /api/mocks/mockingusers', () => {
        it('Deberia generar 50 usuarios por defecto', async () => {
            const res = await request
                .get('/api/mocks/mockingusers')
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('payload');
            expect(res.body.payload).to.be.an('array');
            expect(res.body.payload).to.have.lengthOf(50);
            expect(res.body).to.have.property('count', 50);

            // Verificar estructura de un usuario
            const user = res.body.payload[0];
            expect(user).to.have.property('_id');
            expect(user._id).to.be.a('string');
            expect(user).to.have.property('first_name');
            expect(user).to.have.property('last_name');
            expect(user).to.have.property('email');
            expect(user).to.have.property('password');
            expect(user).to.have.property('role');
            expect(user).to.have.property('pets');

            // Verificar que el password este hasheado
            expect(user.password).to.be.a('string');
            expect(user.password.length).to.be.greaterThan(30);
            expect(user.password).to.include('$2b$');

            // Verificar que role sea user o admin
            expect(['user', 'admin']).to.include(user.role);

            // Verificar que pets sea un array vacio
            expect(user.pets).to.be.an('array');
            expect(user.pets).to.have.lengthOf(0);
        });

        it('Deberia generar cantidad personalizada de usuarios', async () => {
            const res = await request
                .get('/api/mocks/mockingusers?quantity=10')
                .expect(200);

            expect(res.body.payload).to.have.lengthOf(10);
            expect(res.body.count).to.equal(10);
        });
    });

    // Test 3: Obtener conteos iniciales
    describe('Preparacion para POST /generateData', () => {
        it('Deberia obtener el conteo inicial de usuarios', async () => {
            const res = await request
                .get('/api/users')
                .expect(200);

            initialUsersCount = res.body.payload.length;
        });

        it('Deberia obtener el conteo inicial de mascotas', async () => {
            const res = await request
                .get('/api/pets')
                .expect(200);

            initialPetsCount = res.body.payload.length;
        });
    });

    // Test 4: POST /api/mocks/generateData
    describe('POST /api/mocks/generateData', () => {
        it('Deberia insertar usuarios y mascotas en la BD', async () => {
            const res = await request
                .post('/api/mocks/generateData')
                .send({ users: 5, pets: 10 })
                .expect(200);

            expect(res.body).to.have.property('status', 'success');
            expect(res.body).to.have.property('message', 'Data generated successfully');
            expect(res.body).to.have.property('payload');
            expect(res.body.payload).to.have.property('usersCreated', 5);
            expect(res.body.payload).to.have.property('petsCreated', 10);
        });

        it('Deberia manejar solo usuarios', async () => {
            const res = await request
                .post('/api/mocks/generateData')
                .send({ users: 3 })
                .expect(200);

            expect(res.body.payload.usersCreated).to.equal(3);
            expect(res.body.payload.petsCreated).to.equal(0);
        });

        it('Deberia manejar solo mascotas', async () => {
            const res = await request
                .post('/api/mocks/generateData')
                .send({ pets: 7 })
                .expect(200);

            expect(res.body.payload.usersCreated).to.equal(0);
            expect(res.body.payload.petsCreated).to.equal(7);
        });

        it('Deberia manejar body vacio', async () => {
            const res = await request
                .post('/api/mocks/generateData')
                .send({})
                .expect(200);

            expect(res.body.payload.usersCreated).to.equal(0);
            expect(res.body.payload.petsCreated).to.equal(0);
        });
    });

    // Test 5: Verificar insercion en BD
    describe('Verificacion de registros insertados en BD', () => {
        it('Deberia verificar que se insertaron usuarios en la BD', async () => {
            const res = await request
                .get('/api/users')
                .expect(200);

            const newUsersCount = res.body.payload.length;
            const expectedCount = initialUsersCount + 5 + 3;

            expect(newUsersCount).to.equal(expectedCount);
        });

        it('Deberia verificar que se insertaron mascotas en la BD', async () => {
            const res = await request
                .get('/api/pets')
                .expect(200);

            const newPetsCount = res.body.payload.length;
            const expectedCount = initialPetsCount + 10 + 7;

            expect(newPetsCount).to.equal(expectedCount);
        });

        it('Los usuarios insertados deberian tener password hasheado', async () => {
            const res = await request
                .get('/api/users')
                .expect(200);

            const users = res.body.payload;
            const lastUser = users[users.length - 1];

            expect(lastUser.password).to.include('$2b$');
            expect(lastUser.password.length).to.be.greaterThan(30);
        });
    });
});
