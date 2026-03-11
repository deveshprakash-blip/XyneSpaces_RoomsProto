// Type declaration to make Prisma Client importable from @prisma/client
// Prisma 7 generates to node_modules/.prisma/client, but we want to import from @prisma/client
declare module "@prisma/client" {
  export * from "../../node_modules/.prisma/client/client";
}
