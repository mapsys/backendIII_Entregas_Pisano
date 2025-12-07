import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Hash de "coder123" generado una sola vez para mejor performance
const HASHED_PASSWORD = bcrypt.hashSync('coder123', 10);

// Genera un usuario fake
export const generateUser = () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
        _id: new mongoose.Types.ObjectId(),
        first_name: firstName,
        last_name: lastName,
        email: faker.internet.email({ firstName, lastName }),
        password: HASHED_PASSWORD,
        role: faker.helpers.arrayElement(['user', 'admin']),
        pets: []
    };
};

// Genera una mascota fake
export const generatePet = () => {
    const species = ['dog', 'cat', 'bird', 'rabbit', 'hamster'];
    const specie = faker.helpers.arrayElement(species);

    let name;
    if (specie === 'dog') {
        name = faker.animal.dog();
    } else if (specie === 'cat') {
        name = faker.animal.cat();
    } else if (specie === 'bird') {
        name = faker.animal.bird();
    } else if (specie === 'rabbit') {
        name = faker.animal.rabbit();
    } else {
        name = faker.animal.rodent();
    }

    return {
        _id: new mongoose.Types.ObjectId(),
        name: name,
        specie: specie,
        birthDate: faker.date.past({ years: 10 }),
        adopted: false,
        image: faker.image.url()
    };
};

// Genera múltiples usuarios
export const generateUsers = (quantity = 50) => {
    const users = [];
    for (let i = 0; i < quantity; i++) {
        users.push(generateUser());
    }
    return users;
};

// Genera múltiples mascotas
export const generatePets = (quantity = 100) => {
    const pets = [];
    for (let i = 0; i < quantity; i++) {
        pets.push(generatePet());
    }
    return pets;
};
