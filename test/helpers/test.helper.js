import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

/**
** Funciones comunes a todos los tests
 */

// Constante con password hasheado "coder123"
const HASHED_PASSWORD = bcrypt.hashSync('coder123', 10);

/**
 * Limpia todas las colecciones de la base de datos
 */
export const cleanupDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Genera datos aleatorios para un usuario
 * @returns {Object} - Objeto con datos de usuario
 */
export const generateUserData = () => {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password: 'coder123',
    role: faker.helpers.arrayElement(['user', 'admin']),
  };
};

/**
 * Genera datos aleatorios para una mascota
 * @returns {Object} - Objeto con datos de mascota
 */
export const generatePetData = () => {
  return {
    name: faker.animal.dog(),
    specie: faker.helpers.arrayElement(['Perro', 'Gato', 'Conejo', 'Hamster', 'Loro']),
    birthDate: faker.date.past({ years: 5 }).toISOString().split('T')[0], // Formato YYYY-MM-DD
  };
};

/**
 * Valida que un string sea un ObjectId de MongoDB valido
 * @param {string} id - ID a validar
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
};

/**
 * Genera un ObjectId invalido para testing
 * @returns {string}
 */
export const generateInvalidObjectId = () => {
  return 'invalid-id-123';
};

/**
 * Genera un ObjectId valido que NO existe en la BD
 * @returns {string}
 */
export const generateNonExistentObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

/**
 * Crea un usuario directamente en la BD para testing
 * @param {Object} userData - Datos opcionales del usuario
 * @returns {Object} - Usuario creado con _id
 */
export const createUserInDB = async (userData = {}) => {
  const Users = mongoose.connection.collection('users');

  const user = {
    _id: new mongoose.Types.ObjectId(),
    first_name: userData.first_name || faker.person.firstName(),
    last_name: userData.last_name || faker.person.lastName(),
    email: userData.email || faker.internet.email(),
    password: userData.password || HASHED_PASSWORD,
    role: userData.role || 'user',
    pets: userData.pets || [],
  };

  await Users.insertOne(user);
  return user;
};

/**
 * Crea una mascota directamente en la BD para testing
 * @param {Object} petData - Datos opcionales de la mascota
 * @returns {Object} - Mascota creada con _id
 */
export const createPetInDB = async (petData = {}) => {
  const Pets = mongoose.connection.collection('pets');

  const pet = {
    _id: new mongoose.Types.ObjectId(),
    name: petData.name || faker.animal.dog(),
    specie: petData.specie || 'Perro',
    birthDate: petData.birthDate || faker.date.past({ years: 5 }),
    adopted: petData.adopted || false,
    owner: petData.owner || null,
    image: petData.image || null,
  };

  await Pets.insertOne(pet);
  return pet;
};

/**
 * Crea multiples usuarios en la BD
 * @param {number} count - Cantidad de usuarios a crear
 * @returns {Array} - Array de usuarios creados
 */
export const createMultipleUsersInDB = async (count = 5) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createUserInDB();
    users.push(user);
  }
  return users;
};

/**
 * Crea multiples mascotas en la BD
 * @param {number} count - Cantidad de mascotas a crear
 * @returns {Array} - Array de mascotas creadas
 */
export const createMultiplePetsInDB = async (count = 5) => {
  const pets = [];
  for (let i = 0; i < count; i++) {
    const pet = await createPetInDB();
    pets.push(pet);
  }
  return pets;
};

/**
 * Verifica que un usuario existe en la BD
 * @param {string} userId - ID del usuario
 * @returns {boolean}
 */
export const userExistsInDB = async (userId) => {
  const Users = mongoose.connection.collection('users');
  const user = await Users.findOne({ _id: new mongoose.Types.ObjectId(userId) });
  return user !== null;
};

/**
 * Verifica que una mascota existe en la BD
 * @param {string} petId - ID de la mascota
 * @returns {boolean}
 */
export const petExistsInDB = async (petId) => {
  const Pets = mongoose.connection.collection('pets');
  const pet = await Pets.findOne({ _id: new mongoose.Types.ObjectId(petId) });
  return pet !== null;
};

/**
 * Obtiene un usuario de la BD por su ID
 * @param {string} userId - ID del usuario
 * @returns {Object|null}
 */
export const getUserFromDB = async (userId) => {
  const Users = mongoose.connection.collection('users');
  return await Users.findOne({ _id: new mongoose.Types.ObjectId(userId) });
};

/**
 * Obtiene una mascota de la BD por su ID
 * @param {string} petId - ID de la mascota
 * @returns {Object|null}
 */
export const getPetFromDB = async (petId) => {
  const Pets = mongoose.connection.collection('pets');
  return await Pets.findOne({ _id: new mongoose.Types.ObjectId(petId) });
};

/**
 * Valida la estructura basica de respuesta del API
 * @param {Object} response - Respuesta del API
 * @param {string} expectedStatus - Status esperado ('success' o 'error')
 */
export const validateResponseStructure = (response, expectedStatus = 'success') => {
  if (expectedStatus === 'success') {
    return response.body.status === 'success' &&
           (response.body.payload !== undefined || response.body.message !== undefined);
  } else {
    return response.body.status === 'error' && response.body.error !== undefined;
  }
};

/**
 * Crea una adopcion directamente en la BD para testing
 * @param {Object} adoptionData - Datos de la adopcion (owner y pet IDs)
 * @returns {Object} - Adopcion creada con _id
 */
export const createAdoptionInDB = async (adoptionData = {}) => {
  const Adoptions = mongoose.connection.collection('adoptions');

  const adoption = {
    _id: new mongoose.Types.ObjectId(),
    owner: adoptionData.owner || new mongoose.Types.ObjectId(),
    pet: adoptionData.pet || new mongoose.Types.ObjectId(),
  };

  await Adoptions.insertOne(adoption);
  return adoption;
};

/**
 * Verifica que una adopcion existe en la BD
 * @param {string} adoptionId - ID de la adopcion
 * @returns {boolean}
 */
export const adoptionExistsInDB = async (adoptionId) => {
  const Adoptions = mongoose.connection.collection('adoptions');
  const adoption = await Adoptions.findOne({ _id: new mongoose.Types.ObjectId(adoptionId) });
  return adoption !== null;
};

/**
 * Obtiene una adopcion de la BD por su ID
 * @param {string} adoptionId - ID de la adopcion
 * @returns {Object|null}
 */
export const getAdoptionFromDB = async (adoptionId) => {
  const Adoptions = mongoose.connection.collection('adoptions');
  return await Adoptions.findOne({ _id: new mongoose.Types.ObjectId(adoptionId) });
};

export default {
  cleanupDB,
  generateUserData,
  generatePetData,
  isValidObjectId,
  generateInvalidObjectId,
  generateNonExistentObjectId,
  createUserInDB,
  createPetInDB,
  createMultipleUsersInDB,
  createMultiplePetsInDB,
  userExistsInDB,
  petExistsInDB,
  getUserFromDB,
  getPetFromDB,
  validateResponseStructure,
  createAdoptionInDB,
  adoptionExistsInDB,
  getAdoptionFromDB,
};
