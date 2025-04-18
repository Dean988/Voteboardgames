document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const setupSection = document.getElementById('setup');
    const votingSection = document.getElementById('voting');
    const resultsSection = document.getElementById('results');
    const gameSummarySection = document.getElementById('game-summary');
    
    const playerNameInput = document.getElementById('player-name');
    const addPlayerBtn = document.getElementById('add-player');
    const playersList = document.getElementById('players-list');
    const playersCount = document.getElementById('players-count');
    const clearPlayersBtn = document.getElementById('clear-players');
    const startGameBtn = document.getElementById('start-game');
    
    const currentRoundSpan = document.getElementById('current-round');
    const resultRoundSpan = document.getElementById('result-round');
    const currentPlayerSpan = document.getElementById('current-player');
    const voteYaaaaBtn = document.getElementById('vote-yaaaa');
    const votePuzzaBtn = document.getElementById('vote-puzza');
    
    const yaaaaCountSpan = document.getElementById('yaaaa-count');
    const puzzaCountSpan = document.getElementById('puzza-count');
    const votesTbody = document.getElementById('votes-tbody');
    const newVoteBtn = document.getElementById('new-vote');
    const endGameBtn = document.getElementById('end-game');
    
    const roundsSummary = document.getElementById('rounds-summary');
    const newGameBtn = document.getElementById('new-game');
    
    // Game State
    let players = [];
    let currentPlayerIndex = 0;
    let currentRound = 1;
    let rounds = [];
    let currentVotes = {
        yaaaa: 0,
        puzza: 0
    };
    
    // Initialize game
    startGameBtn.disabled = true;
    
    // Add player functionality
    addPlayerBtn.addEventListener('click', addPlayer);
    playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });
    
    clearPlayersBtn.addEventListener('click', clearPlayers);
    
    function clearPlayers() {
        players = [];
        playersList.innerHTML = '';
        updatePlayersCount();
        updateStartButton();
    }
    
    function addPlayer() {
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            // Check if player already exists
            if (players.some(player => player.name.toLowerCase() === playerName.toLowerCase())) {
                animateShake(playerNameInput);
                return;
            }
            
            players.push({
                name: playerName,
                hasVoted: false,
                vote: null
            });
            
            const li = document.createElement('li');
            li.innerHTML = `
                ${playerName}
                <button class="remove-player" data-index="${players.length - 1}">×</button>
            `;
            playersList.appendChild(li);
            
            playerNameInput.value = '';
            updatePlayersCount();
            updateStartButton();
            animateSuccess(addPlayerBtn);
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-player').forEach(btn => {
                btn.addEventListener('click', removePlayer);
            });
        }
    }
    
    function removePlayer(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        players.splice(index, 1);
        
        // Refresh the list
        renderPlayersList();
        updatePlayersCount();
        updateStartButton();
    }
    
    function renderPlayersList() {
        playersList.innerHTML = '';
        players.forEach((player, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${player.name}
                <button class="remove-player" data-index="${index}">×</button>
            `;
            playersList.appendChild(li);
        });
        
        // Re-add event listeners
        document.querySelectorAll('.remove-player').forEach(btn => {
            btn.addEventListener('click', removePlayer);
        });
    }
    
    function updatePlayersCount() {
        playersCount.textContent = `${players.length} giocator${players.length === 1 ? 'e' : 'i'}`;
    }
    
    function updateStartButton() {
        startGameBtn.disabled = players.length < 2;
    }
    
    // Animations
    function animateShake(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }
    
    function animateSuccess(element) {
        element.classList.add('success-animation');
        setTimeout(() => {
            element.classList.remove('success-animation');
        }, 500);
    }
    
    // Start game functionality
    startGameBtn.addEventListener('click', startGame);
    
    function startGame() {
        // Hide setup section, show voting section
        setupSection.classList.add('hidden');
        votingSection.classList.remove('hidden');
        
        // Reset game state
        currentPlayerIndex = 0;
        currentRound = 1;
        rounds = [];
        currentVotes = {
            yaaaa: 0,
            puzza: 0
        };
        
        // Update round display
        currentRoundSpan.textContent = currentRound;
        
        // Reset player votes
        players.forEach(player => {
            player.hasVoted = false;
            player.vote = null;
        });
        
        // Show first player
        showCurrentPlayer();
    }
    
    // Voting functionality
    voteYaaaaBtn.addEventListener('click', () => castVote('yaaaa'));
    votePuzzaBtn.addEventListener('click', () => castVote('puzza'));
    
    function castVote(vote) {
        // Record vote
        players[currentPlayerIndex].hasVoted = true;
        players[currentPlayerIndex].vote = vote;
        
        // Add visual indication of vote being cast
        const button = vote === 'yaaaa' ? voteYaaaaBtn : votePuzzaBtn;
        animateVoteButton(button);
        
        // Move to next player or show results
        currentPlayerIndex++;
        
        if (currentPlayerIndex < players.length) {
            showCurrentPlayer();
        } else {
            showResults();
        }
    }
    
    function animateVoteButton(button) {
        button.classList.add('voted');
        setTimeout(() => {
            button.classList.remove('voted');
        }, 300);
    }
    
    function showCurrentPlayer() {
        currentPlayerSpan.textContent = players[currentPlayerIndex].name;
    }
    
    function showResults() {
        // Calculate results
        currentVotes = {
            yaaaa: 0,
            puzza: 0
        };
        
        players.forEach(player => {
            if (player.vote === 'yaaaa') {
                currentVotes.yaaaa++;
            } else if (player.vote === 'puzza') {
                currentVotes.puzza++;
            }
        });
        
        // Add to rounds history
        rounds.push({
            round: currentRound,
            votes: {...currentVotes},
            playerVotes: players.map(player => ({
                name: player.name,
                vote: player.vote
            }))
        });
        
        // Update results display
        resultRoundSpan.textContent = currentRound;
        yaaaaCountSpan.textContent = currentVotes.yaaaa;
        puzzaCountSpan.textContent = currentVotes.puzza;
        
        // Update votes table
        votesTbody.innerHTML = '';
        players.forEach(player => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${player.name}</td>
                <td class="vote-${player.vote}">${player.vote === 'yaaaa' ? 'Yaaaa' : 'Puzza di Fascio'}</td>
            `;
            votesTbody.appendChild(tr);
        });
        
        // Hide voting section, show results section
        votingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
    }
    
    // New vote functionality
    newVoteBtn.addEventListener('click', startNewVote);
    
    function startNewVote() {
        // Increment round number
        currentRound++;
        currentRoundSpan.textContent = currentRound;
        
        // Reset player votes for this round
        currentPlayerIndex = 0;
        players.forEach(player => {
            player.hasVoted = false;
            player.vote = null;
        });
        
        // Show first player
        showCurrentPlayer();
        
        // Switch to voting view
        resultsSection.classList.add('hidden');
        votingSection.classList.remove('hidden');
    }
    
    // End game functionality
    endGameBtn.addEventListener('click', endGame);
    
    function endGame() {
        // Hide results section, show game summary
        resultsSection.classList.add('hidden');
        gameSummarySection.classList.remove('hidden');
        
        // Generate rounds summary
        roundsSummary.innerHTML = '';
        rounds.forEach(round => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round-card';
            
            let roundHtml = `
                <h3>Turno ${round.round}</h3>
                <div class="round-results">
                    <div>Yaaaa: <strong>${round.votes.yaaaa}</strong></div>
                    <div>Puzza di Fascio: <strong>${round.votes.puzza}</strong></div>
                </div>
                <details>
                    <summary>Dettaglio voti</summary>
                    <table>
                        <thead>
                            <tr>
                                <th>Giocatore</th>
                                <th>Voto</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            round.playerVotes.forEach(vote => {
                roundHtml += `
                    <tr>
                        <td>${vote.name}</td>
                        <td class="vote-${vote.vote}">${vote.vote === 'yaaaa' ? 'Yaaaa' : 'Puzza di Fascio'}</td>
                    </tr>
                `;
            });
            
            roundHtml += `
                        </tbody>
                    </table>
                </details>
            `;
            
            roundDiv.innerHTML = roundHtml;
            roundsSummary.appendChild(roundDiv);
        });
    }
    
    // New game functionality
    newGameBtn.addEventListener('click', resetGame);
    
    function resetGame() {
        // Hide results and summary sections, show setup section
        resultsSection.classList.add('hidden');
        gameSummarySection.classList.add('hidden');
        setupSection.classList.remove('hidden');
        
        // Keep players list but clear their votes
        players.forEach(player => {
            player.hasVoted = false;
            player.vote = null;
        });
    }
}); 