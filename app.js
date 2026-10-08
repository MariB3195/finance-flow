let transactions = JSON.parse(
    localStorage.getItem("financeTransactions")
) || [];

let editingTransactionId = null;
let currentChartPeriod = "total";

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const savingsElement = document.getElementById("savings");
const transactionCountElement = document.getElementById("transactionCount");

const monthlyIncomeElement = document.getElementById("monthlyIncome");
const monthlyExpensesElement = document.getElementById("monthlyExpenses");
const monthlyBalanceElement = document.getElementById("monthlyBalance");
const monthlySummaryTitle = document.getElementById("monthlySummaryTitle");

const transactionsList = document.getElementById("transactionsList");
const transactionForm = document.getElementById("transactionForm");
const addTransactionBtn = document.getElementById("addTransactionBtn");

const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const typeInput = document.getElementById("type");

const filterType = document.getElementById("filterType");
const searchInput = document.getElementById("searchInput");

const chartPeriod = document.getElementById("chartPeriod");
const themeToggle = document.getElementById("themeToggle");

const financeChart = document.getElementById("financeChart");
const categoryChart = document.getElementById("categoryChart");
const categoryDonutChart = document.getElementById("categoryDonutChart");
const categoryLegend = document.getElementById("categoryLegend");


/* =========================
   DATI DI ESEMPIO
========================= */

function createDemoTransactions() {
    const demoTransactions = [
        {
            id: Date.now() + 1,
            description: "Stipendio",
            category: "Stipendio",
            amount: 1800,
            date: "2026-10-01",
            type: "income"
        },
        {
            id: Date.now() + 2,
            description: "Spesa supermercato",
            category: "Alimentari",
            amount: 85.50,
            date: "2026-10-03",
            type: "expense"
        },
        {
            id: Date.now() + 3,
            description: "Cena fuori",
            category: "Ristorante",
            amount: 45,
            date: "2026-10-05",
            type: "expense"
        },
        {
            id: Date.now() + 4,
            description: "Abbonamento trasporti",
            category: "Trasporti",
            amount: 40,
            date: "2026-10-06",
            type: "expense"
        },
        {
            id: Date.now() + 5,
            description: "Bollette",
            category: "Bollette",
            amount: 120,
            date: "2026-10-08",
            type: "expense"
        }
    ];

    transactions = demoTransactions;

    saveTransactions();
}


/* =========================
   FORMATTAZIONE
========================= */

function formatCurrency(value) {
    return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR"
    }).format(value);
}


/* =========================
   LOCAL STORAGE
========================= */

function saveTransactions() {
    localStorage.setItem(
        "financeTransactions",
        JSON.stringify(transactions)
    );
}


/* =========================
   RIEPILOGO GENERALE
========================= */

function calculateSummary() {
    let income = 0;
    let expenses = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            income += Number(transaction.amount);
        } else {
            expenses += Number(transaction.amount);
        }
    });

    const balance = income - expenses;

    balanceElement.textContent = formatCurrency(balance);
    incomeElement.textContent = formatCurrency(income);
    expensesElement.textContent = formatCurrency(expenses);
    savingsElement.textContent = formatCurrency(balance);
    transactionCountElement.textContent = transactions.length;

    calculateMonthlySummary();
    drawChart();
    drawCategoryChart();
    drawCategoryDonutChart();
}


/* =========================
   RIEPILOGO MENSILE
========================= */

function calculateMonthlySummary() {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach(transaction => {
        if (!transaction.date) {
            return;
        }

        const transactionDate = new Date(
            transaction.date + "T00:00:00"
        );

        if (
            transactionDate.getFullYear() === currentYear &&
            transactionDate.getMonth() === currentMonth
        ) {
            if (transaction.type === "income") {
                monthlyIncome += Number(transaction.amount);
            } else {
                monthlyExpenses += Number(transaction.amount);
            }
        }
    });

    const monthlyBalance =
        monthlyIncome - monthlyExpenses;

    const monthName = new Intl.DateTimeFormat(
        "it-IT",
        {
            month: "long"
        }
    ).format(now);

    const capitalizedMonth =
        monthName.charAt(0).toUpperCase() +
        monthName.slice(1);

    monthlySummaryTitle.textContent =
        `Riepilogo di ${capitalizedMonth} ${currentYear}`;

    monthlyIncomeElement.textContent =
        formatCurrency(monthlyIncome);

    monthlyExpensesElement.textContent =
        formatCurrency(monthlyExpenses);

    monthlyBalanceElement.textContent =
        formatCurrency(monthlyBalance);
}


