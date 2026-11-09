const CONFETTI_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

export function fireConfetti() {
  // Sound effect (Web Audio API)
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.05);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch (e) { /* silent */ }

  // Visual effect
  const elements = ['✨', '🎉', '⭐', '🎈', '💖'];
  for (let i = 0; i < 45; i++) {
    const conf = document.createElement('div');
    conf.style.position = 'fixed';
    conf.style.left = '50%';
    conf.style.top = '50%';
    conf.style.fontSize = (12 + Math.random() * 20) + 'px';
    conf.style.zIndex = '9999';
    conf.style.pointerEvents = 'none';
    
    if (Math.random() > 0.4) {
      conf.textContent = elements[Math.floor(Math.random() * elements.length)];
    } else {
      conf.style.width = '10px';
      conf.style.height = '10px';
      conf.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    }
    
    document.body.appendChild(conf);
    const angle = Math.random() * Math.PI * 2;
    const velocity = 100 + Math.random() * 500;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity - (Math.random() * 250 + 50);

    conf.animate([
      { transform: 'translate(-50%, -50%) scale(0) rotate(0deg)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(1.5) rotate(180deg)', opacity: 1, offset: 0.1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.5) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 1000,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }).onfinish = () => conf.remove();
  }
}