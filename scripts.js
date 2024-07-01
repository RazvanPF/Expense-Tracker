// Dynamically create rows in the table
function createInputRow(month) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${month}</td>
        <td><input type="number" class="monthly-income" value="" style="width: 60px;"></td>
        <td><input type="number" class="monthly-expenses" value="" style="width: 60px;"></td>
        <td><input type="number" class="monthly-savings" value="" style="width: 60px;"></td>
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

    document.querySelectorAll('.monthly-savings').forEach(input => {
        input.value = getRandomNumber();
    });

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

    try {
        const tableCanvas = await html2canvas(tableContainer);
        const chartCanvas = await html2canvas(chartContainer);

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

// Initialize the chart when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
});
