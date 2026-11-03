import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditTicket, calcularLiquidacionSemanal, normalizeName } from '../src/lib/liquidacion.js';

const config = {
  id: 'c1',
  version: 1,
  viajesBaseSemana: 3,
  viajesBaseSabado: 2,
  tarifaViajeAdicional: 180,
  volumenConsumoInterno: 0.5,
  excluirCancelados: true,
  excluirConsumoInterno: true,
  estado: 'publicada'
};

describe('liquidacion', () => {
  it('excluye cancelado y consumo 0.5', () => {
    const a = auditTicket(
      { numeroTiquete: '1', fechaTiquete: '2026-10-27', operadorNombre: 'A', volumenMetrosCubicos: 8, estadoOriginal: 'CANCELADO' },
      config,
      new Set()
    );
    assert.equal(a.liquidable, false);
    assert.ok(a.exclusiones.some((e) => e.tipoExclusion === 'cancelado'));

    const b = auditTicket(
      { numeroTiquete: '2', fechaTiquete: '2026-10-27', operadorNombre: 'A', volumenMetrosCubicos: 0.5, estadoOriginal: 'OK' },
      config,
      new Set()
    );
    assert.equal(b.liquidable, false);
    assert.ok(b.exclusiones.some((e) => e.tipoExclusion === 'consumo_interno'));
  });

  it('aplica base 3 y adicionales', () => {
    const op = { id: 'op1', nombreCompleto: 'Juan Pérez' };
    const tickets = [1, 2, 3, 4].map((n) => ({
      id: `t${n}`,
      numeroTiquete: `T${n}`,
      fechaTiquete: '2026-10-27',
      operadorNombre: 'Juan Pérez',
      volumenMetrosCubicos: 8
    }));
    const result = calcularLiquidacionSemanal({
      tiquetesValidos: tickets,
      operadoresByName: new Map([[normalizeName(op.nombreCompleto), op]]),
      config,
      plantaId: 'p1',
      semanaRef: '2026-10-27'
    });
    assert.equal(result.liquidaciones.length, 1);
    assert.equal(result.liquidaciones[0].viajesBase, 3);
    assert.equal(result.liquidaciones[0].viajesAdicionales, 1);
    assert.equal(result.liquidaciones[0].totalLiquidado, 180);
  });
});
