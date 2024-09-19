/**
 * Atribuir +1 Ticket ao Agente
 * 
 * Autor: Jonathan Silva
 * Email: jonathan.silva@3wdev.tech
 * Data: 2024-09-17
 * 
 * Descrição:
 * Este aplicativo Zendesk atribui automaticamente o ticket mais antigo não atribuído da fila do grupo ao agente atual.
 */

var client; // Definido como global

document.addEventListener('DOMContentLoaded', function() {
    client = ZAFClient.init(); // Inicializa o cliente e define como global

    // Exibir a quantidade de tickets na fila definida
    fetchTicketCountFromView();
    
    // Inicializar o botão de atribuição
    initializeButton();
});

// Função para buscar e exibir a quantidade de tickets na fila
function fetchTicketCountFromView() {
    const viewId = '28426766099220'; // ID da fila Aguardando - N1

    client.request({
        url: `/api/v2/views/${viewId}/tickets.json`,
        type: 'GET',
        dataType: 'json',
    }).then(function(data) {
        console.log('Resposta da API:', data); // Log para depuração
        if (data.tickets && data.tickets.length > 0) {
            var ticketCount = data.tickets.length;
            document.getElementById('ticket-count').textContent = 'Tickets aguardando - N1 📣: ' + ticketCount;
        } else {
            document.getElementById('ticket-count').textContent = 'Nenhum ticket aguardando - N1 📣.';
        }
    }).catch(function(err) {
        console.error('Erro ao obter tickets da fila:', err);
        document.getElementById('ticket-count').textContent = 'Erro ao carregar a fila de tickets.';
    });
}

// Função para inicializar o botão
function initializeButton() {
    const button = document.getElementById('assign-ticket-button');
    if (button) {
        // Adiciona um ouvinte para o evento de clique no botão
        button.removeEventListener('click', handleButtonClick); // Remove o ouvinte anterior, se existir
        button.addEventListener('click', handleButtonClick); // Adiciona o novo ouvinte
    }
}

// Função chamada quando o botão é clicado
function handleButtonClick() {
    assignOldestTicketFromView();
}

// Função para buscar e atribuir o ticket mais antigo não atribuído na fila específica
function assignOldestTicketFromView() {
    const viewId = '28426766099220'; // ID da fila definida

    client.invoke('notify', 'Buscando ticket mais antigo na fila...', 'notice');
    client.request({
        url: `/api/v2/views/${viewId}/tickets.json`,
        type: 'GET',
        dataType: 'json',
    }).then(function(data) {
        if (data.tickets && data.tickets.length > 0) {
            const oldestTicket = data.tickets[0]; // Pega o ticket mais antigo
            console.log("Ticket mais antigo encontrado:", oldestTicket);

            // Atribuir o ticket ao agente
            assignTicketToAgent(oldestTicket.id);
        } else {
            console.log("Nenhum ticket encontrado na fila.");
            client.invoke('notify', 'Nenhum ticket encontrado na fila.', 'error');
        }
    }).catch(function(error) {
        console.error("Erro ao buscar os tickets:", error);
        client.invoke('notify', 'Erro ao buscar tickets da fila.', 'error');
    });
}

// Função para atribuir o ticket ao agente
function assignTicketToAgent(ticketId) {
    client.get('currentUser').then(function(userData) {
        const agentId = userData.currentUser.id; // Obtém o ID do agente atual
        console.log("Atribuindo ticket ao agente ID:", agentId);

        client.request({
            url: `/api/v2/tickets/${ticketId}.json`,
            type: 'PUT',
            dataType: 'json',
            data: JSON.stringify({
                ticket: {
                    assignee_id: agentId
                }
            }),
            contentType: 'application/json'
        }).then(function(response) {
            console.log("Ticket atribuído com sucesso.");
            client.invoke('notify', `Ticket #${ticketId} atribuído com sucesso!`, 'notice');
        }).catch(function(error) {
            console.error("Erro ao atribuir o ticket:", error);
            client.invoke('notify', 'Erro ao atribuir o ticket.', 'error');
        });
    }).catch(function(error) {
        console.error("Erro ao obter o usuário atual:", error);
        client.invoke('notify', 'Erro ao obter o usuário atual.', 'error');
    });
}
