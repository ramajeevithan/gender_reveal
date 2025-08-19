$(document).ready(function() {
    const db = firebase.database();
    const auth = firebase.auth();
    const votesRef = db.ref('votes');
    const statusRef = db.ref('status');
    const votersRef = db.ref('voters');

    // Set initial state
    $('.voting-container').removeClass('hidden');
    $('#countdown, #reveal').hide().removeClass('visible');

    // Handle user authentication state
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in anonymously.
            console.log('User authenticated:', user.uid);
            initializeVotingLogic(user);
        } else {
            // No user is signed in. Sign them in anonymously.
            auth.signInAnonymously().catch(error => {
                console.error("Anonymous sign-in failed:", error);
                $('#voteStatus').removeClass().addClass('alert alert-danger')
                    .text('Could not connect to voting service. Please refresh.').show();
            });
        }
    });

    function initializeVotingLogic(user) {
        const userVoteRef = votersRef.child(user.uid);

        // Check if the user has already voted
        userVoteRef.once('value', voteSnapshot => {
            let hasVoted = voteSnapshot.exists();
            
            // Listen for voter node removal (reset)
            votersRef.on('value', snapshot => {
                if (!snapshot.exists()) {
                    hasVoted = false;
                    enableVoting();
                }
            });

            // Listen for voting status changes
            statusRef.on('value', (snapshot) => {
                const status = snapshot.val();
                if (!status) {
                    $('.voting-container').removeClass('hidden');
                    $('#countdown, #reveal').hide().removeClass('visible');
                    $('.display-4').fadeIn();
                    return;
                }

                const { isVotingOpen, isRevealing, actualGender } = status;

                if (hasVoted) {
                    disableVoting();
                    $('#voteStatus').removeClass().addClass('alert alert-success')
                        .text('Thank you for your vote!').show();
                } else if (isVotingOpen) {
                    enableVoting();
                } else {
                    disableVoting();
                    $('#voteStatus').removeClass().addClass('alert alert-info')
                        .text('Voting is currently closed.').show();
                }

                if (isRevealing) {
                    startCountdown(actualGender);
                }
            });

            // Handle vote button clicks
            $('.vote-btn').off('click').on('click', function() {
                if (hasVoted) return;

                const vote = $(this).attr('id').replace('Vote', ''); // 'boy' or 'girl'
                const voteCountRef = votesRef.child(vote);

                // First record that this user has voted
                userVoteRef.set(true)
                    .then(() => {
                        // Then increment the vote count
                        return voteCountRef.transaction(currentCount => (currentCount || 0) + 1);
                    })
                    .then(() => {
                        hasVoted = true;
                        disableVoting();
                        $('#voteStatus').removeClass().addClass('alert alert-success')
                            .text('Thank you for your vote!').show();
                    })
                    .catch(error => {
                        console.error('Error casting vote:', error);
                        $('#voteStatus').removeClass().addClass('alert alert-danger')
                            .text('Error casting vote: ' + error.message).show();
                    });
            });
        });
    }

    function enableVoting() {
        $('.vote-btn').prop('disabled', false);
        $('#voteStatus').hide();
    }

    function disableVoting() {
        $('.vote-btn').prop('disabled', true);
    }

    function startCountdown(actualGender) {
        $('.display-4').fadeOut();
        $('.voting-container').addClass('hidden');
        $('#countdown').removeClass('hidden').show();

        const words = ["IT'S A PRINCE", "IT'S A PRINCESS"];
        let count = 10;

        const countInterval = setInterval(() => {
            if (count > 0) {
                const word = words[count % 2];
                const content = `
                    <div class="countdown-content">
                        <span class="countdown-number" style="font-size:1.5em;display:block;color:#666;">${count}</span>
                        <span style="font-size:2em;" class="${word == "IT'S A PRINCE" ? 'boy-text' : 'girl-text'}">${word}</span>
                    </div>`;
                
                $('#countdown').html(content);

                // Animate the countdown
                gsap.from('.countdown-content', {
                    duration: 0.9,
                    rotationX: -180,
                    opacity: 0,
                    ease: 'elastic.out(1, 0.5)',
                    yoyo: true
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
        
        // Fire confetti immediately
        fireConfetti(
            isGirl ? '#ff69b4' : '#007bff',  // Primary color
            isGirl ? '#ff9ed7' : '#66b3ff'   // Secondary color
        );

        // Prepare reveal element with 3D transform
        $('#reveal').html(`<div class="reveal-3d">${revealText}${emoji}</div>`)
            .removeClass('boy-text girl-text')
            .addClass(isGirl ? 'girl-text' : 'boy-text')
            .show();

        // Animate the reveal with GSAP
        gsap.set('.reveal-3d', {
            rotationX: -90,
            opacity: 0,
            y: 50
        });
        
        gsap.to('.reveal-3d', {
            duration: 1.5,
            rotationX: 0,
            opacity: 1,
            y: 0,
            ease: 'elastic.out(1, 0.5)',
            onComplete: () => {
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
});
