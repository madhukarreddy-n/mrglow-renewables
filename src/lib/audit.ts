import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export async function audit(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
  ip?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? undefined,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      ip: params.ip ?? undefined,
    },
  });
}
