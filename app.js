// Investment Simulator Application
class InvestmentSimulator {
    constructor() {
        this.defaultValues = {
            initialInvestment: 10000,
            annualRate: 10,
            monthlyContribution: 1000
        };
        
        this.targetGoal = 1000000;
        this.maxMonths = 600; // 50 years
        
        this.portfolioChart = null;
        this.compositionChart = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.calculate();
    }
    
    setupEventListeners() {
        // Sliders and inputs synchronization
        const initialInvestmentSlider = document.getElementById('initialInvestmentSlider');
        const initialInvestmentInput = document.getElementById('initialInvestmentInput');
        const annualRateSlider = document.getElementById('annualRateSlider');
        const annualRateInput = document.getElementById('annualRateInput');
        const monthlyContributionSlider = document.getElementById('monthlyContributionSlider');
        const monthlyContributionInput = document.getElementById('monthlyContributionInput');
        const resetButton = document.getElementById('resetButton');
        const logScaleCheckbox = document.getElementById('logScale');
        
        // Sync sliders and inputs
        initialInvestmentSlider.addEventListener('input', (e) => {
            initialInvestmentInput.value = e.target.value;
            this.calculate();
        });
        
        initialInvestmentInput.addEventListener('input', (e) => {
            const value = Math.max(0, Math.min(500000, parseFloat(e.target.value) || 0));
            e.target.value = value;
            initialInvestmentSlider.value = value;
            this.calculate();
        });
        
        annualRateSlider.addEventListener('input', (e) => {
            annualRateInput.value = e.target.value;
            this.calculate();
        });
        
        annualRateInput.addEventListener('input', (e) => {
            const value = Math.max(0, Math.min(30, parseFloat(e.target.value) || 0));
            e.target.value = value;
            annualRateSlider.value = value;
            this.calculate();
        });
        
        monthlyContributionSlider.addEventListener('input', (e) => {
            monthlyContributionInput.value = e.target.value;
            this.calculate();
        });
        
        monthlyContributionInput.addEventListener('input', (e) => {
            const value = Math.max(0, Math.min(50000, parseFloat(e.target.value) || 0));
            e.target.value = value;
            monthlyContributionSlider.value = value;
            this.calculate();
        });
        
        // Reset button
        resetButton.addEventListener('click', () => {
            this.resetToDefaults();
        });
        
        // Log scale toggle
        logScaleCheckbox.addEventListener('change', () => {
            this.updateChartScale();
        });
    }
    
    resetToDefaults() {
        document.getElementById('initialInvestmentSlider').value = this.defaultValues.initialInvestment;
        document.getElementById('initialInvestmentInput').value = this.defaultValues.initialInvestment;
        document.getElementById('annualRateSlider').value = this.defaultValues.annualRate;
        document.getElementById('annualRateInput').value = this.defaultValues.annualRate;
        document.getElementById('monthlyContributionSlider').value = this.defaultValues.monthlyContribution;
        document.getElementById('monthlyContributionInput').value = this.defaultValues.monthlyContribution;
        document.getElementById('logScale').checked = false;
        
        this.calculate();
    }
    
    getCurrentValues() {
        return {
            initialInvestment: parseFloat(document.getElementById('initialInvestmentInput').value) || 0,
            annualRate: parseFloat(document.getElementById('annualRateInput').value) || 0,
            monthlyContribution: parseFloat(document.getElementById('monthlyContributionInput').value) || 0
        };
    }
    
