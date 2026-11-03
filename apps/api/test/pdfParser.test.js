import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDate, parseTicketsFromText, parseVolume } from '../src/lib/pdfParser.js';

describe('pdfParser', () => {
  it('mantiene formato pipe del demo', () => {
    const text = [
      'TIQUETE|FECHA|OPERADOR|VEHICULO|VOLUMEN|ESTADO',
      'TKT-1|2026-10-27|Juan Pérez|CAM-01|8.0|OK',
      'TKT-2|2026-10-27|María López|CAM-02|0.5|CANCELADO'
    ].join('\n');
    const { tickets, warnings } = parseTicketsFromText(text);
    assert.equal(warnings.length, 0);
    assert.equal(tickets.length, 2);
    assert.equal(tickets[0].numeroTiquete, 'TKT-1');
    assert.equal(tickets[0].volumenMetrosCubicos, 8);
    assert.equal(tickets[1].estadoOriginal, 'CANCELADO');
  });

  it('lee encabezados SAP en español y fecha DD.MM.YYYY', () => {
    const text = [
      'Reporte de producción',
      'Folio;Fecha;Operador;Placa;Volumen;Estado',
      '100045;27.10.2026;Juan Pérez;CAM-12;8,5;Liberado',
      '100046;27.10.2026;Carlos Ruiz;CAM-03;0,5;OK'
    ].join('\n');
    const { tickets } = parseTicketsFromText(text);
    assert.equal(tickets.length, 2);
    assert.equal(tickets[0].fechaTiquete, '2026-10-27');
    assert.equal(tickets[0].volumenMetrosCubicos, 8.5);
    assert.equal(tickets[0].vehiculo, 'CAM-12');
    assert.equal(tickets[1].volumenMetrosCubicos, 0.5);
  });

  it('parsea línea suelta estilo SAP', () => {
    const text = '900111 28/10/2026 Juan Pérez CAM-01 7.0 m3 OK';
    const { tickets } = parseTicketsFromText(text, { reportDate: '2026-10-28' });
    assert.equal(tickets.length, 1);
    assert.equal(tickets[0].numeroTiquete, '900111');
    assert.equal(tickets[0].fechaTiquete, '2026-10-28');
    assert.equal(tickets[0].volumenMetrosCubicos, 7);
  });

  it('normaliza cancelado abreviado X', () => {
    const text = 'A1|2026-10-27|Op|V1|8|X';
    const { tickets } = parseTicketsFromText(text);
    assert.equal(tickets[0].estadoOriginal, 'CANCELADO');
  });

  it('helpers fecha/volumen', () => {
    assert.equal(normalizeDate('02.11.2026'), '2026-11-02');
    assert.equal(parseVolume('1.234,5 m³'), 1234.5);
  });
});
