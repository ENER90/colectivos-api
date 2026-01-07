import mongoose from "mongoose";
import { User } from "../models/user.model";
import { Passenger } from "../models/passenger.model";
import { Driver } from "../models/driver.model";
import { connectDB } from "../utils/database";

const seedData = async () => {
  try {
    console.log("🌱 Iniciando seed de datos...");

    // Conectar a la base de datos
    await connectDB();

    // Limpiar datos existentes
    console.log("🗑️  Limpiando datos existentes...");
    await User.deleteMany({});
    await Passenger.deleteMany({});
    await Driver.deleteMany({});

    // Crear usuarios pasajeros
    console.log("👤 Creando pasajeros...");
    const passengersData = [
      {
        username: "pasajero1",
        email: "pasajero1@test.com",
        password: "123456",
        role: "passenger" as const,
        status: "online" as const,
      },
      {
        username: "pasajero2",
        email: "pasajero2@test.com",
        password: "123456",
        role: "passenger" as const,
        status: "online" as const,
      },
      {
        username: "pasajero3",
        email: "pasajero3@test.com",
        password: "123456",
        role: "passenger" as const,
        status: "online" as const,
      },
      {
        username: "maria_gomez",
        email: "maria@test.com",
        password: "123456",
        role: "passenger" as const,
        status: "online" as const,
      },
      {
        username: "juan_perez",
        email: "juan@test.com",
        password: "123456",
        role: "passenger" as const,
        status: "online" as const,
      },
    ];

    // Crear usuarios uno por uno para que se ejecute el hook de hash
    const createdPassengerUsers = [];
    for (const passengerData of passengersData) {
      const passenger = new User(passengerData);
      await passenger.save();
      createdPassengerUsers.push(passenger);
    }
    console.log(`✅ ${createdPassengerUsers.length} pasajeros creados`);

    // Crear pasajeros esperando en la Ruta Mapocho-Alameda-San Bernardo
    const waitingPassengers = [
      {
        userId: createdPassengerUsers[0]._id,
        username: createdPassengerUsers[0].username,
        location: {
          type: "Point",
          coordinates: [-70.6567, -33.4269], // Estación Mapocho
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      },
      {
        userId: createdPassengerUsers[1]._id,
        username: createdPassengerUsers[1].username,
        location: {
          type: "Point",
          coordinates: [-70.6529, -33.45], // República (Alameda)
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
      {
        userId: createdPassengerUsers[2]._id,
        username: createdPassengerUsers[2].username,
        location: {
          type: "Point",
          coordinates: [-70.6783, -33.4569], // Estación Central
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
      {
        userId: createdPassengerUsers[3]._id,
        username: createdPassengerUsers[3].username,
        location: {
          type: "Point",
          coordinates: [-70.69, -33.54], // El Parrón
        },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    ];

    const createdWaitingPassengers = await Passenger.insertMany(
      waitingPassengers
    );
    console.log(
      `⏳ ${createdWaitingPassengers.length} pasajeros esperando en la ruta`
    );

    // Crear usuarios conductores
    console.log("🚗 Creando conductores...");
    const driversData = [
      {
        username: "conductor1",
        email: "conductor1@test.com",
        password: "123456",
        role: "driver" as const,
        status: "online" as const,
      },
      {
        username: "conductor2",
        email: "conductor2@test.com",
        password: "123456",
        role: "driver" as const,
        status: "online" as const,
      },
      {
        username: "conductor3",
        email: "conductor3@test.com",
        password: "123456",
        role: "driver" as const,
        status: "online" as const,
      },
      {
        username: "carlos_taxi",
        email: "carlos@test.com",
        password: "123456",
        role: "driver" as const,
        status: "online" as const,
      },
      {
        username: "pedro_colectivo",
        email: "pedro@test.com",
        password: "123456",
        role: "driver" as const,
        status: "online" as const,
      },
    ];

    // Crear usuarios uno por uno para que se ejecute el hook de hash
    const createdDriverUsers = [];
    for (const driverData of driversData) {
      const driver = new User(driverData);
      await driver.save();
      createdDriverUsers.push(driver);
    }
    console.log(`✅ ${createdDriverUsers.length} conductores creados`);

    // Crear conductores activos en la Ruta Mapocho-Alameda-San Bernardo
    const activeDrivers = [
      {
        userId: createdDriverUsers[0]._id,
        username: createdDriverUsers[0].username,
        location: {
          type: "Point",
          coordinates: [-70.6399, -33.4372], // Plaza Italia
        },
        availableSeats: 3,
        status: "available" as const,
      },
      {
        userId: createdDriverUsers[1]._id,
        username: createdDriverUsers[1].username,
        location: {
          type: "Point",
          coordinates: [-70.685, -33.475], // Lo Ovalle (entrada Autopista)
        },
        availableSeats: 4,
        status: "available" as const,
      },
      {
        userId: createdDriverUsers[2]._id,
        username: createdDriverUsers[2].username,
        location: {
          type: "Point",
          coordinates: [-70.683, -33.51], // Gran Avenida
        },
        availableSeats: 2,
        status: "available" as const,
      },
      {
        userId: createdDriverUsers[3]._id,
        username: createdDriverUsers[3].username,
        location: {
          type: "Point",
          coordinates: [-70.695, -33.57], // La Portada
        },
        availableSeats: 4,
        status: "available" as const,
      },
    ];

    const createdActiveDrivers = await Driver.insertMany(activeDrivers);
    console.log(`🚖 ${createdActiveDrivers.length} conductores activos`);

    console.log("\n✨ Seed completado exitosamente!");
    console.log("\n🚖 RUTA: Mapocho → Alameda → San Bernardo");
    console.log("\n📋 Resumen:");
    console.log(`   - ${createdPassengerUsers.length} usuarios pasajeros`);
    console.log(
      `   - ${createdWaitingPassengers.length} pasajeros esperando en la ruta`
    );
    console.log(`   - ${createdDriverUsers.length} usuarios conductores`);
    console.log(
      `   - ${createdActiveDrivers.length} conductores activos en la ruta`
    );
    console.log("\n🔑 Credenciales de prueba:");
    console.log("   Email: pasajero1@test.com / conductor1@test.com");
    console.log("   Password: 123456");
    console.log("\n📍 Paraderos principales:");
    console.log("   - Estación Mapocho (terminal norte)");
    console.log("   - Plaza Italia / República (Alameda)");
    console.log("   - Estación Central");
    console.log("   - Autopista Central (Lo Ovalle, Gran Avenida)");
    console.log("   - San Bernardo (terminal sur)");

    await mongoose.disconnect();
    console.log("\n👋 Desconectado de MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
};

seedData();
