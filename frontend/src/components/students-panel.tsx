import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc";

export function StudentsPanel() {
  const [name, setName] = useState("");
  const [classByStudent, setClassByStudent] = useState<Record<string, string>>({});
  const utils = trpc.useUtils();

  const students = trpc.students.list.useQuery();
  const classes = trpc.classes.list.useQuery();

  const createStudent = trpc.students.create.useMutation({
    onSuccess: async () => {
      setName("");
      await utils.students.list.invalidate();
    },
  });

  const enrollStudent = trpc.enrollments.add.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.students.list.invalidate(),
        utils.classes.list.invalidate(),
      ]);
    },
  });

  function handleCreateStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createStudent.mutate({ name });
  }

  function handleEnroll(event: FormEvent<HTMLFormElement>, studentId: string) {
    event.preventDefault();
    const classId = classByStudent[studentId];
    if (!classId) return;

    enrollStudent.mutate({ studentId, classId });
  }

  return (
    <Card className="h-full w-full">
      <CardHeader><CardTitle>Students</CardTitle></CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <form className="flex gap-2" onSubmit={handleCreateStudent}>
          <Input
            aria-label="Student name"
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            placeholder="Student name"
            required
            value={name}
          />
          <Button disabled={createStudent.isPending} type="submit">
            {createStudent.isPending ? "Adding..." : "Add"}
          </Button>
        </form>

        {students.isPending && <p className="text-sm text-muted-foreground">Loading students...</p>}
        {students.error && <ApiError message={students.error.message} />}
        {createStudent.error && <ApiError message={createStudent.error.message} />}
        {enrollStudent.error && <ApiError message={enrollStudent.error.message} />}

        {students.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No students yet.</p>
        )}

        <ul className="space-y-3">
          {students.data?.map((student) => (
            <li className="rounded-md border p-3" key={student.id}>
              <p className="font-medium">{student.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Classes: {student.classes.map((classRecord) => classRecord.name).join(", ") || "None"}
              </p>

              <form className="mt-3 flex gap-2" onSubmit={(event) => handleEnroll(event, student.id)}>
                <Select
                  onValueChange={(value) => {
                    if (value) setClassByStudent((current) => ({ ...current, [student.id]: value }));
                  }}
                  value={classByStudent[student.id]}
                >
                  <SelectTrigger aria-label={`Choose a class for ${student.name}`} className="min-w-0 flex-1">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.data?.map((classRecord) => (
                      <SelectItem key={classRecord.id} value={classRecord.id}>
                        {classRecord.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!classes.data?.length || !classByStudent[student.id] || enrollStudent.isPending}
                  type="submit"
                  variant="outline"
                >
                  Enroll
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ApiError({ message }: { message: string }) {
  return <Alert variant="destructive"><AlertDescription>{message}</AlertDescription></Alert>;
}
