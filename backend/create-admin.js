import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@dee.com' }
    });

    if (existing) {
      console.log('❌ Admin user already exists!');
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'System Admin',
        email: 'admin@dee.com',
        passwordHash: passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔐 Password: Admin@123');
    console.log('👤 Role:', admin.role);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();