/* =========================
   RENDER TRANSAZIONI
========================= */

function renderTransactions() {
    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedFilter =
        filterType.value;

    let filteredTransactions =
        transactions.filter(transaction => {

            const matchesSearch =
                transaction.description
                    .toLowerCase()
                    .includes(searchTerm) ||
                transaction.category
                    .toLowerCase()
                    .includes(searchTerm);

            const matchesFilter =
                selectedFilter === "all" ||
                transaction.type === selectedFilter;

            return matchesSearch && matchesFilter;
        });

    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = `
            <p>
                Nessuna transazione trovata.
            </p>
        `;

        return;
    }

    filteredTransactions.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );

    transactionsList.innerHTML =
        filteredTransactions
            .map(transaction => {

                const amountClass =
                    transaction.type === "income"
                        ? "income"
                        : "expense";

                const amountPrefix =
                    transaction.type === "income"
                        ? "+"
                        : "-";

                const formattedDate =
                    new Date(
                        transaction.date + "T00:00:00"
                    ).toLocaleDateString(
                        "it-IT"
                    );

                return `
                    <div class="transaction-item">

                        <div class="transaction-info">

                            <strong class="transaction-description">
                                ${transaction.description}
                            </strong>

                            <div class="transaction-meta">

                                <span class="transaction-category">
                                    ${transaction.category}
                                </span>

                                <span class="transaction-date">
                                    ${formattedDate}
                                </span>

                            </div>

                        </div>

                        <div class="transaction-right">

                            <strong class="transaction-amount ${amountClass}">
                                ${amountPrefix}${formatCurrency(transaction.amount)}
                            </strong>

                            <div class="transaction-actions">

                                <button
                                    type="button"
                                    class="edit-btn"
                                    data-id="${transaction.id}"
                                >
                                    Modifica
                                </button>

                                <button
                                    type="button"
                                    class="delete-btn"
                                    data-id="${transaction.id}"
                                >
                                    Elimina
                                </button>

                            </div>

                        </div>

                    </div>
                `;
            })
            .join("");

    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    editTransaction(
                        Number(button.dataset.id)
                    );
                }
            );
        });

    document
        .querySelectorAll(".delete-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {
                    deleteTransaction(
                        Number(button.dataset.id)
                    );
                }
            );
        });
}


/* =========================
   AGGIUNGI / MODIFICA
========================= */

addTransactionBtn.addEventListener(
    "click",
    () => {

        transactionForm.classList.toggle(
            "active"
        );

        if (
            transactionForm.classList.contains(
                "active"
            )
        ) {
            descriptionInput.focus();
        }
    }
);


/* =========================
   SALVATAGGIO FORM
========================= */

transactionForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const description =
            descriptionInput.value.trim();

        const category =
            categoryInput.value;

        const amount =
            Number(amountInput.value);

        const date =
            dateInput.value;

        const type =
            typeInput.value;

        if (
            !description ||
            !category ||
            !amount ||
            amount <= 0 ||
            !date ||
            !type
        ) {
            return;
        }

        if (editingTransactionId !== null) {

            const transaction =
                transactions.find(
                    item =>
                        item.id ===
                        editingTransactionId
                );

            if (transaction) {
                transaction.description =
                    description;

                transaction.category =
                    category;

                transaction.amount =
                    amount;

                transaction.date =
                    date;

                transaction.type =
                    type;
            }

            editingTransactionId = null;

        } else {

            transactions.push({
                id: Date.now(),
                description,
                category,
                amount,
                date,
                type
            });
        }

        saveTransactions();

        transactionForm.reset();

        transactionForm.classList.remove(
            "active"
        );

        addTransactionBtn.textContent =
            "+ Aggiungi";

        calculateSummary();
        renderTransactions();
    }
);


/* =========================
   MODIFICA TRANSAZIONE
========================= */

