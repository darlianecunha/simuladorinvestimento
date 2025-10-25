// Investment Simulator Application

// Global variables for charts
let evolutionChart = null;
let compositionChart = null;
let annualGrowthChart = null;

// Initialize the application
function init() {
    // Get DOM elements
    const calculateBtn = document.getElementById('calculateBtn');
    const periodSlider = document.getElementById('investmentPeriod');
    const periodValue = document.getElementById('periodValue');

    // Update period value display
    periodSlider.addEventListener('input', (e) => {
        periodValue.textContent = e.target.value;
    });

    // Add real-time calculation on input change
    const inputs = ['initialInvestment', 'targetValue', 'annualReturn', 'monthlyContribution', 'investmentPeriod'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateInvestment);
    });

    // Calculate button click
    calculateBtn.addEventListener('click', calculateInvestment);

    // Initial calculation
    calculateInvestment();
}

// Main calculation function
function calculateInvestment() {
    // Get input values
    const initialInvestment = parseFloat(document.getElementById('initialInvestment').value) || 0;
    const targetValue = parseFloat(document.getElementById('targetValue').value) || 0;
    const annualReturn = parseFloat(document.getElementById('annualReturn').value) || 0;
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value) || 0;
    const investmentPeriod = parseInt(document.getElementById('investmentPeriod').value) || 1;

    // Calculate monthly rate
    const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
    const totalMonths = investmentPeriod * 12;

    // Calculate portfolio evolution
    const evolution = calculatePortfolioEvolution(initialInvestment, monthlyContribution, monthlyRate, totalMonths);

    // Calculate final values
    const finalValue = evolution[evolution.length - 1].total;
    const totalContributions = initialInvestment + (monthlyContribution * totalMonths);
    const totalReturns = finalValue - totalContributions;

    // Calculate time to reach target
    const timeToTarget = calculateTimeToTarget(initialInvestment, targetValue, monthlyContribution, monthlyRate);

    // Update UI
    updateMetrics(finalValue, totalContributions, totalReturns, timeToTarget, targetValue);
    updateCharts(evolution, initialInvestment, monthlyContribution * totalMonths, totalReturns, investmentPeriod);
    updateAnalysis(finalValue, totalContributions, totalReturns, annualReturn);
    updateStatus(finalValue, targetValue, timeToTarget, investmentPeriod);
}

// Calculate portfolio evolution over time
function calculatePortfolioEvolution(initial, monthlyContrib, monthlyRate, months) {
    const evolution = [];
    let balance = initial;
    let totalContributions = initial;

    for (let month = 0; month <= months; month++) {
        if (month > 0) {
            // Apply returns
            balance = balance * (1 + monthlyRate);
            // Add monthly contribution
            balance += monthlyContrib;
            totalContributions += monthlyContrib;
        }

        const returns = balance - totalContributions;

        evolution.push({
            month: month,
            total: balance,
            contributions: totalContributions,
            returns: returns
        });
    }

    return evolution;
}

// Calculate time needed to reach target
function calculateTimeToTarget(initial, target, monthlyContrib, monthlyRate) {
    if (target <= initial) return 0;
    if (monthlyRate === 0 && monthlyContrib === 0) return Infinity;

    let balance = initial;
    let months = 0;
    const maxMonths = 600; // 50 years max

    while (balance < target && months < maxMonths) {
        balance = balance * (1 + monthlyRate) + monthlyContrib;
        months++;
    }

    return months <= maxMonths ? months : Infinity;
}

