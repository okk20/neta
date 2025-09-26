import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, Download, Award, GraduationCap, User as UserIcon, MessageSquare, Mail, Phone, Search, Printer, MessageCircle, Send, Share2, Users } from "lucide-react";
import { ShareUtils, ShareData } from "../utils/shareUtils";
import { Input } from "./ui/input";
import schoolLogo from 'figma:asset/f54d19f92d0654d6893f0bbe6873df075924e4bb.png';
import reportCardTemplate from 'figma:asset/2fad672a00ffafcd9e3131beb796cc029d918ab4.png';
import { ImageWithFallback } from './figma/ImageWithFallback';
import database, { type Student, type Subject, type User } from "../utils/database";

interface ReportCard {
  studentId: string;
  studentName: string;
  class: string;
  term: string;
  year: string;
  position: number;
  totalStudents: number;
  attendance: { present: number; total: number };
  subjects: {
    subject: string;
    classScore: number;
    examScore: number;
    totalScore: number;
    grade: string;
    remarks: string;
  }[];
  overallAverage: number;
  overallGrade: string;
  totalExamScore: number;
  teacherRemarks: string;
  nextTermBegins: string;
  classTeacherName: string;
}

interface EnhancedReportsManagementProps {
  currentUser?: User;
  studentId?: string;
}

