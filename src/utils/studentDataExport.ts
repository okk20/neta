import { db, type Student } from './database';
import { getStudentAttendance } from '../components/SimpleAttendance';

// Student-specific export data structure
export interface StudentExportData {
  student: Student;
  scores: Array<{
    id: string;
    subjectId: string;
    subjectName: string;
    classScore: number;
    examScore: number;
    totalScore: number;
    grade: string;
    term: string;
    academicYear: string;
  }>;
  attendance: string;
  guardianInfo: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  exportDate: string;
  exportedBy: string;
}

// Bulk students export data structure
export interface StudentsExportData {
  students: StudentExportData[];
  summary: {
    totalStudents: number;
    activeStudents: number;
    classes: string[];
    exportDate: string;
    exportedBy: string;
  };
  schoolInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

// Export formats
export type StudentExportFormat = 'json' | 'csv' | 'excel' | 'docx';

// Generate grade from score
const generateGrade = (score: number): string => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  return 'F';
};

// Export single student data
export const exportSingleStudent = async (
  studentId: string,
  format: StudentExportFormat = 'json',
  exportedBy: string = 'admin'
): Promise<{ blob: Blob; filename: string }> => {
  try {
    // Get student data
    const students = await db.getAllStudents();
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      throw new Error('Student not found');
    }

    // Get student scores
    const allScores = await db.getAllScores();
    const studentScores = allScores.filter(s => s.studentId === studentId);

    // Get subjects for score mapping
    const allSubjects = await db.getAllSubjects();
    const subjectMap = new Map(allSubjects.map(s => [s.id, s]));

    // Process scores with subject names
    const scores = studentScores.map(score => {
      const subject = subjectMap.get(score.subjectId);
      const totalScore = score.classScore + score.examScore;
      return {
        id: score.id,
        subjectId: score.subjectId,
        subjectName: subject?.name || 'Unknown Subject',
        classScore: score.classScore,
        examScore: score.examScore,
        totalScore,
        grade: generateGrade(totalScore),
        term: score.term,
        academicYear: score.academicYear
      };
    });

    // Get attendance
    const attendance = getStudentAttendance(studentId);

    // Prepare export data
    const exportData: StudentExportData = {
      student,
      scores,
      attendance,
      guardianInfo: {
        name: student.guardianName,
        phone: student.guardianPhone || '',
        email: student.guardianEmail || '',
        address: student.address || ''
      },
      exportDate: new Date().toISOString(),
      exportedBy
    };

    const timestamp = new Date().toISOString().split('T')[0];
    const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');

    switch (format) {
      case 'json':
        return {
          blob: new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }),
          filename: `student_${cleanName}_${timestamp}.json`
        };

      case 'csv':
        const csvContent = generateStudentCSV(exportData);
        return {
          blob: new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
          filename: `student_${cleanName}_${timestamp}.csv`
        };

      case 'excel':
        const excelContent = generateStudentExcel(exportData);
        return {
          blob: new Blob([excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
          filename: `student_${cleanName}_${timestamp}.xlsx`
        };

      case 'docx':
        const docContent = generateStudentDoc(exportData);
        return {
          blob: new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
          filename: `student_${cleanName}_${timestamp}.docx`
        };

      default:
        throw new Error('Unsupported export format');
    }
  } catch (error) {
    console.error('Student export failed:', error);
    throw new Error('Failed to export student data. Please try again.');
  }
};

// Export multiple students
export const exportMultipleStudents = async (
  studentIds: string[],
  format: StudentExportFormat = 'json',
  exportedBy: string = 'admin'
): Promise<{ blob: Blob; filename: string }> => {
  try {
    const studentDataList: StudentExportData[] = [];
    
    for (const studentId of studentIds) {
      const { blob } = await exportSingleStudent(studentId, 'json', exportedBy);
      const text = await blob.text();
      const data: StudentExportData = JSON.parse(text);
      studentDataList.push(data);
    }

    // Get school info
    const schoolSettings = await db.getSetting('schoolSettings');
    
    const exportData: StudentsExportData = {
      students: studentDataList,
      summary: {
        totalStudents: studentDataList.length,
        activeStudents: studentDataList.filter(s => s.student.status === 'active').length,
        classes: [...new Set(studentDataList.map(s => s.student.class))],
        exportDate: new Date().toISOString(),
        exportedBy
      },
      schoolInfo: {
        name: schoolSettings?.schoolName || 'SEMS',
        address: schoolSettings?.address || '',
        phone: schoolSettings?.phone || '',
        email: schoolSettings?.email || ''
      }
    };

    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'json':
        return {
          blob: new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }),
          filename: `students_export_${timestamp}.json`
        };

      case 'csv':
        const csvContent = generateMultipleStudentsCSV(exportData);
        return {
          blob: new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }),
          filename: `students_export_${timestamp}.csv`
        };

      default:
        // For other formats, fall back to JSON
        return {
          blob: new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }),
          filename: `students_export_${timestamp}.json`
        };
    }
  } catch (error) {
    console.error('Multiple students export failed:', error);
    throw new Error('Failed to export students data. Please try again.');
  }
};

