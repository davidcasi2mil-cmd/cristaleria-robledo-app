'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ordenSchema, OrdenInput } from '@/lib/schemas';
import api from '@/lib/api';

interface Cliente {
  id: string;
  nombre: string;
}

export default function NuevaOrdenPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrdenInput>({
    resolver: zodResolver(ordenSchema),
    defaultValues: {
      clienteId: '',
      lineas: [{ descripcion: '', cantidad: 1, precioUnit: 0 }],
      descuento: 0,
      notas: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineas' });

  const lineas = watch('lineas');
  const descuento = watch('descuento') || 0;

  const subtotal = lineas?.reduce((acc, l) => acc + (Number(l.cantidad) || 0) * (Number(l.precioUnit) || 0), 0) ?? 0;
  const descuentoMonto = subtotal * (Number(descuento) / 100);
  const total = subtotal - descuentoMonto;

  const fetchClientes = useCallback(async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data.clientes ?? res.data ?? []);
    } catch {
      setError('No se pudieron cargar los clientes');
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : null;
    if (!token && !storedToken) {
      router.replace('/login');
      return;
    }
    fetchClientes();
  }, [token, router, fetchClientes]);

  const onSubmit = async (data: OrdenInput) => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/ordenes', {
        ...data,
        descuento: Number(data.descuento),
        lineas: data.lineas.map((l) => ({
          ...l,
          cantidad: Number(l.cantidad),
          precioUnit: Number(l.precioUnit),
        })),
      });
      router.push(`/ordenes/${res.data.id ?? res.data.orden?.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { mensaje?: string } } };
      setError(axiosErr.response?.data?.mensaje || 'Error al crear la orden');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nueva Orden</h1>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Cliente */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Cliente</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar cliente *
            </label>
            {loadingClientes ? (
              <p className="text-gray-400 text-sm">Cargando clientes...</p>
            ) : (
              <select
                {...register('clienteId')}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Seleccionar cliente --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            )}
            {errors.clienteId && (
              <p className="text-red-500 text-sm mt-1">{errors.clienteId.message}</p>
            )}
          </div>
        </div>

        {/* Líneas de orden */}
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Líneas de la orden</h2>
            <button
              type="button"
              onClick={() => append({ descripcion: '', cantidad: 1, precioUnit: 0 })}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm px-3 py-1 rounded transition-colors"
            >
              + Agregar línea
            </button>
          </div>

          {errors.lineas && !Array.isArray(errors.lineas) && (
            <p className="text-red-500 text-sm mb-2">{errors.lineas.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => {
              const linea = lineas?.[index];
              const lineaSubtotal = (Number(linea?.cantidad) || 0) * (Number(linea?.precioUnit) || 0);
              return (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-5">
                    {index === 0 && <label className="block text-xs text-gray-500 mb-1">Descripción</label>}
                    <input
                      {...register(`lineas.${index}.descripcion`)}
                      type="text"
                      placeholder="Descripción del trabajo"
                      className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.lineas?.[index]?.descripcion && (
                      <p className="text-red-500 text-xs mt-1">{errors.lineas[index]?.descripcion?.message}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <label className="block text-xs text-gray-500 mb-1">Cantidad</label>}
                    <input
                      {...register(`lineas.${index}.cantidad`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1"
                      className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.lineas?.[index]?.cantidad && (
                      <p className="text-red-500 text-xs mt-1">{errors.lineas[index]?.cantidad?.message}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <label className="block text-xs text-gray-500 mb-1">Precio unit.</label>}
                    <input
                      {...register(`lineas.${index}.precioUnit`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.lineas?.[index]?.precioUnit && (
                      <p className="text-red-500 text-xs mt-1">{errors.lineas[index]?.precioUnit?.message}</p>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    {index === 0 && <label className="block text-xs text-gray-500 mb-1">Subtotal</label>}
                    <span className="block py-2 text-sm font-medium">
                      €{lineaSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {index === 0 && <label className="block text-xs text-gray-500 mb-1">&nbsp;</label>}
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="py-2 text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totales */}
          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Descuento (%):</span>
                <input
                  {...register('descuento', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span>-€{descuentoMonto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-blue-700">€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white rounded-lg shadow border p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Notas adicionales</h2>
          <textarea
            {...register('notas')}
            rows={3}
            placeholder="Observaciones o instrucciones especiales..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-6 py-2 rounded transition-colors disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Crear Orden'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-2 rounded transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
