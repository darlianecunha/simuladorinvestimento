class InvestmentSimulator {
  constructor() {
    this.defaultValues = { initialInvestment: 10000, annualRate: 10, monthlyContribution: 1000 };
    this.targetGoal = 1000000;
    this.maxMonths = 600;
    this.init();
  }
  init() {
    this.syncInputs();
    this.calculate();
  }
  syncInputs() {
    const ids = ['initialInvestment', 'annualRate', 'monthlyContribution'];
    ids.forEach(id => {
      const slider = document.getElementById(id + 'Slider');
      const input = document.getElementById(id + 'Input');
      slider.addEventListener('input', () => { input.value = slider.value; this.calculate(); });
      input.addEventListener('input', () => { slider.value = input.value; this.calculate(); });
    });
    document.getElementById('resetButton').addEventListener('click', () => this.reset());
    document.getElementById('logScale').addEventListener('change', () => this.calculate());
  }
  reset() {
    Object.entries(this.defaultValues).forEach(([key, val]) => {
      document.getElementById(key + 'Slider').value = val;
      document.getElementById(key + 'Input').value = val;
    });
    this.calculate();
  }
  calculate() {
    const initialInvestment = parseFloat(document.getElementById('initialInvestmentInput').value);
    const annualRate = parseFloat(document.getElementById('annualRateInput').value) / 100;
    const monthlyContribution = parseFloat(document.getElementById('monthlyContributionInput').value);
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    let balance = initialInvestment;
    let totalInvested = initialInvestment;
    let months = 0;
    const data = [];
    while (balance < this.targetGoal && months < this.maxMonths) {
      balance = (balance + monthlyContribution) * (1 + monthlyRate);
      totalInvested += monthlyContribution;
      data.push(balance);
      months++;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const totalReturns = balance - totalInvested;
    document.getElementById('timeToGoal').textContent = `${years} anos e ${remainingMonths} meses`;
    document.getElementById('totalInvested').textContent = this.formatCurrency(totalInvested);
    document.getElementById('totalReturns').textContent = this.formatCurrency(totalReturns);
    document.getElementById('finalValue').textContent = this.formatCurrency(balance);
    this.renderChart(data);
  }
  renderChart(data) {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    if (this.portfolioChart) this.portfolioChart.destroy();
    this.portfolioChart = new Chart(ctx, {
      type: 'line',
      data: { labels: data.map((_, i) => i + 1),
        datasets: [{ label: 'Valor Total (R$)', data: data, borderColor: '#2563eb', fill: false }] },
      options: {
        scales: {
          y: { type: document.getElementById('logScale').checked ? 'logarithmic' : 'linear', title: { display: true, text: 'Valor (R$)' } },
          x: { title: { display: true, text: 'Meses' } }
        }
      }
    });
  }
  formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
window.addEventListener('DOMContentLoaded', () => new InvestmentSimulator());