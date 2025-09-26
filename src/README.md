# School Examination Management System (SEMS)

A comprehensive school management system built for **Offinso College of Education J.H.S.** with modern web technologies, featuring student registration, teacher management, score tracking, report generation, and WhatsApp integration.

## 🌟 Features

### 🎓 Student Management
- **Auto-generated Student IDs** (SU1-SU1000 format)
- **Complete student profiles** with photo upload support
- **Class assignments** (B.S.7A-C, B.S.8A-C, B.S.9A-C)
- **Guardian information** with contact details
- **Full-window profile views** with academic overview
- **Numerical attendance tracking**

### 👨‍🏫 Teacher Management
- **Teacher registration** with qualification tracking
- **Subject allocation** and class teacher assignments
- **Professional profile management**
- **Employment record tracking**
- **Contact information management**

### 📊 Academic Management
- **Score entry** system (Class: 50 MAX, Exam: 50 MAX)
- **Simplified grading system** (A, B, C, D grades)
- **Score editing capabilities**
- **Subject-wise performance tracking**
- **Automatic promotion calculations**

### 📋 Reports & Documents
- **Professional report cards** with school logo and watermarks
- **Achievement certificates** with elegant design
- **3-year academic transcripts** showing complete academic history
- **Customizable report layouts** with proper branding
- **Print-ready formats** optimized for A4 printing

### 📱 Communication
- **WhatsApp integration** with custom message templates
- **SMS messaging support**
- **Bulk messaging** to all guardians
- **Report sharing** via messaging platforms
- **Guardian notification system**

### ⚙️ System Features
- **Multi-role authentication** (Admin, Teacher, Student)
- **SQLite3 database** with persistent data storage
- **Responsive design** for all device types
- **White theme** as default with accessibility focus
- **Search and filtering** across all modules
- **Data export/import** capabilities
- **Settings management** with academic year reset

## 🏗️ Technical Architecture

### Frontend Technologies
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Shadcn/UI** component library
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend & Storage
- **SQLite3** for data persistence
- **LocalStorage** for session management
- **File-based** configuration system
- **Client-side** data processing

### Key Components
- **Authentication Portal** with role-based access
- **Dashboard** with overview statistics  
- **Student Management** with profile views
- **Teacher Management** with assignments
- **Score Management** with editing capabilities
- **Reports Management** with multiple formats
- **Settings Management** for system configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Modern web browser with JavaScript enabled
- 2GB+ available storage space

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/sems.git
cd sems

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Default Login Credentials
- **Admin**: `admin` / `admin123`
- **Teacher**: Create via invitation system
- **Student**: Auto-generated based on student records

## 📖 User Guide

### For Administrators
1. **Login** with admin credentials
2. **Add students** using the Student Management module
3. **Register teachers** and assign subjects/classes
4. **Configure subjects** and academic settings
5. **Generate reports** for students and classes
6. **Manage system settings** and academic years

### For Teachers
1. **Login** with teacher credentials
2. **Enter student scores** for assigned subjects
3. **Edit existing scores** when necessary
4. **View class performance** statistics
5. **Generate student reports** for your classes

### For Students
1. **Login** with student credentials
2. **View academic performance** and reports
3. **Download report cards** and certificates
4. **Check attendance records**

## 🎨 Design System

### Theme Support
- **White Theme** (Default) - High contrast, professional appearance
- **Dark Theme** - Easy on eyes for extended use
- **Black Theme** - Maximum contrast for accessibility
- **Grey Theme** - Balanced neutral appearance

### Typography
- **Primary Font**: Arial, Helvetica, sans-serif
- **Monospace**: For IDs and codes
- **Serif Font**: Georgia for certificates and formal documents

### Color Palette
- **Primary**: Blue (#4c63d2)
- **Success**: Green (#22c55e)  
- **Warning**: Yellow (#eab308)
- **Destructive**: Red (#ef4444)
- **WhatsApp**: Green (#25d366)

## 📊 Database Schema

### Core Tables
- **Students**: Personal info, class, guardian details
- **Teachers**: Professional info, subjects, class assignments
- **Subjects**: Course details, codes, descriptions
- **Scores**: Class scores, exam scores, terms, years
- **Users**: Authentication, roles, permissions
- **Settings**: System configuration, school details

### Data Relationships
- Students ↔ Scores (One-to-Many)
- Teachers ↔ Subjects (Many-to-Many)
- Teachers ↔ Classes (One-to-Many for class teachers)
- Subjects ↔ Scores (One-to-Many)

## 📱 Mobile Responsiveness

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Mobile Features
- **Touch-friendly** interface
- **Collapsible sidebar** navigation
- **Optimized forms** for mobile input
- **Responsive tables** with horizontal scrolling
- **Mobile-first** design approach

## 🔒 Security Features

### Authentication
- **Role-based access control** (RBAC)
- **Secure password handling**
- **Session management**
- **Login attempt monitoring**

### Data Protection
- **Client-side encryption** for sensitive data
- **Input validation** and sanitization
- **XSS protection** through React's built-in security
- **Local data storage** (no external data transmission)

## 🧪 Testing

### Test Coverage
- **Component testing** with React Testing Library
- **Integration testing** for workflows
- **Performance testing** for large datasets
- **Cross-browser compatibility** testing

### Quality Assurance
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Accessibility** compliance testing

## 🔧 Configuration

### Environment Setup
```typescript
// Default configuration in utils/database.ts
export const DB_CONFIG = {
  name: 'SEMS_Database',
  version: 1,
  tables: ['students', 'teachers', 'subjects', 'scores', 'users', 'settings']
};
```

### School Customization
- **School name and logo** in Settings
- **Contact information** configuration  
- **Academic year** and term setup
- **Grading system** customization
- **Report templates** modification

## 📈 Performance

### Optimization Features
- **Code splitting** for faster loading
- **Lazy loading** of components
- **Image optimization** with fallbacks
- **Efficient data structures** for large datasets
- **Debounced search** for better UX

### Scalability
- **Handles 1000+ students** efficiently  
- **Unlimited subjects** and teachers
- **Multi-year data** storage
- **Bulk operations** support

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create feature branch** (`git checkout -b feature/new-feature`)
3. **Commit changes** (`git commit -am 'Add new feature'`)
4. **Push to branch** (`git push origin feature/new-feature`)
5. **Create Pull Request**

### Code Standards
- **TypeScript** for all new code
- **Functional components** with hooks
- **Tailwind CSS** for styling
- **Descriptive commit messages**
- **Component documentation**

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Offinso College of Education J.H.S.** for project requirements
- **React community** for excellent documentation
- **Tailwind CSS team** for the design system
- **Shadcn/UI** for component library
- **Open source contributors** for various packages used

## 📞 Support

### Getting Help
- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs or feature requests  
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

### System Requirements
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: 1GB free space for full dataset
- **Network**: Not required (offline capable)

---

**SEMS v1.0** - Built with ❤️ for educational excellence

*"Knowledge is Power"* - Offinso College of Education J.H.S.