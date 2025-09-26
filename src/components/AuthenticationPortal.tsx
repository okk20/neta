import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { GraduationCap, Shield, User, Users, Phone, UserPlus } from "lucide-react";
import { LoginForm } from "./auth/LoginForm";
import { StudentLoginForm } from "./auth/StudentLoginForm";
import { TeacherLoginForm } from "./auth/TeacherLoginForm";
import { TeacherSignupForm } from "./auth/TeacherSignupForm";
import type { User as UserType } from "../utils/database";

interface AuthenticationPortalProps {
  onLogin: (user: UserType | any) => void;
}

export function AuthenticationPortal({ onLogin }: AuthenticationPortalProps) {
  const [activeTab, setActiveTab] = useState("admin");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            School Examination Management System
          </h1>
          <p className="text-gray-600 text-sm">
            SEMS - School Examination Management System
          </p>
          <p className="text-gray-500 text-xs mt-1">
            "Knowledge is Power"
          </p>
        </div>

        <Card className="shadow-2xl bg-white rounded-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-gray-800">Welcome to SEMS</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6 bg-gray-100 rounded-lg p-1">
                <TabsTrigger 
                  value="admin" 
                  className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 rounded-md"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </TabsTrigger>
                <TabsTrigger 
                  value="teacher" 
                  className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 rounded-md"
                >
                  <Phone className="w-4 h-4 mr-1" />
                  Teacher
                </TabsTrigger>
                <TabsTrigger 
                  value="teacher-register" 
                  className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 rounded-md"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Register
                </TabsTrigger>
                <TabsTrigger 
                  value="student" 
                  className="text-xs data-[state=active]:bg-white data-[state=active]:text-blue-600 rounded-md"
                >
                  <User className="w-4 h-4 mr-1" />
                  Student
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Admin Login</h2>
                  <p className="text-gray-500 text-sm">
                    Enter your credentials to access the management system
                  </p>
                </div>
                <LoginForm onLogin={onLogin} />
              </TabsContent>

              <TabsContent value="teacher" className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Teacher Login</h2>
                  <p className="text-gray-500 text-sm">
                    Use your Teacher ID and phone number to access the system
                  </p>
                </div>
                <TeacherLoginForm onLogin={onLogin} />
              </TabsContent>

              <TabsContent value="teacher-register" className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Teacher Registration</h2>
                  <p className="text-gray-500 text-sm">
                    Create your teacher account with an invitation code
                  </p>
                </div>
                <TeacherSignupForm onLogin={onLogin} />
              </TabsContent>

              <TabsContent value="student" className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Student Portal</h2>
                  <p className="text-gray-500 text-sm">
                    Access your academic records and reports
                  </p>
                </div>
                <StudentLoginForm onLogin={onLogin} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} SEMS. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Secure and reliable school management system
          </p>
        </div>
      </div>
    </div>
  );
}