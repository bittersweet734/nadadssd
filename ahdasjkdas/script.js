const PASSCODE = '1432'; // Change your four-digit PIN here. This is a decorative lock, not secure authentication.

let pin = '';
let unlocked = false;

const $ = id => document.getElementById(id);

function render() {
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.textContent = i < pin.length ? '•' : '';
        dot.classList.toggle('active', i < pin.length);
    });

    $('dots').setAttribute(
        'aria-label',
        `Passcode: ${pin.length} of 4 digits entered`
    );
}

function add(n) {
    if (unlocked || pin.length >= 4) return;

    pin += n;
    $('status').textContent = '';
    render();
}

document.querySelectorAll('[data-digit]').forEach(b => {
    b.onclick = () => add(b.dataset.digit);
});

$('clear').onclick = () => {
    pin = '';
    render();
};

$('back').onclick = () => {
    pin = pin.slice(0, -1);
    render();
};

$('unlock').onclick = () => {
    if (pin.length !== 4) {
        $('status').textContent = 'Enter all 4 digits first.';
        return;
    }

    if (pin !== PASSCODE) {
        $('status').textContent = 'Not quite, love. Try again.';
        pin = '';
        render();
        return;
    }

    unlocked = true;

    $('entry').hidden = true;
    $('title').innerHTML = 'Before we begin,<br><em>your name?</em>';
    $('subtitle').textContent = 'Tell me the name of someone special.';
    $('nameForm').hidden = false;
    $('herName').focus();
    $('emblemIcon').setAttribute('href', '#heart');
    $('status').textContent = '';
};

let herName = '';

$('nameForm').onsubmit = e => {
    e.preventDefault();

    herName = $('herName').value.trim();

    if (!herName) {
        $('status').textContent = 'Please enter your name first.';
        $('herName').setAttribute('aria-invalid', 'true');
        $('herName').focus();
        return;
    }

    $('herName').removeAttribute('aria-invalid');
    $('status').textContent = '';

    transitionTo(() => {
        $('nameForm').hidden = true;
        document.body.classList.add('romance');

        $('title').innerHTML = 'Can I be your<br><em>valentine?</em>';
        $('subtitle').textContent =
            herName + ', this little question is for you.';

        $('proposal').hidden = false;
        $('yesBtn').focus();
    });
};

function transitionTo(change) {
    const card = document.querySelector('.card');

    if (card.classList.contains('depart')) return;

    card.classList.remove('arrive');
    card.classList.add('depart');

    setTimeout(
        () => {
            change();

            card.classList.remove('depart');
            card.classList.add('arrive');
        },
        matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300
    );
}

let noCount = 0;

const noMessages = [
    'Are you sure?',
    'Maybe a tiny yes?',
    'My heart is getting bigger…',
    'One more little chance?',
    'The yes is full of love!'
];

$('noBtn').onclick = () => {
    noCount++;

    const growth = Math.min(noCount, 8);

    $('yesBtn').style.setProperty('--yes-growth', growth);
    $('noBtn').textContent = noCount === 1 ? 'Are you sure?' : 'No';

    $('questionNote').textContent =
        noMessages[Math.min(noCount - 1, noMessages.length - 1)];
};

function localDate() {
    const now = new Date();

    return (
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0')
    );
}

$('yesBtn').onclick = () => {
    transitionTo(() => {
        $('proposal').hidden = true;

        $('title').innerHTML =
            "You said yes.<br><em>Let's make a date.</em>";
        $('subtitle').textContent = herName + ', when are you free?';

        $('dateForm').hidden = false;
        $('date').min = localDate();
        $('date').focus();
    });
};

