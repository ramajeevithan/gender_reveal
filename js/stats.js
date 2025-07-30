$(document).ready(function() {
    const db = firebase.database();
    const votesRef = db.ref('votes');
    const statusRef = db.ref('status');

    // Initial state setup
    $('#countdown, #reveal').removeClass('show');
    $('.stats-container').show();

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
        if (!status) {
            // Hide countdown and reveal if no status
            $('#countdown').removeClass('show');
            $('#reveal').removeClass('show');
            $('.stats-container').show();
            return;
        }

        const { isRevealing, actualGender, isVotingOpen } = status;
        if (isRevealing) {
            startCountdown(actualGender);
        } else {
            // Hide countdown and reveal if not revealing
            $('#countdown').removeClass('show');
            $('#reveal').removeClass('show');
            $('.stats-container').show();
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
                // Show number and word together for context
                const content = `
                    <div class="countdown-content">
                        <span class="countdown-number" style="font-size:1.5em;display:block;">${count}</span>
                        <span style="font-size:2em;">${word}</span>
                    </div>`;
                $('#countdown').html(content)
                    .removeClass('boy-text girl-text')
                    .addClass(word.toLowerCase() === 'boy' ? 'boy-text' : 'girl-text');
                // Animate the countdown
                if (window.gsap) {
                    gsap.from('.countdown-content', {
                        duration: 0.5,
                        rotationX: -180,
                        opacity: 0,
                        ease: 'back.out'
                    });
                }
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
            if (window.confetti) {
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
            }
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    function revealGender(gender) {
        $('#countdown').hide();
        const isGirl = gender.toLowerCase() === 'girl';
        $('#reveal').html(`<div class="reveal-3d">${gender.toUpperCase()}</div>`)
            .removeClass('boy-text girl-text')
            .addClass(isGirl ? 'girl-text' : 'boy-text')
            .show();
        // Animate the reveal with GSAP
        if (window.gsap) {
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
                    fireConfetti(
                        isGirl ? '#ff69b4' : '#007bff',
                        isGirl ? '#ff9ed7' : '#66b3ff'
                    );
                }
            });
        }
    }
});