function editTransaction(id) {

    const transaction =
        transactions.find(
            item => item.id === id
        );

    if (!transaction) {
        return;
    }

    editingTransactionId = id;

    descriptionInput.value =
        transaction.description;

    categoryInput.value =
        transaction.category;

    amountInput.value =
        transaction.amount;

    dateInput.value =
        transaction.date;

    typeInput.value =
        transaction.type;

    transactionForm.classList.add(
        "active"
    );

    addTransactionBtn.textContent =
        "Annulla modifica";

    descriptionInput.focus();
}


/* =========================
   ELIMINA TRANSAZIONE
========================= */

function deleteTransaction(id) {

    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );

    saveTransactions();

    calculateSummary();
    renderTransactions();
}


/* =========================
   FILTRI E RICERCA
========================= */

filterType.addEventListener(
    "change",
    renderTransactions
);

searchInput.addEventListener(
    "input",
    renderTransactions
);


/* =========================
   COLORI GRAFICI
========================= */

function getChartColors() {

    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );

    return {
        text: isDark
            ? "#f8fafc"
            : "#0f172a",

        muted: isDark
            ? "#94a3b8"
            : "#64748b",

        grid: isDark
            ? "#334155"
            : "#e2e8f0",

        income: "#16a34a",
        expense: "#dc2626"
    };
}


/* =========================
   FILTRO PERIODO GRAFICO
========================= */

function getTransactionsForChart() {

    if (currentChartPeriod === "total") {
        return transactions;
    }

    const now = new Date();

    if (currentChartPeriod === "month") {

        return transactions.filter(
            transaction => {

                const date =
                    new Date(
                        transaction.date +
                        "T00:00:00"
                    );

                return (
                    date.getFullYear() ===
                        now.getFullYear() &&
                    date.getMonth() ===
                        now.getMonth()
                );
            }
        );
    }

    if (
        currentChartPeriod ===
        "six-months"
    ) {

        const sixMonthsAgo =
            new Date(
                now.getFullYear(),
                now.getMonth() - 5,
                1
            );

        return transactions.filter(
            transaction => {

                const date =
                    new Date(
                        transaction.date +
                        "T00:00:00"
                    );

                return date >= sixMonthsAgo;
            }
        );
    }

    return transactions;
}


/* =========================
   GRAFICO PRINCIPALE
========================= */

function drawChart() {

    const ctx =
        financeChart.getContext("2d");

    const colors =
        getChartColors();

    ctx.clearRect(
        0,
        0,
        financeChart.width,
        financeChart.height
    );

    const chartTransactions =
        getTransactionsForChart();

    const income =
        chartTransactions
            .filter(
                transaction =>
                    transaction.type ===
                    "income"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    Number(transaction.amount),
                0
            );

    const expenses =
        chartTransactions
            .filter(
                transaction =>
                    transaction.type ===
                    "expense"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    Number(transaction.amount),
                0
            );

    if (
        currentChartPeriod ===
        "six-months"
    ) {
        drawMonthlyChart(
            ctx,
            colors,
            chartTransactions
        );

        return;
    }

    const values = [
        income,
        expenses
    ];

    const maxValue =
        Math.max(...values, 1);

    const chartHeight = 220;
    const chartBottom = 270;
    const barWidth = 140;

    const positions = [
        200,
        420
    ];

    values.forEach(
        (value, index) => {

            const barHeight =
                (value / maxValue) *
                chartHeight;

            const x =
                positions[index];

            const y =
                chartBottom -
                barHeight;

            ctx.fillStyle =
                index === 0
                    ? colors.income
                    : colors.expense;

            ctx.fillRect(
                x,
                y,
                barWidth,
                barHeight
            );

            ctx.fillStyle =
                colors.text;

            ctx.font =
                "bold 16px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                formatCurrency(value),
                x + barWidth / 2,
                y - 10
            );

            ctx.font =
                "14px Arial";

            ctx.fillText(
                index === 0
                    ? "Entrate"
                    : "Uscite",
                x + barWidth / 2,
                300
            );
        }
    );

    ctx.strokeStyle =
        colors.grid;

    ctx.beginPath();

    ctx.moveTo(80, 270);
    ctx.lineTo(640, 270);

    ctx.stroke();
}