$('dateForm').onsubmit = e => {
    e.preventDefault();

    const chosen = new Date($('date').value + 'T' + $('time').value);

    if (chosen < new Date()) {
        $('status').textContent =
            'Pick a date and time still ahead of us.';
        return;
    }

    $('status').textContent = '';

    const day = chosen.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const time = chosen.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
    });

    dateDescription = day + ' at ' + time;

    transitionTo(() => {
        $('dateForm').hidden = true;

        document.body.classList.add('garden');
        document.querySelector('.card').classList.add('ending-card');

        $('title').innerHTML = 'For you,<br><em>always in bloom.</em>';
        $('title').setAttribute('tabindex', '-1');

        $('subtitle').textContent =
            'A few flowers, and a little piece of my heart.';

        $('flowerEnding').hidden = false;
        $('letterGreeting').textContent = 'Dear ' + herName + ',';
        $('endingDate').textContent = dateDescription;

        $('title').focus({ preventScroll: true });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

$('date').oninput = $('time').oninput = () => {
    $('status').textContent = '';
    $('dateSummary').textContent = '';
};

let dateDescription = '';

$('herName').oninput = () => {
    $('status').textContent = '';
    $('herName').removeAttribute('aria-invalid');
};

$('relock').onclick = () => location.reload();

document.addEventListener('keydown', e => {
    if (/INPUT|SELECT|AUDIO/.test(e.target.tagName) || unlocked) return;

    if (/^\d$/.test(e.key)) {
        e.preventDefault();
        add(e.key);
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        $('back').click();
    } else if (e.key === 'Enter') {
        $('unlock').click();
    } else if (e.key === 'Escape') {
        $('clear').click();
    }
});

$('musicToggle').onclick = () => {
    let open = $('musicPanel').hidden;

    $('musicPanel').hidden = !open;
    $('musicToggle').setAttribute('aria-expanded', String(open));
};

let urls = [];

$('files').onchange = () => {
    urls.forEach(URL.revokeObjectURL);
    urls = [];

    $('songs').innerHTML = '';

    Array.from($('files').files).forEach(file => {
        const url = URL.createObjectURL(file);

        urls.push(url);

        $('songs').add(
            new Option(file.name.replace(/\.[^.]+$/, ''), url)
        );
    });

    if (urls.length) playSong();
};

function playSong() {
  const song = $("songs").value;

  if (!song) {
    $("audio").pause();
    $("audio").removeAttribute("src");
    $("audio").load();
    $("musicLabel").textContent = "Pick our song";
    return;
  }

  $("audio").src = song;
  $("musicLabel").textContent = "Our soundtrack";

  $("audio").play().catch(() => {
    $("musicStatus").textContent = "Press play to start your song.";
  });
}

$('songs').onchange = playSong;

$('audio').onerror = () => {
    $('musicStatus').textContent =
        'This audio could not play. Try an MP3 or another supported file.';
};

for (let i = 0; i < 12; i++) {
    let h = document.createElement('div');

    h.className = 'heart';
    h.setAttribute('aria-hidden', 'true');

    h.style.cssText =
        `left:${i * 8.5 + 2}%;` +
        `width:${14 + (i % 4) * 7}px;` +
        `height:${14 + (i % 4) * 7}px;` +
        `animation-delay:-${i * 2.3}s;` +
        `animation-duration:${13 + (i % 5) * 2}s`;

    h.innerHTML = '<svg><use href="#heart"/></svg>';

    document.body.append(h);
}

// Default background song
const defaultSong = "assets/songs/Very Special Love.mp3";
const backgroundMusic = $("audio");

backgroundMusic.src = defaultSong;
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

let musicStarted = false;

async function startDefaultMusic() {
  if (musicStarted) return;

  try {
    await backgroundMusic.play();
    musicStarted = true;

    $("musicLabel").textContent = "Our soundtrack";
    $("musicStatus").textContent = "Playing our song.";

    document.removeEventListener("pointerdown", startDefaultMusic);
    document.removeEventListener("keydown", startDefaultMusic);
  } catch {
    // Try again on the next tap if playback is blocked.
  }
}

// Try immediately when the page opens.
startDefaultMusic();

// If autoplay is blocked, start on the first tap or key press.
document.addEventListener("pointerdown", startDefaultMusic);
document.addEventListener("keydown", startDefaultMusic);