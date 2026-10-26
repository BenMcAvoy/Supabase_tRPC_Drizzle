import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { classes, studentClasses, students } from "./db/schema.mjs";
import { getDb } from "./db/index.mjs";
import { protectedProcedure, publicProcedure, router } from "./trpc.mjs";

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok" as const })),
  dbHealth: publicProcedure.query(async () => {
    try {
      await getDb().execute(sql`select 1`);
      return { status: "ok" as const };
    } catch (cause) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
        cause,
      });
    }
  }),
  whoami: protectedProcedure.query(({ ctx }) => ({ email: ctx.user.email ?? null })),
  students: router({
    list: protectedProcedure.query(async () => {
      const records = await getDb().query.students.findMany({
        orderBy: (table, { asc }) => asc(table.name),
        with: { enrollments: { with: { class: true } } },
      });

      return records.map((student) => ({
        id: student.id,
        name: student.name,
        classes: student.enrollments.map(({ class: classRecord }) => ({
          id: classRecord.id,
          name: classRecord.name,
        })),
      }));
    }),
    create: protectedProcedure
      .input(z.object({ name: z.string().trim().min(1).max(100) }))
      .mutation(async ({ input }) => {
        const [student] = await getDb()
          .insert(students)
          .values({ name: input.name })
          .returning({ id: students.id, name: students.name });

        return student;
      }),
  }),
  classes: router({
    list: protectedProcedure.query(async () => {
      const records = await getDb().query.classes.findMany({
        orderBy: (table, { asc }) => asc(table.name),
        with: { enrollments: { with: { student: true } } },
      });

      return records.map((classRecord) => ({
        id: classRecord.id,
        name: classRecord.name,
        students: classRecord.enrollments.map(({ student }) => ({
          id: student.id,
          name: student.name,
        })),
      }));
    }),
    create: protectedProcedure
      .input(z.object({ name: z.string().trim().min(1).max(100) }))
      .mutation(async ({ input }) => {
        const [classRecord] = await getDb()
          .insert(classes)
          .values({ name: input.name })
          .returning({ id: classes.id, name: classes.name });

        return classRecord;
      }),
  }),
  enrollments: router({
    add: protectedProcedure
      .input(z.object({ studentId: z.string().uuid(), classId: z.string().uuid() }))
      .mutation(async ({ input }) => {
        await getDb()
          .insert(studentClasses)
          .values(input)
          .onConflictDoNothing();

        return { success: true as const };
      }),
  }),
  greeting: publicProcedure
    .input(z.object({ name: z.string().trim().min(1).default("world") }).default({ name: "world" }))
    .query(({ input }) => ({ message: `Hello, ${input.name}!` })),
});

export type AppRouter = typeof appRouter;
