'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ordenFormSchema, OrdenFormInput, TIPOS_ARTICULO, TipoArticulo } from '@/lib/schemas';
import api from '@/lib/api';

const MIN_PHONE_LENGTH = 6;
const PHONE_DEBOUNCE_MS = 400;

interface Articulo {
  id: string;
  tipo: TipoArticulo;
  referencia: string;
  descripcion: string;
  precio: number;
  perfil?: number | null;
}

const TIPO_LABELS: Record<TipoArticulo, string> = {
  CRISTAL: 'Cristal',
  MOLDURA: 'Moldura',
  PASSPARTOUS: 'Passpartous',
  ACCESORIO: 'Accesorio',
  EXTRA: 'Extra',
};

const INPUT_CLS =
  'w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150';
const SELECT_CLS =
  'w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150';

const emptyLinea = () => ({
  tipo: 'CRISTAL' as TipoArticulo,
  articuloId: '',
  referencia: '',
  descripcion: '',
  cantidad: 1,
  precioUnit: 0,
  perfil: undefined as number | undefined,
  ancho: undefined as number | undefined,
  alto: undefined as number | undefined,
});

export default function NuevaOrdenPage() {
  const { token } = useAuthStore();
  const router = useRouter();

  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [maxNumero, setMaxNumero] = useState<number>(0);
  const [numeroActual, setNumeroActual] = useState<number | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingOrden, setLoadingOrden] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const telefonoDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrdenFormInput>({
    resolver: zodResolver(ordenFormSchema),
    defaultValues: {
      clienteNombre: '',
      clienteTelefono: '',
      lineas: [emptyLinea()],
      descuento: 0,
      notas: '',
    },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'lineas' });

  const lineas = useWatch({ control, name: 'lineas' });
  const descuento = watch('descuento') || 0;

  const subtotal =
    lineas?.reduce((acc, l) => {
      const q = Number(l?.cantidad) || 0;
      const p = Number(l?.precioUnit) || 0;
      return acc + q * p;
    }, 0) ?? 0;
  const descuentoMonto = subtotal * (Number(descuento) / 100);
  const total = subtotal - descuentoMonto;

  const fetchArticulos = useCallback(async () => {
    try {
      const res = await api.get('/articulos');
      setArticulos(res.data ?? []);
    } catch {
      // non-critical
    }
  }, []);

  const fetchMaxNumero = useCallback(async () => {
    try {
      const res = await api.get('/ordenes/maximo');
      const max = res.data.maximo ?? 0;
      setMaxNumero(max);
      setNumeroActual(max + 1);
    } catch {
      setNumeroActual(1);
    }
  }, []);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : null;
    if (!token && !storedToken) {
      router.replace('/login');
      return;
    }
    fetchArticulos();
    fetchMaxNumero();
  }, [token, router, fetchArticulos, fetchMaxNumero]);

  const cargarOrdenPorNumero = useCallback(
    async (numero: number) => {
      if (numero > maxNumero || numero < 1) {
        setModoEdicion(false);
        reset({
          clienteNombre: '',
          clienteTelefono: '',
          lineas: [emptyLinea()],
          descuento: 0,
          notas: '',
        });
        setNumeroActual(maxNumero + 1);
        return;
      }
      setLoadingOrden(true);
      setError('');
      try {
        const res = await api.get(`/ordenes/numero/${numero}`);
        const orden = res.data;
        setModoEdicion(true);
        reset({
          clienteId: orden.clienteId,
          clienteNombre: orden.cliente?.nombre ?? '',
          clienteTelefono: orden.cliente?.telefono ?? '',
          anchoOriginal: orden.anchoOriginal ? Number(orden.anchoOriginal) : undefined,
          altoOriginal: orden.altoOriginal ? Number(orden.altoOriginal) : undefined,
          descuento: orden.descuento ? Number(orden.descuento) : 0,
          notas: orden.notas ?? '',
          lineas:
            orden.lineas?.map((l: {
              tipo?: string;
              articuloId?: string;
              referencia?: string;
              descripcion?: string;
              cantidad: number | string;
              precioUnit: number | string;
              perfil?: number | string | null;
              ancho?: number | string | null;
              alto?: number | string | null;
            }) => ({
              tipo: l.tipo ?? 'EXTRA',
              articuloId: l.articuloId ?? '',
              referencia: l.referencia ?? '',
              descripcion: l.descripcion,
              cantidad: Number(l.cantidad),
              precioUnit: Number(l.precioUnit),
              perfil: l.perfil ? Number(l.perfil) : undefined,
              ancho: l.ancho ? Number(l.ancho) : undefined,
              alto: l.alto ? Number(l.alto) : undefined,
            })) ?? [emptyLinea()],
        });
      } catch {
        setError(`No se encontró la orden #${numero}`);
      } finally {
        setLoadingOrden(false);
      }
    },
    [maxNumero, reset],
  );

  const handleNavNumero = (delta: number) => {
    const nuevo = (numeroActual ?? maxNumero + 1) + delta;
    if (nuevo < 1) return;
    setNumeroActual(nuevo);
    cargarOrdenPorNumero(nuevo);
  };

  const handleNumeroChange = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 1) {
      setNumeroActual(n);
      cargarOrdenPorNumero(n);
    } else if (val === '') {
      setNumeroActual(null);
    }
  };

  const handleTelefonoChange = (val: string) => {
    setValue('clienteTelefono', val);
    if (telefonoDebounce.current) clearTimeout(telefonoDebounce.current);
    if (val.length >= MIN_PHONE_LENGTH) {
      telefonoDebounce.current = setTimeout(async () => {
        try {
          const res = await api.get('/clientes/buscar', { params: { telefono: val } });
          if (res.data?.nombre) {
            setValue('clienteNombre', res.data.nombre);
            setValue('clienteId', res.data.id);
            setClienteEncontrado(true);
          } else {
            setClienteEncontrado(false);
          }
        } catch {
          setClienteEncontrado(false);
        }
      }, PHONE_DEBOUNCE_MS);
    } else {
      setClienteEncontrado(false);
    }
  };

  const handleTipoChange = (index: number, tipo: TipoArticulo) => {
    update(index, { ...emptyLinea(), tipo });
  };

  const handleReferenciaChange = (index: number, referencia: string) => {
    const tipo = lineas?.[index]?.tipo as TipoArticulo;
    const art = articulos.find((a) => a.tipo === tipo && a.referencia === referencia);
    if (art) {
      update(index, {
        ...lineas[index],
        articuloId: art.id,
        referencia: art.referencia,
        descripcion: art.descripcion,
        precioUnit: Number(art.precio),
        perfil: art.perfil != null ? Number(art.perfil) : undefined,
      });
    } else {
      update(index, { ...lineas[index], articuloId: '', referencia });
    }
  };

  // Auto-add line when last line has a tipo set
  const handleLineaTipoSet = (index: number) => {
    if (index === fields.length - 1) {
      append(emptyLinea());
    }
  };

  const referenciasPorTipo = (tipo: TipoArticulo) =>
    articulos.filter((a) => a.tipo === tipo).map((a) => a.referencia);

  const calcularSubtotalLinea = (l: OrdenFormInput['lineas'][number]) => {
    const q = Number(l?.cantidad) || 0;
    const p = Number(l?.precioUnit) || 0;
    return q * p;
  };

  const onSubmit = async (data: OrdenFormInput) => {
    if (modoEdicion) return;
    setSubmitting(true);
    setError('');
    try {
      // Filter out empty placeholder lines (no description) before sending to the API
      const lineasValidas = data.lineas.filter((l) => l.descripcion?.trim());
      if (lineasValidas.length === 0) {
        setError('Agrega al menos una línea con descripción');
        return;
      }
      const res = await api.post('/ordenes', {
        ...data,
        lineas: lineasValidas.map((l) => ({
          ...l,
          cantidad: Number(l.cantidad ?? 1),
          precioUnit: Number(l.precioUnit ?? 0),
          perfil: l.perfil != null ? Number(l.perfil) : undefined,
          ancho: l.ancho != null ? Number(l.ancho) : undefined,
          alto: l.alto != null ? Number(l.alto) : undefined,
          articuloId: l.articuloId || undefined,
          referencia: l.referencia || undefined,
        })),
        descuento: Number(data.descuento),
        anchoOriginal: data.anchoOriginal != null ? Number(data.anchoOriginal) : undefined,
        altoOriginal: data.altoOriginal != null ? Number(data.altoOriginal) : undefined,
      });
      const ordenId = res.data.id ?? res.data.orden?.id;
      await fetchMaxNumero();
      router.push(`/ordenes/${ordenId}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { mensaje?: string } } };
      setError(axiosErr.response?.data?.mensaje || 'Error al crear la orden');
    } finally {
      setSubmitting(false);
    }
  };

  const isNuevaOrden = !modoEdicion;
  const mostrarNumero = modoEdicion ? numeroActual : maxNumero + 1;

  return (
    <div className="max-w-full">
      {/* Header: Order number + navigation */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleNavNumero(-1)}
            disabled={loadingOrden || (numeroActual ?? 1) <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-500 transition-colors"
            title="Orden anterior"
          >
            ◀
          </button>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-400">#</span>
            <input
              type="number"
              min="1"
              value={mostrarNumero ?? ''}
              onChange={(e) => handleNumeroChange(e.target.value)}
              className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              title="Número de orden"
            />
          </div>
          <button
            type="button"
            onClick={() => handleNavNumero(1)}
            disabled={loadingOrden || (numeroActual ?? maxNumero + 1) > maxNumero}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-500 transition-colors"
            title="Orden siguiente"
          >
            ▶
          </button>
          {modoEdicion && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold ring-1 ring-amber-200">
              Vista previa
            </span>
          )}
          {isNuevaOrden && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold ring-1 ring-emerald-200">
              Nueva orden
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {modoEdicion && (
            <button
              type="button"
              onClick={() => {
                setModoEdicion(false);
                setNumeroActual(maxNumero + 1);
                reset({
                  clienteNombre: '',
                  clienteTelefono: '',
                  lineas: [emptyLinea()],
                  descuento: 0,
                  notas: '',
                });
              }}
              className="btn-success text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Orden
            </button>
          )}
        </div>
      </div>

      {loadingOrden && (
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2.5 rounded-lg mb-4 text-sm">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando orden...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg mb-4 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Client + Sizes row */}
        <div className="card p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client */}
            <div>
              <h2 className="label mb-3">Cliente</h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
                  <div className="relative">
                    <input
                      {...register('clienteTelefono')}
                      type="tel"
                      placeholder="600 000 000"
                      onChange={(e) => handleTelefonoChange(e.target.value)}
                      disabled={modoEdicion}
                      className={INPUT_CLS}
                    />
                    {clienteEncontrado && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 text-xs font-medium">✓</span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
                  <input
                    {...register('clienteNombre')}
                    type="text"
                    placeholder="Nombre del cliente"
                    disabled={modoEdicion}
                    className={INPUT_CLS}
                  />
                  {errors.clienteNombre && (
                    <p className="text-red-500 text-xs mt-1">{errors.clienteNombre.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Original size */}
            <div>
              <h2 className="label mb-3">Medida Original</h2>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Ancho (cm)</label>
                  <input
                    {...register('anchoOriginal', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="X"
                    disabled={modoEdicion}
                    className={INPUT_CLS}
                  />
                </div>
                <span className="text-gray-300 pb-2 text-lg font-light" aria-hidden="true">×</span>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Alto (cm)</label>
                  <input
                    {...register('altoOriginal', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Y"
                    disabled={modoEdicion}
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order lines */}
        <div className="card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">Artículos</h2>
            {!modoEdicion && (
              <button
                type="button"
                onClick={() => append(emptyLinea())}
                className="btn-primary text-xs py-1.5 px-3"
              >
                + Añadir línea
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="text-left px-2.5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Tipo</th>
                  <th className="text-left px-2.5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Referencia</th>
                  <th className="text-left px-2.5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Descripción</th>
                  <th className="text-right px-2.5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">P. unit.</th>
                  <th className="text-right px-2.5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Uds/Perfil</th>
                  <th className="text-right px-2.5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Ancho</th>
                  <th className="text-right px-2.5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Alto</th>
                  <th className="text-right px-2.5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Subtotal</th>
                  {!modoEdicion && <th className="w-8"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fields.map((field, index) => {
                  const linea = lineas?.[index];
                  const tipo = (linea?.tipo ?? 'CRISTAL') as TipoArticulo;
                  const mostrarPerfil = tipo === 'MOLDURA' || tipo === 'PASSPARTOUS';
                  const lineaSubtotal = calcularSubtotalLinea(linea);
                  const refs = referenciasPorTipo(tipo);

                  return (
                    <tr key={field.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Tipo */}
                      <td className="px-2.5 py-2">
                        <select
                          value={tipo}
                          onChange={(e) => {
                            handleTipoChange(index, e.target.value as TipoArticulo);
                            handleLineaTipoSet(index);
                          }}
                          disabled={modoEdicion}
                          className={SELECT_CLS}
                        >
                          {TIPOS_ARTICULO.map((t) => (
                            <option key={t} value={t}>
                              {TIPO_LABELS[t]}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Referencia */}
                      <td className="px-2.5 py-2">
                        <input
                          list={`refs-${index}`}
                          value={linea?.referencia ?? ''}
                          onChange={(e) => handleReferenciaChange(index, e.target.value)}
                          disabled={modoEdicion}
                          placeholder="Ref..."
                          className={INPUT_CLS}
                        />
                        <datalist id={`refs-${index}`}>
                          {refs.map((r) => (
                            <option key={r} value={r} />
                          ))}
                        </datalist>
                      </td>

                      {/* Descripción */}
                      <td className="px-2.5 py-2">
                        <input
                          {...register(`lineas.${index}.descripcion`)}
                          type="text"
                          placeholder="Descripción..."
                          disabled={modoEdicion}
                          className={INPUT_CLS}
                        />
                        {errors.lineas?.[index]?.descripcion && (
                          <p className="text-red-500 text-xs mt-0.5">{errors.lineas[index]?.descripcion?.message}</p>
                        )}
                      </td>

                      {/* Precio unit */}
                      <td className="px-2.5 py-2">
                        <input
                          {...register(`lineas.${index}.precioUnit`, { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          disabled={modoEdicion}
                          className={`${INPUT_CLS} text-right`}
                        />
                      </td>

                      {/* Cantidad / Perfil */}
                      <td className="px-2.5 py-2">
                        {mostrarPerfil ? (
                          <input
                            {...register(`lineas.${index}.perfil`, { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="m"
                            disabled={modoEdicion}
                            className={`${INPUT_CLS} text-right`}
                            title="Metros de perfil"
                          />
                        ) : (
                          <input
                            {...register(`lineas.${index}.cantidad`, { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="1"
                            disabled={modoEdicion}
                            className={`${INPUT_CLS} text-right`}
                          />
                        )}
                      </td>

                      {/* Ancho */}
                      <td className="px-2.5 py-2">
                        <input
                          {...register(`lineas.${index}.ancho`, { valueAsNumber: true })}
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="cm"
                          disabled={modoEdicion}
                          className={`${INPUT_CLS} text-right`}
                        />
                      </td>

                      {/* Alto */}
                      <td className="px-2.5 py-2">
                        <input
                          {...register(`lineas.${index}.alto`, { valueAsNumber: true })}
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="cm"
                          disabled={modoEdicion}
                          className={`${INPUT_CLS} text-right`}
                        />
                      </td>

                      {/* Subtotal */}
                      <td className="px-2.5 py-2 text-right font-semibold text-gray-800">
                        €{lineaSubtotal.toFixed(2)}
                      </td>

                      {/* Remove */}
                      {!modoEdicion && (
                        <td className="px-1.5 py-2 text-center">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                              title="Eliminar línea"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-5 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-col md:flex-row gap-6 justify-between">
              {/* Notes + Discount */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="label mb-1">Notas</label>
                  <textarea
                    {...register('notas')}
                    rows={2}
                    placeholder="Observaciones..."
                    disabled={modoEdicion}
                    className={`${INPUT_CLS} resize-none`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descuento (%):</label>
                  <input
                    {...register('descuento', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={modoEdicion}
                    className="w-20 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Totals summary */}
              <div className="min-w-52 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
                {Number(descuento) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento ({Number(descuento)}%)</span>
                    <span>–€{descuentoMonto.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-indigo-600">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!modoEdicion && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                'Crear Orden'
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                reset({
                  clienteNombre: '',
                  clienteTelefono: '',
                  lineas: [emptyLinea()],
                  descuento: 0,
                  notas: '',
                })
              }
              className="btn-secondary"
            >
              Limpiar
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