// Update metrics display
function updateMetrics(finalValue, totalContributions, totalReturns, timeToTarget, targetValue) {
    // Format numbers
    const formatNumber = (num) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    // Quick metrics
    document.getElementById('quickFinalValue').textContent = formatNumber(finalValue);
    document.getElementById('quickTotalInvested').textContent = formatNumber(totalContributions);
    document.getElementById('quickTotalReturn').textContent = formatNumber(totalReturns);

    // Main metrics
    document.getElementById('finalValue').textContent = formatNumber(finalValue);
    const changePercent = ((finalValue / totalContributions - 1) * 100).toFixed(1);
    document.getElementById('finalValueChange').textContent = `+${changePercent}% sobre o investido`;

    document.getElementById('totalContributions').textContent = formatNumber(totalContributions);
    document.getElementById('contributionsDetail').textContent = `Investimento acumulado`;

    document.getElementById('totalReturns').textContent = formatNumber(totalReturns);
    const returnPercent = ((totalReturns / totalContributions) * 100).toFixed(1);
    document.getElementById('returnsPercentage').textContent = `+${returnPercent}% de retorno`;

    // Time to target
    if (timeToTarget === Infinity) {
        document.getElementById('timeToTarget').textContent = 'Não atingível';
        document.getElementById('timeDetail').textContent = 'Ajuste os parâmetros';
    } else if (timeToTarget === 0) {
        document.getElementById('timeToTarget').textContent = 'Já atingido';
        document.getElementById('timeDetail').textContent = 'Meta já alcançada';
    } else {
        const years = Math.floor(timeToTarget / 12);
        const months = timeToTarget % 12;
        let timeText = '';
        if (years > 0) timeText += `${years} ano${years !== 1 ? 's' : ''}`;
        if (months > 0) timeText += ` ${months} mês${months !== 1 ? 'es' : ''}`;
        document.getElementById('timeToTarget').textContent = timeText.trim();
        document.getElementById('timeDetail').textContent = `Para atingir a meta`;
    }
}

// Update status card
function updateStatus(finalValue, targetValue, timeToTarget, currentPeriod) {
    const statusIcon = document.getElementById('statusIcon');
    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');

    if (finalValue >= targetValue) {
        statusIcon.innerHTML = '🎯';
        statusIcon.style.background = 'var(--color-bg-3)';
        statusTitle.textContent = 'Meta Atingida!';
        statusMessage.textContent = `Você alcançará seu objetivo de ${new Intl.NumberFormat('pt-BR', {minimumFractionDigits: 2}).format(targetValue)} em ${currentPeriod} anos.`;
    } else if (timeToTarget !== Infinity && timeToTarget / 12 <= currentPeriod * 1.5) {
        statusIcon.innerHTML = '✓';
        statusIcon.style.background = 'var(--color-bg-1)';
        statusTitle.textContent = 'Meta Alcançável';
        const years = Math.floor(timeToTarget / 12);
        statusMessage.textContent = `Você precisará de aproximadamente ${years} anos para atingir sua meta. Continue investindo!`;
    } else if (timeToTarget === Infinity) {
        statusIcon.innerHTML = '⚠️';
        statusIcon.style.background = 'var(--color-bg-4)';
        statusTitle.textContent = 'Meta Não Atingível';
        statusMessage.textContent = 'Com os parâmetros atuais, não é possível atingir a meta. Considere aumentar os aportes ou o período de investimento.';
    } else {
        statusIcon.innerHTML = '📊';
        statusIcon.style.background = 'var(--color-bg-2)';
        statusTitle.textContent = 'Meta Distante';
        statusMessage.textContent = `Sua meta é ambiciosa. Considere aumentar os aportes mensais ou o período de investimento para resultados mais realistas.`;
    }
}

// Update all charts
function updateCharts(evolution, initialInvestment, totalMonthlyContributions, totalReturns, years) {
    updateEvolutionChart(evolution, years);
    updateCompositionChart(initialInvestment, totalMonthlyContributions, totalReturns);
    updateAnnualGrowthChart(evolution, years);
}

