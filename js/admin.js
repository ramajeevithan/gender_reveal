$(document).ready(function() {
    const db = firebase.database();
    const votesRef = db.ref('votes');
    const statusRef = db.ref('status');

    let boyVotes = 0;
    let girlVotes = 0;

    // Initialize controls
    $('#actualGender').change(function() {
        const selectedGender = $(this).val();
        $('#startVoting').prop('disabled', !selectedGender);
    });

    // Listen for vote changes
    votesRef.on('value', (snapshot) => {
        const votes = snapshot.val() || { boy: 0, girl: 0 };
        boyVotes = votes.boy || 0;
        girlVotes = votes.girl || 0;
        updateStats();
    });

    function updateStats() {
        $('#boyCount').text(boyVotes);
        $('#girlCount').text(girlVotes);
    }

    function updateStatus(isVotingOpen, isRevealing = false) {
        const actualGender = $('#actualGender').val();
        const status = {
            isVotingOpen,
            isRevealing,
            actualGender
        };
        console.log('Updating status:', status);
        statusRef.set(status).then(() => {
            console.log('Status updated successfully');
        }).catch(error => {
            console.error('Error updating status:', error);
        });
    }

    function resetVotes() {
        votesRef.set({
            boy: 0,
            girl: 0
        });
        updateStatus(false, false);
        $('#actualGender').val('').prop('disabled', false);
        $('#startVoting').prop('disabled', true);
        $('#stopVoting').prop('disabled', true);
        $('#resetVoting').prop('disabled', true);
    }

    // Event Listeners
    $('#startVoting').click(function() {
        console.log('Start voting clicked');
        $(this).prop('disabled', true);
        $('#stopVoting').prop('disabled', false);
        $('#resetVoting').prop('disabled', false);
        $('#actualGender').prop('disabled', true);
        $('#revealSection').hide();
        updateStatus(true, false);
    });

    $('#stopVoting').click(function() {
        $(this).prop('disabled', true);
        $('#startVoting').prop('disabled', true);
        $('#revealSection').show();
        updateStatus(false, false);
    });

    $('#revealGender').click(function() {
        $(this).prop('disabled', true);
        updateStatus(false, true);
    });

    $('#resetVoting').click(function() {
        if (confirm('Are you sure you want to reset all votes?')) {
            resetVotes();
        }
    });

    // Initialize
    resetVotes();
});
