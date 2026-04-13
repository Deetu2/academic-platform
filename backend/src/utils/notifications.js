import prisma from './db.js';

/**
 * Create a notification for a user
 */
export const createNotification = async ({
  userId,
  type,
  title,
  body,
  link = null
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        link
      }
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Notify lecturer when student sends a message
 */
export const notifyLecturerNewMessage = async (courseId, studentName) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lecturer: {
          include: { user: true }
        }
      }
    });

    if (!course) return;

    await createNotification({
      userId: course.lecturer.userId,
      type: 'NEW_MESSAGE',
      title: 'New Course Message',
      body: `${studentName} sent a message in ${course.code}`,
      link: `/messages/${courseId}`
    });
  } catch (error) {
    console.error('Error notifying lecturer:', error);
  }
};

/**
 * Notify lecturer when student submits assignment
 */
export const notifyLecturerNewSubmission = async (assignmentId, studentName) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          include: {
            lecturer: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!assignment) return;

    await createNotification({
      userId: assignment.course.lecturer.userId,
      type: 'NEW_SUBMISSION',
      title: 'New Assignment Submission',
      body: `${studentName} submitted "${assignment.title}"`,
      link: '/lecturer/submissions'
    });
  } catch (error) {
    console.error('Error notifying lecturer:', error);
  }
};

/**
 * Notify all enrolled students when material is uploaded
 */
export const notifyStudentsMaterialUploaded = async (courseId, materialTitle) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: 'ACTIVE'
      },
      include: {
        student: {
          include: { user: true }
        },
        course: true
      }
    });

    const course = enrollments[0]?.course;
    if (!course) return;

    // Create notifications for all enrolled students
    const notifications = enrollments.map(enrollment => ({
      userId: enrollment.student.userId,
      type: 'MATERIAL_UPLOADED',
      title: 'New Course Material',
      body: `New material "${materialTitle}" uploaded in ${course.code}`,
      link: `/student/courses/${courseId}`
    }));

    await prisma.notification.createMany({
      data: notifications
    });
  } catch (error) {
    console.error('Error notifying students:', error);
  }
};

/**
 * Notify all enrolled students when assignment is created
 */
export const notifyStudentsNewAssignment = async (courseId, assignmentTitle) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: 'ACTIVE'
      },
      include: {
        student: {
          include: { user: true }
        },
        course: true
      }
    });

    const course = enrollments[0]?.course;
    if (!course) return;

    const notifications = enrollments.map(enrollment => ({
      userId: enrollment.student.userId,
      type: 'ASSIGNMENT_CREATED',
      title: 'New Assignment',
      body: `New assignment "${assignmentTitle}" in ${course.code}`,
      link: '/student/assignments'
    }));

    await prisma.notification.createMany({
      data: notifications
    });
  } catch (error) {
    console.error('Error notifying students:', error);
  }
};

/**
 * Notify student when their assignment is graded
 */
export const notifyStudentAssignmentGraded = async (submissionId, score) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true
          }
        },
        student: {
          include: { user: true }
        }
      }
    });

    if (!submission) return;

    await createNotification({
      userId: submission.student.userId,
      type: 'GRADE_RELEASED',
      title: 'Assignment Graded',
      body: `Your submission for "${submission.assignment.title}" has been graded: ${score}/100`,
      link: '/student/grades'
    });
  } catch (error) {
    console.error('Error notifying student:', error);
  }
};
