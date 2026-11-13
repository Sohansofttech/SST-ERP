import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.notificationRecipient.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.logBookEntry.deleteMany();
  await prisma.mentoringRecord.deleteMany();
  await prisma.resourceBooking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.transportAllocation.deleteMany();
  await prisma.hostelAllocation.deleteMany();
  await prisma.electiveSelection.deleteMany();
  await prisma.electiveCourse.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lmsCourseMaterial.deleteMany();
  await prisma.feeReceipt.deleteMany();
  await prisma.feePayment.deleteMany();
  await prisma.feeInvoiceItem.deleteMany();
  await prisma.feeInvoice.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examAdmitCard.deleteMany();
  await prisma.examSlot.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.assessmentRecord.deleteMany();
  await prisma.campusInOutLog.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.guardianLink.deleteMany();
  await prisma.guardianAccount.deleteMany();
  await prisma.studentDocument.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  const passwordHash = await bcrypt.hash("Password@123", 10);
  const studentPwHash = await bcrypt.hash("Student@123", 10);
  const parentPwHash = await bcrypt.hash("Parent@123", 10);

  // 1. INSTITUTIONS (Tenant isolation)
  const instApex = await prisma.institution.create({
    data: {
      id: "inst_apex",
      code: "APEX-TECH",
      name: "Apex Institute of Technology",
      address: "100 Innovation Boulevard, Tech City, Bangalore 560100",
      phone: "+91 80 2345 6789",
      email: "contact@apex.edu",
      website: "https://apex.edu",
    },
  });

  const instHorizon = await prisma.institution.create({
    data: {
      id: "inst_horizon",
      code: "HORIZON-UNIV",
      name: "Horizon Global University",
      address: "45 Knowledge Park, New Delhi 110001",
      phone: "+91 11 9876 5432",
      email: "info@horizon.edu",
      website: "https://horizon.edu",
    },
  });

  // 2. ACADEMIC YEARS
  const ay2024 = await prisma.academicYear.create({
    data: {
      id: "ay_apex_2024",
      institutionId: instApex.id,
      name: "2024-2025",
      startDate: new Date("2024-07-01"),
      endDate: new Date("2025-05-31"),
      isCurrent: false,
    },
  });

  const ay2025 = await prisma.academicYear.create({
    data: {
      id: "ay_apex_2025",
      institutionId: instApex.id,
      name: "2025-2026",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2026-05-31"),
      isCurrent: true,
    },
  });

  // 3. COURSES & SUBJECTS
  const courseCse = await prisma.course.create({
    data: {
      id: "course_cse",
      institutionId: instApex.id,
      code: "BTECH-CSE",
      name: "B.Tech in Computer Science and Engineering",
      department: "Computer Science",
      totalSemesters: 8,
    },
  });

  const subDbms = await prisma.subject.create({
    data: {
      id: "sub_cs301",
      institutionId: instApex.id,
      courseId: courseCse.id,
      code: "CS301",
      name: "Database Management Systems",
      semester: 5,
      credits: 4,
      syllabus: "Relational model, Normalization, Query optimization, ACID transactions, NoSQL overview.",
    },
  });

  const subOs = await prisma.subject.create({
    data: {
      id: "sub_cs302",
      institutionId: instApex.id,
      courseId: courseCse.id,
      code: "CS302",
      name: "Operating Systems",
      semester: 5,
      credits: 4,
      syllabus: "Process management, Deadlocks, Memory paging, Virtual memory, File systems.",
    },
  });

  const subCn = await prisma.subject.create({
    data: {
      id: "sub_cs303",
      institutionId: instApex.id,
      courseId: courseCse.id,
      code: "CS303",
      name: "Computer Networks",
      semester: 5,
      credits: 3,
      syllabus: "OSI and TCP/IP models, Routing protocols, Transport layer, Network security.",
    },
  });

  const subSe = await prisma.subject.create({
    data: {
      id: "sub_cs304",
      institutionId: instApex.id,
      courseId: courseCse.id,
      code: "CS304",
      name: "Software Engineering & Architecture",
      semester: 5,
      credits: 3,
      syllabus: "Agile methodologies, Design patterns, Microservices, CI/CD, Software testing.",
    },
  });

  const subCloud = await prisma.subject.create({
    data: {
      id: "sub_cs305",
      institutionId: instApex.id,
      courseId: courseCse.id,
      code: "CS305-E",
      name: "Cloud Computing & DevOps (Elective)",
      semester: 5,
      credits: 3,
      isElective: true,
      syllabus: "Virtualization, Containers, Kubernetes, AWS/GCP architectures, Terraform.",
    },
  });

  // 4. USERS & TEACHERS
  const userAdmin = await prisma.user.create({
    data: {
      id: "user_apex_admin",
      institutionId: instApex.id,
      email: "admin@apex.edu",
      passwordHash: passwordHash,
      role: "ADMIN",
      fullName: "Dr. Vikram Seth (Registrar & Admin)",
      phone: "+91 98450 11223",
    },
  });

  const userTeacher1 = await prisma.user.create({
    data: {
      id: "user_teacher_1",
      institutionId: instApex.id,
      email: "prof.sharma@apex.edu",
      passwordHash: passwordHash,
      role: "TEACHER",
      fullName: "Prof. Rajesh Sharma",
      phone: "+91 98450 44556",
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      id: "teacher_1",
      institutionId: instApex.id,
      userId: userTeacher1.id,
      employeeId: "EMP-CSE-042",
      department: "Computer Science",
      designation: "Associate Professor & Senior Mentor",
    },
  });

  // 5. STUDENTS & GUARDIANS (Apex)
  // Student 1: John Doe
  const userStudent1 = await prisma.user.create({
    data: {
      id: "user_student_1",
      institutionId: instApex.id,
      email: "john.doe@student.apex.edu",
      passwordHash: studentPwHash,
      role: "STUDENT",
      fullName: "John Doe",
      phone: "+91 98765 43210",
    },
  });

  const student1 = await prisma.student.create({
    data: {
      id: "student_john_doe",
      institutionId: instApex.id,
      userId: userStudent1.id,
      admissionNumber: "ADM-2023-CS089",
      rollNumber: "23CS089",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("2004-05-15"),
      gender: "MALE",
      bloodGroup: "O+",
      emergencyContact: "+91 98765 43211",
      addressLine: "Flat 402, Green Valley Apartments, Outer Ring Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560103",
      admissionDate: new Date("2023-08-01"),
      currentSemester: 5,
      currentSection: "A",
      status: "ACTIVE",
    },
  });

  // Student 2: Emma Doe (John's sister, for parent multi-child testing!)
  const userStudent2 = await prisma.user.create({
    data: {
      id: "user_student_2",
      institutionId: instApex.id,
      email: "emma.doe@student.apex.edu",
      passwordHash: studentPwHash,
      role: "STUDENT",
      fullName: "Emma Doe",
      phone: "+91 98765 43212",
    },
  });

  const student2 = await prisma.student.create({
    data: {
      id: "student_emma_doe",
      institutionId: instApex.id,
      userId: userStudent2.id,
      admissionNumber: "ADM-2024-CS114",
      rollNumber: "24CS114",
      firstName: "Emma",
      lastName: "Doe",
      dateOfBirth: new Date("2005-09-22"),
      gender: "FEMALE",
      bloodGroup: "A+",
      emergencyContact: "+91 98765 43211",
      addressLine: "Flat 402, Green Valley Apartments, Outer Ring Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560103",
      admissionDate: new Date("2024-08-01"),
      currentSemester: 3,
      currentSection: "B",
      status: "ACTIVE",
    },
  });

  // Student 3: Alex Smith (Unlinked student to test parent IDOR isolation!)
  const userStudent3 = await prisma.user.create({
    data: {
      id: "user_student_3",
      institutionId: instApex.id,
      email: "alex.smith@student.apex.edu",
      passwordHash: studentPwHash,
      role: "STUDENT",
      fullName: "Alex Smith",
      phone: "+91 98765 77777",
    },
  });

  const student3 = await prisma.student.create({
    data: {
      id: "student_alex_smith",
      institutionId: instApex.id,
      userId: userStudent3.id,
      admissionNumber: "ADM-2023-CS044",
      rollNumber: "23CS044",
      firstName: "Alex",
      lastName: "Smith",
      dateOfBirth: new Date("2004-11-10"),
      gender: "MALE",
      bloodGroup: "B+",
      emergencyContact: "+91 98765 88888",
      addressLine: "77 Orchid Street",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
      admissionDate: new Date("2023-08-01"),
      currentSemester: 5,
      currentSection: "A",
      status: "ACTIVE",
    },
  });

  // Parent 1: Robert Doe (Father of John & Emma)
  const userParent1 = await prisma.user.create({
    data: {
      id: "user_parent_1",
      institutionId: instApex.id,
      email: "robert.doe@parent.apex.edu",
      passwordHash: parentPwHash,
      role: "PARENT",
      fullName: "Robert Doe",
      phone: "+91 98765 43211",
    },
  });

  const guardianAccount1 = await prisma.guardianAccount.create({
    data: {
      id: "guardian_robert_doe",
      institutionId: instApex.id,
      userId: userParent1.id,
      fullName: "Robert Doe",
      phone: "+91 98765 43211",
      relationship: "FATHER",
      occupation: "Senior Systems Architect",
      address: "Flat 402, Green Valley Apartments, Outer Ring Road, Bangalore",
    },
  });

  // Link Robert to John Doe
  await prisma.guardianLink.create({
    data: {
      institutionId: instApex.id,
      guardianAccountId: guardianAccount1.id,
      studentId: student1.id,
      relationship: "FATHER",
      isVerified: true,
      isPrimary: true,
      canAccessPortal: true,
    },
  });

  // Link Robert to Emma Doe
  await prisma.guardianLink.create({
    data: {
      institutionId: instApex.id,
      guardianAccountId: guardianAccount1.id,
      studentId: student2.id,
      relationship: "FATHER",
      isVerified: true,
      isPrimary: true,
      canAccessPortal: true,
    },
  });

  // Documents for John Doe
  await prisma.studentDocument.createMany({
    data: [
      {
        studentId: student1.id,
        documentType: "AADHAAR",
        title: "National Identification Card (Aadhaar)",
        fileUrl: "/documents/john_doe_aadhaar.pdf",
        fileSize: 1048576,
      },
      {
        studentId: student1.id,
        documentType: "TRANSCRIPT",
        title: "High School 12th Grade Transcript",
        fileUrl: "/documents/john_doe_12th_transcript.pdf",
        fileSize: 2097152,
      },
    ],
  });

  // 6. PRESERVED ACADEMIC HISTORY (Rule 4)
  // Semester 3 (Historical - 2024-2025)
  const enrollSem3 = await prisma.enrollment.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      academicYearId: ay2024.id,
      courseId: courseCse.id,
      semester: 3,
      section: "A",
      status: "COMPLETED",
      gradePointAverage: 8.75,
      promotionRemarks: "Successfully promoted to Semester 4 with First Class Distinction",
      enrolledDate: new Date("2024-07-15"),
      completedDate: new Date("2024-12-20"),
    },
  });

  // Semester 4 (Historical - 2024-2025)
  const enrollSem4 = await prisma.enrollment.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      academicYearId: ay2024.id,
      courseId: courseCse.id,
      semester: 4,
      section: "A",
      status: "PROMOTED",
      gradePointAverage: 8.92,
      promotionRemarks: "Promoted to Year 3 (Semester 5)",
      enrolledDate: new Date("2025-01-05"),
      completedDate: new Date("2025-05-25"),
    },
  });

  // Semester 5 (Current Active - 2025-2026)
  const enrollSem5 = await prisma.enrollment.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      academicYearId: ay2025.id,
      courseId: courseCse.id,
      semester: 5,
      section: "A",
      status: "ACTIVE",
      enrolledDate: new Date("2025-07-20"),
    },
  });

  // 7. TIMETABLE SLOTS (Daily & Weekly)
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const timetableData = [
    { day: "MONDAY", sub: subDbms, start: "09:00", end: "10:00", room: "LH-201" },
    { day: "MONDAY", sub: subOs, start: "10:15", end: "11:15", room: "LH-201" },
    { day: "MONDAY", sub: subCn, start: "11:30", end: "12:30", room: "LH-203" },
    { day: "MONDAY", sub: subSe, start: "13:30", end: "14:30", room: "LH-201" },
    
    { day: "TUESDAY", sub: subOs, start: "09:00", end: "10:00", room: "LH-201" },
    { day: "TUESDAY", sub: subDbms, start: "10:15", end: "11:15", room: "LH-201" },
    { day: "TUESDAY", sub: subCloud, start: "11:30", end: "12:30", room: "LH-Lab 4" },
    { day: "TUESDAY", sub: subCn, start: "13:30", end: "14:30", room: "LH-203" },

    { day: "WEDNESDAY", sub: subSe, start: "09:00", end: "10:00", room: "LH-201" },
    { day: "WEDNESDAY", sub: subCn, start: "10:15", end: "11:15", room: "LH-203" },
    { day: "WEDNESDAY", sub: subDbms, start: "11:30", end: "12:30", room: "LH-201" },
    { day: "WEDNESDAY", sub: subOs, start: "13:30", end: "14:30", room: "LH-201" },

    { day: "THURSDAY", sub: subCloud, start: "09:00", end: "10:00", room: "LH-Lab 4" },
    { day: "THURSDAY", sub: subDbms, start: "10:15", end: "11:15", room: "LH-201" },
    { day: "THURSDAY", sub: subSe, start: "11:30", end: "12:30", room: "LH-201" },
    { day: "THURSDAY", sub: subOs, start: "13:30", end: "14:30", room: "LH-201" },

    { day: "FRIDAY", sub: subCn, start: "09:00", end: "10:00", room: "LH-203" },
    { day: "FRIDAY", sub: subOs, start: "10:15", end: "11:15", room: "LH-201" },
    { day: "FRIDAY", sub: subDbms, start: "11:30", end: "12:30", room: "LH-201" },
    { day: "FRIDAY", sub: subCloud, start: "13:30", end: "14:30", room: "LH-Lab 4" },
  ];

  for (const slot of timetableData) {
    await prisma.timetableSlot.create({
      data: {
        institutionId: instApex.id,
        courseId: courseCse.id,
        semester: 5,
        section: "A",
        subjectId: slot.sub.id,
        teacherId: teacher1.id,
        dayOfWeek: slot.day,
        startTime: slot.start,
        endTime: slot.end,
        roomNumber: slot.room,
      },
    });
  }

  // 8. ATTENDANCE & IN/OUT REGISTER
  // Generate 40 attendance entries across subjects
  const subjects = [subDbms, subOs, subCn, subSe, subCloud];
  const sampleDates = [
    "2025-10-01", "2025-10-03", "2025-10-06", "2025-10-08",
    "2025-10-10", "2025-10-13", "2025-10-15", "2025-10-17",
    "2025-10-20", "2025-10-22", "2025-10-24", "2025-10-27"
  ];

  for (let d = 0; d < sampleDates.length; d++) {
    const date = new Date(sampleDates[d]);
    for (let s = 0; s < subjects.length; s++) {
      // 90% attendance, occasionally absent or late
      let status = "PRESENT";
      let remarks: string | null = null;
      if (d === 3 && s === 1) {
        status = "ABSENT";
        remarks = "Medical appointment notified";
      } else if (d === 7 && s === 2) {
        status = "LATE";
        remarks = "Late by 10 mins due to rain";
      } else if (d === 10 && s === 0) {
        status = "ABSENT";
        remarks = "Unexcused absence";
      }

      await prisma.attendanceRecord.create({
        data: {
          institutionId: instApex.id,
          studentId: student1.id,
          enrollmentId: enrollSem5.id,
          subjectId: subjects[s].id,
          date: date,
          status: status,
          remarks: remarks,
        },
      });
    }
  }

  // Campus In/Out Register
  await prisma.campusInOutLog.createMany({
    data: [
      {
        institutionId: instApex.id,
        studentId: student1.id,
        logType: "ENTRY",
        timestamp: new Date("2025-11-10T08:42:00Z"),
        gateName: "Main Entrance Gate A",
        verifiedBy: "RFID-SCANNER-01",
      },
      {
        institutionId: instApex.id,
        studentId: student1.id,
        logType: "EXIT",
        timestamp: new Date("2025-11-10T16:45:00Z"),
        gateName: "Main Entrance Gate A",
        verifiedBy: "RFID-SCANNER-02",
      },
      {
        institutionId: instApex.id,
        studentId: student1.id,
        logType: "ENTRY",
        timestamp: new Date("2025-11-11T08:50:00Z"),
        gateName: "East Library Gate",
        verifiedBy: "Guard S. Kumar",
      },
      {
        institutionId: instApex.id,
        studentId: student1.id,
        logType: "EXIT",
        timestamp: new Date("2025-11-11T17:10:00Z"),
        gateName: "Main Entrance Gate A",
        verifiedBy: "RFID-SCANNER-02",
      },
    ],
  });

  // 9. INTERNAL ASSESSMENTS
  await prisma.assessmentRecord.createMany({
    data: [
      {
        institutionId: instApex.id,
        studentId: student1.id,
        enrollmentId: enrollSem5.id,
        subjectId: subDbms.id,
        assessmentName: "Internal Assessment 1",
        maxMarks: 50,
        marksObtained: 46,
        weightage: 20,
        remarks: "Excellent grasp of SQL joins and indexing",
        conductedDate: new Date("2025-09-15"),
      },
      {
        institutionId: instApex.id,
        studentId: student1.id,
        enrollmentId: enrollSem5.id,
        subjectId: subDbms.id,
        assessmentName: "Internal Assessment 2",
        maxMarks: 50,
        marksObtained: 48,
        weightage: 20,
        remarks: "Outstanding project design & ER normalization",
        conductedDate: new Date("2025-10-25"),
      },
      {
        institutionId: instApex.id,
        studentId: student1.id,
        enrollmentId: enrollSem5.id,
        subjectId: subOs.id,
        assessmentName: "Internal Assessment 1",
        maxMarks: 50,
        marksObtained: 42,
        weightage: 20,
        remarks: "Good work on semaphore synchronizations",
        conductedDate: new Date("2025-09-17"),
      },
      {
        institutionId: instApex.id,
        studentId: student1.id,
        enrollmentId: enrollSem5.id,
        subjectId: subCn.id,
        assessmentName: "Internal Assessment 1",
        maxMarks: 50,
        marksObtained: 44,
        weightage: 20,
        remarks: "Clear packet structure explanations",
        conductedDate: new Date("2025-09-19"),
      },
    ],
  });

  // 10. EXAMINATIONS & HALL TICKET / RESULTS
  const examSchedule = await prisma.examSchedule.create({
    data: {
      id: "exam_nov_2025",
      institutionId: instApex.id,
      academicYearId: ay2025.id,
      semester: 5,
      title: "Semester 5 End Semester Examinations — Nov/Dec 2025",
      examType: "FINAL",
      startDate: new Date("2025-11-25"),
      endDate: new Date("2025-12-10"),
      isPublished: true,
    },
  });

  await prisma.examSlot.createMany({
    data: [
      {
        examScheduleId: examSchedule.id,
        subjectCode: "CS301",
        subjectName: "Database Management Systems",
        examDate: new Date("2025-11-25T10:00:00Z"),
        startTime: "10:00",
        endTime: "13:00",
        roomNumber: "Exam Block Hall 3A",
      },
      {
        examScheduleId: examSchedule.id,
        subjectCode: "CS302",
        subjectName: "Operating Systems",
        examDate: new Date("2025-11-28T10:00:00Z"),
        startTime: "10:00",
        endTime: "13:00",
        roomNumber: "Exam Block Hall 3A",
      },
      {
        examScheduleId: examSchedule.id,
        subjectCode: "CS303",
        subjectName: "Computer Networks",
        examDate: new Date("2025-12-02T10:00:00Z"),
        startTime: "10:00",
        endTime: "13:00",
        roomNumber: "Exam Block Hall 2B",
      },
      {
        examScheduleId: examSchedule.id,
        subjectCode: "CS304",
        subjectName: "Software Engineering & Architecture",
        examDate: new Date("2025-12-05T10:00:00Z"),
        startTime: "10:00",
        endTime: "13:00",
        roomNumber: "Exam Block Hall 2B",
      },
    ],
  });

  // Hall Ticket / Admit card
  await prisma.examAdmitCard.create({
    data: {
      institutionId: instApex.id,
      examScheduleId: examSchedule.id,
      studentId: student1.id,
      hallTicketNo: "HT-2025-CS089-NOV",
      isEligible: true,
      qrCodeData: "APEX-EXAM-VERIFY:HT-2025-CS089-NOV:STUDENT-JOHN-DOE:PASS",
    },
  });

  // Past Examination Results (Semester 4 - Preserved!)
  const pastExamSchedule = await prisma.examSchedule.create({
    data: {
      id: "exam_may_2025",
      institutionId: instApex.id,
      academicYearId: ay2024.id,
      semester: 4,
      title: "Semester 4 End Examinations — May 2025",
      examType: "FINAL",
      startDate: new Date("2025-05-10"),
      endDate: new Date("2025-05-25"),
      isPublished: true,
    },
  });

  await prisma.examResult.createMany({
    data: [
      {
        institutionId: instApex.id,
        examScheduleId: pastExamSchedule.id,
        studentId: student1.id,
        subjectId: subDbms.id,
        internalMarks: 48,
        externalMarks: 45,
        totalMarks: 93,
        maxMarks: 100,
        grade: "A+",
        gradePoint: 10.0,
        credits: 4,
        isPassed: true,
      },
      {
        institutionId: instApex.id,
        examScheduleId: pastExamSchedule.id,
        studentId: student1.id,
        subjectId: subOs.id,
        internalMarks: 44,
        externalMarks: 42,
        totalMarks: 86,
        maxMarks: 100,
        grade: "A",
        gradePoint: 9.0,
        credits: 4,
        isPassed: true,
      },
    ],
  });

  // 11. FEES & INVOICES & PAYMENTS & RECEIPTS
  const invoice1 = await prisma.feeInvoice.create({
    data: {
      id: "inv_sem5_tuition",
      institutionId: instApex.id,
      studentId: student1.id,
      enrollmentId: enrollSem5.id,
      invoiceNumber: "INV-2025-001089",
      title: "Semester 5 Academic Tuition & Laboratory Fee",
      totalAmount: 65000,
      paidAmount: 40000,
      outstandingAmount: 25000,
      dueDate: new Date("2025-12-15"),
      status: "PARTIAL",
    },
  });

  await prisma.feeInvoiceItem.createMany({
    data: [
      { invoiceId: invoice1.id, description: "Tuition Fee (Semester 5)", amount: 45000 },
      { invoiceId: invoice1.id, description: "Specialized Laboratory & Software Lab Fee", amount: 15000 },
      { invoiceId: invoice1.id, description: "Digital Library Access & Database Subscriptions", amount: 5000 },
    ],
  });

  // Previous Payment & Generated Receipt
  const payment1 = await prisma.feePayment.create({
    data: {
      id: "pay_sem5_part1",
      institutionId: instApex.id,
      invoiceId: invoice1.id,
      studentId: student1.id,
      amount: 40000,
      paymentMethod: "UPI",
      transactionRef: "UPI-TXN-9988221100",
      gatewayOrderId: "ORDER-APEX-2025-01",
      gatewaySignature: "sig_backend_verified_a1b2c3d4",
      status: "SUCCESS",
      backendVerified: true,
      verifiedAt: new Date("2025-08-10T14:30:00Z"),
    },
  });

  await prisma.feeReceipt.create({
    data: {
      institutionId: instApex.id,
      feePaymentId: payment1.id,
      receiptNumber: "REC-2025-089-A",
      amountPaid: 40000,
      paymentMode: "UPI / Net Banking",
      pdfUrl: "/receipts/REC-2025-089-A.pdf",
    },
  });

  // 12. LMS (MATERIALS, ASSIGNMENTS, QUIZZES)
  await prisma.lmsCourseMaterial.createMany({
    data: [
      {
        institutionId: instApex.id,
        subjectId: subDbms.id,
        title: "Lecture 01 - Relational Database Concepts & Schema Design",
        description: "Covers E-R modeling, entity sets, attributes, and mapping to relational tables.",
        fileUrl: "https://apex.edu/materials/cs301/lecture01.pdf",
        fileType: "PDF",
        fileSizeBytes: 2450000,
        unitNumber: 1,
      },
      {
        institutionId: instApex.id,
        subjectId: subDbms.id,
        title: "Unit 2 Cheatsheet - SQL Advanced Queries & CTEs",
        description: "Window functions, Common Table Expressions, recursive SQL patterns.",
        fileUrl: "https://apex.edu/materials/cs301/unit2_sql_cte.pdf",
        fileType: "PDF",
        fileSizeBytes: 1800000,
        unitNumber: 2,
      },
      {
        institutionId: instApex.id,
        subjectId: subOs.id,
        title: "Chapter 3 - CPU Scheduling Algorithms & Gantt Charts",
        description: "Detailed step-by-step algorithms: FCFS, SJF, Priority, Round Robin.",
        fileUrl: "https://apex.edu/materials/cs302/ch3_scheduling.pdf",
        fileType: "PDF",
        fileSizeBytes: 3100000,
        unitNumber: 3,
      },
    ],
  });

  const assignment1 = await prisma.assignment.create({
    data: {
      institutionId: instApex.id,
      subjectId: subDbms.id,
      title: "Assignment 1: Complex SQL Queries & Index Benchmark",
      description: "Implement query plans on PostgreSQL/SQLite, analyze execution cost with EXPLAIN ANALYZE, and submit the benchmark report.",
      dueDate: new Date("2025-11-20T23:59:59Z"),
      totalPoints: 100,
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      institutionId: instApex.id,
      assignmentId: assignment1.id,
      studentId: student1.id,
      fileUrl: "https://apex.edu/submissions/john_doe_assignment1.pdf",
      textContent: "Here is my completed query plan benchmark with performance diagrams and 3NF decomposition proofs.",
      status: "GRADED",
      score: 95,
      feedback: "Brilliant execution of B-tree vs Hash index comparison.",
    },
  });

  const quiz1 = await prisma.quiz.create({
    data: {
      id: "quiz_dbms_01",
      institutionId: instApex.id,
      subjectId: subDbms.id,
      title: "DBMS Mid-Term Practice Quiz",
      durationMinutes: 20,
      totalPoints: 20,
    },
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz1.id,
        questionText: "Which normal form prohibits transitive dependencies on candidate keys?",
        optionA: "First Normal Form (1NF)",
        optionB: "Second Normal Form (2NF)",
        optionC: "Third Normal Form (3NF)",
        optionD: "Boyce-Codd Normal Form (BCNF)",
        correctOption: "C",
        points: 10,
      },
      {
        quizId: quiz1.id,
        questionText: "In the ACID acronym for database transactions, what does 'I' stand for?",
        optionA: "Integrity",
        optionB: "Isolation",
        optionC: "Independency",
        optionD: "Iteration",
        correctOption: "B",
        points: 10,
      },
    ],
  });

  // 13. ELECTIVES
  const elective1 = await prisma.electiveCourse.create({
    data: {
      institutionId: instApex.id,
      courseId: courseCse.id,
      semester: 5,
      subjectId: subCloud.id,
      capacity: 60,
      enrolledCount: 42,
      description: "Hands-on Cloud native architectures, Docker containers, Kubernetes orchestration, and AWS Lambda serverless functions.",
    },
  });

  await prisma.electiveSelection.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      electiveCourseId: elective1.id,
      status: "APPROVED",
    },
  });

  // 14. CAMPUS SERVICES (HOSTEL & TRANSPORT)
  await prisma.hostelAllocation.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      hostelName: "Kaveri Boys Residency Block B",
      roomNumber: "B-304",
      bedNumber: "Bed 1 (Window Side)",
      wardenName: "Mr. M. Narayanan",
      wardenContact: "+91 94441 22334",
    },
  });

  await prisma.transportAllocation.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      routeName: "Route 12: Whitefield to Campus Express",
      routeNumber: "R-12",
      vehicleNumber: "KA-01-F-4921",
      driverName: "Ramesh Babu",
      driverContact: "+91 97401 55667",
      pickupPoint: "Hope Farm Junction, Whitefield",
      pickupTime: "07:35 AM",
      dropTime: "05:25 PM",
    },
  });

  // 15. EVENTS & RESOURCE BOOKINGS
  await prisma.event.createMany({
    data: [
      {
        institutionId: instApex.id,
        title: "Apex Innovation Summit & Tech Hackathon 2025",
        description: "Annual 36-hour hackathon focusing on AI agents, IoT, and CleanTech solutions with industry mentors.",
        category: "ACADEMIC",
        eventDate: new Date("2025-11-28T09:00:00Z"),
        venue: "Main Auditorium & Computing Center",
        organizer: "Department of Computer Science & Innovation Club",
      },
      {
        institutionId: instApex.id,
        title: "Inter-Collegiate Cultural Festival 'AURA 2025'",
        description: "Three-day music, drama, debate, and fine arts festival featuring college teams across the state.",
        category: "CULTURAL",
        eventDate: new Date("2025-12-18T10:00:00Z"),
        venue: "Open Air Amphitheatre",
        organizer: "Student Cultural Committee",
      },
    ],
  });

  await prisma.resourceBooking.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      resourceType: "LAB_WORKSTATION",
      resourceName: "High-Performance GPU Cluster Workstation #07",
      bookingDate: new Date("2025-11-18"),
      timeSlot: "14:00 - 17:00",
      purpose: "Training deep neural network model for final semester project benchmark.",
      status: "APPROVED",
    },
  });

  // 16. MENTORING (Rule: Private mentoring notes MUST NOT be visible to parents!)
  await prisma.mentoringRecord.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      mentorTeacherId: teacher1.id,
      sessionDate: new Date("2025-10-14T15:00:00Z"),
      topicsDiscussed: "Discussed semester 5 academic targets, GRE preparation roadmap, and internship opportunities.",
      studentActionItems: "Draft portfolio website, complete LeetCode 50 algorithms, submit draft resume to placement cell.",
      followUpDate: new Date("2025-11-14T15:00:00Z"),
      isPrivateNote: false, // Permitted note - visible to student and parent
      mentorNotes: "Student is highly motivated and consistently maintains top 10% class percentile.",
    },
  });

  await prisma.mentoringRecord.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      mentorTeacherId: teacher1.id,
      sessionDate: new Date("2025-10-28T16:00:00Z"),
      topicsDiscussed: "Confidential counselor check-in regarding stress management during midterms.",
      studentActionItems: "Participate in weekend sports activity, balance sleep schedule.",
      followUpDate: new Date("2025-11-20T16:00:00Z"),
      isPrivateNote: true, // STRICTLY PRIVATE: Parent MUST NOT see this!
      mentorNotes: "CONFIDENTIAL NOTE: Student reported temporary exam stress. Reassured and guided through time-blocking techniques.",
    },
  });

  // 17. LOG BOOK
  await prisma.logBookEntry.createMany({
    data: [
      {
        institutionId: instApex.id,
        studentId: student1.id,
        activityType: "PRACTICAL",
        title: "Lab Experiment 4: B-Tree Index Implementation in C++",
        description: "Implemented insertion, node splitting, and ranged binary lookups. Verified zero memory leaks using Valgrind.",
        entryDate: new Date("2025-10-18"),
        hoursSpent: 3.5,
        status: "APPROVED",
        supervisorFeedback: "Correct node balancing logic. Well documented.",
      },
      {
        institutionId: instApex.id,
        studentId: student1.id,
        activityType: "PROJECT",
        title: "Capstone Project Sprint 2: Authentication & RBAC Service",
        description: "Engineered JWT session validation and database multi-tenant isolation middleware.",
        entryDate: new Date("2025-11-04"),
        hoursSpent: 4.0,
        status: "APPROVED",
        supervisorFeedback: "Security boundaries verified. Great architecture.",
      },
    ],
  });

  // 18. FEEDBACK
  await prisma.feedback.create({
    data: {
      institutionId: instApex.id,
      studentId: student1.id,
      category: "INFRASTRUCTURE",
      subject: "Wi-Fi Coverage in Library Reading Hall 3",
      message: "The 5GHz signal drops frequently near the west wing cubicles in Library Hall 3.",
      status: "RESOLVED",
      response: "IT Network team has installed an additional Cisco access point in West Wing. Tested and operational at 150 Mbps.",
      respondedAt: new Date("2025-10-12"),
    },
  });

  // 19. NOTIFICATIONS & RECIPIENTS
  const notif1 = await prisma.notification.create({
    data: {
      institutionId: instApex.id,
      title: "Semester 5 Examination Time Table Published",
      message: "The official timetable for End Semester Examinations November/December 2025 has been released. Check Examinations tab.",
      category: "EXAMINATION",
      audienceRole: "ALL",
    },
  });

  const notif2 = await prisma.notification.create({
    data: {
      institutionId: instApex.id,
      title: "Fee Reminder: Balance Due by Dec 15, 2025",
      message: "Second installment of Semester 5 fees is due on December 15. Please settle online to avoid late fee penalties.",
      category: "FEE",
      audienceRole: "ALL",
    },
  });

  await prisma.notificationRecipient.createMany({
    data: [
      { notificationId: notif1.id, userId: userStudent1.id, isRead: false },
      { notificationId: notif2.id, userId: userStudent1.id, isRead: true, readAt: new Date() },
      { notificationId: notif1.id, userId: userParent1.id, isRead: false },
      { notificationId: notif2.id, userId: userParent1.id, isRead: false },
    ],
  });

  // 20. APPROVAL REQUEST ENGINE (Profile correction demo)
  await prisma.approvalRequest.create({
    data: {
      institutionId: instApex.id,
      userId: userStudent1.id,
      requestType: "PROFILE_CORRECTION",
      title: "Address and Emergency Phone Number Update",
      requestedDataJson: JSON.stringify({
        proposedEmergencyContact: "+91 98765 99999",
        proposedAddressLine: "Flat 402, Green Valley Apartments, Wing B, Outer Ring Road",
        reason: "Family relocated to Wing B of same complex",
      }),
      status: "PENDING",
    },
  });

  // 21. INSTITUTION 2 (HORIZON) DATA FOR TENANT ISOLATION TESTS
  const userHorizonStudent = await prisma.user.create({
    data: {
      id: "user_horizon_student",
      institutionId: instHorizon.id,
      email: "priya.sharma@student.horizon.edu",
      passwordHash: studentPwHash,
      role: "STUDENT",
      fullName: "Priya Sharma",
      phone: "+91 99112 33445",
    },
  });

  const studentHorizon = await prisma.student.create({
    data: {
      id: "student_priya_sharma",
      institutionId: instHorizon.id,
      userId: userHorizonStudent.id,
      admissionNumber: "HOR-2023-EC012",
      rollNumber: "23EC012",
      firstName: "Priya",
      lastName: "Sharma",
      dateOfBirth: new Date("2004-08-19"),
      gender: "FEMALE",
      bloodGroup: "B+",
      admissionDate: new Date("2023-08-01"),
      currentSemester: 5,
      currentSection: "A",
      status: "ACTIVE",
    },
  });

  const userHorizonParent = await prisma.user.create({
    data: {
      id: "user_horizon_parent",
      institutionId: instHorizon.id,
      email: "rajesh.sharma@parent.horizon.edu",
      passwordHash: parentPwHash,
      role: "PARENT",
      fullName: "Rajesh Sharma",
      phone: "+91 99112 33446",
    },
  });

  const guardianHorizon = await prisma.guardianAccount.create({
    data: {
      id: "guardian_rajesh_sharma",
      institutionId: instHorizon.id,
      userId: userHorizonParent.id,
      fullName: "Rajesh Sharma",
      phone: "+91 99112 33446",
      relationship: "FATHER",
      occupation: "Civil Engineer",
    },
  });

  await prisma.guardianLink.create({
    data: {
      institutionId: instHorizon.id,
      guardianAccountId: guardianHorizon.id,
      studentId: studentHorizon.id,
      relationship: "FATHER",
      isVerified: true,
      isPrimary: true,
      canAccessPortal: true,
    },
  });

  console.log("Database seeded successfully with multi-tenant data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
