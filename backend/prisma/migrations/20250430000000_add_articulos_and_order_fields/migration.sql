-- CreateEnum
CREATE TYPE "TipoArticulo" AS ENUM ('CRISTAL', 'MOLDURA', 'PASSPARTOUS', 'ACCESORIO', 'EXTRA');

-- CreateIndex (telefono on Cliente)
CREATE INDEX "Cliente_telefono_idx" ON "Cliente"("telefono");

-- CreateTable
CREATE TABLE "Articulo" (
    "id" TEXT NOT NULL,
    "tipo" "TipoArticulo" NOT NULL,
    "referencia" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "perfil" DECIMAL(10,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Articulo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Articulo_tipo_referencia_key" ON "Articulo"("tipo", "referencia");

-- CreateIndex
CREATE INDEX "Articulo_tipo_idx" ON "Articulo"("tipo");

-- AlterTable Orden
ALTER TABLE "Orden" ADD COLUMN "anchoOriginal" DECIMAL(10,2),
                    ADD COLUMN "altoOriginal" DECIMAL(10,2);

-- AlterTable OrdenLinea
ALTER TABLE "OrdenLinea" ADD COLUMN "tipo" "TipoArticulo" NOT NULL DEFAULT 'EXTRA',
                         ADD COLUMN "articuloId" TEXT,
                         ADD COLUMN "referencia" TEXT,
                         ADD COLUMN "perfil" DECIMAL(10,2),
                         ADD COLUMN "ancho" DECIMAL(10,2),
                         ADD COLUMN "alto" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "OrdenLinea_articuloId_idx" ON "OrdenLinea"("articuloId");

-- AddForeignKey
ALTER TABLE "OrdenLinea" ADD CONSTRAINT "OrdenLinea_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
