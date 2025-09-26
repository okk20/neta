import database, { type User } from "./database";

export interface InitializationResult {
  success: boolean;
  error?: string;
}

export class AppInitializer {
  static async initializeDatabase(): Promise<InitializationResult> {
    try {
      console.log('🚀 Initializing SEMS database...');
      
      await database.init();
      console.log('✅ Database connection established');
      
      await database.initializeDefaultSettings();
      console.log('✅ Default settings initialized');
      
      // Check for existing admin user
      const users = await database.getAllUsers();
      console.log('📊 Current users in database:', users.map(u => ({
        id: u.id, 
        username: u.username, 
        role: u.role, 
        status: u.status
      })));
      
      const adminUser = users.find(u => u.role === 'admin');
      
      if (!adminUser) {
        await AppInitializer.createDefaultAdmin();
      } else {
        console.log('✅ Admin user already exists:', {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          status: adminUser.status
        });
      }
      
      // Test database operations
      await AppInitializer.testDatabaseOperations();
      
      // Final verification
      await AppInitializer.verifyAdminUser();
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      return { 
        success: false, 
        error: `Database initialization failed: ${errorMessage}` 
      };
    }
  }

  private static async createDefaultAdmin(): Promise<void> {
    const defaultAdmin: User = {
      id: 'ADMIN_001',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      email: 'admin@sems.edu.gh',
      phone: '+233 24 000 0000',
      status: 'active',
      lastLogin: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await database.addUser(defaultAdmin);
    console.log('✅ Default admin user created with credentials:', {
      username: defaultAdmin.username,
      password: defaultAdmin.password,
      role: defaultAdmin.role,
      status: defaultAdmin.status
    });
    
    // Verify the user was created
    const verifyUsers = await database.getAllUsers();
    const createdAdmin = verifyUsers.find(u => u.username === 'admin');
    console.log('🔍 Verification - Admin user in database:', createdAdmin ? 'Found' : 'Not Found');
    
    if (createdAdmin) {
      console.log('👤 Admin user details:', {
        id: createdAdmin.id,
        username: createdAdmin.username,
        role: createdAdmin.role,
        status: createdAdmin.status,
        password: '***' + createdAdmin.password.slice(-3)
      });
    }
  }

  private static async testDatabaseOperations(): Promise<void> {
    try {
      const testData = await Promise.all([
        database.getAllStudents().catch(() => []),
        database.getAllTeachers().catch(() => []),
        database.getAllSubjects().catch(() => []),
        database.getAllScores().catch(() => [])
      ]);
      
      console.log('📊 SEMS Database stats:', {
        students: testData[0]?.length || 0,
        teachers: testData[1]?.length || 0,
        subjects: testData[2]?.length || 0,
        scores: testData[3]?.length || 0
      });
      
      // Run database health check
      const healthCheck = await database.testDatabase();
      console.log('🏥 Database health check:', healthCheck);
      
    } catch (testError) {
      console.warn('Database test operations failed:', testError);
    }
  }

  private static async verifyAdminUser(): Promise<void> {
    const finalUsers = await database.getAllUsers();
    const finalAdmin = finalUsers.find(u => u.username === 'admin' && u.role === 'admin');
    
    if (!finalAdmin) {
      console.error('❌ Critical: Admin user still not found after initialization');
      // Force create admin user
      const emergencyAdmin: User = {
        id: 'EMERGENCY_ADMIN',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        email: 'admin@sems.edu.gh',
        phone: '+233 24 000 0000',
        status: 'active',
        lastLogin: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await database.addUser(emergencyAdmin);
      console.log('🆘 Emergency admin user created');
    }
  }
}