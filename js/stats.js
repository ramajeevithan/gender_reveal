$(document).ready(function() {
    const db = firebase.database();
    const votesRef = db.ref('votes');
    const statusRef = db.ref('status');

    // Listen for vote changes
    votesRef.on('value', (snapshot) => {
        const votes = snapshot.val() || { boy: 0, girl: 0 };
        const boyVotes = votes.boy || 0;
        const girlVotes = votes.girl || 0;
        const totalVotes = boyVotes + girlVotes;

        // Update vote counts
        $('#boyCount').text(boyVotes);
        $('#girlCount').text(girlVotes);
        $('#totalVotes').text(totalVotes);

        // Calculate and update percentages
        if (totalVotes > 0) {
            $('#boyPercentage').text(Math.round((boyVotes / totalVotes) * 100));
            $('#girlPercentage').text(Math.round((girlVotes / totalVotes) * 100));
        }
    });

    // Listen for status changes
    statusRef.on('value', (snapshot) => {
        const status = snapshot.val();
        if (!status) return;

        const { isRevealing, actualGender } = status;
        if (isRevealing) {
            startCountdown(actualGender);
        }
    });

    function startCountdown(actualGender) {
        const words = ['BOY', 'GIRL'];
        let count = 10;
        
        $('.stats-container').hide();
        $('#countdown').show();

        const countInterval = setInterval(() => {
            if (count > 0) {
                const word = words[count % 2];
                $('#countdown').text(word)
                    .removeClass('boy-text girl-text')
                    .addClass(word.toLowerCase() === 'boy' ? 'boy-text' : 'girl-text');
                count--;
            } else {
                clearInterval(countInterval);
                revealGender(actualGender);
            }
        }, 1000);
    }

    function revealGender(gender) {
        $('#countdown').hide();
        $('#reveal').text(gender.toUpperCase())
            .removeClass('boy-text girl-text')
            .addClass(gender.toLowerCase() === 'boy' ? 'boy-text' : 'girl-text')
            .show();
    }
});
