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
            $('#votingUrlContainer').hide();
            return;
        }

        const { isRevealing, actualGender, isVotingOpen, votingUrl } = status;
        
        // Handle voting URL display
        if (votingUrl && isVotingOpen) {
            $('#votingUrlLink').text(votingUrl).attr('href', votingUrl);
            $('#votingUrlContainer').show();
        } else {
            $('#votingUrlContainer').hide();
        }
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
        const words = ['BABY BOY', 'BABY GIRL'];
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
        $('#reveal').html(`<div class="reveal-3d">${revealText}${emoji}</div>`)
            .removeClass('boy-text girl-text')
            .addClass(isGirl ? 'girl-text' : 'boy-text')
            .show();
        // Fire confetti immediately
        fireConfetti(
            isGirl ? '#ff69b4' : '#007bff',
            isGirl ? '#ff9ed7' : '#66b3ff'
        );

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
