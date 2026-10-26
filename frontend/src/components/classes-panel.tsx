import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc";

export function ClassesPanel() {
  const [name, setName] = useState("");
  const utils = trpc.useUtils();

  const classes = trpc.classes.list.useQuery();
  const createClass = trpc.classes.create.useMutation({
    onSuccess: async () => {
      setName("");
      await Promise.all([
        utils.classes.list.invalidate(),
        utils.students.list.invalidate(),
      ]);
    },
  });

  function handleCreateClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createClass.mutate({ name });
  }

  return (
    <Card className="h-full w-full">
      <CardHeader><CardTitle>Classes</CardTitle></CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <form className="flex gap-2" onSubmit={handleCreateClass}>
          <Input
            aria-label="Class name"
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            placeholder="Class name"
            required
            value={name}
          />
          <Button disabled={createClass.isPending} type="submit">
            {createClass.isPending ? "Adding..." : "Add"}
          </Button>
        </form>

        {classes.isPending && <p className="text-sm text-muted-foreground">Loading classes...</p>}
        {classes.error && <ApiError message={classes.error.message} />}
        {createClass.error && <ApiError message={createClass.error.message} />}
        {classes.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No classes yet.</p>
        )}

        <ul className="space-y-3">
          {classes.data?.map((classRecord) => (
            <li className="rounded-md border p-3" key={classRecord.id}>
              <p className="font-medium">{classRecord.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Students: {classRecord.students.map((student) => student.name).join(", ") || "None"}
              </p>
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
