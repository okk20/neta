import { GRADE_THRESHOLDS } from "../constants/scores";
import type { Score, Student, Subject } from "./database";

export interface ScoreStatistics {
  totalScores: number;
  averageScore: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
  passRate: number;
}

export class ScoreUtils {
  // Updated to use only A, B, C, D grades
  static calculateGrade(totalScore: number): string {
    if (totalScore >= GRADE_THRESHOLDS.A) return 'A';
    if (totalScore >= GRADE_THRESHOLDS.B) return 'B';
    if (totalScore >= GRADE_THRESHOLDS.C) return 'C';
    return 'D';
  }

  static calculateStatistics(scores: Score[]): ScoreStatistics {
    const totalScores = scores.length;
    const averageScore = totalScores > 0 ? 
      Math.round(scores.reduce((sum, s) => sum + s.totalScore, 0) / totalScores) : 0;
    
    const gradeDistribution = {
      A: scores.filter(s => s.grade === 'A').length,
      B: scores.filter(s => s.grade === 'B').length,
      C: scores.filter(s => s.grade === 'C').length,
      D: scores.filter(s => s.grade === 'D').length
    };

    // Pass rate - consider C and above as passing
    const passRate = totalScores > 0 ? 
      Math.round(((gradeDistribution.A + gradeDistribution.B + gradeDistribution.C) / totalScores) * 100) : 0;

    return {
      totalScores,
      averageScore,
      gradeDistribution,
      passRate
    };
  }

  static validateScoreForm(form: any): string | null {
    if (!form.studentId) return 'Please select a student';
    if (!form.subjectId) return 'Please select a subject';
    if (form.classScore < 0 || form.classScore > 50) return 'Class score must be between 0 and 50';
    if (form.examScore < 0 || form.examScore > 50) return 'Exam score must be between 0 and 50';
    return null;
  }

  static getStudentName(studentId: string, students: Student[]): string {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  }

  static getSubjectName(subjectId: string, subjects: Subject[]): string {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  }

  static getStudentClass(studentId: string, students: Student[]): string {
    const student = students.find(s => s.id === studentId);
    return student ? student.class : '';
  }

  static filterScores(
    scores: Score[], 
    students: Student[], 
    subjects: Subject[],
    filters: {
      searchTerm: string;
      filterClass: string;
      filterSubject: string;
      filterTerm: string;
      filterYear: string;
    }
  ): Score[] {
    return scores.filter(score => {
      const student = students.find(s => s.id === score.studentId);
      const subject = subjects.find(s => s.id === score.subjectId);
      
      const matchesSearch = student?.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           subject?.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           score.grade.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesClass = !filters.filterClass || student?.class === filters.filterClass;
      const matchesSubject = !filters.filterSubject || score.subjectId === filters.filterSubject;
      const matchesTerm = !filters.filterTerm || score.term === filters.filterTerm;
      const matchesYear = !filters.filterYear || score.year === filters.filterYear;
      
      return matchesSearch && matchesClass && matchesSubject && matchesTerm && matchesYear;
    });
  }

  static createScoreData(form: any, currentUser: any) {
    const totalScore = form.classScore + form.examScore;
    const grade = this.calculateGrade(totalScore);

    return {
      studentId: form.studentId,
      subjectId: form.subjectId,
      term: form.term,
      year: form.year,
      classScore: form.classScore,
      examScore: form.examScore,
      totalScore,
      grade,
      remarks: form.remarks.trim(),
      teacherId: currentUser?.teacherId || currentUser?.id || 'ADMIN_001'
    };
  }

  static getGradeColorClass(grade: string): string {
    const colorMap: { [key: string]: string } = {
      'A': 'text-green-500',   // Excellent
      'B': 'text-blue-500',    // Very Good
      'C': 'text-yellow-500',  // Good
      'D': 'text-red-500'      // Needs Improvement
    };
    return colorMap[grade] || 'text-muted-foreground';
  }

  static formatPercentage(score: number, maxScore: number): string {
    return `${((score / maxScore) * 100).toFixed(1)}%`;
  }

  static getGradeRemarks(grade: string): string {
    const remarksMap: { [key: string]: string } = {
      'A': 'Excellent',
      'B': 'Very Good',
      'C': 'Good',
      'D': 'Needs Improvement'
    };
    return remarksMap[grade] || 'No Grade';
  }
}