/* =========================
   GRAFICO MENSILE
========================= */

function drawMonthlyChart(
    ctx,
    colors,
    chartTransactions
) {

    const now = new Date();

    const months = [];

    for (let i = 5; i >= 0; i--) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );

        months.push({
            year: date.getFullYear(),
            month: date.getMonth(),
            label: date.toLocaleDateString(
                "it-IT",
                {
                    month: "short"
                }
            ),
            income: 0,
            expense: 0
        });
    }

    chartTransactions.forEach(
        transaction => {

            const date =
                new Date(
                    transaction.date +
                    "T00:00:00"
                );

            const month =
                months.find(
                    item =>
                        item.year ===
                            date.getFullYear() &&
                        item.month ===
                            date.getMonth()
                );

            if (!month) {
                return;
            }

            if (
                transaction.type ===
                "income"
            ) {
                month.income +=
                    Number(
                        transaction.amount
                    );
            } else {
                month.expense +=
                    Number(
                        transaction.amount
                    );
            }
        }
    );

    const maxValue =
        Math.max(
            ...months.flatMap(
                month => [
                    month.income,
                    month.expense
                ]
            ),
            1
        );

    const chartBottom = 270;
    const chartHeight = 220;

    const groupWidth = 85;
    const barWidth = 28;

    months.forEach(
        (month, index) => {

            const center =
                110 +
                index * 100;

            const incomeHeight =
                (month.income /
                    maxValue) *
                chartHeight;

            const expenseHeight =
                (month.expense /
                    maxValue) *
                chartHeight;

            ctx.fillStyle =
                colors.income;

            ctx.fillRect(
                center - 32,
                chartBottom -
                    incomeHeight,
                barWidth,
                incomeHeight
            );

            ctx.fillStyle =
                colors.expense;

            ctx.fillRect(
                center + 4,
                chartBottom -
                    expenseHeight,
                barWidth,
                expenseHeight
            );

            ctx.fillStyle =
                colors.text;

            ctx.font =
                "12px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                month.label,
                center,
                300
            );
        }
    );

    ctx.strokeStyle =
        colors.grid;

    ctx.beginPath();

    ctx.moveTo(60, 270);
    ctx.lineTo(650, 270);

    ctx.stroke();
}


/* =========================
   SELETTORE GRAFICO
========================= */

chartPeriod.addEventListener(
    "change",
    () => {

        currentChartPeriod =
            chartPeriod.value;

        drawChart();
    }
);


/* =========================
   CATEGORIE
========================= */

function getCategoryTotals() {

    const totals = {};

    transactions.forEach(
        transaction => {

            if (
                transaction.type !==
                "expense"
            ) {
                return;
            }

            if (!totals[transaction.category]) {
                totals[transaction.category] = 0;
            }

            totals[transaction.category] +=
                Number(transaction.amount);
        }
    );

    return totals;
}


/* =========================
   GRAFICO CATEGORIE
========================= */

function drawCategoryChart() {

    const ctx =
        categoryChart.getContext("2d");

    const colors =
        getChartColors();

    ctx.clearRect(
        0,
        0,
        categoryChart.width,
        categoryChart.height
    );

    const totals =
        getCategoryTotals();

    const categories =
        Object.keys(totals);

    if (categories.length === 0) {

        ctx.fillStyle =
            colors.muted;

        ctx.font =
            "16px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Nessuna spesa disponibile",
            categoryChart.width / 2,
            categoryChart.height / 2
        );

        categoryLegend.innerHTML = "";

        return;
    }

    const maxValue =
        Math.max(
            ...Object.values(totals),
            1
        );

    const barWidth = 55;
    const gap = 25;

    categories.forEach(
        (category, index) => {

            const value =
                totals[category];

            const barHeight =
                (value / maxValue) *
                210;

            const x =
                35 +
                index *
                (barWidth + gap);

            const y =
                270 -
                barHeight;

            const hue =
                (index * 55) % 360;

            ctx.fillStyle =
                `hsl(${hue}, 65%, 50%)`;

            ctx.fillRect(
                x,
                y,
                barWidth,
                barHeight
            );

            ctx.fillStyle =
                colors.text;

            ctx.font =
                "12px Arial";

            ctx.textAlign =
                "center";

            ctx.fillText(
                category,
                x + barWidth / 2,
                295
            );

            ctx.font =
                "bold 12px Arial";

            ctx.fillText(
                formatCurrency(value),
                x + barWidth / 2,
                y - 8
            );
        }
    );

    ctx.strokeStyle =
        colors.grid;

    ctx.beginPath();

    ctx.moveTo(20, 270);
    ctx.lineTo(680, 270);

    ctx.stroke();

    drawCategoryLegend(totals);
}


