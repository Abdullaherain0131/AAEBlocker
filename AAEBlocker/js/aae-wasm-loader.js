/**
 * AAEBlocker WebAssembly Hızlandırıcı
 * Sinir ağı işlemleri için yüksek performanslı matris çarpımları.
 */
(function() {
    'use strict';

    // AAEAccelerator modülü
    const AAEAccelerator = {
        isWASM: false,
        wasmModule: null,
        
        // C fonksiyonlarını saklamak için
        _dotProduct: null,
        _relu: null,
        _sigmoid: null,
        _forwardPass: null,

        // Bellek yönetimi için yardımcı fonksiyonlar
        _allocArray: function(array) {
            if (!this.isWASM) return null;
            const bytes = array.length * 4;
            const ptr = this.wasmModule._malloc(bytes);
            this.wasmModule.HEAPF32.set(array, ptr / 4);
            return ptr;
        },

        _freeArray: function(ptr) {
            if (this.isWASM && ptr) {
                this.wasmModule._free(ptr);
            }
        },

        /**
         * WASM modülünü başlatır.
         */
        init: async function() {
            try {
                // Eğer WASM dosyası eklenti içerisindeyse fetch ile al.
                // aae-matmul.js tarafından oluşturulan Module objesini kullan.
                if (typeof window.Module !== 'undefined') {
                    this.wasmModule = window.Module;
                    
                    // Modül hazır olduğunda fonksiyonları bağla
                    return new Promise((resolve) => {
                        this.wasmModule.onRuntimeInitialized = () => {
                            this._bindFunctions();
                            this.isWASM = true;
                            console.log("AAEAccelerator: WASM hızlandırması aktif.");
                            resolve(true);
                        };
                        // Zaten başlatılmış olabilir
                        if (this.wasmModule._malloc) {
                            this._bindFunctions();
                            this.isWASM = true;
                            console.log("AAEAccelerator: WASM hızlandırması aktif.");
                            resolve(true);
                        }
                    });
                } else {
                    console.warn("AAEAccelerator: WASM modülü bulunamadı, JavaScript yedeğine geçiliyor.");
                    this.isWASM = false;
                    return Promise.resolve(false);
                }
            } catch (error) {
                console.error("AAEAccelerator: WASM yükleme hatası:", error);
                this.isWASM = false;
                return Promise.resolve(false);
            }
        },

        _bindFunctions: function() {
            // C fonksiyonlarını cwrap ile bağlama
            this._dotProduct = this.wasmModule.cwrap('dot_product', null, ['number', 'number', 'number', 'number', 'number', 'number']);
            this._relu = this.wasmModule.cwrap('relu_activation', null, ['number', 'number']);
            this._sigmoid = this.wasmModule.cwrap('sigmoid_activation', 'number', ['number']);
            this._forwardPass = this.wasmModule.cwrap('forward_pass', 'number', [
                'number', 'number', 'number', 'number', 'number', 
                'number', 'number', 'number', 'number', 'number', 
                'number', 'number', 'number'
            ]);
        },

        /**
         * Matris çarpımı (Giriş * Ağırlıklar + Bias)
         */
        dotProduct: function(input, weights, bias) {
            const inputSize = input.length;
            const outputSize = bias.length;
            const result = new Float32Array(outputSize);

            if (this.isWASM) {
                const inputPtr = this._allocArray(input);
                const weightsPtr = this._allocArray(weights);
                const biasPtr = this._allocArray(bias);
                const resultPtr = this.wasmModule._malloc(outputSize * 4);

                this._dotProduct(inputPtr, weightsPtr, biasPtr, resultPtr, inputSize, outputSize);

                const resultArray = new Float32Array(this.wasmModule.HEAPF32.buffer, resultPtr, outputSize);
                result.set(resultArray);

                this._freeArray(inputPtr);
                this._freeArray(weightsPtr);
                this._freeArray(biasPtr);
                this.wasmModule._free(resultPtr);
                
                return result;
            } else {
                // JavaScript Fallback
                for (let i = 0; i < outputSize; ++i) {
                    let sum = bias[i];
                    let w_offset = i * inputSize;
                    for (let j = 0; j < inputSize; ++j) {
                        sum += input[j] * weights[w_offset + j];
                    }
                    result[i] = sum;
                }
                return result;
            }
        },

        /**
         * In-place ReLU Aktivasyonu
         */
        relu: function(data) {
            if (this.isWASM) {
                const dataPtr = this._allocArray(data);
                this._relu(dataPtr, data.length);
                const resultArray = new Float32Array(this.wasmModule.HEAPF32.buffer, dataPtr, data.length);
                data.set(resultArray);
                this._freeArray(dataPtr);
                return data;
            } else {
                // JavaScript Fallback
                for (let i = 0; i < data.length; ++i) {
                    if (data[i] < 0.0) {
                        data[i] = 0.0;
                    }
                }
                return data;
            }
        },

        /**
         * Sigmoid Aktivasyonu
         */
        sigmoid: function(x) {
            if (this.isWASM) {
                return this._sigmoid(x);
            } else {
                // JavaScript Fallback
                return 1.0 / (1.0 + Math.exp(-x));
            }
        },

        /**
         * Tam İleri Yönlü Geçiş (Forward Pass)
         * brain nesnesi ağırlık ve bias'ları içermelidir (Düzleştirilmiş Float32Array'ler).
         */
        forwardPass: function(input, brain) {
            if (this.isWASM) {
                const ptrs = [];
                const alloc = (arr) => {
                    const ptr = this._allocArray(arr);
                    ptrs.push(ptr);
                    return ptr;
                };

                const inputPtr = alloc(input);
                const w1 = alloc(brain.w1); const b1 = alloc(brain.b1);
                const w2 = alloc(brain.w2); const b2 = alloc(brain.b2);
                const w3 = alloc(brain.w3); const b3 = alloc(brain.b3);
                const w4 = alloc(brain.w4); const b4 = alloc(brain.b4);

                const result = this._forwardPass(
                    inputPtr, input.length,
                    w1, b1, brain.b1.length,
                    w2, b2, brain.b2.length,
                    w3, b3, brain.b3.length,
                    w4, b4
                );

                ptrs.forEach(ptr => this._freeArray(ptr));
                return result;
            } else {
                // JavaScript Fallback
                let h1 = this.dotProduct(input, brain.w1, brain.b1);
                this.relu(h1);
                
                let h2 = this.dotProduct(h1, brain.w2, brain.b2);
                this.relu(h2);
                
                let h3 = this.dotProduct(h2, brain.w3, brain.b3);
                this.relu(h3);
                
                let out = this.dotProduct(h3, brain.w4, brain.b4);
                return this.sigmoid(out[0]);
            }
        }
    };

    window.AAEAccelerator = AAEAccelerator;
})();
