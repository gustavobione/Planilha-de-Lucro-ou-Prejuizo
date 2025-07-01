// Import Firebase service functions
import { 
    handleAuthentication, 
    onAuth, 
    listenToTransactions, 
    addTransaction, 
    deleteTransaction 
} from '../services/firebase-service.js';

// --- Global State ---
let userId = null;
let transactions = [];
let unsubscribeFromFirestore = null;

// --- DOM Elements ---
const form = document.getElementById('transaction-form');
const dateInput = document.getElementById('date');
const typeInput = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const quantityInput = document.getElementById('quantity');
const costPriceInput = document.getElementById('cost-price');
const salePriceInput = document.getElementById('sale-price');
const tableBody = document.getElementById('transaction-table-body');
const noTransactionsMessage = document.getElementById('no-transactions');
const totalRevenueEl = document.getElementById('total-revenue');
const totalCostEl = document.getElementById('total-cost');
const totalProfitEl = document.getElementById('total-profit');
const exportCsvBtn = document.getElementById('export-csv');
const userIdDisplay = document.getElementById('user-id-display');
const errorModal = document.getElementById('error-modal');
const errorMessageEl = document.getElementById('error-message');
const closeModalBtn = document.getElementById('close-modal-btn');

// --- Utility Functions ---
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (timestamp) => timestamp?.toDate?.().toLocaleDateString('pt-BR') ?? 'Data inválida';

// --- UI Functions ---
const showErrorModal = (message) => {
    errorMessageEl.textContent = message;
    errorModal.classList.remove('hidden');
};

const hideErrorModal = () => errorModal.classList.add('hidden');

function renderUI() {
    renderTable();
    updateSummary();
}

