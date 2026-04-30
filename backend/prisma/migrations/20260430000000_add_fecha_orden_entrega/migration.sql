-- AlterTable Orden: add order date and delivery date fields
ALTER TABLE "Orden" ADD COLUMN "fechaOrden"   TIMESTAMP(3),
                    ADD COLUMN "fechaEntrega" TIMESTAMP(3);
