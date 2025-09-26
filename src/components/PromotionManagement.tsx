import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { UserPlus, TrendingUp, AlertCircle, CheckCircle, Download, Printer, Users, BookOpen } from "lucide-react";
import schoolLogo from 'figma:asset/f54d19f92d0654d6893f0bbe6873df075924e4bb.png';
import { db, type Student, type Score } from "../utils/database";

interface StudentPromotion {
  id: string;
  name: string;
  currentClass: string;
  overallAverage: number;
  examScore: number;
  totalExamScore: number;
  status: 'promote' | 'retain' | 'review' | 'no-scores';
  subjects: { subject: string; average: number; passed: boolean }[];
}

export function PromotionManagement() {
  const [selectedYear, setSelectedYear] = useState("latest");
  const [selectedClass, setSelectedClass] = useState("all");
  const [students, setStudents] = useState<StudentPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLogo, setCurrentLogo] = useState(schoolLogo);
  const [promotionCriteria, setPromotionCriteria] = useState({
    minimumAverage: 50,
    minimumSubjectPass: 5,
    totalSubjects: 8
  });

  const classes = ["B.S.7A", "B.S.7B", "B.S.7C", "B.S.8A", "B.S.8B", "B.S.8C", "B.S.9A", "B.S.9B", "B.S.9C"];
  const years = ["latest", "2023", "2024", "2025"];

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Determine the actual year to use
      let actualYear = selectedYear;
      if (selectedYear === "latest") {
        // Get the latest year from available data
        const scoresList = await db.getAllScores();
        const availableYears = [...new Set(scoresList.map(score => score.year))].sort().reverse();
        actualYear = availableYears[0] || new Date().getFullYear().toString();
      }
      
      const [studentsList, scoresList, schoolSettings] = await Promise.all([
        db.getAllStudents(),
        db.getAllScores(),
        db.getSetting('schoolSettings')
      ]);
      
      if (schoolSettings && schoolSettings.logo) {
        setCurrentLogo(schoolSettings.logo);
      }
      
      // Calculate promotion status for each student
      const studentsWithPromotion: StudentPromotion[] = studentsList.map(student => {
        const studentScores = scoresList.filter(score => 
          score.studentId === student.id && 
          score.term === "Term 3" && 
          score.year === actualYear
        );
        
        if (studentScores.length === 0) {
          return {
            id: student.id,
            name: student.name,
            currentClass: student.class,
            overallAverage: 0,
            examScore: 0,
            totalExamScore: 0,
            status: 'no-scores',
            subjects: []
          };
        }
        
        const totalScore = studentScores.reduce((sum, score) => sum + score.totalScore, 0);
        const totalExamScore = studentScores.reduce((sum, score) => sum + score.examScore, 0);
        const maxExamScore = studentScores.length * 50;
        const currentAverage = Math.round(totalScore / studentScores.length);
        const examPercentage = (totalExamScore / maxExamScore) * 100;
        
        const subjects = studentScores.map(score => ({
          subject: `Subject ${score.subjectId}`,
          average: score.totalScore,
          passed: score.totalScore >= 50
        }));
        
        const passedSubjects = subjects.filter(s => s.passed).length;
        let status: 'promote' | 'retain' | 'review' = 'retain';
        
        if (currentAverage >= promotionCriteria.minimumAverage && 
            passedSubjects >= promotionCriteria.minimumSubjectPass) {
          status = 'promote';
        } else if (currentAverage >= 40 && passedSubjects >= 3) {
          status = 'review';
        }
        
        return {
          id: student.id,
          name: student.name,
          currentClass: student.class,
          overallAverage: currentAverage,
          examScore: totalExamScore,
          totalExamScore: maxExamScore,
          status,
          subjects
        };
      });
      
      setStudents(studentsWithPromotion);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextClass = (currentClass: string): string => {
    const classMap: { [key: string]: string } = {
      "B.S.7A": "B.S.8A", "B.S.7B": "B.S.8B", "B.S.7C": "B.S.8C",
      "B.S.8A": "B.S.9A", "B.S.8B": "B.S.9B", "B.S.8C": "B.S.9C",
      "B.S.9A": "Graduate", "B.S.9B": "Graduate", "B.S.9C": "Graduate"
    };
    return classMap[currentClass] || "Unknown";
  };

  const filteredStudents = selectedClass === "all"
    ? students
    : students.filter(student => student.currentClass === selectedClass);

  const promotionStats = {
    total: filteredStudents.length,
    promote: filteredStudents.filter(s => s.status === 'promote').length,
    retain: filteredStudents.filter(s => s.status === 'retain').length,
    review: filteredStudents.filter(s => s.status === 'review').length
  };

  const handleAutoPromotion = async () => {
    if (filteredStudents.length === 0) {
      alert("No students available for promotion");
      return;
    }

    if (confirm(`This will process promotion for ${filteredStudents.length} students. Continue?`)) {
      const promotedStudents = filteredStudents.filter(student => 
        student.status === 'promote'
      );
      
      // In a real application, you would update the student records in the database
      const promotionSummary = promotedStudents.map(student => ({
        id: student.id,
        name: student.name,
        from: student.currentClass,
        to: getNextClass(student.currentClass)
      }));
      
      const summaryText = promotionSummary.map(p => 
        `${p.name} (${p.id}): ${p.from} → ${p.to}`
      ).join('\n');
      
      alert(`Auto-promotion completed successfully!\n\nPromoted Students (${promotedStudents.length}):\n${summaryText}\n\nRetained Students: ${filteredStudents.length - promotedStudents.length}`);
    }
  };

  const generatePromotionList = (status: 'promote' | 'retain' | 'review'): string => {
    const studentsWithStatus = filteredStudents.filter(student => 
      student.status === status
    );
    
    const statusTitle = status === 'promote' ? 'PROMOTED STUDENTS' : 
                       status === 'retain' ? 'RETAINED STUDENTS' : 
                       'STUDENTS UNDER REVIEW';
    
    return `
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; position: relative;">
        <!-- Watermark -->
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.05; z-index: 1; pointer-events: none;">
          <img src="${currentLogo}" alt="Watermark" style="width: 400px; height: 400px; object-fit: contain;" />
        </div>
        
        <!-- Content -->
        <div style="position: relative; z-index: 2;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #4c63d2; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
            <img src="${currentLogo}" alt="School Logo" style="width: 80px; height: 80px; border-radius: 10px;" />
            <div>
              <h1 style="color: #4c63d2; margin: 0; font-size: 24px;">OFFINSO COLLEGE OF EDUCATION J.H.S.</h1>
              <p style="color: #666; margin: 5px 0;">Offinso</p>
              <p style="color: #888; margin: 0; font-style: italic;">"Knowledge is Power"</p>
            </div>
          </div>
          <h2 style="color: #4c63d2; margin: 10px 0; font-size: 20px;">${statusTitle}</h2>
          <p style="color: #666; margin: 0;">Academic Year: ${selectedYear === 'latest' ? 'Latest' : selectedYear}</p>
          <p style="color: #666; margin: 0;">${selectedClass === 'all' ? 'All Classes' : selectedClass}</p>
        </div>

        <!-- Summary -->
        <div style="background: #f8f9ff; border: 2px solid #4c63d2; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 10px 0; color: #4c63d2;">Summary</h3>
          <p style="margin: 5px 0;"><strong>Total Students ${status === 'promote' ? 'Promoted' : status === 'retain' ? 'Retained' : 'Under Review'}:</strong> ${studentsWithStatus.length}</p>
          <p style="margin: 5px 0;"><strong>Date Generated:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
          <p style="margin: 5px 0;"><strong>Generated By:</strong> Academic Office</p>
        </div>

        ${studentsWithStatus.length === 0 ? 
          `<div style="text-align: center; padding: 40px;">
            <p style="color: #666; font-size: 18px;">No students found for ${statusTitle.toLowerCase()}</p>
          </div>` :
          `<!-- Students List -->
          <div style="margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #4c63d2; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: linear-gradient(to right, #e3f2fd, #bbdefb);">
                  <th style="border: 1px solid #4c63d2; padding: 12px; text-align: left; font-weight: bold;">S/N</th>
                  <th style="border: 1px solid #4c63d2; padding: 12px; text-align: left; font-weight: bold;">Student ID</th>
                  <th style="border: 1px solid #4c63d2; padding: 12px; text-align: left; font-weight: bold;">Student Name</th>
                  <th style="border: 1px solid #4c63d2; padding: 12px; text-align: center; font-weight: bold;">Current Class</th>
                  <th style="border: 1px solid #4c63d2; padding: 12px; text-align: center; font-weight: bold;">Overall Average</th>
                  <th style="border: 1px solid #4c63d2; padding: 12px; text-align: center; font-weight: bold;">${status === 'promote' ? 'Next Class' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                ${studentsWithStatus.map((student, index) => `
                  <tr style="background: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
                    <td style="border: 1px solid #4c63d2; padding: 10px; text-align: center;">${index + 1}</td>
                    <td style="border: 1px solid #4c63d2; padding: 10px;">${student.id}</td>
                    <td style="border: 1px solid #4c63d2; padding: 10px; font-weight: 500;">${student.name}</td>
                    <td style="border: 1px solid #4c63d2; padding: 10px; text-align: center;">${student.currentClass}</td>
                    <td style="border: 1px solid #4c63d2; padding: 10px; text-align: center; font-weight: bold;">${student.overallAverage}%</td>
                    <td style="border: 1px solid #4c63d2; padding: 10px; text-align: center; font-weight: bold; color: ${status === 'promote' ? '#2e7d32' : status === 'retain' ? '#d32f2f' : '#f57c00'};">
                      ${status === 'promote' ? getNextClass(student.currentClass) : status === 'retain' ? 'Retained' : 'Under Review'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`
        }

        <!-- Footer -->
        <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 2px solid #4c63d2;">
          <div style="text-align: center; width: 45%;">
            <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 50px;"></div>
            <p style="font-weight: bold; color: #4c63d2; margin: 0;">Academic Coordinator</p>
            <p style="font-size: 12px; color: #666;">Date: ___________</p>
          </div>
          <div style="text-align: center; width: 45%;">
            <div style="border-bottom: 2px solid #333; margin-bottom: 10px; height: 50px;"></div>
            <p style="font-weight: bold; color: #4c63d2; margin: 0;">Principal</p>
            <p style="font-size: 12px; color: #666;">Date: ___________</p>
          </div>
        </div>

        <!-- Statistics -->
        <div style="margin-top: 30px; padding: 15px; background: #f0f4ff; border-radius: 8px;">
          <h4 style="margin: 0 0 10px 0; color: #4c63d2;">Promotion Statistics</h4>
          <div style="display: flex; justify-content: space-around; text-align: center;">
            <div>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2e7d32;">${promotionStats.promote}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">Promoted</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #d32f2f;">${promotionStats.retain}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">Retained</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #f57c00;">${promotionStats.review}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">Under Review</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1976d2;">${promotionStats.total}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">Total</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    `;
  };

  const downloadPromotionList = (status: 'promote' | 'retain' | 'review') => {
    const statusText = status === 'promote' ? 'Promoted' : 
                      status === 'retain' ? 'Retained' : 'Under_Review';
    const filename = `${statusText}_Students_${selectedClass}_${selectedYear}.pdf`;
    
    const listContent = generatePromotionList(status);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${listContent}
            <div class="no-print" style="margin-top: 20px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; margin: 5px; background: #4c63d2; color: white; border: none; border-radius: 5px; cursor: pointer;">Print/Download as PDF</button>
              <button onclick="window.close()" style="padding: 10px 20px; margin: 5px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-black text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading promotion management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen" style={{ backgroundColor: 'white', color: 'black' }}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-black text-xl font-semibold">{promotionStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-gray-600 text-sm">Promote</p>
                <p className="text-black text-xl font-semibold">{promotionStats.promote}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-gray-600 text-sm">Review</p>
                <p className="text-black text-xl font-semibold">{promotionStats.review}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-gray-600 text-sm">Retain</p>
                <p className="text-black text-xl font-semibold">{promotionStats.retain}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-black">Promotion Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="glass border-gray-200">
              <TabsTrigger value="overview" className="text-black">Overview</TabsTrigger>
              <TabsTrigger value="lists" className="text-black">Generate Lists</TabsTrigger>
              <TabsTrigger value="criteria" className="text-black">Criteria</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-600 mb-4">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No students available</p>
                    <p className="text-sm">Add students and scores to manage promotions</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Controls */}
                    <Card className="glass-card border-0">
                      <CardHeader>
                        <CardTitle className="text-black">Promotion Controls</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-black">Academic Year</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                              <SelectTrigger className="glass border-gray-200 text-black">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass border-gray-200">
                                {years.map(year => (
                                  <SelectItem key={year} value={year} className="text-black">
                                    {year === "latest" ? "Latest" : year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-black">Class Filter</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                              <SelectTrigger className="glass border-gray-200 text-black">
                                <SelectValue placeholder="All classes" />
                              </SelectTrigger>
                              <SelectContent className="glass border-gray-200">
                                <SelectItem value="all" className="text-black">All Classes</SelectItem>
                                {classes.map(cls => (
                                  <SelectItem key={cls} value={cls} className="text-black">{cls}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button 
                          onClick={handleAutoPromotion}
                          className="bubble-button bg-green-500/20 hover:bg-green-500/30 text-black border-green-500/30 w-full"
                          disabled={filteredStudents.length === 0}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Process Auto Promotion
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Promotion Criteria */}
                    <Card className="glass-card border-0">
                      <CardHeader>
                        <CardTitle className="text-black">Promotion Criteria</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-black">Minimum Average (%)</Label>
                          <Input
                            type="number"
                            value={promotionCriteria.minimumAverage}
                            onChange={(e) => setPromotionCriteria({
                              ...promotionCriteria,
                              minimumAverage: parseInt(e.target.value) || 0
                            })}
                            className="glass border-gray-200 text-black"
                          />
                        </div>
                        <div>
                          <Label className="text-black">Minimum Subjects to Pass</Label>
                          <Input
                            type="number"
                            value={promotionCriteria.minimumSubjectPass}
                            onChange={(e) => setPromotionCriteria({
                              ...promotionCriteria,
                              minimumSubjectPass: parseInt(e.target.value) || 0
                            })}
                            className="glass border-gray-200 text-black"
                          />
                        </div>
                        <div>
                          <Label className="text-black">Total Subjects</Label>
                          <Input
                            type="number"
                            value={promotionCriteria.totalSubjects}
                            onChange={(e) => setPromotionCriteria({
                              ...promotionCriteria,
                              totalSubjects: parseInt(e.target.value) || 8
                            })}
                            className="glass border-gray-200 text-black"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Students Table */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="text-black">Student Promotion Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="glass rounded-lg overflow-hidden border border-gray-200">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-200">
                              <TableHead className="text-gray-700">Student ID</TableHead>
                              <TableHead className="text-gray-700">Name</TableHead>
                              <TableHead className="text-gray-700">Current Class</TableHead>
                              <TableHead className="text-gray-700">Overall Average</TableHead>
                              <TableHead className="text-gray-700">Status</TableHead>
                              <TableHead className="text-gray-700">Next Class</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredStudents.map((student) => (
                              <TableRow key={student.id} className="border-gray-200">
                                <TableCell className="text-black">{student.id}</TableCell>
                                <TableCell className="text-black">{student.name}</TableCell>
                                <TableCell className="text-black">{student.currentClass}</TableCell>
                                <TableCell className="text-black">{student.overallAverage}%</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="secondary" 
                                    className={`${
                                      student.status === 'promote' ? 'bg-green-500/20 text-green-800 border-green-500/30' :
                                      student.status === 'review' ? 'bg-yellow-500/20 text-yellow-800 border-yellow-500/30' :
                                      student.status === 'no-scores' ? 'bg-gray-500/20 text-gray-800 border-gray-500/30' :
                                      'bg-red-500/20 text-red-800 border-red-500/30'
                                    }`}
                                  >
                                    {student.status === 'promote' ? 'Promote' :
                                     student.status === 'review' ? 'Review' :
                                     student.status === 'no-scores' ? 'No Scores' : 'Retain'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-black">
                                  {student.status === 'promote' ? getNextClass(student.currentClass) : student.currentClass}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="lists" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="text-black flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Promoted Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-black text-3xl font-bold">{promotionStats.promote}</p>
                      <p className="text-gray-600">Students to be promoted</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => downloadPromotionList('promote')}
                        className="bubble-button bg-green-500/20 hover:bg-green-500/30 text-black border-green-500/30 w-full"
                        disabled={promotionStats.promote === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download List
                      </Button>
                      <Button 
                        onClick={() => downloadPromotionList('promote')}
                        className="bubble-button bg-blue-500/20 hover:bg-blue-500/30 text-black border-blue-500/30 w-full"
                        disabled={promotionStats.promote === 0}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print List
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="text-black flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-red-600" />
                      Retained Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-black text-3xl font-bold">{promotionStats.retain}</p>
                      <p className="text-gray-600">Students to be retained</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => downloadPromotionList('retain')}
                        className="bubble-button bg-red-500/20 hover:bg-red-500/30 text-black border-red-500/30 w-full"
                        disabled={promotionStats.retain === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download List
                      </Button>
                      <Button 
                        onClick={() => downloadPromotionList('retain')}
                        className="bubble-button bg-blue-500/20 hover:bg-blue-500/30 text-black border-blue-500/30 w-full"
                        disabled={promotionStats.retain === 0}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print List
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="text-black flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      Under Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-black text-3xl font-bold">{promotionStats.review}</p>
                      <p className="text-gray-600">Students under review</p>
                    </div>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => downloadPromotionList('review')}
                        className="bubble-button bg-yellow-500/20 hover:bg-yellow-500/30 text-black border-yellow-500/30 w-full"
                        disabled={promotionStats.review === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download List
                      </Button>
                      <Button 
                        onClick={() => downloadPromotionList('review')}
                        className="bubble-button bg-blue-500/20 hover:bg-blue-500/30 text-black border-blue-500/30 w-full"
                        disabled={promotionStats.review === 0}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print List
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="criteria">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-black">Promotion Criteria Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-black">Minimum Overall Average (%)</Label>
                      <Input
                        type="number"
                        value={promotionCriteria.minimumAverage}
                        onChange={(e) => setPromotionCriteria({
                          ...promotionCriteria,
                          minimumAverage: parseInt(e.target.value) || 0
                        })}
                        className="glass border-gray-200 text-black"
                        min="0"
                        max="100"
                      />
                      <p className="text-gray-600 text-sm mt-1">
                        Students must achieve this overall average to be eligible for promotion
                      </p>
                    </div>
                    <div>
                      <Label className="text-black">Minimum Subjects to Pass</Label>
                      <Input
                        type="number"
                        value={promotionCriteria.minimumSubjectPass}
                        onChange={(e) => setPromotionCriteria({
                          ...promotionCriteria,
                          minimumSubjectPass: parseInt(e.target.value) || 0
                        })}
                        className="glass border-gray-200 text-black"
                        min="0"
                        max="8"
                      />
                      <p className="text-gray-600 text-sm mt-1">
                        Minimum number of subjects a student must pass
                      </p>
                    </div>
                    <div>
                      <Label className="text-black">Total Subjects</Label>
                      <Input
                        type="number"
                        value={promotionCriteria.totalSubjects}
                        onChange={(e) => setPromotionCriteria({
                          ...promotionCriteria,
                          totalSubjects: parseInt(e.target.value) || 8
                        })}
                        className="glass border-gray-200 text-black"
                        min="1"
                        max="10"
                      />
                      <p className="text-gray-600 text-sm mt-1">
                        Total number of subjects offered
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-black mb-2">Promotion Rules</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• <strong>Promote:</strong> Students who meet both minimum average and subject pass requirements</li>
                      <li>• <strong>Review:</strong> Students who meet some but not all requirements</li>
                      <li>• <strong>Retain:</strong> Students with average below 40% or passing fewer than 3 subjects</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}