function renderTable() {
    tableBody.innerHTML = '';
    noTransactionsMessage.classList.toggle('hidden', transactions.length > 0);

    const sortedTransactions = [...transactions].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

    sortedTransactions.forEach(tx => {
        const isSale = tx.type === 'Venda';
        const totalCost = tx.quantity * tx.costPrice;
        const totalRevenue = isSale ? tx.quantity * tx.salePrice : 0;
        const profitOrLoss = isSale ? totalRevenue - totalCost : -totalCost;

        const row = document.createElement('tr');
        row.className = `border-b ${isSale ? '' : 'bg-red-50'}`;
        row.innerHTML = `
            <td class="p-3 text-sm">${formatDate(tx.date)}</td>
            <td class="p-3"><span class="px-2 py-1 text-xs rounded-full ${isSale ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">${tx.type}</span></td>
            <td class="p-3 font-medium">${tx.description}</td>
            <td class="p-3 text-right">${tx.quantity}</td>
            <td class="p-3 text-right text-red-600">${formatCurrency(totalCost)}</td>
            <td class="p-3 text-right text-green-600">${formatCurrency(totalRevenue)}</td>
            <td class="p-3 text-right font-bold ${profitOrLoss >= 0 ? 'text-green-700' : 'text-red-700'}">${formatCurrency(profitOrLoss)}</td>
            <td class="p-3 text-center">
                <button data-id="${tx.id}" class="btn-delete text-xs py-1 px-2 rounded">Excluir</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateSummary() {
    const totalRevenue = transactions
        .filter(tx => tx.type === 'Venda')
        .reduce((sum, tx) => sum + (tx.quantity * tx.salePrice), 0);
    
    const costOfGoodsSold = transactions
        .filter(tx => tx.type === 'Venda')
        .reduce((sum, tx) => sum + (tx.quantity * tx.costPrice), 0);

    const totalProfit = totalRevenue - costOfGoodsSold;

    totalRevenueEl.textContent = formatCurrency(totalRevenue);
    totalCostEl.textContent = formatCurrency(costOfGoodsSold);
    totalProfitEl.textContent = formatCurrency(totalProfit);

    totalProfitEl.classList.toggle('text-yellow-300', totalProfit < 0);
    totalProfitEl.classList.toggle('text-white', totalProfit >= 0);
}

// --- Event Handlers ---
async function handleAddTransaction(e) {
    e.preventDefault();
    if (!userId) {
        showErrorModal("Você não está conectado. Por favor, recarregue a página.");
        return;
    }

    const dateValue = dateInput.value;
    const typeValue = typeInput.value;
    const descriptionValue = descriptionInput.value.trim();
    const quantityValue = parseInt(quantityInput.value);
    const costPriceValue = parseFloat(costPriceInput.value.replace(',', '.'));
    const salePriceValue = parseFloat(salePriceInput.value.replace(',', '.'));

    if (!dateValue || !descriptionValue || isNaN(quantityValue) || isNaN(costPriceValue)) {
        showErrorModal('Por favor, preencha todos os campos obrigatórios: Data, Descrição, Quantidade e Preço de Custo.');
        return;
    }
    if (typeValue === 'Venda' && isNaN(salePriceValue)) {
        showErrorModal('Para uma venda, o Preço de Venda é obrigatório.');
        return;
    }

    try {
        await addTransaction(userId, {
            date: new Date(dateValue + 'T00:00:00'),
            type: typeValue,
            description: descriptionValue,
            quantity: quantityValue,
            costPrice: costPriceValue,
            salePrice: typeValue === 'Venda' ? salePriceValue : 0,
        });
        form.reset();
        dateInput.valueAsDate = new Date();
    } catch (error) {
        console.error("Error adding document: ", error);
        showErrorModal('Ocorreu um erro ao salvar a transação. Tente novamente.');
    }
}

async function handleDeleteTransaction(id) {
    if (!userId) return;
    try {
        await deleteTransaction(userId, id);
    } catch (error) {
        console.error("Error deleting document: ", error);
        showErrorModal('Ocorreu um erro ao excluir a transação.');
    }
}

function handleExportToCSV() {
    if (transactions.length === 0) {
        showErrorModal('Não há dados para exportar.');
        return;
    }

    const headers = ['Data', 'Tipo', 'Descricao', 'Quantidade', 'Custo_Unitario', 'Venda_Unitaria', 'Custo_Total', 'Receita_Total', 'Lucro_Prejuizo'];
    const csvRows = [headers.join(',')];
    
    const sortedTransactions = [...transactions].sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

    for (const tx of sortedTransactions) {
        const isSale = tx.type === 'Venda';
        const totalCost = tx.quantity * tx.costPrice;
        const totalRevenue = isSale ? tx.quantity * tx.salePrice : 0;
        const profitOrLoss = isSale ? totalRevenue - totalCost : -totalCost;
        
        const row = [
            formatDate(tx.date),
            tx.type,
            `"${tx.description.replace(/"/g, '""')}"`,
            tx.quantity,
            tx.costPrice.toFixed(2),
            tx.salePrice.toFixed(2),
            totalCost.toFixed(2),
            totalRevenue.toFixed(2),
            profitOrLoss.toFixed(2)
        ].join(',');
        csvRows.push(row);
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'relatorio_vendas_mary_kay.csv';
    link.click();
}

// --- Initialization ---
function init() {
    // Set up event listeners
    form.addEventListener('submit', handleAddTransaction);
    exportCsvBtn.addEventListener('click', handleExportToCSV);
    closeModalBtn.addEventListener('click', hideErrorModal);
    tableBody.addEventListener('click', (e) => {
        if (e.target.matches('.btn-delete')) {
            handleDeleteTransaction(e.target.dataset.id);
        }
    });

    // Handle Authentication and Data Loading
    onAuth(user => {
        if (user) {
            userId = user.uid;
            userIdDisplay.textContent = userId;

            if (unsubscribeFromFirestore) unsubscribeFromFirestore();
            unsubscribeFromFirestore = listenToTransactions(userId, (data, error) => {
                if (error) {
                    showErrorModal("Não foi possível carregar seus dados. Verifique sua conexão.");
                    return;
                }
                transactions = data;
                renderUI();
            });
        } else {
            userId = null;
            userIdDisplay.textContent = 'Nenhum usuário logado.';
            if (unsubscribeFromFirestore) unsubscribeFromFirestore();
            transactions = [];
            renderUI();
        }
    });

    handleAuthentication();
    dateInput.valueAsDate = new Date();
}

// Start the application
init();
