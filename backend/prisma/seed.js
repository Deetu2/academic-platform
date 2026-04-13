import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageThread.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.material.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.lecturerProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      role: 'ADMIN',
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash
    }
  });

  // Create Lecturers
  const lecturer1 = await prisma.user.create({
    data: {
      role: 'LECTURER',
      name: 'Dr. John Smith',
      email: 'lecturer@test.com',
      passwordHash,
      lecturerProfile: {
        create: {
          department: 'Computer Science',
          bio: 'Professor of Computer Science with 10+ years of experience in software engineering and distributed systems.'
        }
      }
    },
    include: {
      lecturerProfile: true
    }
  });

  const lecturer2 = await prisma.user.create({
    data: {
      role: 'LECTURER',
      name: 'Dr. Sarah Johnson',
      email: 'lecturer2@test.com',
      passwordHash,
      lecturerProfile: {
        create: {
          department: 'Mathematics',
          bio: 'Mathematics professor specializing in calculus and linear algebra.'
        }
      }
    },
    include: {
      lecturerProfile: true
    }
  });

  // Create Students
  const student1 = await prisma.user.create({
    data: {
      role: 'STUDENT',
      name: 'Alice Williams',
      email: 'student@test.com',
      passwordHash,
      studentProfile: {
        create: {
          matricNo: 'STU001',
          level: '300',
          department: 'Computer Science'
        }
      }
    },
    include: {
      studentProfile: true
    }
  });

  const student2 = await prisma.user.create({
    data: {
      role: 'STUDENT',
      name: 'Bob Brown',
      email: 'student2@test.com',
      passwordHash,
      studentProfile: {
        create: {
          matricNo: 'STU002',
          level: '300',
          department: 'Computer Science'
        }
      }
    },
    include: {
      studentProfile: true
    }
  });

  // Create Courses
  const course1 = await prisma.course.create({
    data: {
      lecturerId: lecturer1.lecturerProfile.id,
      title: 'Web Development Fundamentals',
      code: 'CSC301',
      description: 'Introduction to modern web development with HTML, CSS, JavaScript, and React.',
      semester: 'Fall 2024',
      type: 'COMPULSORY',
      joinCode: 'WEB2024A'
    }
  });

  const course2 = await prisma.course.create({
    data: {
      lecturerId: lecturer1.lecturerProfile.id,
      title: 'Database Systems',
      code: 'CSC401',
      description: 'Advanced database concepts including SQL, NoSQL, and database design.',
      semester: 'Fall 2024',
      type: 'SELECTIVE',
      joinCode: 'DB2024B1'
    }
  });

  const course3 = await prisma.course.create({
    data: {
      lecturerId: lecturer2.lecturerProfile.id,
      title: 'Linear Algebra',
      code: 'MAT201',
      description: 'Vector spaces, linear transformations, and matrix theory.',
      semester: 'Fall 2024',
      type: 'COMPULSORY',
      joinCode: 'LINALG24'
    }
  });

  // Create Enrollments
  await prisma.enrollment.create({
    data: {
      courseId: course1.id,
      studentId: student1.studentProfile.id,
      status: 'ACTIVE'
    }
  });

  await prisma.enrollment.create({
    data: {
      courseId: course2.id,
      studentId: student1.studentProfile.id,
      status: 'ACTIVE'
    }
  });

  await prisma.enrollment.create({
    data: {
      courseId: course1.id,
      studentId: student2.studentProfile.id,
      status: 'ACTIVE'
    }
  });

  // Create Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      courseId: course1.id,
      lecturerId: lecturer1.lecturerProfile.id,
      title: 'Build a Personal Portfolio Website',
      description: 'Create a responsive portfolio website using HTML, CSS, and JavaScript. Include at least 3 pages: Home, About, and Projects.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      type: 'ASSIGNMENT'
    }
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      courseId: course2.id,
      lecturerId: lecturer1.lecturerProfile.id,
      title: 'Database Design Project',
      description: 'Design and implement a database for a library management system. Include ERD and SQL scripts.',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      type: 'PROJECT'
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📧 Test Accounts:');
  console.log('Admin: admin@test.com / password123');
  console.log('Lecturer 1: lecturer@test.com / password123');
  console.log('Lecturer 2: lecturer2@test.com / password123');
  console.log('Student 1: student@test.com / password123');
  console.log('Student 2: student2@test.com / password123');
  console.log('\n🔑 Join Codes:');
  console.log(`${course1.title}: ${course1.joinCode}`);
  console.log(`${course2.title}: ${course2.joinCode}`);
  console.log(`${course3.title}: ${course3.joinCode}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
