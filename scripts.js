// Dynamically create rows in the table
function createInputRow(month) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${month}</td>
        <td><input type="number" class="monthly-income" value="" style="width: 60px;"></td>
        <td><input type="number" class="monthly-expenses" value="" style="width: 60px;"></td>
        <td><input type="number" class="monthly-savings" value="" style="width: 60px;" readonly></td>
    `;
    return row;
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const tableBody = document.getElementById('inputRows');

// Populate table with rows
months.forEach(month => {
    tableBody.appendChild(createInputRow(month));
});

let myChart; // Define myChart outside of the updateChart function

// Function to initialize the chart
function initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Income',
                data: [],
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.1)',
                fill: false,
                lineTension: 0.4 // Make the line more round
            }, {
                label: 'Monthly Expenses',
                data: [],
                borderColor: 'red',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                fill: false,
                lineTension: 0.4 // Make the line more round
            }, {
                label: 'Savings',
                data: [],
                borderColor: 'green',
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                fill: false,
                lineTension: 0.4 // Make the line more round
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            }
        }
    });
}

// Function to update the chart
function updateChart() {
    const incomes = [];
    const expenses = [];
    const savings = [];

    document.querySelectorAll('.monthly-income').forEach(input => {
        incomes.push(parseFloat(input.value) || 0);
    });

    document.querySelectorAll('.monthly-expenses').forEach(input => {
        expenses.push(parseFloat(input.value) || 0);
    });

    document.querySelectorAll('.monthly-savings').forEach(input => {
        savings.push(parseFloat(input.value) || 0);
    });

    if (myChart) {
        myChart.destroy(); // Destroy the chart instance if it exists
    }

    initializeChart(); // Re-initialize the chart with new data

    myChart.data.datasets[0].data = incomes;
    myChart.data.datasets[1].data = expenses;
    myChart.data.datasets[2].data = savings;
    myChart.update();
}

// Function to clear all input fields and the chart
function clearAll() {
    document.querySelectorAll('.monthly-income').forEach(input => {
        input.value = '';
    });

    document.querySelectorAll('.monthly-expenses').forEach(input => {
        input.value = '';
    });

    document.querySelectorAll('.monthly-savings').forEach(input => {
        input.value = '';
    });

    if (myChart) {
        myChart.destroy(); // Destroy the chart instance
    }

    initializeChart(); // Re-initialize the chart with empty data
}

// Function to populate table with random numbers
function populateRandom() {
    document.querySelectorAll('.monthly-income').forEach(input => {
        input.value = getRandomNumber();
    });

    document.querySelectorAll('.monthly-expenses').forEach(input => {
        input.value = getRandomNumber();
    });

    updateSavings(); // Update savings after populating random numbers
    updateChart(); // Update chart after populating random numbers
}

// Function to generate random number between 1 and 100000
function getRandomNumber() {
    return Math.floor(Math.random() * 100000) + 1;
}

// Function to save the chart and table as PDF
async function saveAsPDF() {
    const tableContainer = document.querySelector(".table-container");
    const chartContainer = document.querySelector(".chart-container");

    // Scroll to the top of the table
    window.scrollTo({
        top: tableContainer.offsetTop - 20, // Scroll to the top of the table with some padding
        behavior: 'smooth'
    });

    // Add a delay to ensure the page is fully scrolled and rendered
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Temporarily scale down the table for the screenshot
    tableContainer.style.transform = 'scale(0.8)';
    tableContainer.style.transformOrigin = 'top left';
    tableContainer.style.width = '125%'; // Compensate for the scaling

    try {
        const tableCanvas = await html2canvas(tableContainer, {
            scale: 3, // Increase the scale for better resolution
            useCORS: true, // Enable CORS
            scrollY: -window.scrollY // Offset the scroll position to capture the entire table
        });
        const chartCanvas = await html2canvas(chartContainer, {
            scale: 3, // Increase the scale for better resolution
            useCORS: true, // Enable CORS
        });

        // Revert the scaling after capturing the screenshot
        tableContainer.style.transform = '';
        tableContainer.style.width = '';

        const imgDataTable = tableCanvas.toDataURL('image/png');
        const imgDataChart = chartCanvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // Width of A4 in mm
        const pageHeight = 295; // Height of A4 in mm
        const imgHeightTable = tableCanvas.height * imgWidth / tableCanvas.width;
        const imgHeightChart = chartCanvas.height * imgWidth / chartCanvas.width;

        // Add the table to the first page
        pdf.addImage(imgDataTable, 'PNG', 0, 0, imgWidth, imgHeightTable);

        // Add the chart to the next page
        pdf.addPage();
        pdf.addImage(imgDataChart, 'PNG', 0, 0, imgWidth, imgHeightChart);

        pdf.save('expense-tracker.pdf');
    } catch (error) {
        console.error("Error generating PDF: ", error);
    }
}

// Update savings when income or expenses change
function updateSavings() {
    document.querySelectorAll('tr').forEach(row => {
        const incomeInput = row.querySelector('.monthly-income');
        const expensesInput = row.querySelector('.monthly-expenses');
        const savingsInput = row.querySelector('.monthly-savings');

        if (incomeInput && expensesInput && savingsInput) {
            const income = parseFloat(incomeInput.value) || 0;
            const expenses = parseFloat(expensesInput.value) || 0;
            const savings = income - expenses;
            savingsInput.value = savings.toFixed(2);
        }
    });
}

// Attach event listeners to income and expenses inputs to update savings automatically
document.addEventListener('input', event => {
    if (event.target.classList.contains('monthly-income') || event.target.classList.contains('monthly-expenses')) {
        updateSavings();
        updateChart(); // Update chart after savings change
    }
});

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
});

// Function to export data to CSV
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Month,Monthly Income,Monthly Expenses,Savings\n";
    
    // Select all rows except the header row
    const rows = document.querySelectorAll('#inputRows tr');

    // Iterate over each row to extract data
    rows.forEach(row => {
        const monthCell = row.querySelector('td:first-child');
        const incomeInput = row.querySelector('.monthly-income');
        const expensesInput = row.querySelector('.monthly-expenses');
        const savingsInput = row.querySelector('.monthly-savings');

        // Check if all elements are found in the row
        if (monthCell && incomeInput && expensesInput && savingsInput) {
            const month = monthCell.textContent.trim();
            const income = incomeInput.value.trim();
            const expenses = expensesInput.value.trim();
            const savings = savingsInput.value.trim();

            csvContent += `${month},${income},${expenses},${savings}\n`;
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expense_data.csv");
    document.body.appendChild(link);
    link.click();

    // Clean up the link element after clicking
    document.body.removeChild(link);
}