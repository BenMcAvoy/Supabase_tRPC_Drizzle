import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/trpc";

export function ApiTestPanel() {
  const health = trpc.health.useQuery(undefined, { enabled: false });
  const database = trpc.dbHealth.useQuery(undefined, { enabled: false });
  const whoami = trpc.whoami.useQuery(undefined, { enabled: false });

  return (
    <Card className="h-full w-full">
      <CardHeader><CardTitle>API tests</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button disabled={health.isFetching} onClick={() => void health.refetch()}>
            {health.isFetching ? "Testing..." : "Test API"}
          </Button>
          <Button disabled={database.isFetching} onClick={() => void database.refetch()} variant="outline">
            {database.isFetching ? "Testing..." : "Test DB"}
          </Button>
          <Button disabled={whoami.isFetching} onClick={() => void whoami.refetch()} variant="outline">
            {whoami.isFetching ? "Loading..." : "Whoami"}
          </Button>
        </div>

        {health.data && <p className="text-sm">API status: {health.data.status}</p>}
        {health.error && <ApiError message={health.error.message} />}
        {database.data && <p className="text-sm">Database status: {database.data.status}</p>}
        {database.error && <ApiError message={database.error.message} />}
        {whoami.data && <p className="text-sm">Email: {whoami.data.email}</p>}
        {whoami.error && <ApiError message={whoami.error.message} />}
      </CardContent>
    </Card>
  );
}

function ApiError({ message }: { message: string }) {
  return <Alert variant="destructive"><AlertDescription>{message}</AlertDescription></Alert>;
}
