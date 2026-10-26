import { ApiTestPanel } from "@/components/api-test-panel";
import { AuthPanel } from "@/components/auth-panel";
import { ClassesPanel } from "@/components/classes-panel";
import { StudentsPanel } from "@/components/students-panel";

export default function App() {
  return (
    <main className="app-grid divide-x divide-y">
      <section
        aria-label="Auth status"
        className="app-grid__auth flex items-start justify-center p-4 md:p-8"
      >
        <AuthPanel />
      </section>

      <section aria-label="API tests" className="app-grid__api p-4 md:p-8">
        <ApiTestPanel />
      </section>

      <section aria-label="Students" className="app-grid__lower-left min-h-0 p-4 md:p-8">
        <StudentsPanel />
      </section>

      <section aria-label="Classes" className="app-grid__lower-right min-h-0 p-4 md:p-8">
        <ClassesPanel />
      </section>
    </main>
  );
}
