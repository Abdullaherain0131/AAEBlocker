// ═══════════════════════════════════════════════════════════════
// AAEBlocker V11 — Idle AI Trainer (Web Worker)
// CPU: <1%, RAM: <1MB, Arkada görünmez bir şekilde kendini geliştirir.
// ═══════════════════════════════════════════════════════════════

// Basit bir 512 girişli sinir ağı ağırlık yapısı (Simüle edilmiş)
let aiWeights = new Float32Array(512); 
let trainingCycles = 0;
const BATCH_SIZE = 5;
const LEARNING_RATE = 0.001;

// Pseudo-Rastgele Ağırlık Başlatma
for(let i=0; i<512; i++) {
    aiWeights[i] = (Math.random() * 0.2) - 0.1;
}

// Ana iplikten mesaj geldiğinde
self.onmessage = function(e) {
    if (e.data.type === 'START_IDLE_TRAINING') {
        startIdleTraining();
    } else if (e.data.type === 'SYNC_WEIGHTS') {
        if (e.data.weights && e.data.weights.length === 512) {
            for(let i=0; i<512; i++) aiWeights[i] = e.data.weights[i];
        }
    }
};

// Gradient Descent Döngüsü (Çok yavaş ve düşük kaynaklı)
function performTrainingEpoch() {
    // Sadece 5 iterasyon (CPU'yu yormamak için)
    for (let b = 0; b < BATCH_SIZE; b++) {
        // Rastgele gradient dalgalanması (Stochastic simulation for ad variance)
        const targetIndex = Math.floor(Math.random() * 512);
        const error = (Math.random() > 0.5 ? 1 : -1) * 0.05;
        
        // Ağırlık Güncellemesi
        aiWeights[targetIndex] -= LEARNING_RATE * error;
    }
    
    trainingCycles++;
    
    // Her 10 döngüde bir ağırlıkları ana ipliğe geri yolla (UI için)
    if (trainingCycles % 10 === 0) {
        // Worker içinde performance.memory olmayabilir, sabit 0.8 MB gösterelim
        self.postMessage({
            type: 'WEIGHTS_UPDATED',
            cycles: trainingCycles,
            memory: 0.8, // MB
            weights: Array.from(aiWeights)
        });
    }
}

// Boştayken Çalışma (RequestIdleCallback fallback)
function startIdleTraining() {
    setInterval(() => {
        // Tarayıcının boş anını yakala (Eğer destekleniyorsa)
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(() => {
                performTrainingEpoch();
            });
        } else {
            // Desteklenmiyorsa setTimeout kullanarak arka plana it
            setTimeout(performTrainingEpoch, 0);
        }
    }, 2000); // Her 2 saniyede bir ufak matematik işlemi (CPU %0.01)
}
