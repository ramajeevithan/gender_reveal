$(document).ready(function() {
    const db = firebase.database();
    const votesRef = db.ref('votes');
    const statusRef = db.ref('status');
    let hasVoted = localStorage.getItem('hasVoted') === 'true';

    // Set initial state
    $('.voting-container').removeClass('hidden');
    $('#countdown, #reveal').hide().removeClass('visible');

    // Listen for voting status changes
    statusRef.on('value', (snapshot) => {
        const status = snapshot.val();
        console.log('Received status:', status);
        if (!status) {
            // Default state when no status is available
            $('.voting-container').removeClass('hidden');
            $('#countdown, #reveal').hide().removeClass('visible');
            return;
        }

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
        } else {
            // Reset to default state if not revealing
            $('.voting-container').removeClass('hidden');
            $('#countdown, #reveal').hide().removeClass('visible');
            $('.display-4').fadeIn(); // Show the title again
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
        const words = ['BABY BOY', 'BABY GIRL'];
        let count = 10;
        
        $('.voting-container').addClass('hidden');
        $('#voteStatus').hide();
        $('.display-4').fadeOut(); // Hide the title
        $('#countdown').removeClass('hidden').show();

        const countInterval = setInterval(() => {
            if (count > 0) {
                const word = words[count % 2];
                const content = `
                    <div class="countdown-content">
                        <span class="countdown-number" style="font-size:1.5em;display:block;">${count}</span>
                        <span style="font-size:2em;" class="${word.includes('BOY') ? 'boy-text' : 'girl-text'}">${word}</span>
                    </div>`;
                
                $('#countdown').html(content);

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
        const duration = 6000; // Increased to 6 seconds
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: [color1],
                scalar: 1.2
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: [color2],
                scalar: 1.2
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    function revealGender(gender) {
        $('#countdown').hide();
        const isGirl = gender.toLowerCase() === 'girl';
        const emoji = isGirl ? '💝' : '🤴';
        const revealText = isGirl ? "IT'S A PRINCESS!" : "IT'S A PRINCE!";
        
        // Prepare reveal element with 3D transform
        $('#reveal').html(`<div class="reveal-3d">${revealText}${emoji}</div>`)
            .removeClass('boy-text girl-text')
            .addClass(isGirl ? 'girl-text' : 'boy-text')
            .show();

        // Fire confetti immediately
        fireConfetti(
            isGirl ? '#ff69b4' : '#007bff',  // Primary color
            isGirl ? '#ff9ed7' : '#66b3ff'   // Secondary color
        );

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
            }
        });
    }

    // Event Listeners
    $('#boyVote').click(() => castVote('boy'));
    $('#girlVote').click(() => castVote('girl'));

    // Initial state
    disableVoting();
});