    calculateInvestment() {
        const { initialInvestment, annualRate, monthlyContribution } = this.getCurrentValues();
        
        if (initialInvestment === 0 && monthlyContribution === 0) {
            return {
                monthsToGoal: null,
                finalValue: 0,
                totalContributions: 0,
                totalReturns: 0,
                monthlyData: [],
                yearlyData: []
            };
        }
        
        const monthlyRate = annualRate > 0 ? Math.pow(1 + annualRate / 100, 1/12) - 1 : 0;
        let balance = initialInvestment;
        let totalContributions = initialInvestment;
        let monthsToGoal = null;
        
        const monthlyData = [];
        const yearlyData = [];
        
        // Track yearly data
        let yearStartBalance = balance;
        let yearContributions = 0;
        
        for (let month = 1; month <= this.maxMonths; month++) {
            // Add monthly contribution
            if (month > 1) { // Don't add contribution in first month (already have initial investment)
                balance += monthlyContribution;
                totalContributions += monthlyContribution;
                yearContributions += monthlyContribution;
            }
            
            // Apply monthly return
            const monthlyReturn = balance * monthlyRate;
            balance += monthlyReturn;
            
            // Store monthly data
            monthlyData.push({
                month: month,
                balance: balance,
                contributions: totalContributions,
                returns: balance - totalContributions
            });
            
            // Check if goal reached
            if (monthsToGoal === null && balance >= this.targetGoal) {
                monthsToGoal = month;
            }
            
            // Store yearly data (every 12 months)
            if (month % 12 === 0) {
                const year = month / 12;
                const yearEndBalance = balance;
                const yearReturns = yearEndBalance - yearStartBalance - yearContributions;
                
                yearlyData.push({
                    year: year,
                    startBalance: yearStartBalance,
                    contributions: yearContributions,
                    returns: yearReturns,
                    endBalance: yearEndBalance
                });
                
                // Reset for next year
                yearStartBalance = balance;
                yearContributions = 0;
            }
        }
        
        // If we haven't completed a full year cycle, add the partial year
        if (monthlyData.length % 12 !== 0) {
            const lastMonth = monthlyData.length;
            const year = Math.ceil(lastMonth / 12);
            const yearEndBalance = balance;
            const yearReturns = yearEndBalance - yearStartBalance - yearContributions;
            
            yearlyData.push({
                year: year,
                startBalance: yearStartBalance,
                contributions: yearContributions,
                returns: yearReturns,
                endBalance: yearEndBalance
            });
        }
        
        return {
            monthsToGoal,
            finalValue: balance,
            totalContributions,
            totalReturns: balance - totalContributions,
            monthlyData,
            yearlyData
        };
    }
    
    calculate() {
        const results = this.calculateInvestment();
        
        this.updateGoalBanner(results);
        this.updateMetrics(results);
        this.updateCharts(results);
        this.updateTable(results);
    }
    
    updateGoalBanner(results) {
        const timeToGoalElement = document.getElementById('timeToGoal');
        const progressFillElement = document.getElementById('progressFill');
        const progressTextElement = document.getElementById('progressText');
        
        if (results.monthsToGoal !== null) {
            const years = Math.floor(results.monthsToGoal / 12);
            const months = results.monthsToGoal % 12;
            
            let timeText = 'Meta atingida em ';
            if (years > 0) {
                timeText += `${years} ${years === 1 ? 'ano' : 'anos'}`;
                if (months > 0) {
                    timeText += ` e ${months} ${months === 1 ? 'mês' : 'meses'}`;
                }
            } else {
                timeText += `${months} ${months === 1 ? 'mês' : 'meses'}`;
            }
            
            timeToGoalElement.textContent = timeText;
            progressFillElement.style.width = '100%';
            progressTextElement.textContent = '100%';
        } else {
            timeToGoalElement.textContent = 'Meta não atingida em 50 anos';
            const progress = Math.min(100, (results.finalValue / this.targetGoal) * 100);
            progressFillElement.style.width = `${progress}%`;
            progressTextElement.textContent = `${progress.toFixed(1)}%`;
        }
    }
    
