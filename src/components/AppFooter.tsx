export function AppFooter() {
  return (
    <div className="mt-16 mb-8">
      <div className="glass-card p-4 rounded-xl bg-white">
        <div className="text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} School Examination Management System (SEMS) - All rights reserved
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Offinso College of Education J.H.S. - "Knowledge is Power"
          </p>
        </div>
      </div>
    </div>
  );
}