// Update portfolio evolution chart
function updateEvolutionChart(evolution, years) {
    const ctx = document.getElementById('evolutionChart').getContext('2d');

    // Prepare data - sample points for better visualization
    const sampleRate = Math.max(1, Math.floor(evolution.length / 100));
    const labels = [];
    const totalData = [];
    const contributionsData = [];
    const returnsData = [];

    evolution.forEach((point, index) => {
        if (index % sampleRate === 0 || index === evolution.length - 1) {
            const year = (point.month / 12).toFixed(1);
            labels.push(`${year}`);
            totalData.push(point.total.toFixed(2));
            contributionsData.push(point.contributions.toFixed(2));
            returnsData.push(point.returns.toFixed(2));
        }
    });

    // Destroy existing chart
    if (evolutionChart) {
        evolutionChart.destroy();
    }

    // Create new chart
    evolutionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Patrimônio Total',
                    data: totalData,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Total Investido',
                    data: contributionsData,
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Rendimentos',
                    data: returnsData,
                    borderColor: '#964325',
                    backgroundColor: 'rgba(150, 67, 37, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += new Intl.NumberFormat('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Anos'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor'
                    },
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-BR', {
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(value);
                        }
                    }
                }
            }
        }
    });
}

// Update composition pie chart
function updateCompositionChart(initialInvestment, monthlyContributions, returns) {
    const ctx = document.getElementById('compositionChart').getContext('2d');

    // Destroy existing chart
    if (compositionChart) {
        compositionChart.destroy();
    }

    // Create new chart
    compositionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Investimento Inicial', 'Aportes Mensais', 'Rendimentos'],
            datasets: [{
                data: [initialInvestment, monthlyContributions, Math.max(0, returns)],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            const formattedValue = new Intl.NumberFormat('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(value);
                            return `${label}: ${formattedValue} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update annual growth bar chart
function updateAnnualGrowthChart(evolution, years) {
    const ctx = document.getElementById('annualGrowthChart').getContext('2d');

    // Calculate annual values
    const annualData = [];
    for (let year = 1; year <= years; year++) {
        const monthIndex = year * 12;
        if (monthIndex < evolution.length) {
            const currentYear = evolution[monthIndex];
            const previousYear = evolution[(year - 1) * 12];
            const growth = currentYear.total - previousYear.total;
            annualData.push({
                year: year,
                growth: growth,
                contributions: currentYear.contributions - previousYear.contributions,
                returns: currentYear.returns - previousYear.returns
            });
        }
    }

    const labels = annualData.map(d => `Ano ${d.year}`);
    const contributionsData = annualData.map(d => d.contributions);
    const returnsData = annualData.map(d => Math.max(0, d.returns));

    // Destroy existing chart
    if (annualGrowthChart) {
        annualGrowthChart.destroy();
    }

    // Create new chart
    annualGrowthChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Aportes',
                    data: contributionsData,
                    backgroundColor: '#FFC185',
                    borderWidth: 0
                },
                {
                    label: 'Rendimentos',
                    data: returnsData,
                    backgroundColor: '#B4413C',
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += new Intl.NumberFormat('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-BR', {
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(value);
                        }
                    }
                }
            }
        }
    });
}

// Update analysis section
function updateAnalysis(finalValue, totalContributions, totalReturns, annualReturn) {
    const formatNumber = (num) => {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    // Effective annual rate
    document.getElementById('effectiveRate').textContent = `${annualReturn.toFixed(2)}% a.a.`;

    // Average monthly growth
    const monthlyGrowth = (Math.pow(1 + annualReturn / 100, 1 / 12) - 1) * 100;
    document.getElementById('monthlyGrowth').textContent = `${monthlyGrowth.toFixed(2)}% a.m.`;

    // ROI
    const roi = ((totalReturns / totalContributions) * 100).toFixed(1);
    document.getElementById('roi').textContent = `${roi}%`;

    // Capital multiplier
    const multiplier = (finalValue / totalContributions).toFixed(2);
    document.getElementById('capitalMultiplier').textContent = `${multiplier}x`;
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}