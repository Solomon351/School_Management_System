// TEMPORARY: the server will do the real calculations
(function () {
  'use strict';

  function calculateTotal(scoreParts, scores) {
    if (!Array.isArray(scoreParts) || !scoreParts.length || !scores) {
      return { total: null, complete: false };
    }

    let total = 0;
    for (const part of scoreParts) {
      const score = scores[part.name];
      const maximum = Number(part.maximumMarks);
      if (score === '' || score === null || score === undefined || !Number.isFinite(Number(score))) {
        return { total: null, complete: false };
      }
      const numericScore = Number(score);
      if (numericScore < 0 || numericScore > maximum) {
        return { total: null, complete: false };
      }
      total += numericScore;
    }

    return { total: Number(total.toFixed(1)), complete: true };
  }

  function getGradeAndRemark(total, gradingScale) {
    if (total === null || total === undefined || total === '' ||
        !Number.isFinite(Number(total)) || !Array.isArray(gradingScale)) return null;
    const score = Number(total);
    const range = gradingScale.find((row) => score >= Number(row.from) && score <= Number(row.to));
    return range ? { grade: range.grade, remark: range.remark } : null;
  }

  function isPassed(total, passMark) {
    if (total === null || total === undefined || total === '') return false;
    return Number.isFinite(Number(total)) && Number(total) >= Number(passMark);
  }

  function getPositions(totals) {
    const validTotals = totals
      .map((total, index) => ({
        total: total === null || total === undefined || total === '' ? NaN : Number(total),
        index
      }))
      .filter((entry) => Number.isFinite(entry.total))
      .sort((a, b) => b.total - a.total);
    const positions = Array(totals.length).fill(null);
    let position = 0;
    let previousTotal = null;

    validTotals.forEach((entry, index) => {
      if (previousTotal === null || entry.total !== previousTotal) position = index + 1;
      positions[entry.index] = position;
      previousTotal = entry.total;
    });

    return positions;
  }

  function getClassStats(records, passMark) {
    const totals = records
      .map((record) => {
        const total = typeof record === 'number' ? record : record && record.total;
        return total === null || total === undefined || total === '' ? NaN : Number(total);
      })
      .filter((total) => Number.isFinite(total));
    if (!totals.length) {
      return { average: null, highest: null, lowest: null, passed: 0, failed: 0 };
    }
    const passed = totals.filter((total) => isPassed(total, passMark)).length;
    return {
      average: Number((totals.reduce((sum, total) => sum + total, 0) / totals.length).toFixed(1)),
      highest: Math.max(...totals),
      lowest: Math.min(...totals),
      passed,
      failed: totals.length - passed
    };
  }

  window.ResultsEngine = {
    calculateTotal,
    getGradeAndRemark,
    isPassed,
    getPositions,
    getClassStats
  };
})();
