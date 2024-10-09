/**
 * Atribuir +1 Ticket ao Agente
 * 
 * Autor: Jonathan Silva
 * Email: jonathan.silva@saipos.com
 * Data: 2024-09-30
 * Versão 3.0.1
 * Descrição:
 * Este aplicativo Zendesk atribui automaticamente o ticket mais antigo não atribuído da fila do grupo ao agente atual.
 */

var client; // Definido como global

document.addEventListener('DOMContentLoaded', function() {
    client = ZAFClient.init();

    // Exibir a quantidade de tickets na fila definida
    fetchTicketCountFromView();
    
    // Inicializar o botão de atribuição
    initializeButton();

    // Adicionar evento de clique para o botão de refresh
    const refreshButton = document.getElementById('refresh-button');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            console.log("Botão de refresh clicado.");
            // Chamar a função que recarrega a contagem de tickets
            fetchTicketCountFromView();
        });
    }
});

// Função para buscar e exibir a quantidade de tickets na fila
function fetchTicketCountFromView() {
    const viewId = '28426766099220'; // ID da fila Aguardando - N1

    client.request({
        url: `/api/v2/views/${viewId}/tickets.json`, // Api de consulta da view
        type: 'GET',
        dataType: 'json',
    }).then(function(data) {
        console.log('Resposta da API:', data); // Log para depuração
        if (data.tickets && data.tickets.length > 0) {
            var ticketCount = data.tickets.length;
            document.getElementById('ticket-count').textContent = 'Tickets aguardando N1📣:' + ticketCount;
        } else {
            document.getElementById('ticket-count').textContent = 'Nenhum ticket aguardando N1📣.';
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
        url: `/api/v2/views/${viewId}/tickets.json`, // Api de consulta ticket
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

        // Atribuir o ticket ao agente
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
            
            // Adicionar observação ao ticket informando que foi atribuído pelo app
            addCommentToTicket(ticketId, agentId);

        }).catch(function(error) {
            console.error("Erro ao atribuir o ticket:", error);
            client.invoke('notify', 'Erro ao atribuir o ticket.', 'error');
        });
    }).catch(function(error) {
        console.error("Erro ao obter o usuário atual:", error);
        client.invoke('notify', 'Erro ao obter o usuário atual.', 'error');
    });
}

// Função para adicionar um comentário ao ticket
function addCommentToTicket(ticketId, agentId) {
    const comment = `Ticket atribuído pelo aplicativo Saipos Fila ao agente ID: ${agentId}`;
    
    client.request({
        url: `/api/v2/tickets/${ticketId}.json`,
        type: 'PUT',
        dataType: 'json',
        data: JSON.stringify({
            ticket: {
                comment: {
                    body: comment,
                    public: false // Define se o comentário é público (true) ou privado (false)
                }
            }
        }),
        contentType: 'application/json'
    }).then(function(response) {
        console.log("Comentário adicionado ao ticket.");
        client.invoke('notify', 'Comentário adicionado com sucesso!', 'notice');
    }).catch(function(error) {
        console.error("Erro ao adicionar comentário ao ticket:", error);
        client.invoke('notify', 'Erro ao adicionar comentário ao ticket.', 'error');
    });
}

document.querySelector("#\\:r1ro\\:--primary-pane > div.sc-rbmcji-0.fvZJku > div > section > div.sc-1j75nax-1.sc-9fnvsr-0.gSpHaW > div.sc-9fnvsr-1.jxhHtY > div.sc-8c77jc-0.fatSvu > div.sc-1ho6spw-0.duLYkQ > div.sc-1ho6spw-1.gPQwvo > div.sc-1ho6spw-3.cpsRYi > button:nth-child(1)")