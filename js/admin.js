$(document).ready(function() {
    const auth = firebase.auth();
    const db = firebase.database();
    const votesRef = db.ref('votes');
    const statusRef = db.ref('status');

    let boyVotes = 0;
    let girlVotes = 0;

    // Check authentication state
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            $('#loginSection').hide();
            $('#adminControls').show();
            
            // Initialize UI state for authenticated user
            updateStartVotingButton();
            $('#resetVoting').prop('disabled', false); // Enable reset button for authenticated users
        } else {
            // No user is signed in
            $('#loginSection').show();
            $('#adminControls').hide();
        }
    });

    // Handle login form submission
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        const email = $('#email').val();
        const password = $('#password').val();

        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => {
                alert('Login failed: ' + error.message);
            });
    });

    // Handle logout
    $('#logoutBtn').click(function() {
        auth.signOut().then(() => {
            location.reload();
        }).catch((error) => {
            alert('Logout failed: ' + error.message);
        });
    });

    // Initialize controls
    function updateStartVotingButton() {
        const selectedGender = $('#actualGender').val();
        $('#startVoting').prop('disabled', !selectedGender);
    }

    $('#actualGender').change(updateStartVotingButton);

    // Handle URL setting
    $('#setUrl').click(function() {
        const url = $('#votingUrl').val().trim();
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }
        updateStatus(false, false); // This will update the URL in Firebase
        updateUrlStatus(url, true);
    });

    // Update URL status display
    function updateUrlStatus(url, isNew = false) {
        $('#urlStatus').show();
        $('#currentUrl').text(url || 'Not set');
        $('#urlDisplayStatus').text(url ? 'Visible on stats page' : 'Not visible');
        
        if (isNew && url) {
            // Show temporary success message
            const originalText = $('#setUrl').text();
            $('#setUrl').text('✓ Set!').prop('disabled', true);
            setTimeout(() => {
                $('#setUrl').text(originalText).prop('disabled', false);
            }, 2000);
        }
    }

    // Listen for status changes to update URL display
    statusRef.on('value', (snapshot) => {
        const status = snapshot.val() || {};
        const currentUrl = status.votingUrl || '';
        
        // Update URL input if empty and URL exists in status
        if (!$('#votingUrl').val() && currentUrl) {
            $('#votingUrl').val(currentUrl);
        }
        
        updateUrlStatus(currentUrl);
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
        // Check if user is authenticated before updating
        if (!auth.currentUser) {
            console.log('User not authenticated, skipping status update');
            return;
        }
        
        const actualGender = $('#actualGender').val();
        const votingUrl = $('#votingUrl').val().trim();
        const status = {
            isVotingOpen,
            isRevealing,
            actualGender,
            votingUrl: votingUrl // Will be updated even when voting is not started
        };
        console.log('Updating status:', status);
        statusRef.set(status).then(() => {
            console.log('Status updated successfully');
        }).catch(error => {
            console.error('Error updating status:', error);
        });
    }

    function resetVotes() {
        // Check if user is authenticated before resetting
        if (!auth.currentUser) {
            console.log('User not authenticated, skipping reset');
            return;
        }
        
        // Reset votes count
        votesRef.set({
            boy: 0,
            girl: 0
        });
        
        // Clear all voter records
        db.ref('voters').remove();
        
        // Reset status (including clearing the URL)
        statusRef.set({
            isVotingOpen: false,
            isRevealing: false,
            actualGender: '',
            votingUrl: '' // Clear the URL to hide it on stats page
        });
        
        // Reset UI
        $('#actualGender').val('').prop('disabled', false);
        $('#startVoting').prop('disabled', true);
        $('#stopVoting').prop('disabled', true);
        $('#resetVoting').prop('disabled', false); // Keep reset button enabled
        $('#revealGender').prop('disabled', false);
        $('#revealSection').hide();
        $('#votingUrl').val('');
        updateUrlStatus(''); // Reset URL status display
    }

    // Event Listeners
    $('#startVoting').click(function() {
        const selectedGender = $('#actualGender').val();
        if (!selectedGender) {
            alert('Please select a gender before starting the voting.');
            return;
        }
        
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
        $('#revealGender').prop('disabled', false); // Enable the reveal button
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

    // Initialize UI on page load
    updateStartVotingButton();
});
