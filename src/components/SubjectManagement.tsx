import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Modal } from "./ui/modal";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  Sparkles
} from "lucide-react";
import { db, type Subject, type Teacher } from "../utils/database";

export function SubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL_CATEGORIES');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    creditHours: 1,
    isCore: false,
    teacherId: 'NO_TEACHER'
  });

  const categories = ['Core', 'Elective', 'Vocational', 'Co-curricular'];

  // Auto-generate subject descriptions
  const subjectDescriptions: { [key: string]: string } = {
    'Mathematics': 'A comprehensive study of numerical concepts, algebra, geometry, and problem-solving skills essential for academic and real-world applications.',
    'English Language': 'Development of reading, writing, speaking, and listening skills to enhance communication and literacy in the English language.',
    'Science': 'An integrated approach to understanding natural phenomena through physics, chemistry, and biology concepts and practical investigations.',
    'Social Studies': 'Exploration of human society, culture, geography, history, and civic responsibility to develop informed citizenship.',
    'ICT': 'Introduction to information and communication technology, including computer literacy, digital skills, and modern technology applications.',
    'RME': 'Religious and moral education focusing on ethical values, spiritual development, and understanding diverse religious traditions.',
    'French': 'Introduction to the French language including basic vocabulary, grammar, pronunciation, and cultural understanding.',
    'Creative Arts': 'Expression through various artistic mediums including visual arts, music, drama, and creative design to foster imagination and creativity.',
    'Physical Education': 'Development of physical fitness, motor skills, sportsmanship, and healthy lifestyle habits through various sports and activities.',
    'Technical Skills': 'Practical training in vocational and technical skills to prepare students for hands-on careers and technical applications.'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsList, teachersList] = await Promise.all([
        db.getAllSubjects(),
        db.getAllTeachers()
      ]);
      setSubjects(subjectsList);
      setTeachers(teachersList);
      setError('');
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const resetForm = () => {
    setSubjectForm({
      name: '',
      code: '',
      description: '',
      category: '',
      creditHours: 1,
      isCore: false,
      teacherId: 'NO_TEACHER'
    });
    setEditingSubject(null);
    setShowModal(false);
  };

  const generateSubjectCode = (name: string): string => {
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase() + '101';
    } else {
      const firstLetters = words.map(word => word.charAt(0).toUpperCase()).join('');
      return firstLetters.substring(0, 3) + '101';
    }
  };

  const generateDescription = (subjectName: string): string => {
    // First check if we have a predefined description
    const predefinedDesc = subjectDescriptions[subjectName];
    if (predefinedDesc) {
      return predefinedDesc;
    }

    // Generate a description based on subject name patterns
    const name = subjectName.toLowerCase();
    
    if (name.includes('math')) {
      return 'A comprehensive study of mathematical concepts, problem-solving, and analytical thinking skills essential for academic and practical applications.';
    } else if (name.includes('english') || name.includes('language')) {
      return 'Development of communication skills including reading, writing, speaking, and listening to enhance language proficiency and literacy.';
    } else if (name.includes('science')) {
      return 'Scientific exploration and understanding of natural phenomena through observation, experimentation, and critical analysis.';
    } else if (name.includes('history') || name.includes('social')) {
      return 'Study of human society, historical events, and cultural development to understand social structures and civic responsibility.';
    } else if (name.includes('art') || name.includes('creative')) {
      return 'Creative expression and artistic development through various mediums to foster imagination, creativity, and aesthetic appreciation.';
    } else if (name.includes('physical') || name.includes('sport')) {
      return 'Physical fitness, motor skill development, and healthy lifestyle education through sports, exercise, and wellness activities.';
    } else if (name.includes('music')) {
      return 'Musical education including theory, performance, and appreciation to develop artistic expression and cultural understanding.';
    } else if (name.includes('computer') || name.includes('technology') || name.includes('ict')) {
      return 'Information and communication technology education including digital literacy, computer skills, and modern technology applications.';
    } else {
      return `Comprehensive study of ${subjectName} principles, concepts, and practical applications to develop knowledge and skills in this academic area.`;
    }
  };

  const handleNameChange = (name: string) => {
    setSubjectForm(prev => ({
      ...prev,
      name,
      code: prev.code || generateSubjectCode(name),
      description: prev.description || generateDescription(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      // Validation
      if (!subjectForm.name.trim()) {
        throw new Error('Subject name is required');
      }
      if (!subjectForm.category) {
        throw new Error('Category is required');
      }
      if (subjectForm.creditHours < 1 || subjectForm.creditHours > 10) {
        throw new Error('Credit hours must be between 1 and 10');
      }

      const code = subjectForm.code.trim() || generateSubjectCode(subjectForm.name);

      // Check for duplicate subject code
      const existingSubject = subjects.find(s => 
        s.code.toLowerCase() === code.toLowerCase() && 
        (!editingSubject || s.id !== editingSubject.id)
      );
      if (existingSubject) {
        throw new Error('Subject code already exists. Please use a different code.');
      }

      const subjectData: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'> = {
        name: subjectForm.name.trim(),
        code: code.toUpperCase(),
        description: subjectForm.description.trim() || generateDescription(subjectForm.name),
        category: subjectForm.category,
        creditHours: subjectForm.creditHours,
        isCore: subjectForm.isCore,
        teacherId: subjectForm.teacherId === 'NO_TEACHER' ? undefined : subjectForm.teacherId
      };

      if (editingSubject) {
        await db.updateSubject(editingSubject.id, subjectData);
        setSuccess('Subject updated successfully!');
      } else {
        await db.addSubject(subjectData as Subject);
        setSuccess('Subject added successfully!');
      }

      await loadData();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save subject:', error);
      setError(error.message || 'Failed to save subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setSubjectForm({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      category: subject.category,
      creditHours: subject.creditHours,
      isCore: subject.isCore,
      teacherId: subject.teacherId || 'NO_TEACHER'
    });
    setEditingSubject(subject);
    setShowModal(true);
    clearMessages();
  };

  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone and will remove all related scores.`)) {
      return;
    }

    try {
      setLoading(true);
      await db.deleteSubject(subject.id);
      setSuccess('Subject deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to delete subject:', error);
      setError('Failed to delete subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL_CATEGORIES' || subject.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getTeacherName = (teacherId: string | undefined) => {
    if (!teacherId) return 'Not assigned';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.title} ${teacher.name}` : 'Unknown Teacher';
  };

  return (
    <div className="space-y-3">
      <Card className="glass-card">
        <CardHeader className="card-compact-header">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm">
            <BookOpen className="w-3 h-3" />
            Subject Management
          </CardTitle>
        </CardHeader>
        <CardContent className="card-compact space-y-3">
          {/* Success/Error Messages */}
          {error && (
            <Alert className="py-1 border-red-500 bg-red-900/20">
              <AlertCircle className="h-2.5 w-2.5 text-red-400" />
              <AlertDescription className="text-red-300 text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="py-1 border-green-500 bg-green-900/20">
              <CheckCircle className="h-2.5 w-2.5 text-green-400" />
              <AlertDescription className="text-green-300 text-xs">{success}</AlertDescription>
            </Alert>
          )}

          {/* Ultra Compact Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-1.5 top-1.5 h-2.5 w-2.5 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass pl-6 input-compact"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="glass w-full sm:w-32 input-compact">
                <SelectValue placeholder="Filter category" />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="ALL_CATEGORIES">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setShowModal(true);
                clearMessages();
              }}
              className="bg-green-600 hover:bg-green-700 text-white btn-compact"
            >
              <Plus className="w-2.5 h-2.5 mr-1" />
              Add
            </Button>
          </div>

          {/* Ultra Compact Statistics */}
          <div className="grid grid-cols-4 grid-compact-sm">
            {[
              { label: 'Total', value: subjects.length, icon: BookOpen, color: 'text-primary' },
              { label: 'Core', value: subjects.filter(s => s.isCore).length, icon: Star, color: 'text-green-400' },
              { label: 'Assigned', value: subjects.filter(s => s.teacherId).length, icon: Users, color: 'text-blue-400' },
              { label: 'Credit Hrs', value: subjects.reduce((sum, s) => sum + s.creditHours, 0), icon: Clock, color: 'text-foreground' }
            ].map((stat, index) => (
              <div key={index} className="glass-card card-compact text-center">
                <stat.icon className={`w-3 h-3 mx-auto mb-0.5 ${stat.color}`} />
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Ultra Compact Subjects List */}
          {loading && !showModal ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-6">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-foreground mb-1 text-sm">No Subjects Found</h3>
              <p className="text-muted-foreground text-xs mb-2">
                {searchTerm || filterCategory !== 'ALL_CATEGORIES' ? 'No subjects match your criteria.' : 'Start by adding subjects.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-compact-sm">
              {filteredSubjects.map((subject) => (
                <Card key={subject.id} className="glass-card hover:shadow-lg transition-all duration-200">
                  <CardContent className="card-compact">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate text-xs">{subject.name}</h3>
                        <p className="text-xs text-muted-foreground">Code: {subject.code}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {subject.isCore && (
                          <Star className="w-2.5 h-2.5 text-yellow-400" title="Core Subject" />
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-0.5 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {subject.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-2 h-2" />
                          <span>{subject.creditHours} hrs</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-2 h-2" />
                          <span className="truncate text-xs">{getTeacherName(subject.teacherId)}</span>
                        </div>
                      </div>
                      
                      {subject.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {subject.description.substring(0, 60)}...
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEdit(subject)}
                        size="sm"
                        variant="outline"
                        className="glass flex-1 btn-compact"
                      >
                        <Edit className="w-2 h-2 mr-0.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(subject)}
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-400 hover:bg-red-900/20 btn-compact-icon"
                      >
                        <Trash2 className="w-2 h-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compact Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-ultra-compact">
          <div className="space-y-2">
            <div>
              <Label htmlFor="name" className="text-foreground text-xs">Subject Name *</Label>
              <Input
                id="name"
                value={subjectForm.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="glass input-compact"
                placeholder="e.g., Mathematics"
                required
              />
            </div>
            <div>
              <Label htmlFor="code" className="text-foreground text-xs">Subject Code *</Label>
              <Input
                id="code"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value }))}
                className="glass input-compact"
                placeholder="e.g., MAT101"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="category" className="text-foreground text-xs">Category *</Label>
                <Select value={subjectForm.category} onValueChange={(value) => setSubjectForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="glass input-compact">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="creditHours" className="text-foreground text-xs">Credit Hours *</Label>
                <Input
                  id="creditHours"
                  type="number"
                  min="1"
                  max="10"
                  value={subjectForm.creditHours}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, creditHours: parseInt(e.target.value) || 1 }))}
                  className="glass input-compact"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="teacherId" className="text-foreground text-xs">Assigned Teacher</Label>
              <Select value={subjectForm.teacherId} onValueChange={(value) => setSubjectForm(prev => ({ ...prev, teacherId: value }))}>
                <SelectTrigger className="glass input-compact">
                  <SelectValue placeholder="Select teacher (optional)" />
                </SelectTrigger>
                <SelectContent className="glass">
                  <SelectItem value="NO_TEACHER">No teacher assigned</SelectItem>
                  {teachers.filter(t => t.status === 'active').slice(0, 5).map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.title} {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCore"
                checked={subjectForm.isCore}
                onCheckedChange={(checked) => setSubjectForm(prev => ({ ...prev, isCore: !!checked }))}
                className="w-3 h-3"
              />
              <Label htmlFor="isCore" className="text-foreground text-xs">
                Core Subject
              </Label>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-foreground text-xs flex items-center gap-1">
                Description 
                <Sparkles className="w-2.5 h-2.5 text-yellow-400" title="Auto-generated" />
              </Label>
              <Textarea
                id="description"
                value={subjectForm.description}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                className="glass textarea-compact"
                rows={2}
                placeholder="Auto-generated description..."
              />
              <p className="text-xs text-muted-foreground mt-0.5">
                💡 Auto-generated when you enter subject name
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white flex-1 btn-compact"
            >
              {loading ? (
                <>
                  <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />
                  {editingSubject ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-2.5 h-2.5 mr-1" />
                  {editingSubject ? 'Update' : 'Add'}
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              className="glass flex-1 btn-compact"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}