/**
 * Testes Unitários - Regras de Negócio
 * 
 * Este arquivo contém testes para as funções críticas de cálculo
 * que lidam com métricas financeiras e validações de estoque.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateProfitMargin,
  calculateTotalProfit,
  calculateTurnoverRate,
  isProductStagnant,
  validateStockAvailability
} from '../utils/business';

describe('Business Logic - Cálculos Financeiros', () => {
  describe('calculateProfitMargin', () => {
    it('deve calcular margem de lucro corretamente', () => {
      // Produto com 50% de margem
      const costPrice = 50;
      const salePrice = 100;
      const margin = calculateProfitMargin(costPrice, salePrice);
      expect(margin).toBe(50);
    });

    it('deve retornar 0 quando preço de venda é 0', () => {
      const margin = calculateProfitMargin(50, 0);
      expect(margin).toBe(0);
    });

    it('deve calcular margem negativa quando custo > venda', () => {
      const margin = calculateProfitMargin(100, 50);
      expect(margin).toBe(-100);
    });

    it('deve calcular margem de 100% quando custo é 0', () => {
      const margin = calculateProfitMargin(0, 100);
      expect(margin).toBe(100);
    });
  });

  describe('calculateTotalProfit', () => {
    it('deve calcular lucro total corretamente', () => {
      const quantity = 10;
      const costPrice = 50;
      const salePrice = 100;
      const profit = calculateTotalProfit(quantity, costPrice, salePrice);
      expect(profit).toBe(500); // 10 * (100 - 50) = 500
    });

    it('deve retornar 0 quando quantidade é 0', () => {
      const profit = calculateTotalProfit(0, 50, 100);
      expect(profit).toBe(0);
    });

    it('deve calcular lucro negativo quando custo > venda', () => {
      const profit = calculateTotalProfit(10, 100, 50);
      expect(profit).toBe(-500);
    });
  });

  describe('calculateTurnoverRate', () => {
    it('deve calcular giro de estoque corretamente', () => {
      const totalSold = 100;
      const averageStock = 50;
      const turnover = calculateTurnoverRate(totalSold, averageStock);
      expect(turnover).toBe(2);
    });

    it('deve retornar 0 quando estoque médio é 0', () => {
      const turnover = calculateTurnoverRate(100, 0);
      expect(turnover).toBe(0);
    });

    it('deve calcular giro alto para produtos com alta rotatividade', () => {
      const turnover = calculateTurnoverRate(500, 50);
      expect(turnover).toBe(10);
    });
  });

  describe('isProductStagnant', () => {
    it('deve identificar produto parado quando não há movimentação', () => {
      const lastMovementDate = null;
      const isStagnant = isProductStagnant(lastMovementDate, 30);
      expect(isStagnant).toBe(true);
    });

    it('deve identificar produto parado quando última venda foi há mais de 30 dias', () => {
      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);
      const isStagnant = isProductStagnant(thirtyOneDaysAgo, 30);
      expect(isStagnant).toBe(true);
    });

    it('não deve identificar como parado quando última venda foi recente', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const isStagnant = isProductStagnant(tenDaysAgo, 30);
      expect(isStagnant).toBe(false);
    });

    it('deve usar threshold customizado', () => {
      const sixtyOneDaysAgo = new Date();
      sixtyOneDaysAgo.setDate(sixtyOneDaysAgo.getDate() - 61);
      const isStagnant = isProductStagnant(sixtyOneDaysAgo, 60);
      expect(isStagnant).toBe(true);
    });
  });

  describe('validateStockAvailability', () => {
    it('não deve lançar erro quando estoque é suficiente', () => {
      expect(() => {
        validateStockAvailability(100, 50);
      }).not.toThrow();
    });

    it('deve lançar erro quando estoque é insuficiente', () => {
      expect(() => {
        validateStockAvailability(50, 100);
      }).toThrow('Estoque insuficiente');
    });

    it('deve permitir venda quando quantidade é exatamente igual ao estoque', () => {
      expect(() => {
        validateStockAvailability(100, 100);
      }).not.toThrow();
    });

    it('deve lançar erro com mensagem descritiva', () => {
      try {
        validateStockAvailability(10, 20);
      } catch (error: any) {
        expect(error.message).toContain('Estoque insuficiente');
        expect(error.message).toContain('10');
        expect(error.message).toContain('20');
      }
    });
  });
});