// Helper functions for different formats
const generateStudentCSV = (data: StudentExportData): string => {
  let csv = '';
  
  // Student Info
  csv += 'STUDENT INFORMATION\n';
  csv += 'Field,Value\n';
  csv += `"ID","${data.student.id}"\n`;
  csv += `"Name","${data.student.name}"\n`;
  csv += `"Class","${data.student.class}"\n`;
  csv += `"Date of Birth","${data.student.dateOfBirth}"\n`;
  csv += `"Gender","${data.student.gender}"\n`;
  csv += `"Status","${data.student.status}"\n`;
  csv += `"Attendance","${data.attendance}"\n`;
  
  // Guardian Info
  csv += '\nGUARDIAN INFORMATION\n';
  csv += 'Field,Value\n';
  csv += `"Guardian Name","${data.guardianInfo.name}"\n`;
  csv += `"Guardian Phone","${data.guardianInfo.phone}"\n`;
  csv += `"Guardian Email","${data.guardianInfo.email || 'N/A'}"\n`;
  
  // Scores
  csv += '\nSCORES\n';
  csv += 'Subject,Class Score,Exam Score,Total Score,Grade,Term,Academic Year\n';
  data.scores.forEach(score => {
    csv += `"${score.subjectName}","${score.classScore}","${score.examScore}","${score.totalScore}","${score.grade}","${score.term}","${score.academicYear}"\n`;
  });
  
  return csv;
};

const generateStudentExcel = (data: StudentExportData): string => {
  // In a real implementation, this would use a library like xlsx
  // For now, return CSV format as placeholder
  return generateStudentCSV(data);
};

const generateStudentDoc = (data: StudentExportData): string => {
  // In a real implementation, this would use a library like docx
  const content = `
STUDENT RECORD

Student Information:
- ID: ${data.student.id}
- Name: ${data.student.name}
- Class: ${data.student.class}
- Date of Birth: ${data.student.dateOfBirth}
- Gender: ${data.student.gender}
- Status: ${data.student.status}
- Attendance: ${data.attendance}

Guardian Information:
- Name: ${data.guardianInfo.name}
- Phone: ${data.guardianInfo.phone}
- Email: ${data.guardianInfo.email || 'N/A'}
- Address: ${data.guardianInfo.address || 'N/A'}

Academic Scores:
${data.scores.map(score => 
  `- ${score.subjectName}: ${score.totalScore}% (Class: ${score.classScore}, Exam: ${score.examScore}) - Grade ${score.grade} [${score.term}, ${score.academicYear}]`
).join('\n')}

Export Information:
- Exported Date: ${new Date(data.exportDate).toLocaleDateString()}
- Exported By: ${data.exportedBy}

Generated by SEMS - School Examination Management System
"Knowledge is Power"
`;

  return content;
};

const generateMultipleStudentsCSV = (data: StudentsExportData): string => {
  let csv = '';
  
  // Summary
  csv += 'STUDENTS EXPORT SUMMARY\n';
  csv += `"Export Date","${new Date(data.summary.exportDate).toLocaleDateString()}"\n`;
  csv += `"Exported By","${data.summary.exportedBy}"\n`;
  csv += `"Total Students","${data.summary.totalStudents}"\n`;
  csv += `"Active Students","${data.summary.activeStudents}"\n`;
  csv += `"Classes","${data.summary.classes.join(', ')}"\n`;
  
  // All Students Data
  csv += '\nALL STUDENTS\n';
  csv += 'ID,Name,Class,Date of Birth,Gender,Guardian Name,Guardian Phone,Attendance,Status\n';
  
  data.students.forEach(studentData => {
    const s = studentData.student;
    csv += `"${s.id}","${s.name}","${s.class}","${s.dateOfBirth}","${s.gender}","${studentData.guardianInfo.name}","${studentData.guardianInfo.phone}","${studentData.attendance}","${s.status}"\n`;
  });
  
  return csv;
};

// Import student data
export const importStudentData = async (file: File): Promise<boolean> => {
  try {
    const fileContent = await file.text();
    let data: StudentExportData | StudentsExportData;
    
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      data = JSON.parse(fileContent);
    } else {
      throw new Error('Only JSON format is supported for import.');
    }
    
    // Check if it's single student or multiple students
    if ('student' in data) {
      // Single student import
      const studentData = data as StudentExportData;
      
      // Import student
      await db.addStudent(studentData.student);
      
      // Import scores
      for (const score of studentData.scores) {
        await db.addScore({
          id: score.id,
          studentId: studentData.student.id,
          subjectId: score.subjectId,
          classScore: score.classScore,
          examScore: score.examScore,
          term: score.term,
          academicYear: score.academicYear,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Import attendance
      if (studentData.attendance) {
        localStorage.setItem(`attendance_simple_${studentData.student.id}`, studentData.attendance);
      }
      
    } else if ('students' in data) {
      // Multiple students import
      const studentsData = data as StudentsExportData;
      
      for (const studentData of studentsData.students) {
        // Import student
        await db.addStudent(studentData.student);
        
        // Import scores
        for (const score of studentData.scores) {
          await db.addScore({
            id: score.id,
            studentId: studentData.student.id,
            subjectId: score.subjectId,
            classScore: score.classScore,
            examScore: score.examScore,
            term: score.term,
            academicYear: score.academicYear,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        // Import attendance
        if (studentData.attendance) {
          localStorage.setItem(`attendance_simple_${studentData.student.id}`, studentData.attendance);
        }
      }
    } else {
      throw new Error('Invalid import data format.');
    }
    
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};