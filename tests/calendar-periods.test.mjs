import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const from = source.indexOf('  function hasDone(');
const to = source.indexOf('  function updateHome()', from);
assert.ok(from >= 0 && to > from, 'calendar helper source is present');

function calendarContext() {
  const context = { Date, Math, Number, Object, String, progressDateStart(date) { const start = new Date(date); start.setHours(0, 0, 0, 0); return start; } };
  vm.createContext(context);
  vm.runInContext(source.slice(from, to), context);
  return context;
}

test('ISO weeks handle year boundaries and week 53', () => {
  const context = calendarContext();
  for (const [date, expected] of [
    ['2021-01-01', 'Week 53 · 2020'],
    ['2021-01-04', 'Week 1 · 2021'],
    ['2026-12-31', 'Week 53 · 2026'],
    ['2027-01-04', 'Week 1 · 2027']
  ]) assert.equal(context.isoWeekLabel(new Date(`${date}T12:00:00`)), expected);
});

test('weekly buckets start at local Monday midnight and daily buckets use actual dates across DST', () => {
  const previousTz = process.env.TZ;
  process.env.TZ = 'Europe/Zurich';
  try {
    const context = calendarContext();
    const week = context.calendarPeriods('4w', new Date(2026, 2, 29, 12)).at(-1);
    assert.equal(week.label, 'Week 13 · 2026');
    assert.equal(week.from.getDay(), 1);
    assert.equal(week.from.getHours(), 0);
    assert.equal(week.to.getDay(), 1);
    assert.equal(week.to.getHours(), 0);
    assert.equal((week.to - week.from) / 3600000, 167, 'DST week uses local calendar boundaries');

    const days = context.calendarPeriods('7d', new Date(2026, 2, 29, 12));
    assert.equal(days.at(-1).shortLabel, 'Sun 29');
    assert.equal(days.at(-1).label, 'Sunday, Mar 29, 2026');
    const log = { firstSetCompletedAt: '2026-03-28T23:30:00.000Z' };
    assert.equal(context.logDateLabel(log), 'Sun, Mar 29');
  } finally {
    if (previousTz === undefined) delete process.env.TZ;
    else process.env.TZ = previousTz;
  }
});

test('trend chart uses a rounded readable scale and omits zero-volume points', () => {
  const start = source.indexOf('  function renderVolumeGroupTrend(');
  const end = source.indexOf('  function renderCharts(', start);
  const context = {
    Math,
    progressCompact: value => Math.round(value).toLocaleString('en-US'),
    progressFmt: value => Math.round(value).toLocaleString('en-US'),
    escapeHtml: value => String(value)
  };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const html = context.renderVolumeGroupTrend([
    { name: 'Upper push', values: [0, 1084, 2035] },
    { name: 'Upper pull', values: [0, 0, 1570] }
  ], ['W11', 'W12', 'W13']);
  assert.match(html, />2,500<\/text>/);
  assert.match(html, />1,250<\/text>/);
  assert.match(html, /progress-chart-axis-line/);
  assert.match(html, /progress-chart-tick/);
  assert.match(html, />W11<\/text>/);
  assert.match(html, />W12<\/text>/);
  assert.match(html, />W13<\/text>/);
  assert.doesNotMatch(html, /cx="38\.0"/);
  assert.match(html, /kg × reps/);
});
