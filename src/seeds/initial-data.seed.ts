import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserType } from '../user-types/entities/user-type.entity';
import { ExerciseType } from '../exercise-types/entities/exercise-type.entity';
import { Exercise } from '../exercises/entities/exercise.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'ludix',
    entities: [User, UserType, ExerciseType, Exercise],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Conectado a la base de datos');

  // Create user types
  const userTypeRepo = dataSource.getRepository(UserType);
  let adminType = await userTypeRepo.findOneBy({ type: 'admin' });
  if (!adminType) {
    adminType = userTypeRepo.create({
      type: 'admin',
      description: 'Administrador',
    });
    await userTypeRepo.save(adminType);
    console.log('Tipo admin creado');
  }
  let userType = await userTypeRepo.findOneBy({ type: 'user' });
  if (!userType) {
    userType = userTypeRepo.create({
      type: 'user',
      description: 'Usuario normal',
    });
    await userTypeRepo.save(userType);
    console.log('Tipo user creado');
  }

  // 2. Create admin
  const userRepo = dataSource.getRepository(User);
  const adminExists = await userRepo.findOneBy({ email: 'admin@ejemplo.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = userRepo.create({
      email: 'admin@ejemplo.com',
      password: hashedPassword,
      name: 'Administrador',
      userTypeId: adminType.id,
    });
    await userRepo.save(adminUser);
    console.log('Usuario admin creado');
  }

  // Create exercise types
  const exerciseTypeRepo = dataSource.getRepository(ExerciseType);
  const tipos = ['cardio', 'fuerza', 'flexibilidad'];
  for (const tipo of tipos) {
    const exists = await exerciseTypeRepo.findOneBy({ type: tipo });
    if (!exists) {
      await exerciseTypeRepo.save(exerciseTypeRepo.create({ type: tipo }));
      console.log(`Tipo de ejercicio "${tipo}" creado`);
    }
  }

  // Create exercise examples
  const exerciseRepo = dataSource.getRepository(Exercise);
  const cardioType = await exerciseTypeRepo.findOneBy({ type: 'cardio' });
  const fuerzaType = await exerciseTypeRepo.findOneBy({ type: 'fuerza' });
  const flexibilidadType = await exerciseTypeRepo.findOneBy({
    type: 'flexibilidad',
  });

  if (!cardioType || !fuerzaType || !flexibilidadType) {
    throw new Error('One or more exercise types not found');
  }

  const ejercicios = [
    {
      name: 'Correr 5km',
      description: 'Trote suave durante 5 kilómetros',
      duration: 30,
      exerciseTypeId: cardioType.id,
      createdBy: 'admin',
    },
    {
      name: 'Sentadillas',
      description: '3 series de 15 repeticiones',
      duration: 10,
      exerciseTypeId: fuerzaType.id,
      createdBy: 'admin',
    },
    {
      name: 'Estiramiento de piernas',
      description: 'Mantener cada estiramiento 30 segundos',
      duration: 15,
      exerciseTypeId: flexibilidadType.id,
      createdBy: 'admin',
    },
  ];

  for (const ejercicio of ejercicios) {
    const exists = await exerciseRepo.findOneBy({ name: ejercicio.name });
    if (!exists) {
      await exerciseRepo.save(exerciseRepo.create(ejercicio));
      console.log(`Ejercicio "${ejercicio.name}" creado`);
    }
  }

  console.log('Seeding completado');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Error durante el seeding:', error);
  process.exit(1);
});
