const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
const categories = {};
const formatter = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "INR",
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const balanceValue = parseFloat(balance.textContent.replace(/\D/g, ""));
const expenseValue = parseFloat(expense.textContent.replace(/\D/g, ""));

form.addEventListener("submit", addTransaction);
function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);

  const pendingExpense = incomeTotal - expenseTotal;
  balance.textContent = formatter.format(pendingExpense).substring(1);
  income.textContent = formatter.format(incomeTotal);
  
  expense.textContent = "-" + formatter.format(Math.abs(expenseTotal));
}


function renderList() {
  list.innerHTML = "";

  statusbar.textContent = "";
  if (transactions.length === 0) {
    statusbar.textContent = "No transactions.";
    return;
  }

  transactions.forEach(({ id, category, amount, date, type }) => {
    const sign = "income" === type ? 1 : -1;

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="category">
        <h4>${category}</h4>
        <p>${new Date(date).toLocaleDateString()}</p>
      </div>

      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>
    
      <div class="action">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id})">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;

    list.appendChild(li);
  });
}

renderList();
updateTotal();

function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  transactions.splice(index, 1);

  updateTotal();
  saveTransactions();
  renderList();
}

function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);
 

  transactions.push({
    id: transactions.length + 1,
    category: formData.get("category"),
    amount: parseFloat(formData.get("amount")),
    date: new Date(formData.get("date")),
    type: "on" === formData.get("type") ? "income" : "expense",
  });

  this.reset();

  updateTotal();
  saveTransactions();
  renderList();
}

function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateDonutChart();
}

const data = {
  labels: ['Expense','Balance'],
  datasets: [{
    label: '# Income',
    data: [expenseValue, balanceValue],
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
    ],
    borderWidth: 1
  }]
};

const options = {
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const ctx = document.getElementById('donutChart').getContext('2d');
ctx.canvas.width = 300;
ctx.canvas.height = 300;
const donutChart = new Chart(ctx, {
  type: 'doughnut',
  data: data,
  options: options
});

function updateDonutChart() {
  const balanceValue = parseFloat(balance.textContent.replace(/\D/g, '')); 
  const expenseValue = parseFloat(expense.textContent.replace(/\D/g, ''));
  
  donutChart.data.datasets[0].data = [expenseValue, balanceValue];
  donutChart.update();
}

updateDonutChart();
