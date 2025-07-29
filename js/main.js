$(document).ready(function() {
    const db = firebase.database();
    const votesRef = db.ref('votes');
    const statusRef = db.ref('status');
    let hasVoted = localStorage.getItem('hasVoted') === 'true';

    // Listen for voting status changes
    statusRef.on('value', (snapshot) => {
        const status = snapshot.val();
        console.log('Received status:', status);
        if (!status) return;

        const { isVotingOpen, isRevealing, actualGender } = status;
        console.log('Voting status:', { isVotingOpen, isRevealing, hasVoted });

        if (isVotingOpen && !hasVoted) {
            console.log('Enabling voting...');
            enableVoting();
        } else if (!isVotingOpen) {
            console.log('Disabling voting...');
            disableVoting();
            $('#voteStatus').removeClass().addClass('alert alert-info')
                .text('Voting has ended. Please wait for the reveal!').show();
        }

        if (isRevealing) {
            console.log('Starting countdown...');
            startCountdown(actualGender);
        }
    });

    function enableVoting() {
        $('.vote-btn').prop('disabled', false).addClass('enabled');
        $('#voteStatus').removeClass().addClass('alert alert-success')
            .text('Voting is open! Cast your vote!').show();
    }

    function disableVoting() {
        $('.vote-btn').prop('disabled', true).removeClass('enabled');
        if (hasVoted) {
            $('#voteStatus').removeClass().addClass('alert alert-info')
                .text('Thank you for voting! Please wait for the reveal.').show();
        } else {
            $('#voteStatus').removeClass().addClass('alert alert-warning')
                .text('Voting is currently closed.').show();
        }
    }

    function castVote(gender) {
        if (hasVoted) return;

        votesRef.child(gender).transaction((current) => {
            return (current || 0) + 1;
        }).then(() => {
            hasVoted = true;
            localStorage.setItem('hasVoted', 'true');
            disableVoting();
        }).catch((error) => {
            console.error('Error casting vote:', error);
            $('#voteStatus').removeClass().addClass('alert alert-danger')
                .text('Error casting vote. Please try again.').show();
        });
    }

    function startCountdown(actualGender) {
        const words = ['BOY', 'GIRL'];
        let count = 10;
        
        $('.voting-container').hide();
        $('#voteStatus').hide();
        $('#countdown').show();

        const countInterval = setInterval(() => {
            if (count > 0) {
                const word = words[count % 2];
                const content = `
                    <div class="countdown-content">
                        <span class="countdown-number">${count}</span>
                        ${word}
                    </div>`;
                
                $('#countdown').html(content)
                    .removeClass('boy-text girl-text')
                    .addClass(word.toLowerCase() === 'boy' ? 'boy-text' : 'girl-text');

                // Animate the countdown
                gsap.from('.countdown-content', {
                    duration: 0.5,
                    rotationX: -180,
                    opacity: 0,
                    ease: 'back.out'
                });

                count--;
            } else {
                clearInterval(countInterval);
                revealGender(actualGender);
            }
        }, 1000);
    }

    function fireConfetti(color1, color2) {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: [color1]
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: [color2]
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    function revealGender(gender) {
        $('#countdown').hide();
        const isGirl = gender.toLowerCase() === 'girl';
        
        // Prepare reveal element with 3D transform
        $('#reveal').html(`<div class="reveal-3d">${gender.toUpperCase()}</div>`)
            .removeClass('boy-text girl-text')
            .addClass(gender.toLowerCase() === 'boy' ? 'boy-text' : 'girl-text')
            .show();

        // Animate the reveal with GSAP
        gsap.to('.reveal-3d', {
            duration: 1.5,
            rotationX: 0,
            opacity: 1,
            y: 0,
            ease: 'elastic.out(1, 0.5)',
            onComplete: () => {
                // Start floating animation
                gsap.to('.reveal-3d', {
                    duration: 2,
                    y: -20,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power1.inOut'
                });

                // Fire confetti with gender-specific colors
                fireConfetti(
                    isGirl ? '#ff69b4' : '#007bff',  // Primary color
                    isGirl ? '#ff9ed7' : '#66b3ff'   // Secondary color
                );
            }
        });
    }

    // Event Listeners
    $('#boyVote').click(() => castVote('boy'));
    $('#girlVote').click(() => castVote('girl'));

    // Initial state
    disableVoting();
});