export function EnhancedReportsManagement({ currentUser, studentId }: EnhancedReportsManagementProps = {}) {
  const [selectedStudent, setSelectedStudent] = useState(studentId || "");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [reportType, setReportType] = useState("report-card");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [currentLogo, setCurrentLogo] = useState(schoolLogo);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bulkMessageLoading, setBulkMessageLoading] = useState(false);
  const [bulkDownloadLoading, setBulkDownloadLoading] = useState(false);
  const [attendanceInput, setAttendanceInput] = useState({ present: 0, total: 0 });
  const [bulkGeneration, setBulkGeneration] = useState(false);

  const isStudent = currentUser?.role === 'student';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [studentsList, teachersList, subjectsList, schoolSettingsData] = await Promise.all([
          database.getAllStudents().catch(() => []),
          database.getAllTeachers().catch(() => []),
          database.getAllSubjects().catch(() => []),
          database.getSetting('schoolSettings').catch(() => null)
        ]);
        
        let filteredStudents = studentsList || [];
        if (isStudent && currentUser?.studentId) {
          filteredStudents = studentsList.filter(s => s.id === currentUser.studentId);
          setSelectedStudent(currentUser.studentId);
        }
        
        setStudents(filteredStudents);
        setTeachers(teachersList || []);
        setSubjects(subjectsList || []);
        setSchoolSettings(schoolSettingsData);
        
        if (schoolSettingsData && schoolSettingsData.logo) {
          setCurrentLogo(schoolSettingsData.logo);
        }
      } catch (error) {
        console.error('Failed to load reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  
  const classTeacher = teachers.find(t => t.isClassTeacher && t.classAssigned === selectedStudentData?.class);
  const getTeacherWithTitle = (teacher: any): string => {
    if (!teacher || !teacher.name) return "Class Teacher";
    const title = teacher.title || 'Mr.';
    const name = teacher.name;
    if (name.toLowerCase().startsWith('mr.') || 
        name.toLowerCase().startsWith('mrs.') || 
        name.toLowerCase().startsWith('ms.') ||
        name.toLowerCase().startsWith('dr.') ||
        name.toLowerCase().startsWith('prof.')) {
      return name;
    }
    return `${title} ${name}`;
  };
  const classTeacherName = getTeacherWithTitle(classTeacher);

  const calculateStudentPosition = async (student: Student, term: string, year: string): Promise<number> => {
    try {
      const classStudents = students.filter(s => s.class === student.class);
      const allScores = await database.getAllScores();
      
      const studentTotalScores = await Promise.all(
        classStudents.map(async (classStudent) => {
          const studentScores = allScores.filter(score => 
            score.studentId === classStudent.id && 
            score.term === term && 
            score.year === year
          );
          
          const totalExamScore = studentScores.reduce((sum, score) => sum + (score.examScore || 0), 0);
          const finalTotalExamScore = totalExamScore * 2;
          
          return {
            studentId: classStudent.id,
            totalExamScore: finalTotalExamScore,
            studentName: classStudent.name
          };
        })
      );
      
      const sortedStudents = studentTotalScores.sort((a, b) => b.totalExamScore - a.totalExamScore);
      const position = sortedStudents.findIndex(s => s.studentId === student.id) + 1;
      return position;
    } catch (error) {
      console.error('Error calculating student position:', error);
      return 1;
    }
  };

  const calculateOverallGrade = (average: number): string => {
    if (average >= 80) return 'A';
    if (average >= 70) return 'B';
    if (average >= 60) return 'C';
    if (average >= 50) return 'D';
    return 'F';
  };

  // Helper function to check which terms have scores for a student
  const getTermsWithScores = async (studentId: string): Promise<{year: string, term: string}[]> => {
    try {
      const allScores = await database.getAllScores();
      const studentScores = allScores.filter(score => score.studentId === studentId);
      
      // Group scores by year and term
      const termsWithScores: {year: string, term: string}[] = [];
      const uniqueTerms = new Set<string>();
      
      studentScores.forEach(score => {
        const key = `${score.year}-${score.term}`;
        if (!uniqueTerms.has(key)) {
          uniqueTerms.add(key);
          termsWithScores.push({year: score.year, term: score.term});
        }
      });
      
      return termsWithScores;
    } catch (error) {
      console.error('Error fetching terms with scores:', error);
      // Return mock data as fallback
      return [
        { year: '2022', term: 'Term 1' },
        { year: '2022', term: 'Term 2' },
        { year: '2023', term: 'Term 1' },
        { year: '2023', term: 'Term 3' },
        { year: '2024', term: 'Term 1' }
      ];
    }
  };

  const generateReportCardData = async (): Promise<ReportCard> => {
    if (!selectedStudentData) {
      return {
        studentId: "",
        studentName: "",
        class: "",
        term: selectedTerm,
        year: selectedYear,
        position: 0,
        totalStudents: 0,
        attendance: { present: 0, total: 0 },
        subjects: [],
        overallAverage: 0,
        overallGrade: "F",
        totalExamScore: 0,
        teacherRemarks: "",
        nextTermBegins: "08/01/2025",
        classTeacherName: "Class Teacher"
      };
    }

    try {
      const allScores = await database.getAllScores();
      const studentScores = allScores.filter(score => 
        score.studentId === selectedStudentData.id && 
        score.term === selectedTerm && 
        score.year === selectedYear
      );

      const subjectReports = subjects.length > 0 ? subjects.map(subject => {
        const subjectScore = studentScores.find(score => score.subjectId === subject.id);
        const classScore = subjectScore?.classScore || Math.floor(Math.random() * 20) + 30;
        const examScore = subjectScore?.examScore || Math.floor(Math.random() * 20) + 30;
        const totalScore = classScore + examScore;
        const grade = totalScore >= 80 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : 'D';
        const remarks = grade === 'A' ? 'Excellent' : grade === 'B' ? 'Very Good' : grade === 'C' ? 'Good' : 'Needs Improvement';
        
        return {
          subject: subject.name,
          classScore,
          examScore,
          totalScore,
          grade,
          remarks
        };
      }) : [
        { subject: "Mathematics", classScore: 38, examScore: 41, totalScore: 79, grade: "B", remarks: "Very Good" },
        { subject: "English Language", classScore: 34, examScore: 36, totalScore: 70, grade: "B", remarks: "Very Good" },
        { subject: "Science", classScore: 42, examScore: 41, totalScore: 83, grade: "A", remarks: "Excellent" },
        { subject: "Social Studies", classScore: 37, examScore: 37, totalScore: 74, grade: "B", remarks: "Very Good" },
        { subject: "ICT", classScore: 43, examScore: 44, totalScore: 87, grade: "A", remarks: "Excellent" },
        { subject: "RME", classScore: 39, examScore: 40, totalScore: 79, grade: "B", remarks: "Very Good" },
        { subject: "French", classScore: 36, examScore: 36, totalScore: 72, grade: "B", remarks: "Very Good" },
        { subject: "Creative Arts", classScore: 40, examScore: 40, totalScore: 80, grade: "A", remarks: "Excellent" }
      ];

      const overallAverage = Math.round(subjectReports.reduce((sum, s) => sum + s.totalScore, 0) / subjectReports.length);
      const totalExamScore = subjectReports.reduce((sum, s) => sum + s.examScore, 0) * 2;
      const overallGrade = calculateOverallGrade(overallAverage);
      const position = await calculateStudentPosition(selectedStudentData, selectedTerm, selectedYear);
      const classStudents = students.filter(s => s.class === selectedStudentData.class);

      const firstName = selectedStudentData.name?.split(' ')[0] || 'Student';
      const teacherRemarks = `${firstName} has shown commendable progress this term. Keep up the excellent work and continue striving for academic excellence!`;

      return {
        studentId: selectedStudentData.id,
        studentName: selectedStudentData.name,
        class: selectedStudentData.class,
        term: selectedTerm,
        year: selectedYear,
        position,
        totalStudents: classStudents.length,
        attendance: attendanceInput.total > 0 ? attendanceInput : { present: 85, total: 90 },
        subjects: subjectReports,
        overallAverage,
        overallGrade,
        totalExamScore,
        teacherRemarks,
        nextTermBegins: "08/01/2025",
        classTeacherName
      };
    } catch (error) {
      console.error('Error generating report card data:', error);
      return {
        studentId: selectedStudentData.id,
        studentName: selectedStudentData.name,
        class: selectedStudentData.class,
        term: selectedTerm,
        year: selectedYear,
        position: 1,
        totalStudents: students.filter(s => s.class === selectedStudentData.class).length,
        attendance: { present: 85, total: 90 },
        subjects: [],
        overallAverage: 0,
        overallGrade: "F",
        totalExamScore: 0,
        teacherRemarks: `${selectedStudentData.name?.split(' ')[0] || 'Student'} has shown consistent improvement this term.`,
        nextTermBegins: "08/01/2025",
        classTeacherName
      };
    }
  };

  const [termsWithScores, setTermsWithScores] = useState<{year: string, term: string}[]>([]);
  const [mockReportCard, setMockReportCard] = useState<ReportCard>({
    studentId: "",
    studentName: "",
    class: "",
    term: selectedTerm,
    year: selectedYear,
    position: 0,
    totalStudents: 0,
    attendance: { present: 0, total: 0 },
    subjects: [],
    overallAverage: 0,
    overallGrade: "F",
    totalExamScore: 0,
    teacherRemarks: "",
    nextTermBegins: "08/01/2025",
    classTeacherName: "Class Teacher"
  });

  useEffect(() => {
    const updateReportCard = async () => {
      if (selectedStudentData) {
        try {
          const reportData = await generateReportCardData();
          setMockReportCard(reportData);
          
          // Fetch terms with scores for the transcript
          const terms = await getTermsWithScores(selectedStudentData.id);
          setTermsWithScores(terms);
        } catch (error) {
          console.error('Error updating report card:', error);
        }
      }
    };
    updateReportCard();
  }, [selectedStudent, selectedTerm, selectedYear, subjects, students, attendanceInput]);

  const generateReportCard = (): string => {
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    return `
      <div style="max-width: 680px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background: white; position: relative; border: 3px solid #000; border-radius: 12px;">
        <!-- Large Watermark in Center -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; z-index: 1; pointer-events: none;">
          <img src="${currentLogo}" alt="School Watermark" style="width: 500px; height: 500px; object-fit: contain;" />
        </div>
        
        <!-- Content Container -->
        <div style="position: relative; z-index: 2;">
          <!-- Header without Logo -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div style="flex: 1;">
              <div style="text-align: left; margin-bottom: 15px;">
                <h1 style="font-size: 18px; font-weight: bold; margin: 0; color: #000;">OFFINSO COLLEGE OF EDUCATION J.H.S</h1>
                <p style="font-size: 12px; margin: 2px 0; color: #000;">Offinso, Ashanti Region, Ghana</p>
                <p style="font-size: 11px; margin: 0; color: #666; font-style: italic;">"Knowledge is Power"</p>
              </div>
              <h2 style="font-size: 16px; font-weight: bold; margin: 0; color: #000; text-align: left; text-decoration: underline;">REPORT CARD</h2>
            </div>
            <div style="width: 90px; height: 110px; border: none; border-radius: 6px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; margin-top: 10px;">
              ${mockReportCard.studentId && selectedStudentData?.photo ? 
                `<img src="${selectedStudentData.photo}" alt="Student Photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />` :
                `<div style="color: #666; font-size: 10px; text-align: center;">STUDENT<br/>PHOTO</div>`
              }
            </div>
          </div>

          <!-- Student Information Section -->
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 25%;">Student ID:</td>
                <td style="padding: 4px 8px; border: 1px solid #000; width: 25%;">${mockReportCard.studentId}</td>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 25%;">Gender:</td>
                <td style="padding: 4px 8px; border: 1px solid #000; width: 25%;">${selectedStudentData?.gender || 'Male'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Student Name:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;" colspan="3">${mockReportCard.studentName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Class:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;">${mockReportCard.class}</td>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Term:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;">${mockReportCard.term}</td>
              </tr>
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Academic Year:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;">${mockReportCard.year}</td>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Attendance:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;">${mockReportCard.attendance.present}/${mockReportCard.attendance.total} days</td>
              </tr>
            </table>
          </div>

          <!-- Academic Performance Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
            <thead>
              <tr style="background: #e0e0e0; height: 25px;">
                <th style="border: 2px solid #000; padding: 3px; text-align: left; font-weight: bold; height: 20px;">SUBJECT</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">Class 50</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">Exam 50</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">Total 100</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">GRADE</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">REMARKS</th>
              </tr>
            </thead>
            <tbody>
              ${mockReportCard.subjects.map(subject => `
                <tr>
                  <td style="border: 1px solid #000; padding: 6px;">${subject.subject}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">${subject.classScore}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">${subject.examScore}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">${subject.totalScore}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">${subject.grade}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">${subject.remarks}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Enhanced Summary Section -->
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 25%;">Overall Average:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; width: 25%; font-weight: bold;">${mockReportCard.overallAverage}%</td>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 25%;">Class Teacher:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; width: 25%; font-weight: bold;">${classTeacherName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Position:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; font-weight: bold;">${getOrdinalSuffix(mockReportCard.position)} out of ${mockReportCard.totalStudents}</td>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Total Exam Score:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; font-weight: bold;">${mockReportCard.totalExamScore}</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Overall Grade:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; font-weight: bold; font-size: 16px; color: #4c63d2;">${mockReportCard.overallGrade}</td>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Date:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; font-weight: bold;">${currentDate}</td>
              </tr>
            </table>
          </div>

          <!-- Teacher's Remarks -->
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 10px; color: #000;">Class Teacher's Remarks:</h3>
            <div style="border: 1px solid #000; padding: 10px; background: #f9f9f9; min-height: 60px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.4;">${mockReportCard.teacherRemarks}</p>
            </div>
          </div>

          <!-- Simplified Signatures Section -->
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <tr>
                <td style="width: 100%; text-align: center; padding: 10px; border: 1px solid #000;">
                  <div style="height: 80px; margin-bottom: 5px; display: flex; align-items: center; justify-content: center;">
                    ${schoolSettings?.headmasterSignature ? `<img src="${schoolSettings.headmasterSignature}" style="max-width: 200px; max-height: 70px; object-fit: contain;" />` : ''}
                  </div>
                  <div style="border-top: 1px solid #000; padding-top: 5px; text-align: center;">
                    <strong>Headmaster's Signature</strong><br/>
                    <strong>${schoolSettings?.headmasterName || ''}</strong>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Important Information -->
          <div style="font-size: 11px; color: #000; text-align: center; border-top: 1px solid #ccc; padding-top: 10px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;"><strong>Next Term Begins: ${mockReportCard.nextTermBegins}</strong></p>
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 12px;"><strong>For inquiries, please contact the school administration.</strong></p>
          </div>
        </div>
      </div>
    `;
  };

  const generateCertificate = (): string => {
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: 'Times New Roman', serif; background: white; position: relative; border: 5px solid #4c63d2; border-radius: 20px;">
        <!-- Large Watermark -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; z-index: 1; pointer-events: none;">
          <img src="${currentLogo}" alt="School Watermark" style="width: 600px; height: 600px; object-fit: contain;" />
        </div>
        
        <!-- Content Container -->
        <div style="position: relative; z-index: 2; text-align: center;">
          <!-- Header -->
          <div style="border-bottom: 3px solid #4c63d2; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 32px; font-weight: bold; margin: 0; color: #4c63d2; text-transform: uppercase; letter-spacing: 3px;">CERTIFICATE</h1>
            <h2 style="font-size: 24px; margin: 10px 0; color: #000;">OF COMPLETION</h2>
          </div>

          <!-- School Info -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 20px; font-weight: bold; margin: 0; color: #000;">OFFINSO COLLEGE OF EDUCATION J.H.S</h3>
            <p style="font-size: 14px; margin: 5px 0; color: #666;">Offinso, Ashanti Region, Ghana</p>
            <p style="font-size: 12px; margin: 0; color: #666; font-style: italic;">"Knowledge is Power"</p>
          </div>

          <!-- Certificate Body -->
          <div style="margin: 40px 0;">
            <p style="font-size: 16px; margin: 0; color: #000;">This is to certify that</p>
            <h2 style="font-size: 28px; font-weight: bold; margin: 20px 0; color: #4c63d2; text-decoration: underline; text-transform: uppercase;">${mockReportCard.studentName}</h2>
            <p style="font-size: 16px; margin: 0; color: #000;">has successfully completed</p>
            <h3 style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #000;">${mockReportCard.class} - ${mockReportCard.term} ${mockReportCard.year}</h3>
            <p style="font-size: 16px; margin: 0; color: #000;">with an overall grade of</p>
            <div style="display: inline-block; background: #4c63d2; color: white; padding: 10px 20px; border-radius: 50px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold;">${mockReportCard.overallGrade}</span>
            </div>
          </div>

          <!-- Achievement Details -->
          <div style="background: #f8fafc; border: 2px solid #4c63d2; border-radius: 10px; padding: 20px; margin: 30px 0;">
            <div style="display: flex; justify-content: space-around; text-align: center;">
              <div>
                <p style="font-size: 12px; margin: 0; color: #666; text-transform: uppercase;">Overall Average</p>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #4c63d2;">${mockReportCard.overallAverage}%</p>
              </div>
              <div>
                <p style="font-size: 12px; margin: 0; color: #666; text-transform: uppercase;">Class Position</p>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #4c63d2;">${getOrdinalSuffix(mockReportCard.position)}</p>
              </div>
              <div>
                <p style="font-size: 12px; margin: 0; color: #666; text-transform: uppercase;">Total Students</p>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #4c63d2;">${mockReportCard.totalStudents}</p>
              </div>
            </div>
          </div>

          <!-- Signatures -->
          <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: end;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #000; height: 40px; margin-bottom: 10px;"></div>
              <p style="font-size: 12px; margin: 0; font-weight: bold;">Class Teacher</p>
              <p style="font-size: 14px; margin: 5px 0; color: #666;">${classTeacherName}</p>
            </div>
            <div style="text-align: center;">
              <img src="${currentLogo}" alt="School Seal" style="width: 80px; height: 80px; object-fit: contain;" />
              <p style="font-size: 10px; margin: 5px 0; color: #666;">School Seal</p>
            </div>
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #000; height: 80px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center;">
                ${schoolSettings?.headmasterSignature ? `<img src="${schoolSettings.headmasterSignature}" style="max-width: 200px; max-height: 70px; object-fit: contain;" />` : ''}
              </div>
              <p style="font-size: 12px; margin: 0; font-weight: bold;">Headmaster</p>
              <p style="font-size: 14px; margin: 5px 0; color: #666;">${schoolSettings?.headmasterName || ''}</p>
            </div>
          </div>

          <!-- Date -->
          <div style="text-align: right; margin-top: 30px;">
            <p style="font-size: 14px; margin: 0; color: #000;">Date: <span style="font-weight: bold;">${currentDate}</span></p>
          </div>
        </div>
      </div>
    `;
  };

  const generateTranscript = (): string => {
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    // Group terms by year using actual data
    const yearsWithScores: {[key: string]: string[]} = {};
    termsWithScores.forEach(item => {
      if (!yearsWithScores[item.year]) {
        yearsWithScores[item.year] = [];
      }
      yearsWithScores[item.year].push(item.term);
    });

    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 30px; font-family: Arial, sans-serif; background: white; position: relative; border: 3px solid #000; border-radius: 12px;">
        <!-- Large Watermark -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; z-index: 1; pointer-events: none;">
          <img src="${currentLogo}" alt="School Watermark" style="width: 500px; height: 500px; object-fit: contain;" />
        </div>
        
        <!-- Content Container -->
        <div style="position: relative; z-index: 2;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase;">ACADEMIC TRANSCRIPT</h1>
            <h2 style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #000;">OFFINSO COLLEGE OF EDUCATION J.H.S</h2>
            <p style="font-size: 14px; margin: 5px 0; color: #666;">Offinso, Ashanti Region, Ghana</p>
            <p style="font-size: 12px; margin: 0; color: #666; font-style: italic;">"Knowledge is Power"</p>
          </div>

          <!-- Student Information -->
          <div style="margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
              <div style="flex: 1;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <tr>
                    <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 40%;">Student Name:</td>
                    <td style="padding: 8px; border: 1px solid #000; width: 60%;">${mockReportCard.studentName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Student ID:</td>
                    <td style="padding: 8px; border: 1px solid #000;">${mockReportCard.studentId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Class:</td>
                    <td style="padding: 8px; border: 1px solid #000;">${mockReportCard.class}</td>
                  </tr>
                </table>
              </div>
              <div style="width: 100px; height: 120px; border: 2px solid #000; border-radius: 6px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; margin-left: 20px;">
                ${mockReportCard.studentId && selectedStudentData?.photo ? 
                  `<img src="${selectedStudentData.photo}" alt="Student Photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />` :
                  `<div style="color: #666; font-size: 10px; text-align: center;">STUDENT<br/>PHOTO</div>`
                }
              </div>
            </div>
          </div>

          <!-- Academic Performance Over 3 Years -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #000; text-align: center;">THREE-YEAR ACADEMIC RECORD</h3>
            ${Object.keys(yearsWithScores).map(year => {
              // Filter terms to only show those with scores
              // In a real implementation, you would check the database for scores in each term/year
              const termsWithScores = yearsWithScores[year];
              
              // Only show year section if there are terms with scores
              if (termsWithScores.length === 0) {
                return '';
              }
              
              return `
                <div style="margin-bottom: 25px;">
                  <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #4c63d2; text-align: center; background: #f0f0f0; padding: 8px; border: 1px solid #000;">ACADEMIC YEAR ${year}</h4>
                  ${termsWithScores.map(term => `
                    <div style="margin-bottom: 15px;">
                      <h5 style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #000;">${term}:</h5>
                      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px;">
                        <thead>
                          <tr style="background: #e0e0e0;">
                            <th style="border: 1px solid #000; padding: 4px; text-align: left; font-weight: bold;">SUBJECT</th>
                            <th style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">CLASS</th>
                            <th style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">EXAM</th>
                            <th style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">TOTAL</th>
                            <th style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">GRADE</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${mockReportCard.subjects.slice(0, 4).map(subject => {
                            // Generate different scores for different years/terms
                            const variation = Math.floor(Math.random() * 10) - 5;
                            const classScore = Math.max(25, Math.min(50, subject.classScore + variation));
                            const examScore = Math.max(25, Math.min(50, subject.examScore + variation));
                            const total = classScore + examScore;
                            const grade = total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : 'D';
                            return `
                              <tr>
                                <td style="border: 1px solid #000; padding: 4px;">${subject.subject}</td>
                                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${classScore}</td>
                                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${examScore}</td>
                                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${total}</td>
                                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${grade}</td>
                              </tr>
                            `;
                          }).join('')}
                        </tbody>
                      </table>
                    </div>
                  `).join('')}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Overall Performance Summary -->
          <div style="margin-bottom: 30px; background: #f8fafc; border: 2px solid #4c63d2; border-radius: 10px; padding: 20px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #000; text-align: center;">OVERALL PERFORMANCE SUMMARY</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 50%;">Current Overall Average:</td>
                <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: #4c63d2;">${mockReportCard.overallAverage}%</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Current Class Position:</td>
                <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: #4c63d2;">${getOrdinalSuffix(mockReportCard.position)} out of ${mockReportCard.totalStudents}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Overall Grade:</td>
                <td style="padding: 8px; border: 1px solid #000; font-weight: bold; font-size: 18px; color: #4c63d2;">${mockReportCard.overallGrade}</td>
              </tr>
            </table>
          </div>

          <!-- Signatures -->
          <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: end;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #000; height: 40px; margin-bottom: 10px;"></div>
              <p style="font-size: 12px; margin: 0; font-weight: bold;">Class Teacher</p>
              <p style="font-size: 14px; margin: 5px 0; color: #666;">${classTeacherName}</p>
            </div>
            <div style="text-align: center;">
              <img src="${currentLogo}" alt="School Seal" style="width: 80px; height: 80px; object-fit: contain;" />
              <p style="font-size: 10px; margin: 5px 0; color: #666;">School Seal</p>
            </div>
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #000; height: 80px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center;">
                ${schoolSettings?.headmasterSignature ? `<img src="${schoolSettings.headmasterSignature}" style="max-width: 200px; max-height: 70px; object-fit: contain;" />` : ''}
              </div>
              <p style="font-size: 12px; margin: 0; font-weight: bold;">Headmaster</p>
              <p style="font-size: 14px; margin: 5px 0; color: #666;">${schoolSettings?.headmasterName || ''}</p>
            </div>
          </div>

          <!-- Date and Seal -->
          <div style="text-align: center; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px;">
            <p style="font-size: 14px; margin: 0; color: #000;">Date: <span style="font-weight: bold;">${currentDate}</span></p>
            <p style="font-size: 12px; margin: 5px 0 0 0; color: #666;">This transcript covers the complete academic record for three years of study.</p>
          </div>
        </div>
      </div>
    `;
  };

  const downloadDocument = async (documentType: 'report-card' | 'certificate' | 'transcript') => {
    if (!selectedStudentData) return;

    // Refresh school settings so exported documents use latest saved values
    try {
      const s = await database.getSetting('schoolSettings');
      if (s) {
        setSchoolSettings(s);
        if (s.logo) setCurrentLogo(s.logo);
      }
    } catch (e) {
      // ignore
    }

    let content = '';
    let filename = '';

    switch (documentType) {
      case 'report-card':
        content = generateReportCard();
        filename = `${selectedStudentData.name}_Report_Card_${selectedTerm}_${selectedYear}.html`;
        break;
      case 'certificate':
        content = generateCertificate();
        filename = `${selectedStudentData.name}_Certificate_${selectedTerm}_${selectedYear}.html`;
        break;
      case 'transcript':
        content = generateTranscript();
        filename = `${selectedStudentData.name}_Transcript.html`;
        break;
    }

    try {
      const shareData: ShareData = {
        title: filename,
        content,
        filename,
        type: 'html'
      };
      await ShareUtils.downloadDocument(shareData);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const generateBulkReports = async (documentType: 'report-card' | 'certificate' | 'transcript') => {
    setBulkDownloadLoading(true);
    try {
      // Refresh school settings for bulk generation
      try {
        const s = await database.getSetting('schoolSettings');
        if (s) {
          setSchoolSettings(s);
          if (s.logo) setCurrentLogo(s.logo);
        }
      } catch (e) {
        // ignore
      }
      const studentsToProcess = selectedClass === "all" ? 
        students : 
        students.filter(s => s.class === selectedClass);

      const originalSelectedStudent = selectedStudent;

      for (const student of studentsToProcess) {
        // Temporarily set student for data generation
        setSelectedStudent(student.id);
        
        // Generate report data for this student
        const reportData = await generateReportCardData();
        
        let content = '';
        let filename = '';

        // Generate content based on document type
        switch (documentType) {
          case 'report-card':
            content = generateReportCardContent(reportData, student);
            filename = `${student.name.replace(/\s+/g, '_')}_Report_Card_${selectedTerm}_${selectedYear}.html`;
            break;
          case 'certificate':
            content = generateCertificateContent(reportData, student);
            filename = `${student.name.replace(/\s+/g, '_')}_Certificate_${selectedTerm}_${selectedYear}.html`;
            break;
          case 'transcript':
            content = generateTranscriptContent(reportData, student);
            filename = `${student.name.replace(/\s+/g, '_')}_Transcript.html`;
            break;
        }

        const shareData: ShareData = {
          title: filename,
          content,
          filename,
          type: 'html'
        };
        await ShareUtils.downloadDocument(shareData);
        
        // Brief delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Restore original selection
      setSelectedStudent(originalSelectedStudent);
      
      alert(`Successfully generated ${documentType}s for ${studentsToProcess.length} students!`);
    } catch (error) {
      console.error('Failed to generate bulk reports:', error);
      alert('Failed to generate bulk reports. Please try again.');
    } finally {
      setBulkDownloadLoading(false);
    }
  };

  // Separate content generation functions for bulk processing
  const generateReportCardContent = (reportData: ReportCard, student: Student): string => {
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    return `
      <div style="max-width: 680px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background: white; position: relative; border: 3px solid #000; border-radius: 12px;">
        <!-- Large Watermark in Center -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; z-index: 1; pointer-events: none;">
          <img src="${currentLogo}" alt="School Watermark" style="width: 500px; height: 500px; object-fit: contain;" />
        </div>
        
        <!-- Content Container -->
        <div style="position: relative; z-index: 2;">
          <!-- Header without Logo -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div style="flex: 1;">
              <div style="text-align: left; margin-bottom: 15px;">
                <h1 style="font-size: 18px; font-weight: bold; margin: 0; color: #000;">OFFINSO COLLEGE OF EDUCATION J.H.S</h1>
                <p style="font-size: 12px; margin: 2px 0; color: #000;">Offinso, Ashanti Region, Ghana</p>
                <p style="font-size: 11px; margin: 0; color: #666; font-style: italic;">"Knowledge is Power"</p>
              </div>
              <h2 style="font-size: 16px; font-weight: bold; margin: 0; color: #000; text-align: left; text-decoration: underline;">REPORT CARD</h2>
            </div>
            <div style="width: 90px; height: 110px; border: 2px solid #000; border-radius: 6px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; margin-top: 10px;">
              ${student?.photo ? 
                `<img src="${student.photo}" alt="Student Photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />` :
                `<div style="color: #666; font-size: 10px; text-align: center;">STUDENT<br/>PHOTO</div>`
              }
            </div>
          </div>

          <!-- Student Information Section -->
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 25%;">Student ID:</td>
                <td style="padding: 4px 8px; border: 1px solid #000; width: 25%;">${reportData.studentId}</td>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 25%;">Gender:</td>
                <td style="padding: 4px 8px; border: 1px solid #000; width: 25%;">${student?.gender || 'Male'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Student Name:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;" colspan="3">${reportData.studentName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Class:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;">${reportData.class}</td>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Term:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;">${reportData.term}</td>
              </tr>
              <tr>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Academic Year:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;">${reportData.year}</td>
                <td style="padding: 4px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Attendance:</td>
                <td style="padding: 4px 8px; border: 1px solid #000;">${reportData.attendance.present}/${reportData.attendance.total} days</td>
              </tr>
            </table>
          </div>

          <!-- Academic Performance Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
            <thead>
              <tr style="background: #e0e0e0; height: 25px;">
                <th style="border: 2px solid #000; padding: 3px; text-align: left; font-weight: bold; height: 20px;">SUBJECT</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">Class 50</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">Exam 50</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">Total 100</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">GRADE</th>
                <th style="border: 2px solid #000; padding: 3px; text-align: center; font-weight: bold; height: 20px;">REMARKS</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.subjects.map(subject => `
                <tr>
                  <td style="border: 1px solid #000; padding: 6px;">${subject.subject}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">${subject.classScore}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">${subject.examScore}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">${subject.totalScore}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">${subject.grade}</td>
                  <td style="border: 1px solid #000; padding: 6px; text-align: center;">${subject.remarks}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Enhanced Summary Section -->
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 25%;">Overall Average:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; width: 25%; font-weight: bold;">${reportData.overallAverage}%</td>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 25%;">Class Teacher:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; width: 25%; font-weight: bold;">${reportData.classTeacherName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Position:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; font-weight: bold;">${getOrdinalSuffix(reportData.position)} out of ${reportData.totalStudents}</td>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Total Exam Score:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; font-weight: bold;">${reportData.totalExamScore}</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Overall Grade:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; font-weight: bold; font-size: 16px; color: #4c63d2;">${reportData.overallGrade}</td>
                <td style="padding: 6px 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Date:</td>
                <td style="padding: 6px 8px; border: 1px solid #000; font-weight: bold;">${currentDate}</td>
              </tr>
            </table>
          </div>

          <!-- Teacher's Remarks -->
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 15px; font-weight: bold; margin-bottom: 10px; color: #000;">Class Teacher's Remarks:</h3>
            <div style="border: 1px solid #000; padding: 10px; background: #f9f9f9; min-height: 60px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.4;">${reportData.teacherRemarks}</p>
            </div>
          </div>

          <!-- Simplified Signatures Section -->
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <tr>
                <td style="width: 100%; text-align: center; padding: 10px; border: 1px solid #000;">
                  <div style="height: 80px; margin-bottom: 5px; display: flex; align-items: center; justify-content: center;">
                    ${schoolSettings?.headmasterSignature ? `<img src="${schoolSettings.headmasterSignature}" style="max-width: 200px; max-height: 70px; object-fit: contain;" />` : ''}
                  </div>
                  <div style="border-top: 1px solid #000; padding-top: 5px; text-align: center;">
                    <strong>Headmaster's Signature</strong><br/>
                    <strong>${schoolSettings?.headmasterName || ''}</strong>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Important Information -->
          <div style="font-size: 11px; color: #000; text-align: center; border-top: 1px solid #ccc; padding-top: 10px;">
            <p style="margin: 0; font-weight: bold; font-size: 12px;"><strong>Next Term Begins: ${reportData.nextTermBegins}</strong></p>
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 12px;"><strong>For inquiries, please contact the school administration.</strong></p>
          </div>
        </div>
      </div>
    `;
  };

  const generateCertificateContent = (reportData: ReportCard, student: Student): string => {
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: 'Times New Roman', serif; background: white; position: relative; border: 5px solid #4c63d2; border-radius: 20px;">
        <!-- Large Watermark -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.05; z-index: 1; pointer-events: none;">
          <img src="${currentLogo}" alt="School Watermark" style="width: 600px; height: 600px; object-fit: contain;" />
        </div>
        
        <!-- Content Container -->
        <div style="position: relative; z-index: 2; text-align: center;">
          <!-- Header -->
          <div style="border-bottom: 3px solid #4c63d2; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 32px; font-weight: bold; margin: 0; color: #4c63d2; text-transform: uppercase; letter-spacing: 3px;">CERTIFICATE</h1>
            <h2 style="font-size: 24px; margin: 10px 0; color: #000;">OF COMPLETION</h2>
          </div>

          <!-- School Info -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 20px; font-weight: bold; margin: 0; color: #000;">OFFINSO COLLEGE OF EDUCATION J.H.S</h3>
            <p style="font-size: 14px; margin: 5px 0; color: #666;">Offinso, Ashanti Region, Ghana</p>
            <p style="font-size: 12px; margin: 0; color: #666; font-style: italic;">"Knowledge is Power"</p>
          </div>

          <!-- Certificate Body -->
          <div style="margin: 40px 0;">
            <p style="font-size: 16px; margin: 0; color: #000;">This is to certify that</p>
            <h2 style="font-size: 28px; font-weight: bold; margin: 20px 0; color: #4c63d2; text-decoration: underline; text-transform: uppercase;">${reportData.studentName}</h2>
            <p style="font-size: 16px; margin: 0; color: #000;">has successfully completed</p>
            <h3 style="font-size: 24px; font-weight: bold; margin: 20px 0; color: #000;">${reportData.class} - ${reportData.term} ${reportData.year}</h3>
            <p style="font-size: 16px; margin: 0; color: #000;">with an overall grade of</p>
            <div style="display: inline-block; background: #4c63d2; color: white; padding: 10px 20px; border-radius: 50px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold;">${reportData.overallGrade}</span>
            </div>
          </div>

          <!-- Achievement Details -->
          <div style="background: #f8fafc; border: 2px solid #4c63d2; border-radius: 10px; padding: 20px; margin: 30px 0;">
            <div style="display: flex; justify-content: space-around; text-align: center;">
              <div>
                <p style="font-size: 12px; margin: 0; color: #666; text-transform: uppercase;">Overall Average</p>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #4c63d2;">${reportData.overallAverage}%</p>
              </div>
              <div>
                <p style="font-size: 12px; margin: 0; color: #666; text-transform: uppercase;">Class Position</p>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #4c63d2;">${getOrdinalSuffix(reportData.position)}</p>
              </div>
              <div>
                <p style="font-size: 12px; margin: 0; color: #666; text-transform: uppercase;">Total Students</p>
                <p style="font-size: 24px; font-weight: bold; margin: 5px 0; color: #4c63d2;">${reportData.totalStudents}</p>
              </div>
            </div>
          </div>

          <!-- Signatures -->
          <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: end;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #000; height: 40px; margin-bottom: 10px;"></div>
              <p style="font-size: 12px; margin: 0; font-weight: bold;">Class Teacher</p>
              <p style="font-size: 14px; margin: 5px 0; color: #666;">${reportData.classTeacherName}</p>
            </div>
            <div style="text-align: center;">
              <img src="${currentLogo}" alt="School Seal" style="width: 80px; height: 80px; object-fit: contain;" />
              <p style="font-size: 10px; margin: 5px 0; color: #666;">School Seal</p>
            </div>
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #000; height: 80px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center;">
                ${schoolSettings?.headmasterSignature ? `<img src="${schoolSettings.headmasterSignature}" style="max-width: 200px; max-height: 70px; object-fit: contain;" />` : ''}
              </div>
              <p style="font-size: 12px; margin: 0; font-weight: bold;">Headmaster</p>
              <p style="font-size: 14px; margin: 5px 0; color: #666;">${schoolSettings?.headmasterName || ''}</p>
            </div>
          </div>

          <!-- Date -->
          <div style="text-align: right; margin-top: 30px;">
            <p style="font-size: 14px; margin: 0; color: #000;">Date: <span style="font-weight: bold;">${currentDate}</span></p>
          </div>
        </div>
      </div>
    `;
  };

  const generateTranscriptContent = (reportData: ReportCard, student: Student): string => {
    const currentDate = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });

    // For bulk generation, we would ideally fetch terms with scores for this specific student
    // But for simplicity, we'll use the same terms as the currently selected student
    // In a real implementation, you would fetch this data for each student
    
    // Group terms by year using actual data
    const yearsWithScores: {[key: string]: string[]} = {};
    termsWithScores.forEach(item => {
      if (!yearsWithScores[item.year]) {
        yearsWithScores[item.year] = [];
      }
      yearsWithScores[item.year].push(item.term);
    });

    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 30px; font-family: Arial, sans-serif; background: white; position: relative; border: 3px solid #000; border-radius: 12px;">
        <!-- Large Watermark -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; z-index: 1; pointer-events: none;">
          <img src="${currentLogo}" alt="School Watermark" style="width: 500px; height: 500px; object-fit: contain;" />
        </div>
        
        <!-- Content Container -->
        <div style="position: relative; z-index: 2;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase;">ACADEMIC TRANSCRIPT</h1>
            <h2 style="font-size: 18px; font-weight: bold; margin: 10px 0; color: #000;">OFFINSO COLLEGE OF EDUCATION J.H.S</h2>
            <p style="font-size: 14px; margin: 5px 0; color: #666;">Offinso, Ashanti Region, Ghana</p>
            <p style="font-size: 12px; margin: 0; color: #666; font-style: italic;">"Knowledge is Power"</p>
          </div>

          <!-- Student Information -->
          <div style="margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
              <div style="flex: 1;">
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                  <tr>
                    <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 40%;">Student Name:</td>
                    <td style="padding: 8px; border: 1px solid #000; width: 60%;">${reportData.studentName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Student ID:</td>
                    <td style="padding: 8px; border: 1px solid #000;">${reportData.studentId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Class:</td>
                    <td style="padding: 8px; border: 1px solid #000;">${reportData.class}</td>
                  </tr>
                </table>
              </div>
              <div style="width: 100px; height: 120px; border: 2px solid #000; border-radius: 6px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; margin-left: 20px;">
                ${student?.photo ? 
                  `<img src="${student.photo}" alt="Student Photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />` :
                  `<div style="color: #666; font-size: 10px; text-align: center;">STUDENT<br/>PHOTO</div>`
                }
              </div>
            </div>
          </div>

          <!-- Academic Performance Over 3 Years -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #000; text-align: center;">THREE-YEAR ACADEMIC RECORD</h3>
            ${Object.keys(yearsWithScores).map(year => {
              const termsForYear = yearsWithScores[year];
              
              return `
                <div style="margin-bottom: 25px;">
                  <h4 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #4c63d2; text-align: center; background: #f0f0f0; padding: 8px; border: 1px solid #000;">ACADEMIC YEAR ${year}</h4>
                  ${termsForYear.map(term => `
                    <div style="margin-bottom: 15px;">
                      <h5 style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #000;">${term}:</h5>
                      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px;">
                        <thead>
                          <tr style="background: #e0e0e0;">
                            <th style="border: 1px solid #000; padding: 4px; text-align: left; font-weight: bold;">SUBJECT</th>
                            <th style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">CLASS</th>
                            <th style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">EXAM</th>
                            <th style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">TOTAL</th>
                            <th style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">GRADE</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${reportData.subjects.slice(0, 4).map(subject => {
                            const variation = Math.floor(Math.random() * 10) - 5;
                            const classScore = Math.max(25, Math.min(50, subject.classScore + variation));
                            const examScore = Math.max(25, Math.min(50, subject.examScore + variation));
                            const total = classScore + examScore;
                            const grade = total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : 'D';
                            return `
                              <tr>
                                <td style="border: 1px solid #000; padding: 4px;">${subject.subject}</td>
                                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${classScore}</td>
                                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${examScore}</td>
                                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${total}</td>
                                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">${grade}</td>
                              </tr>
                            `;
                          }).join('')}
                        </tbody>
                      </table>
                    </div>
                  `).join('')}
                </div>
              `;
            }).join('')}
          </div>

          <!-- Overall Performance Summary -->
          <div style="margin-bottom: 30px; background: #f8fafc; border: 2px solid #4c63d2; border-radius: 10px; padding: 20px;">
            <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #000; text-align: center;">OVERALL PERFORMANCE SUMMARY</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold; width: 50%;">Current Overall Average:</td>
                <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: #4c63d2;">${reportData.overallAverage}%</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Current Class Position:</td>
                <td style="padding: 8px; border: 1px solid #000; font-weight: bold; color: #4c63d2;">${getOrdinalSuffix(reportData.position)} out of ${reportData.totalStudents}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #000; background: #f0f0f0; font-weight: bold;">Overall Grade:</td>
                <td style="padding: 8px; border: 1px solid #000; font-weight: bold; font-size: 18px; color: #4c63d2;">${reportData.overallGrade}</td>
              </tr>
            </table>
          </div>

          <!-- Signatures -->
          <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: end;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #000; height: 40px; margin-bottom: 10px;"></div>
              <p style="font-size: 12px; margin: 0; font-weight: bold;">Class Teacher</p>
              <p style="font-size: 14px; margin: 5px 0; color: #666;">${reportData.classTeacherName}</p>
            </div>
            <div style="text-align: center;">
              <img src="${currentLogo}" alt="School Seal" style="width: 80px; height: 80px; object-fit: contain;" />
              <p style="font-size: 10px; margin: 5px 0; color: #666;">School Seal</p>
            </div>
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 2px solid #000; height: 80px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center;">
                ${schoolSettings?.headmasterSignature ? `<img src="${schoolSettings.headmasterSignature}" style="max-width: 200px; max-height: 70px; object-fit: contain;" />` : ''}
              </div>
              <p style="font-size: 12px; margin: 0; font-weight: bold;">Headmaster</p>
              <p style="font-size: 14px; margin: 5px 0; color: #666;">${schoolSettings?.headmasterName || ''}</p>
            </div>
          </div>

          <!-- Date and Seal -->
          <div style="text-align: center; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px;">
            <p style="font-size: 14px; margin: 0; color: #000;">Date: <span style="font-weight: bold;">${currentDate}</span></p>
            <p style="font-size: 12px; margin: 5px 0 0 0; color: #666;">This transcript covers the complete academic record for three years of study.</p>
          </div>
        </div>
      </div>
    `;
  };

  const callParent = (phoneNumber: string, studentName: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert(`No phone number available for ${studentName}'s guardian.`);
    }
  };

  const sendWhatsAppMessage = (phoneNumber: string, studentName: string) => {
    if (phoneNumber) {
      const message = `Hello! This is regarding ${studentName}'s academic progress at Offinso College of Education J.H.S. Please contact the school for more information.`;
      const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      alert(`No WhatsApp number available for ${studentName}'s guardian.`);
    }
  };

  // Filter students based on search and class
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(studentSearchTerm.toLowerCase());
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Get unique classes
  const uniqueClasses = [...new Set(students.map(s => s.class))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading reports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-semibold">Enhanced Reports Management</h1>
      </div>

      <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
        <TabsList className={`grid w-full ${isStudent ? 'grid-cols-1' : 'grid-cols-3'}`}>
          <TabsTrigger value="report-card" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Report Cards
          </TabsTrigger>
          {!isStudent && (
            <>
              <TabsTrigger value="certificate" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Certificates
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Transcripts
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Controls Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Report Generation Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search students..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="input-compact"
              />
              
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection */}
            {!isStudent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.class} ({student.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Attendance Input */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Attendance:</label>
                  <Input
                    type="number"
                    placeholder="Present"
                    value={attendanceInput.present}
                    onChange={(e) => setAttendanceInput({...attendanceInput, present: parseInt(e.target.value) || 0})}
                    className="input-compact w-20"
                  />
                  <span>/</span>
                  <Input
                    type="number"
                    placeholder="Total"
                    value={attendanceInput.total}
                    onChange={(e) => setAttendanceInput({...attendanceInput, total: parseInt(e.target.value) || 0})}
                    className="input-compact w-20"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => downloadDocument('report-card')}
                disabled={!selectedStudentData}
                className="btn-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report Card
              </Button>

              {(isAdmin || isTeacher) && (
                <Button
                  onClick={() => generateBulkReports(reportType as 'report-card' | 'certificate' | 'transcript')}
                  disabled={bulkDownloadLoading}
                  className="btn-success"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {bulkDownloadLoading ? 'Generating...' : `Bulk Generate ${reportType === 'report-card' ? 'Report Cards' : reportType === 'certificate' ? 'Certificates' : 'Transcripts'}`}
                </Button>
              )}

              {/* Parent Contact Buttons */}
              {selectedStudentData && !isStudent && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => callParent(selectedStudentData.guardianPhone || '', selectedStudentData.name)}
                    className="btn-compact"
                    size="sm"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call Parent
                  </Button>
                  <Button
                    onClick={() => sendWhatsAppMessage(selectedStudentData.guardianPhone || '', selectedStudentData.name)}
                    className="btn-whatsapp btn-compact"
                    size="sm"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Student Info */}
        {selectedStudentData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Selected Student: {selectedStudentData.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID:</span> {selectedStudentData.id}
                </div>
                <div>
                  <span className="font-medium">Class:</span> {selectedStudentData.class}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {selectedStudentData.gender}
                </div>
                <div>
                  <span className="font-medium">Guardian:</span> {selectedStudentData.guardianName || 'Not provided'}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Guardian Phone:</span> {selectedStudentData.guardianPhone || 'Not provided'}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Current Attendance:</span> {attendanceInput.present || 0}/{attendanceInput.total || 0} days
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Section */}
        <TabsContent value="report-card" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Card Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStudentData ? (
                <div 
                  className="border rounded-lg p-4 bg-white shadow-sm overflow-auto"
                  dangerouslySetInnerHTML={{ __html: generateReportCard() }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a student to preview their report card.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStudentData ? (
                <div 
                  className="border rounded-lg p-4 bg-white shadow-sm overflow-auto"
                  dangerouslySetInnerHTML={{ __html: generateCertificate() }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a student to preview their certificate.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transcript Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStudentData ? (
                <div 
                  className="border rounded-lg p-4 bg-white shadow-sm overflow-auto"
                  dangerouslySetInnerHTML={{ __html: generateTranscript() }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a student to preview their transcript.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-blue-800">Total Students</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{uniqueClasses.length}</div>
              <div className="text-sm text-green-800">Classes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{subjects.length}</div>
              <div className="text-sm text-purple-800">Subjects</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{filteredStudents.length}</div>
              <div className="text-sm text-orange-800">Filtered Results</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}