/* =========================
   LEGEND CATEGORIE
========================= */

function drawCategoryLegend(
    totals
) {

    const totalExpenses =
        Object.values(totals)
            .reduce(
                (sum, value) =>
                    sum + value,
                0
            );

    categoryLegend.innerHTML =
        Object.entries(totals)
            .map(
                ([category, value], index) => {

                    const percentage =
                        totalExpenses > 0
                            ? (
                                value /
                                totalExpenses
                            ) * 100
                            : 0;

                    const hue =
                        (index * 55) % 360;

                    return `
                        <div class="category-legend-item">

                            <span
                                class="category-legend-color"
                                style="
                                    background:
                                    hsl(
                                        ${hue},
                                        65%,
                                        50%
                                    );
                                "
                            ></span>

                            <span>
                                ${category}
                            </span>

                            <strong>
                                ${formatCurrency(value)}
                                (${percentage.toFixed(0)}%)
                            </strong>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================
   DONUT
========================= */

function drawCategoryDonutChart() {

    const ctx =
        categoryDonutChart.getContext("2d");

    const colors =
        getChartColors();

    ctx.clearRect(
        0,
        0,
        categoryDonutChart.width,
        categoryDonutChart.height
    );

    const totals =
        getCategoryTotals();

    const entries =
        Object.entries(totals);

    const total =
        entries.reduce(
            (sum, [, value]) =>
                sum + value,
            0
        );

    if (
        entries.length === 0 ||
        total === 0
    ) {

        ctx.fillStyle =
            colors.muted;

        ctx.font =
            "16px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "Nessuna spesa",
            180,
            180
        );

        return;
    }

    let startAngle =
        -Math.PI / 2;

    const centerX = 180;
    const centerY = 180;
    const radius = 130;

    entries.forEach(
        ([category, value], index) => {

            const slice =
                (
                    value /
                    total
                ) *
                Math.PI *
                2;

            const hue =
                (index * 55) % 360;

            ctx.beginPath();

            ctx.moveTo(
                centerX,
                centerY
            );

            ctx.arc(
                centerX,
                centerY,
                radius,
                startAngle,
                startAngle + slice
            );

            ctx.closePath();

            ctx.fillStyle =
                `hsl(${hue}, 65%, 50%)`;

            ctx.fill();

            startAngle += slice;
        }
    );

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        72,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        document.body.classList.contains(
            "dark-mode"
        )
            ? "#111827"
            : "#ffffff";

    ctx.fill();

    ctx.fillStyle =
        colors.text;

    ctx.font =
        "bold 20px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        formatCurrency(total),
        centerX,
        centerY + 7
    );
}


/* =========================
   DARK MODE
========================= */

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );

        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );

        localStorage.setItem(
            "financeDarkMode",
            isDark
        );

        themeToggle.textContent =
            isDark
                ? "☀️"
                : "🌙";

        themeToggle.setAttribute(
            "aria-label",
            isDark
                ? "Disattiva modalità scura"
                : "Attiva modalità scura"
        );

        drawChart();
        drawCategoryChart();
        drawCategoryDonutChart();
    }
);


/* =========================
   AVVIO DARK MODE
========================= */

if (
    localStorage.getItem(
        "financeDarkMode"
    ) === "true"
) {

    document.body.classList.add(
        "dark-mode"
    );

    themeToggle.textContent = "☀️";

    themeToggle.setAttribute(
        "aria-label",
        "Disattiva modalità scura"
    );
}


/* =========================
   INIZIALIZZAZIONE
========================= */

if (transactions.length === 0) {
    createDemoTransactions();
}

calculateSummary();
renderTransactions();