    updateMetrics(results) {
        document.getElementById('totalInvested').textContent = this.formatCurrency(results.totalContributions);
        document.getElementById('totalReturns').textContent = this.formatCurrency(results.totalReturns);
        document.getElementById('finalValue').textContent = this.formatCurrency(results.finalValue);
        
        const realReturn = results.totalContributions > 0 
            ? ((results.finalValue / results.totalContributions) - 1) * 100 
            : 0;
        document.getElementById('realReturn').textContent = `${realReturn.toFixed(1)}%`;
        
        const capitalMultiple = results.totalContributions > 0 
            ? results.finalValue / results.totalContributions 
            : 0;
        document.getElementById('capitalMultiple').textContent = `${capitalMultiple.toFixed(1)}x`;
    }
    
    updateCharts(results) {
        this.updatePortfolioChart(results);
        this.updateCompositionChart(results);
    }
    
    updatePortfolioChart(results) {
        const ctx = document.getElementById('portfolioChart').getContext('2d');
        const isLogScale = document.getElementById('logScale').checked;
        
        if (this.portfolioChart) {
            this.portfolioChart.destroy();
        }
        
        const labels = results.monthlyData.map((data, index) => {
            const year = Math.floor(index / 12);
            const month = index % 12;
            return `${year}a ${month}m`;
        });
        
        const datasets = [
            {
                label: 'Total do Patrimônio',
                data: results.monthlyData.map(d => d.balance),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: false,
                tension: 0.3
            },
            {
                label: 'Total Investido',
                data: results.monthlyData.map(d => d.contributions),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: false,
                tension: 0.3
            },
            {
                label: 'Rendimentos',
                data: results.monthlyData.map(d => d.returns),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: false,
                tension: 0.3
            }
        ];
        
        // Add goal line
        if (results.finalValue > 0) {
            datasets.push({
                label: 'Meta (R$ 1 Milhão)',
                data: new Array(results.monthlyData.length).fill(this.targetGoal),
                borderColor: '#ef4444',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            });
        }
        
        this.portfolioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Tempo'
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        type: isLogScale ? 'logarithmic' : 'linear',
                        display: true,
                        title: {
                            display: true,
                            text: 'Valor (R$)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(context.parsed.y);
                                return `${label}: ${value}`;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    updateCompositionChart(results) {
        const ctx = document.getElementById('compositionChart').getContext('2d');
        
        if (this.compositionChart) {
            this.compositionChart.destroy();
        }
        
        const { initialInvestment } = this.getCurrentValues();
        const monthlyContributionsTotal = results.totalContributions - initialInvestment;
        
        const data = [];
        const labels = [];
        const colors = [];
        
        if (initialInvestment > 0) {
            data.push(initialInvestment);
            labels.push('Valor Inicial');
            colors.push('#10b981');
        }
        
        if (monthlyContributionsTotal > 0) {
            data.push(monthlyContributionsTotal);
            labels.push('Aportes Mensais');
            colors.push('#2563eb');
        }
        
        if (results.totalReturns > 0) {
            data.push(results.totalReturns);
            labels.push('Rendimentos');
            colors.push('#f59e0b');
        }
        
        this.compositionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(context.parsed);
                                const percentage = ((context.parsed / results.finalValue) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    updateTable(results) {
        const tbody = document.getElementById('breakdownTableBody');
        tbody.innerHTML = '';
        
        results.yearlyData.forEach(yearData => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${yearData.year}º ano</td>
                <td>${this.formatCurrency(yearData.startBalance)}</td>
                <td>${this.formatCurrency(yearData.contributions)}</td>
                <td>${this.formatCurrency(yearData.returns)}</td>
                <td><strong>${this.formatCurrency(yearData.endBalance)}</strong></td>
            `;
            tbody.appendChild(row);
        });
    }
    
    updateChartScale() {
        if (this.portfolioChart) {
            const isLogScale = document.getElementById('logScale').checked;
            this.portfolioChart.options.scales.y.type = isLogScale ? 'logarithmic' : 'linear';
            this.portfolioChart.update();
        }
    }
    
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InvestmentSimulator();
});