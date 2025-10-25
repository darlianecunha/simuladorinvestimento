class InvestmentSimulator {
  constructor() {
    this.defaultValues = {
      initialInvestment: 10000,
      monthlyContribution: 1000,
      annualRate: 10,
      targetGoal: 1000000
    };

    // limite de 50 anos (600 meses)
    this.maxMonths = 600;

    this.chartRef = null;

    this.init();
  }

  init() {
    this.bindInputs();
    this.calculate();
  }

  bindInputs() {
    const fields = [
      "initialInvestmentInput",
      "monthlyContributionInput",
      "annualRateInput",
      "targetGoalInput",
      "logScale"
    ];

    fields.forEach(id => {
      document.getElementById(id).addEventListener("input", () => this.calculate());
    });

    document.getElementById("resetButton").addEventListener("click", () => this.reset());
  }

  reset() {
    document.getElementById("initialInvestmentInput").value = this.defaultValues.initialInvestment;
    document.getElementById("monthlyContributionInput").value = this.defaultValues.monthlyContribution;
    document.getElementById("annualRateInput").value = this.defaultValues.annualRate;
    document.getElementById("targetGoalInput").value = this.defaultValues.targetGoal;
    document.getElementById("logScale").checked = false;
    this.calculate();
  }

  calculate() {
    const initialInvestment = parseFloat(document.getElementById("initialInvestmentInput").value) || 0;
    const monthlyContribution = parseFloat(document.getElementById("monthlyContributionInput").value) || 0;
    const annualRate = parseFloat(document.getElementById("annualRateInput").value) / 100 || 0;
    const targetGoal = parseFloat(document.getElementById("targetGoalInput").value) || 0;

    // taxa efetiva mensal
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    let balance = initialInvestment;
    let totalInvested = initialInvestment;
    let months = 0;

    const seriesBalance = [];

    // simulação mensal
    while (balance < targetGoal && months < this.maxMonths) {
      balance = (balance + monthlyContribution) * (1 + monthlyRate);
      totalInvested += monthlyContribution;
      seriesBalance.push(balance);
      months++;
    }

    // tempo
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    // retorno total (ganho)
    const totalReturns = balance - totalInvested;

    // texto tempo
    let timeText;
    if (months === this.maxMonths && balance < targetGoal) {
      timeText = "não atinge em até 50 anos";
    } else {
      const yPart = years === 1 ? "1 ano" : years + " anos";
      const mPart = remainingMonths === 1 ? "1 mês" : remainingMonths + " meses";
      timeText = years > 0
        ? yPart + " e " + mPart
        : mPart;
    }

    // atualiza UI
    document.getElementById("timeToGoal").textContent = timeText;
    document.getElementById("totalInvested").textContent = this.formatNumber(totalInvested);
    document.getElementById("totalReturns").textContent = this.formatNumber(totalReturns);
    document.getElementById("finalValue").textContent = this.formatNumber(balance);

    // gráfico
    this.renderChart(seriesBalance);
  }

  renderChart(seriesBalance) {
    const ctx = document.getElementById("portfolioChart").getContext("2d");
    const useLog = document.getElementById("logScale").checked;

    if (this.chartRef) {
      this.chartRef.destroy();
    }

    this.chartRef = new Chart(ctx, {
      type: "line",
      data: {
        labels: seriesBalance.map((_, i) => i + 1),
        datasets: [
          {
            label: "Valor total projetado",
            data: seriesBalance,
            borderWidth: 2,
            tension: 0.2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        scales: {
          y: {
            type: useLog ? "logarithmic" : "linear",
            title: {
              display: true,
              text: "Valor acumulado"
            },
            ticks: {
              callback: function (val) {
                return Number(val).toLocaleString("en-US");
              }
            }
          },
          x: {
            title: {
              display: true,
              text: "Meses"
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: "#f8fafc"
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y;
                return " " + Number(v).toLocaleString("en-US");
              }
            }
          }
        }
      }
    });
  }

  formatNumber(value) {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}

window.addEventListener("DOMContentLoaded", () => new InvestmentSimulator());
