
const { Types: {ObjectId} } = require('mongoose');
const mockingoose = require('mockingoose');

const gymController = require('../controllers/gymController');
const machineController = require('../controllers/machineController');
const trainerController = require('../controllers/trainerController');
const userController = require('../controllers/userController');

const Gym = require('../models/Gym');
const Machine = require('../models/Machine');
const Trainer = require('../models/Trainer');
const User = require('../models/User');




const TestResponse = require('./test-response');

jest.setTimeout(60000);



/* -------------------- GYMS -------------------- */
describe('Gym routes', () => {
  test('GET /gyms -> getAllGyms', async () => {
    const gyms = [{
    _id: '64a7f0f4f0f0f0f0f0f0f0f0',
    name: 'Iron Temple Frankfurt',
    city: 'Frankfurt',
  }];

  mockingoose(Gym).toReturn(gyms, 'find');
  const req = {};
  const res = new TestResponse();

  await gymController.getAllGyms(req, res);

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.data)).toBe(true);
  expect(res.data).toHaveLength(1);
  expect(res.data[0].name).toBe('Iron Temple Frankfurt');
  });

   test('GET /gyms/:id -> getGymById', async () => {
    const id = '64a7f0f4f0f0f0f0f0f0f0f1';
    const gymDoc = {
      _id: id,
      name: 'Berlin Powerhouse',
      city: 'Berlin',
      country: 'Germany',
    };
    // findById maps to 'findOne' in mockingoose
    mockingoose(Gym).toReturn(gymDoc, 'findOne');

    const req = { params: { id: id.toString() } };
    const res = new TestResponse();

    await gymController.getGymById(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data).toBeDefined();
    expect(res.data._id.toString()).toBe(id.toString());
    expect(res.data.name).toBe('Berlin Powerhouse');
  });

  test('GET /gyms/by-machine/:machineId -> getGymsByMachine', async () => {
    const machineId = '64a7f0f4f0f0f0f0f0f0f0f2';
    const gyms = [
      {
        _id: '64a7f0f4f0f0f0f0f0f0f0f3',
        name: 'Mainhattan Fitness',
        city: 'Frankfurt',
        machines: [{ machine: machineId, quantity: 4 }],
      },
    ];
    mockingoose(Gym).toReturn(gyms, 'find');

    const req = { params: { machineId: machineId.toString() }, query: {} };
    const res = new TestResponse();

    await gymController.getGymsByMachine(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data[0].name).toBe('Mainhattan Fitness');
  });
});

describe('Machine routes', () => {
  test('GET /machines/:id -> getMachineById', async () => {
    const id = '64a7f0f4f0f0f0f0f0f0f0f4';
    const machine = {
      _id: id,
      name: 'Treadmill Pro 3000',
      brand: 'TechnoGym',
      type: 'cardio',
    };
    mockingoose(Machine).toReturn(machine, 'findOne');

    const req = { params: { id: id.toString() } };
    const res = new TestResponse();

    await machineController.getMachineById(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.data._id.toString()).toBe(id.toString());
    expect(res.data.name).toBe('Treadmill Pro 3000');
  });

  test('GET /machines -> listMachines', async () => {
    const machines = [
      { _id:  '64a7f0f4f0f0f0f0f0f0f0f5', name: 'Treadmill Pro 3000', type: 'cardio' },
      { _id:  '64a7f0f4f0f0f0f0f0f0f0f6', name: 'Lat Pulldown Station', type: 'strength' },
    ];
    mockingoose(Machine).toReturn(machines, 'find');

    mockingoose(Machine).toReturn(machines.length, 'countDocuments');

    const req = { query: { page: '1', limit: '100' } };
    const res = new TestResponse();

    await machineController.listMachines(req, res); 

    expect(res.statusCode).toBe(200);

    if (Array.isArray(res.data)) {
      expect(res.data.length).toBe(2);
    } else {
      expect(Array.isArray(res.data.items)).toBe(true);
      expect(res.data.items.length).toBe(2);
    }
  });
});

describe('Trainer routes', () => {
  test('GET /trainers?city=Frankfurt -> listByCity', async () => {
    const trainers = [
      {
        _id:  '64a7f0f4f0f0f0f0f0f0f0f7',
        headline: 'Strength & Rehab',
        baseCity: 'Frankfurt',
        baseCountry: 'Germany',
        ratingAvg: 4.8,
        ratingCount: 20,
      },
    ];
    mockingoose(Trainer).toReturn(trainers, 'find');

    const req = { query: { city: 'Frankfurt', country: 'Germany' } };
    const res = new TestResponse();

    await trainerController.listByCity(req, res);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBe(1);
    expect(res.data[0].baseCity).toBe('Frankfurt');
  });
});







describe('User routes', () => {
  test('GET /users -> getAllUsers returns names as provided', async () => {
  const users = [
    { _id: '64a7f0f4f0f0f0f0f0f0f0f1', firstName: 'Alice', lastName: 'Anderson', email: 'alice@example.com' },
  ];
  mockingoose(User).toReturn(users, 'find');

  const req = {};
  const res = new TestResponse();

  await userController.getAllUsers(req, res);

  expect(res.statusCode).toBe(200);
  expect(res.data).toHaveLength(1);
  expect(res.data[0].firstName).toBe('Alice');  
});


  test('GET /users/:id -> getUserById (found)', async () => {
    const id = new ObjectId().toString();
    const user = { _id:id, firstName: 'Charlie', lastName: 'Anderson', email: 'charlie@example.com' };


    mockingoose(User).toReturn(user, 'findOne');

    const req = { params: { id } };
    const res = new TestResponse();

    await userController.getUserById(req, res);

    expect(res.statusCode).toBe(200);
    
    expect(String(res.data._id)).toBe(id);
    expect(res.data.firstName).toBe('Charlie');
  });
  });