import { Router } from 'express';
import { generateUsers, generatePets } from '../mocks/mocking.js';
import { usersService, petsService } from '../services/index.js';

const router = Router();

// GET /api/mocks/mockingpets - Genera mascotas fake (sin guardar en BD)
router.get('/mockingpets', (req, res) => {
    const quantity = parseInt(req.query.quantity) || 100;
    const pets = generatePets(quantity);

    res.send({
        status: 'success',
        payload: pets,
        count: pets.length
    });
});

// GET /api/mocks/mockingusers - Genera usuarios fake (sin guardar en BD)
router.get('/mockingusers', (req, res) => {
    const quantity = parseInt(req.query.quantity) || 50;
    const users = generateUsers(quantity);

    res.send({
        status: 'success',
        payload: users,
        count: users.length
    });
});

// POST /api/mocks/generateData - Inserta datos fake en la BD
router.post('/generateData', async (req, res) => {
    try {
        const { users = 0, pets = 0 } = req.body;

        const results = {
            usersCreated: 0,
            petsCreated: 0
        };

        // Generar e insertar usuarios
        if (users > 0) {
            const fakeUsers = generateUsers(users);
            for (const user of fakeUsers) {
                await usersService.create(user);
                results.usersCreated++;
            }
        }

        // Generar e insertar mascotas
        if (pets > 0) {
            const fakePets = generatePets(pets);
            for (const pet of fakePets) {
                await petsService.create(pet);
                results.petsCreated++;
            }
        }

        res.send({
            status: 'success',
            message: 'Data generated successfully',
            payload: results
        });
    } catch (error) {
        res.status(500).send({
            status: 'error',
            error: error.message
        });
    }
});

export default router;
